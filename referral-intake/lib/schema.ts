import { z } from "zod";

export const FieldStatus = z.enum(["extracted", "inferred", "missing"]);
export type FieldStatus = z.infer<typeof FieldStatus>;

export const listField = z.object({
  status: FieldStatus,
  items: z.array(z.string()),
});

export const UrgencyLevel = z.enum(["Routine", "Urgent", "STAT"]);
export type UrgencyLevel = z.infer<typeof UrgencyLevel>;

const timelineEntry = z.object({
  date: z.string().describe("Date as stated in the referral, e.g. 7/21/2026."),
  test: z.string().describe("Test or study name, e.g. 'CT Abd/Pel w/con'."),
  finding: z.string().describe("The finding or result as stated."),
});

const activeProblem = z.object({
  diagnosis: z.string(),
  icdCode: z
    .string()
    .describe("ICD-10 code only if explicitly present in the referral text. Empty string otherwise — never inferred."),
});

export const NoteSummarySchema = z.object({
  openingNarrative: z.object({
    status: FieldStatus,
    value: z
      .string()
      .describe(
        "A single draft paragraph in dictation style — age, referring physician, reason for referral, presenting symptoms, timeline, and relevant history woven into prose. Only facts explicitly present in the referral. This is a draft the physician will edit, not a final note.",
      ),
  }),
  urgency: z.object({
    level: UrgencyLevel,
    rationale: z
      .string()
      .describe("One sentence explaining why this level was chosen, quoting the trigger language if any."),
  }),
  resultsTimeline: z
    .array(timelineEntry)
    .describe("Every dated lab or imaging result in the referral, in chronological order."),
  reviewOfSystemsNotes: z
    .array(z.string())
    .describe(
      "Explicit symptom positives or negatives stated in the referral (e.g. 'denies postmenopausal bleeding'). Not a full ROS — that is completed at the visit.",
    ),
  medicalHistory: z.array(z.string()),
  activeProblems: z.array(activeProblem),
  surgicalHistory: z.array(z.string()),
  currentMedications: listField,
  allergies: listField,
  socialHistoryNotes: z.array(z.string()).describe("e.g. smoking status, occupation if relevant."),
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
    .describe("Standard information a specialist in this field would expect that is absent from this referral."),
});

export type NoteSummary = z.infer<typeof NoteSummarySchema>;
