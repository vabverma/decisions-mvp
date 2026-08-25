"use client";

import { useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { ReferralForm } from "@/components/ReferralForm";
import { SummaryPanel } from "@/components/SummaryPanel";
import type { ReferralSummary } from "@/lib/schema";
import type { GynOncSummary } from "@/lib/templates/gynOnc";
import type { TemplateId } from "@/lib/templates";
import type { Sample } from "@/lib/samples";

type Summary = ReferralSummary | GynOncSummary;

export default function Home() {
  const [referralText, setReferralText] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("generic");
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
        body: JSON.stringify({ referralText, templateId }),
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

  function handleLoadSample(sample: Sample) {
    setReferralText(sample.text);
    setTemplateId(sample.templateId);
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
    setSummary(null);
    setError(null);
  }

  return (
    <div className="wrap">
      <Disclaimer />

      <header className="top">
        <div className="brand">
          <span className="eyebrow">Specialist pre-chart extraction</span>
          <h1>Referral Intake</h1>
        </div>
        <p className="top-note">
          Turns a raw referral packet into the pre-chart summary a specialist actually needs, with every extracted
          item traceable back to source and every uncertain item flagged for review before it reaches the chart.
        </p>
      </header>

      <div className="board">
        <ReferralForm
          referralText={referralText}
          templateId={templateId}
          isLoading={isLoading}
          onTextChange={setReferralText}
          onTemplateChange={handleTemplateChange}
          onLoadSample={handleLoadSample}
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
