"use client";

import { useState } from "react";
import { CircleNotch, CloudArrowUp, FileImage, FilePdf, MagicWand, X } from "@phosphor-icons/react/dist/ssr";
import { SAMPLES, type Sample } from "@/lib/samples";
import { TEMPLATES, type TemplateId } from "@/lib/templates";
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES, type Attachment } from "@/lib/attachments";

interface ReferralFormProps {
  referralText: string;
  templateId: TemplateId;
  attachments: Attachment[];
  isLoading: boolean;
  attachmentError: string | null;
  onTextChange: (text: string) => void;
  onTemplateChange: (templateId: TemplateId) => void;
  onLoadSample: (sample: Sample) => void;
  onAddFiles: (files: FileList) => void;
  onRemoveAttachment: (filename: string) => void;
  onExtract: () => void;
  onClear: () => void;
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentIcon({ mediaType }: { mediaType: Attachment["mediaType"] }) {
  return mediaType === "application/pdf" ? (
    <FilePdf weight="bold" size={13} />
  ) : (
    <FileImage weight="bold" size={13} />
  );
}

export function ReferralForm({
  referralText,
  templateId,
  attachments,
  isLoading,
  attachmentError,
  onTextChange,
  onTemplateChange,
  onLoadSample,
  onAddFiles,
  onRemoveAttachment,
  onExtract,
  onClear,
}: ReferralFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const canExtract = (referralText.trim().length > 0 || attachments.length > 0) && !isLoading;
  const canAddMore = attachments.length < MAX_ATTACHMENTS && !isLoading;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Incoming referral</h2>
      </div>
      <div className="panel-body">
        <div className="field-label" style={{ marginBottom: 6 }}>
          Output format
        </div>
        <div className="samples">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`chip-btn${templateId === template.id ? " active" : ""}`}
              disabled={isLoading}
              onClick={() => onTemplateChange(template.id)}
            >
              {template.label}
            </button>
          ))}
        </div>

        <div className="samples">
          {SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="chip-btn"
              disabled={isLoading}
              onClick={() => onLoadSample(sample)}
            >
              {sample.label}
            </button>
          ))}
          <button type="button" className="chip-btn ghost" disabled={isLoading} onClick={onClear}>
            Clear
          </button>
        </div>

        <textarea
          id="raw"
          placeholder="Paste a referral letter or cover note here (optional if you attach documents below)…"
          value={referralText}
          onChange={(event) => onTextChange(event.target.value)}
          disabled={isLoading}
        />

        <div className="field-label" style={{ marginTop: 14, marginBottom: 6 }}>
          Attached documents
        </div>

        <label
          className={`dropzone${isDragging ? " dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            if (canAddMore) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (canAddMore && event.dataTransfer.files.length > 0) onAddFiles(event.dataTransfer.files);
          }}
        >
          <span className="icon">
            <CloudArrowUp weight="light" size={26} />
          </span>
          <span className="dropzone-title">Drop files or click to browse</span>
          <span className="dropzone-hint">
            PDF, PNG, JPEG, WEBP, GIF — up to {MAX_ATTACHMENTS} files, {formatBytes(MAX_ATTACHMENT_BYTES)} each
          </span>
          <input
            type="file"
            className="dropzone-input"
            accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
            multiple
            disabled={!canAddMore}
            onChange={(event) => {
              if (event.target.files) onAddFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        {attachments.length > 0 && (
          <div className="chip-list" style={{ marginTop: 10 }}>
            {attachments.map((attachment) => (
              <span className="data-chip removable" key={attachment.filename}>
                <span className="icon">
                  <AttachmentIcon mediaType={attachment.mediaType} />
                </span>
                {attachment.filename}
                <button
                  type="button"
                  className="chip-remove"
                  aria-label={`Remove ${attachment.filename}`}
                  onClick={() => onRemoveAttachment(attachment.filename)}
                  disabled={isLoading}
                >
                  <X weight="bold" size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        {attachmentError && (
          <div className="status-text error" style={{ marginTop: 6 }}>
            {attachmentError}
          </div>
        )}

        <div className="extract-row">
          <button type="button" className="primary" disabled={!canExtract} onClick={onExtract}>
            <span className="icon">
              {isLoading ? <CircleNotch className="spin" weight="bold" size={16} /> : <MagicWand weight="bold" size={16} />}
            </span>
            {isLoading ? "Extracting…" : "Extract pre-chart summary"}
          </button>
        </div>

        <div className="arch-note">
          <strong>How this works:</strong> the referral text and any attached documents are sent to Claude, which
          extracts them into the selected output format. Nothing is stored — each request is stateless.
        </div>
      </div>
    </section>
  );
}
