import { z } from "zod";

export const FieldStatus = z.enum(["extracted", "inferred", "missing"]);
export type FieldStatus = z.infer<typeof FieldStatus>;

export const textField = z.object({
  status: FieldStatus,
  value: z.string().describe("The field content. Empty string when status is missing."),
  sourceQuote: z
    .string()
    .describe(
      "A short verbatim quote from the referral supporting this value, so a reviewer can trace it back to source. Empty string when status is missing.",
    ),
});

export const listField = z.object({
  status: FieldStatus,
  items: z.array(z.string()),
});

export const UrgencyLevel = z.enum(["Routine", "Urgent", "STAT"]);
export type UrgencyLevel = z.infer<typeof UrgencyLevel>;

export const ReferralSummarySchema = z.object({
  referringPhysician: textField.describe("Referring physician's name and practice, if stated."),
  specialty: z.string().describe("The specialty this referral is directed to, e.g. Cardiology."),
  urgency: z.object({
    level: UrgencyLevel,
    rationale: z
      .string()
      .describe("One sentence explaining why this level was chosen, quoting the trigger language if any."),
  }),
  reasonForReferral: textField,
  workingDiagnosis: textField.extend({
    icdCodes: z.array(z.string()).describe("Any ICD-10 codes found near the diagnosis."),
  }),
  historyOfPresentIllness: textField,
  pastMedicalHistory: textField,
  currentMedications: listField,
  allergies: listField,
  laboratoryFindings: textField,
  imagingFindings: textField,
  redFlags: z
    .array(
      z.object({
        term: z.string().describe("The clinically significant term or finding."),
        context: z.string().describe("The sentence or phrase it appeared in."),
      }),
    )
    .describe("Findings that warrant clinician confirmation before or at the visit."),
  gaps: z
    .array(z.string())
    .describe("Standard information a specialist would expect that is absent from this referral."),
});

export type ReferralSummary = z.infer<typeof ReferralSummarySchema>;
