import type { ReactNode } from "react";
import { Badge } from "./Badge";
import type { FieldStatus } from "@/lib/schema";

interface FieldRowProps {
  label: string;
  status: FieldStatus;
  children: ReactNode;
}

export function FieldRow({ label, status, children }: FieldRowProps) {
  return (
    <div className="field-row">
      <div className="field-label">{label}</div>
      <div>
        <Badge status={status} />
        {children}
      </div>
    </div>
  );
}
