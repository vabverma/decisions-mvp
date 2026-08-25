import type { ReferralSummary } from "@/lib/schema";
import type { GynOncSummary } from "@/lib/templates/gynOnc";
import type { TemplateId } from "@/lib/templates";
import { FieldRow } from "./FieldRow";
import { GynOncSummaryPanel } from "./GynOncSummaryPanel";

const URGENCY_TONE: Record<ReferralSummary["urgency"]["level"], string> = {
  Routine: "ok",
  Urgent: "warn",
  STAT: "critical",
};

function TextFieldValue({ value, sourceQuote }: { value: string; sourceQuote: string }) {
  if (!value.trim()) {
    return <div className="field-value empty">Not present in this referral.</div>;
  }
  return (
    <>
      <div className="field-value mono">{value}</div>
      {sourceQuote.trim() && <div className="field-quote">&ldquo;{sourceQuote}&rdquo;</div>}
    </>
  );
}

function ChipListValue({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <div className="field-value empty">Not present in this referral.</div>;
  }
  return (
    <div className="chip-list">
      {items.map((item, i) => (
        <span className="data-chip" key={i}>
          {item}
        </span>
      ))}
    </div>
  );
}

function GenericSummaryContent({ summary }: { summary: ReferralSummary }) {
  return (
    <>
      <FieldRow label="Referring physician" status={summary.referringPhysician.status}>
        <TextFieldValue value={summary.referringPhysician.value} sourceQuote={summary.referringPhysician.sourceQuote} />
      </FieldRow>

      <FieldRow label="Reason for referral" status={summary.reasonForReferral.status}>
        <TextFieldValue value={summary.reasonForReferral.value} sourceQuote={summary.reasonForReferral.sourceQuote} />
      </FieldRow>

      <FieldRow label="Working diagnosis" status={summary.workingDiagnosis.status}>
        <TextFieldValue value={summary.workingDiagnosis.value} sourceQuote={summary.workingDiagnosis.sourceQuote} />
        {summary.workingDiagnosis.icdCodes.length > 0 && (
          <div className="chip-list">
            {summary.workingDiagnosis.icdCodes.map((code) => (
              <span className="data-chip" key={code}>
                {code}
              </span>
            ))}
          </div>
        )}
      </FieldRow>

      <FieldRow label="History of present illness" status={summary.historyOfPresentIllness.status}>
        <TextFieldValue
          value={summary.historyOfPresentIllness.value}
          sourceQuote={summary.historyOfPresentIllness.sourceQuote}
        />
      </FieldRow>

      <FieldRow label="Past medical history" status={summary.pastMedicalHistory.status}>
        <TextFieldValue value={summary.pastMedicalHistory.value} sourceQuote={summary.pastMedicalHistory.sourceQuote} />
      </FieldRow>

      <FieldRow label="Current medications" status={summary.currentMedications.status}>
        <ChipListValue items={summary.currentMedications.items} />
      </FieldRow>

      <FieldRow label="Allergies" status={summary.allergies.status}>
        <ChipListValue items={summary.allergies.items} />
      </FieldRow>

      <FieldRow label="Laboratory findings" status={summary.laboratoryFindings.status}>
        <TextFieldValue value={summary.laboratoryFindings.value} sourceQuote={summary.laboratoryFindings.sourceQuote} />
      </FieldRow>

      <FieldRow label="Imaging findings" status={summary.imagingFindings.status}>
        <TextFieldValue value={summary.imagingFindings.value} sourceQuote={summary.imagingFindings.sourceQuote} />
      </FieldRow>

      {summary.redFlags.length > 0 && (
        <div className="section-block review">
          <h3>Flagged for review</h3>
          <ul>
            {summary.redFlags.map((flag, i) => (
              <li key={i}>
                <span className="badge inferred">Inferred</span> Term &ldquo;{flag.term}&rdquo; — confirm clinical
                significance before the visit.
                <span className="trace">&ldquo;{flag.context}&rdquo;</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.gaps.length > 0 && (
        <div className="section-block gaps">
          <h3>Gaps to request from referring office</h3>
          <ul>
            {summary.gaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

interface SummaryPanelProps {
  summary: ReferralSummary | GynOncSummary | null;
  templateId: TemplateId;
  isLoading: boolean;
  error: string | null;
}

export function SummaryPanel({ summary, templateId, isLoading, error }: SummaryPanelProps) {
  const genericSummary = templateId === "generic" ? (summary as ReferralSummary | null) : null;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Pre-chart summary</h2>
        {genericSummary && (
          <div className="summary-meta">
            <span className={`pill ${URGENCY_TONE[genericSummary.urgency.level]}`}>{genericSummary.urgency.level}</span>
            <span className="pill neutral">{genericSummary.specialty}</span>
          </div>
        )}
      </div>
      <div className="panel-body">
        {isLoading && <div className="empty-state">Extracting the pre-chart summary…</div>}

        {!isLoading && error && <div className="empty-state status-text error">{error}</div>}

        {!isLoading && !error && !summary && (
          <div className="empty-state">
            Load a sample or paste a referral, then extract, to generate the pre-chart summary.
          </div>
        )}

        {!isLoading && !error && summary && templateId === "generic" && (
          <GenericSummaryContent summary={summary as ReferralSummary} />
        )}

        {!isLoading && !error && summary && templateId === "gyn-onc" && (
          <GynOncSummaryPanel summary={summary as GynOncSummary} />
        )}
      </div>
    </section>
  );
}
