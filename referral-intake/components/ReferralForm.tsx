"use client";

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
  const canExtract = (referralText.trim().length > 0 || attachments.length > 0) && !isLoading;

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
          Attached documents (PDF, PNG, JPEG — up to {MAX_ATTACHMENTS})
        </div>
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
          multiple
          disabled={isLoading || attachments.length >= MAX_ATTACHMENTS}
          onChange={(event) => {
            if (event.target.files) onAddFiles(event.target.files);
            event.target.value = "";
          }}
          style={{ fontSize: 13 }}
        />
        {attachments.length > 0 && (
          <div className="chip-list" style={{ marginTop: 8 }}>
            {attachments.map((attachment) => (
              <span className="data-chip" key={attachment.filename}>
                {attachment.filename}
                <button
                  type="button"
                  aria-label={`Remove ${attachment.filename}`}
                  onClick={() => onRemoveAttachment(attachment.filename)}
                  disabled={isLoading}
                  style={{
                    marginLeft: 6,
                    border: "none",
                    background: "none",
                    color: "var(--ink-faint)",
                    cursor: "pointer",
                    font: "inherit",
                  }}
                >
                  ×
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
        <div className="status-text" style={{ marginTop: 6 }}>
          Max {formatBytes(MAX_ATTACHMENT_BYTES)} per file. Claude reads PDFs and images directly — scans and photos
          work, not just clean text.
        </div>

        <div className="extract-row">
          <button type="button" className="primary" disabled={!canExtract} onClick={onExtract}>
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
