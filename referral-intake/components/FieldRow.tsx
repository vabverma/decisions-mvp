import type { CSSProperties, ReactNode } from "react";
import { Badge } from "./Badge";
import type { FieldStatus } from "@/lib/schema";

interface FieldRowProps {
  label: string;
  status: FieldStatus;
  index?: number;
  children: ReactNode;
}

export function FieldRow({ label, status, index = 0, children }: FieldRowProps) {
  const style = { "--stagger-index": index } as CSSProperties;
  return (
    <div className="field-row" style={style}>
      <div className="field-label">{label}</div>
      <div>
        <Badge status={status} />
        {children}
      </div>
    </div>
  );
}
