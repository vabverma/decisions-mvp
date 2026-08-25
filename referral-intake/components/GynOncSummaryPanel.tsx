import type { CSSProperties } from "react";
import { ClipboardText, Clock, Info, Stethoscope, Warning, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { GynOncSummary } from "@/lib/templates/gynOnc";
import { FieldRow } from "./FieldRow";

const EXAM_SECTIONS = [
  "Constitutional",
  "Hematologic/Lymphatic",
  "Respiratory",
  "Cardiovascular",
  "Chest",
  "Abdomen",
  "Genitourinary",
  "Psychiatric",
];

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <div className="field-value empty">Not documented in this referral.</div>;
  }
  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 14, lineHeight: 1.6 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function PlainRow({ label, index, children }: { label: string; index: number; children: React.ReactNode }) {
  const style = { "--stagger-index": index } as CSSProperties;
  return (
    <div className="field-row" style={style}>
      <div className="field-label">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function CompleteAtVisit({ label }: { label: string }) {
  return (
    <div className="section-block gaps" style={{ marginTop: 12 }}>
      <h3>
        <Clock weight="bold" size={14} />
        {label}
      </h3>
      <div className="field-value empty">To be completed at the visit.</div>
    </div>
  );
}

interface GynOncSummaryPanelProps {
  summary: GynOncSummary;
}

export function GynOncSummaryPanel({ summary }: GynOncSummaryPanelProps) {
  return (
    <>
      <div className="section-block review" style={{ marginTop: 0, marginBottom: 20 }}>
        <h3>
          <Info weight="bold" size={14} />
          Suggested summary — verify before charting
        </h3>
        <div className="field-value" style={{ fontSize: 13.5 }}>
          Drafted from the referral packet only. Vitals, exam, and assessment &amp; plan are left for the visit.
        </div>
      </div>

      <FieldRow label="HPI (draft)" status={summary.openingNarrative.status} index={0}>
        <div className="field-value">{summary.openingNarrative.value || "Not enough information to draft."}</div>
      </FieldRow>

      <PlainRow label="History" index={1}>
        {summary.resultsTimeline.length === 0 ? (
          <div className="field-value empty">No dated results in this referral.</div>
        ) : (
          <div className="field-value mono">
            {summary.resultsTimeline.map((entry, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                {entry.date}: {entry.test} - {entry.finding}
              </div>
            ))}
          </div>
        )}
      </PlainRow>

      <PlainRow label="Review of systems" index={2}>
        <BulletList items={summary.reviewOfSystemsNotes} />
        <div className="field-value empty" style={{ marginTop: 6 }}>
          (Full ROS to be completed at the visit.)
        </div>
      </PlainRow>

      <PlainRow label="Medical history" index={3}>
        <BulletList items={summary.medicalHistory} />
      </PlainRow>

      <PlainRow label="Active problems" index={4}>
        {summary.activeProblems.length === 0 ? (
          <div className="field-value empty">Not documented in this referral.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {summary.activeProblems.map((problem, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.6 }}>
                {problem.diagnosis}
                {problem.icdCode && (
                  <span className="data-chip" style={{ marginLeft: 8 }}>
                    {problem.icdCode}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </PlainRow>

      <PlainRow label="Surgical history" index={5}>
        <BulletList items={summary.surgicalHistory} />
      </PlainRow>

      <FieldRow label="OB/GYN history" status={summary.obGynHistory.status} index={6}>
        {summary.obGynHistory.status === "missing" ? (
          <div className="field-value empty">Not documented in this referral.</div>
        ) : (
          <>
            <div className="chip-list">
              <span className="data-chip">Gravida: {summary.obGynHistory.gravida || "—"}</span>
              <span className="data-chip">Para: {summary.obGynHistory.para || "—"}</span>
            </div>
            {summary.obGynHistory.notes && (
              <div className="field-value" style={{ marginTop: 6 }}>
                {summary.obGynHistory.notes}
              </div>
            )}
          </>
        )}
      </FieldRow>

      <FieldRow label="Current medications" status={summary.currentMedications.status} index={7}>
        {summary.currentMedications.items.length === 0 ? (
          <div className="field-value empty">Not documented in this referral.</div>
        ) : (
          <div className="chip-list">
            {summary.currentMedications.items.map((item, i) => (
              <span className="data-chip" key={i}>
                {item}
              </span>
            ))}
          </div>
        )}
      </FieldRow>

      <FieldRow label="Allergies" status={summary.allergies.status} index={8}>
        {summary.allergies.items.length === 0 ? (
          <div className="field-value empty">Not documented in this referral.</div>
        ) : (
          <div className="chip-list">
            {summary.allergies.items.map((item, i) => (
              <span className="data-chip" key={i}>
                {item}
              </span>
            ))}
          </div>
        )}
      </FieldRow>

      <PlainRow label="Social history" index={9}>
        <BulletList items={summary.socialHistoryNotes} />
      </PlainRow>

      <CompleteAtVisit label="Vital signs" />
      <CompleteAtVisit label="ECOG performance status" />

      <div className="section-block gaps" style={{ marginTop: 12 }}>
        <h3>
          <Stethoscope weight="bold" size={14} />
          Exam
        </h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {EXAM_SECTIONS.map((section) => (
            <li key={section} style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--ink-faint)" }}>
              {section}: <em>to be completed at the visit</em>
            </li>
          ))}
        </ul>
      </div>

      <div className="section-block gaps" style={{ marginTop: 12 }}>
        <h3>
          <ClipboardText weight="bold" size={14} />
          Assessment &amp; plan
        </h3>
        {summary.activeProblems.length === 0 ? (
          <div className="field-value empty">To be completed at the visit.</div>
        ) : (
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {summary.activeProblems.map((problem, i) => (
              <li key={i} style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--ink-faint)" }}>
                {problem.diagnosis}: <em>to be completed at the visit</em>
              </li>
            ))}
          </ol>
        )}
      </div>

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
