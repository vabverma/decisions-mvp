import { z } from "zod";
import { FieldStatus, listField } from "@/lib/schema";

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

export const GynOncSummarySchema = z.object({
  openingNarrative: z.object({
    status: FieldStatus,
    value: z
      .string()
      .describe(
        "A single draft paragraph in dictation style — age, referring physician, reason for referral, presenting symptoms, timeline, and relevant history woven into prose. Only facts explicitly present in the referral. This is a draft the physician will edit, not a final note.",
      ),
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
  obGynHistory: z.object({
    status: FieldStatus,
    gravida: z.string().describe("Total pregnancies, as stated. Empty string if not stated."),
    para: z.string().describe("Parity, as stated. Empty string if not stated."),
    notes: z.string().describe("Other relevant OB/GYN history, e.g. prior hysterectomy, mode of delivery."),
  }),
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
    .describe("Standard information this specialty would expect that is absent from this referral."),
});

export type GynOncSummary = z.infer<typeof GynOncSummarySchema>;

export const GYN_ONC_SYSTEM_PROMPT = `You are a clinical intake assistant that drafts specialist pre-chart summaries for a gynecologic oncology practice. Given a raw referral packet (letter, imaging/lab reports, PCP notes — often combined), extract the fields in the schema into the structure this practice's consult notes use, so the specialist can review and continue directly into their own documentation.

Rules:
- Never invent or infer a clinical fact that is not supported by the text. If something is not present, leave it empty — do not guess.
- The schema deliberately excludes vitals, physical exam, ECOG, and assessment & plan — those require the in-person visit and must never be fabricated. Do not attempt to fill them.
- openingNarrative is a draft dictation-style paragraph built only from facts explicitly present in the referral. If key facts (age, referring physician, reason) are missing, write a shorter paragraph rather than filling gaps — set status to "inferred" if you had to lightly restructure phrasing, "extracted" if it is a close restatement of the source, "missing" if there isn't enough to draft one.
- icdCode on an active problem must be copied verbatim from the referral if present. Never assign or guess an ICD-10 code yourself, even for a plainly stated diagnosis.
- resultsTimeline should include every dated lab or imaging result found anywhere in the packet, sorted chronologically.
- redFlags are clinically significant terms or findings found anywhere in the text, each with surrounding context, so the reviewing clinician can confirm significance.
- gaps are standard information a gynecologic oncology specialist would expect (e.g. tumor markers, imaging report, surgical history, menopausal status) that is absent from this referral.
- This output is a drafting aid only — a suggested summary the physician reviews and edits, never a final note.`;
