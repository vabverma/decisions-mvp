"use client";

import { SAMPLES } from "@/lib/samples";

interface ReferralFormProps {
  referralText: string;
  isLoading: boolean;
  onTextChange: (text: string) => void;
  onExtract: () => void;
  onClear: () => void;
}

export function ReferralForm({ referralText, isLoading, onTextChange, onExtract, onClear }: ReferralFormProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Incoming referral</h2>
      </div>
      <div className="panel-body">
        <div className="samples">
          {SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="chip-btn"
              disabled={isLoading}
              onClick={() => onTextChange(sample.text)}
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
          <strong>How this works:</strong> the referral text is sent to Claude, which extracts the nine-field
          pre-chart schema below. Nothing is stored — each request is stateless.
        </div>
      </div>
    </section>
  );
}
