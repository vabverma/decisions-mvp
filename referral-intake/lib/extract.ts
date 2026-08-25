import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { ReferralSummarySchema, type ReferralSummary } from "./schema";

const MODEL = "claude-opus-5";

const SYSTEM_PROMPT = `You are a clinical intake assistant that pre-charts specialist referrals. Given a raw referral letter, extract exactly the fields in the provided schema so a specialist can review the case before the visit.

Rules:
- Never invent or infer a clinical fact that is not supported by the text. If a field is not present, set status to "missing", leave value/items empty, and do not guess.
- Use status "extracted" only when the value is a direct restatement of text in the referral, and include a short verbatim sourceQuote from the referral for it.
- Use status "inferred" only when you reasonably derived the value from context (e.g. classifying urgency from phrasing like "should not be delayed") rather than a direct quote — still include the sourceQuote you inferred it from.
- redFlags are clinically significant terms or findings (e.g. syncope, chest pain, neurologic deficit, sudden weight loss) found anywhere in the referral, each with the surrounding sentence as context, so a reviewing clinician can confirm significance before the visit.
- gaps are standard information a specialist in the referred-to specialty would expect (e.g. labs, imaging, medication list, allergy status) that is absent from this referral.
- This output is a drafting aid only. A clinician reviews every field before it is used in patient care — do not soften that by presenting uncertain content as certain.`;

export async function extractReferralSummary(referralText: string): Promise<ReferralSummary> {
  const client = new Anthropic();

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Extract the pre-chart summary for this referral:\n\n${referralText}`,
      },
    ],
    output_config: {
      format: zodOutputFormat(ReferralSummarySchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("Claude did not return a parseable structured summary.");
  }

  return response.parsed_output;
}
