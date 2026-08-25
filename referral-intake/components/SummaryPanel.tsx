import { ClipboardText, FileMagnifyingGlass, FileText, Siren, Warning, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { NoteSummary, UrgencyLevel } from "@/lib/schema";
import { NoteSummaryPanel } from "./NoteSummaryPanel";
import { SkeletonSummary } from "./SkeletonSummary";

const URGENCY_TONE: Record<UrgencyLevel, string> = {
  Routine: "ok",
  Urgent: "warn",
  STAT: "critical",
};

const URGENCY_ICON: Record<UrgencyLevel, React.ReactNode> = {
  Routine: <ClipboardText weight="bold" size={12} />,
  Urgent: <Warning weight="bold" size={12} />,
  STAT: <Siren weight="bold" size={12} />,
};

interface SummaryPanelProps {
  summary: NoteSummary | null;
  specialty: string;
  isLoading: boolean;
  error: string | null;
}

export function SummaryPanel({ summary, specialty, isLoading, error }: SummaryPanelProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-head-title">
          <span className="icon">
            <FileMagnifyingGlass weight="bold" size={18} />
          </span>
          <h2>Pre-chart summary</h2>
        </div>
        {summary && (
          <div className="summary-meta">
            <span className={`pill ${URGENCY_TONE[summary.urgency.level]}`}>
              <span className="icon">{URGENCY_ICON[summary.urgency.level]}</span>
              {summary.urgency.level}
            </span>
            <span className="pill neutral">{specialty}</span>
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
            Choose a specialty, load a sample or paste a referral, then extract, to generate the pre-chart summary.
          </div>
        )}

        {!isLoading && !error && summary && <NoteSummaryPanel summary={summary} />}
      </div>
    </section>
  );
}
