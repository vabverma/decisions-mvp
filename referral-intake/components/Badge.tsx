import type { FieldStatus } from "@/lib/schema";

const LABELS: Record<FieldStatus, string> = {
  extracted: "Extracted",
  inferred: "Inferred",
  missing: "Not found",
};

export function Badge({ status }: { status: FieldStatus }) {
  return <span className={`badge ${status}`}>{LABELS[status]}</span>;
}
