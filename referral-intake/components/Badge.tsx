import { CheckCircle, Question, Minus } from "@phosphor-icons/react/dist/ssr";
import type { FieldStatus } from "@/lib/schema";

const LABELS: Record<FieldStatus, string> = {
  extracted: "Extracted",
  inferred: "Inferred",
  missing: "Not found",
};

const ICONS: Record<FieldStatus, React.ReactNode> = {
  extracted: <CheckCircle weight="bold" size={12} />,
  inferred: <Question weight="bold" size={12} />,
  missing: <Minus weight="bold" size={12} />,
};

export function Badge({ status }: { status: FieldStatus }) {
  return (
    <span className={`badge ${status}`}>
      <span className="icon">{ICONS[status]}</span>
      {LABELS[status]}
    </span>
  );
}
