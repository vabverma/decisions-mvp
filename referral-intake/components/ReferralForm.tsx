"use client";

import { SAMPLES, type Sample } from "@/lib/samples";
import { TEMPLATES, type TemplateId } from "@/lib/templates";

interface ReferralFormProps {
  referralText: string;
  templateId: TemplateId;
  isLoading: boolean;
  onTextChange: (text: string) => void;
  onTemplateChange: (templateId: TemplateId) => void;
  onLoadSample: (sample: Sample) => void;
  onExtract: () => void;
  onClear: () => void;
}

export function ReferralForm({
  referralText,
  templateId,
  isLoading,
  onTextChange,
  onTemplateChange,
  onLoadSample,
  onExtract,
  onClear,
}: ReferralFormProps) {
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
          placeholder="Paste a referral letter, fax OCR text, or CCD export here…"
          value={referralText}
          onChange={(event) => onTextChange(event.target.value)}
          disabled={isLoading}
        />

        <div className="extract-row">
          <button type="button" className="primary" disabled={isLoading || !referralText.trim()} onClick={onExtract}>
            {isLoading ? "Extracting…" : "Extract pre-chart summary"}
          </button>
        </div>

        <div className="arch-note">
          <strong>How this works:</strong> the referral text is sent to Claude, which extracts it into the selected
          output format. Nothing is stored — each request is stateless.
        </div>
      </div>
    </section>
  );
}
