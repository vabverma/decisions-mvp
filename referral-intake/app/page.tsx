"use client";

import { useState } from "react";
import { Stethoscope } from "@phosphor-icons/react/dist/ssr";
import { Disclaimer } from "@/components/Disclaimer";
import { ReferralForm } from "@/components/ReferralForm";
import { SummaryPanel } from "@/components/SummaryPanel";
import type { ReferralSummary } from "@/lib/schema";
import type { GynOncSummary } from "@/lib/templates/gynOnc";
import type { TemplateId } from "@/lib/templates";
import type { Sample } from "@/lib/samples";
import {
  fileToAttachment,
  isAllowedAttachmentType,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  type Attachment,
} from "@/lib/attachments";

type Summary = ReferralSummary | GynOncSummary;

export default function Home() {
  const [referralText, setReferralText] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("generic");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralText, templateId, attachments }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Extraction failed.");
      }
      setSummary(body.summary as Summary);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Extraction failed.");
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddFiles(files: FileList) {
    setAttachmentError(null);
    const incoming = Array.from(files);

    if (attachments.length + incoming.length > MAX_ATTACHMENTS) {
      setAttachmentError(`A maximum of ${MAX_ATTACHMENTS} attachments is supported.`);
      return;
    }

    const oversized = incoming.find((f) => f.size > MAX_ATTACHMENT_BYTES);
    if (oversized) {
      setAttachmentError(`"${oversized.name}" exceeds the ${(MAX_ATTACHMENT_BYTES / (1024 * 1024)).toFixed(0)}MB limit.`);
      return;
    }

    const unsupported = incoming.find((f) => !isAllowedAttachmentType(f.type));
    if (unsupported) {
      setAttachmentError(`"${unsupported.name}" is an unsupported file type. Use PDF, PNG, JPEG, WEBP, or GIF.`);
      return;
    }

    try {
      const newAttachments = await Promise.all(incoming.map(fileToAttachment));
      setAttachments((prev) => [...prev, ...newAttachments]);
      setSummary(null);
      setError(null);
    } catch (err: unknown) {
      setAttachmentError(err instanceof Error ? err.message : "Could not read the selected file(s).");
    }
  }

  function handleRemoveAttachment(filename: string) {
    setAttachments((prev) => prev.filter((a) => a.filename !== filename));
  }

  function handleLoadSample(sample: Sample) {
    setReferralText(sample.text);
    setTemplateId(sample.templateId);
    setAttachments([]);
    setAttachmentError(null);
    setSummary(null);
    setError(null);
  }

  function handleTemplateChange(next: TemplateId) {
    setTemplateId(next);
    setSummary(null);
    setError(null);
  }

  function handleClear() {
    setReferralText("");
    setAttachments([]);
    setAttachmentError(null);
    setSummary(null);
    setError(null);
  }

  return (
    <div className="wrap">
      <Disclaimer />

      <header className="top">
        <div className="brand">
          <span className="brand-mark">
            <Stethoscope weight="bold" size={22} />
          </span>
          <div className="brand-text">
            <span className="eyebrow">Specialist pre-chart extraction</span>
            <h1>Referral Intake</h1>
          </div>
        </div>
        <p className="top-note">
          Turns a raw referral packet — including attached scans, images, and lab reports — into the pre-chart
          summary a specialist actually needs, with every extracted item traceable back to source and every
          uncertain item flagged for review before it reaches the chart.
        </p>
      </header>

      <div className="board">
        <ReferralForm
          referralText={referralText}
          templateId={templateId}
          attachments={attachments}
          isLoading={isLoading}
          attachmentError={attachmentError}
          onTextChange={setReferralText}
          onTemplateChange={handleTemplateChange}
          onLoadSample={handleLoadSample}
          onAddFiles={handleAddFiles}
          onRemoveAttachment={handleRemoveAttachment}
          onExtract={handleExtract}
          onClear={handleClear}
        />
        <SummaryPanel summary={summary} templateId={templateId} isLoading={isLoading} error={error} />
      </div>

      <div className="legend">
        <span className="item">
          <span className="dot" style={{ background: "var(--accent-strong)" }} />
          Extracted — direct quote from the referral
        </span>
        <span className="item">
          <span className="dot" style={{ background: "var(--warn)" }} />
          Inferred — derived from context, confirm before charting
        </span>
        <span className="item">
          <span className="dot" style={{ background: "var(--ink-faint)" }} />
          Not found — flagged as a gap
        </span>
      </div>
    </div>
  );
}
