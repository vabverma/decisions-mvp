import { ReferralSummarySchema } from "@/lib/schema";
import { GENERIC_SYSTEM_PROMPT } from "./generic";
import { GynOncSummarySchema, GYN_ONC_SYSTEM_PROMPT } from "./gynOnc";

export const TEMPLATES = [
  {
    id: "generic",
    label: "Generic",
    schema: ReferralSummarySchema,
    systemPrompt: GENERIC_SYSTEM_PROMPT,
  },
  {
    id: "gyn-onc",
    label: "Gynecologic Oncology",
    schema: GynOncSummarySchema,
    systemPrompt: GYN_ONC_SYSTEM_PROMPT,
  },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export function getTemplate(id: TemplateId) {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) {
    throw new Error(`Unknown template: ${id}`);
  }
  return template;
}

export function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && TEMPLATES.some((t) => t.id === value);
}
