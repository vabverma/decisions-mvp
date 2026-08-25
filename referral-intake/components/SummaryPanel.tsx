import {
  ClipboardText,
  FileMagnifyingGlass,
  FileText,
  Siren,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { ReferralSummary } from "@/lib/schema";
import type { GynOncSummary } from "@/lib/templates/gynOnc";
import type { TemplateId } from "@/lib/templates";
import { FieldRow } from "./FieldRow";
import { GynOncSummaryPanel } from "./GynOncSummaryPanel";
import { SkeletonSummary } from "./SkeletonSummary";

const URGENCY_TONE: Record<ReferralSummary["urgency"]["level"], string> = {
  Routine: "ok",
  Urgent: "warn",
  STAT: "critical",
};

const URGENCY_ICON: Record<ReferralSummary["urgency"]["level"], React.ReactNode> = {
  Routine: <ClipboardText weight="bold" size={12} />,
  Urgent: <Warning weight="bold" size={12} />,
  STAT: <Siren weight="bold" size={12} />,
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
      <FieldRow label="Referring physician" status={summary.referringPhysician.status} index={0}>
        <TextFieldValue value={summary.referringPhysician.value} sourceQuote={summary.referringPhysician.sourceQuote} />
      </FieldRow>

      <FieldRow label="Reason for referral" status={summary.reasonForReferral.status} index={1}>
        <TextFieldValue value={summary.reasonForReferral.value} sourceQuote={summary.reasonForReferral.sourceQuote} />
      </FieldRow>

      <FieldRow label="Working diagnosis" status={summary.workingDiagnosis.status} index={2}>
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

      <FieldRow label="History of present illness" status={summary.historyOfPresentIllness.status} index={3}>
        <TextFieldValue
          value={summary.historyOfPresentIllness.value}
          sourceQuote={summary.historyOfPresentIllness.sourceQuote}
        />
      </FieldRow>

      <FieldRow label="Past medical history" status={summary.pastMedicalHistory.status} index={4}>
        <TextFieldValue value={summary.pastMedicalHistory.value} sourceQuote={summary.pastMedicalHistory.sourceQuote} />
      </FieldRow>

      <FieldRow label="Current medications" status={summary.currentMedications.status} index={5}>
        <ChipListValue items={summary.currentMedications.items} />
      </FieldRow>

      <FieldRow label="Allergies" status={summary.allergies.status} index={6}>
        <ChipListValue items={summary.allergies.items} />
      </FieldRow>

      <FieldRow label="Laboratory findings" status={summary.laboratoryFindings.status} index={7}>
        <TextFieldValue value={summary.laboratoryFindings.value} sourceQuote={summary.laboratoryFindings.sourceQuote} />
      </FieldRow>

      <FieldRow label="Imaging findings" status={summary.imagingFindings.status} index={8}>
        <TextFieldValue value={summary.imagingFindings.value} sourceQuote={summary.imagingFindings.sourceQuote} />
      </FieldRow>

      {summary.redFlags.length > 0 && (
        <div className="section-block review">
          <h3>
            <Warning weight="bold" size={14} />
            Flagged for review
          </h3>
          <ul>
            {summary.redFlags.map((flag, i) => (
              <li key={i}>
                <span className="badge inferred">
                  <span className="icon">
                    <WarningCircle weight="bold" size={12} />
                  </span>
                  Inferred
                </span>{" "}
                Term &ldquo;{flag.term}&rdquo; — confirm clinical significance before the visit.
                <span className="trace">&ldquo;{flag.context}&rdquo;</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.gaps.length > 0 && (
        <div className="section-block gaps">
          <h3>
            <ClipboardText weight="bold" size={14} />
            Gaps to request from referring office
          </h3>
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
        <div className="panel-head-title">
          <span className="icon">
            <FileMagnifyingGlass weight="bold" size={18} />
          </span>
          <h2>Pre-chart summary</h2>
        </div>
        {genericSummary && (
          <div className="summary-meta">
            <span className={`pill ${URGENCY_TONE[genericSummary.urgency.level]}`}>
              <span className="icon">{URGENCY_ICON[genericSummary.urgency.level]}</span>
              {genericSummary.urgency.level}
            </span>
            <span className="pill neutral">{genericSummary.specialty}</span>
          </div>
        )}
      </div>
      <div className="panel-body">
        {isLoading && <SkeletonSummary />}

        {!isLoading && error && (
          <div className="empty-state status-text error">
            <span className="icon">
              <WarningCircle weight="bold" size={28} />
            </span>
            {error}
          </div>
        )}

        {!isLoading && !error && !summary && (
          <div className="empty-state">
            <span className="icon">
              <FileText weight="light" size={30} />
            </span>
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
