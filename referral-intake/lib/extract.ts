import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getTemplate, type TemplateId } from "@/lib/templates";

const MODEL = "claude-opus-5";

export async function extractSummary(templateId: TemplateId, referralText: string): Promise<unknown> {
  const template = getTemplate(templateId);
  const client = new Anthropic();

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    system: template.systemPrompt,
    messages: [
      {
        role: "user",
        content: `Extract the pre-chart summary for this referral:\n\n${referralText}`,
      },
    ],
    output_config: {
      format: zodOutputFormat(template.schema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("Claude did not return a parseable structured summary.");
  }

  return response.parsed_output;
}
