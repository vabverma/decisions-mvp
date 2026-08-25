import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getTemplate, type TemplateId } from "@/lib/templates";
import type { Attachment } from "@/lib/attachments";

const MODEL = "claude-opus-5";

function attachmentToContentBlock(attachment: Attachment): Anthropic.ContentBlockParam {
  if (attachment.mediaType === "application/pdf") {
    return {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: attachment.base64 },
    };
  }
  return {
    type: "image",
    source: { type: "base64", media_type: attachment.mediaType, data: attachment.base64 },
  };
}

export async function extractSummary(
  templateId: TemplateId,
  referralText: string,
  attachments: Attachment[] = [],
): Promise<unknown> {
  const template = getTemplate(templateId);
  const client = new Anthropic();

  const content: Anthropic.ContentBlockParam[] = attachments.map(attachmentToContentBlock);
  content.push({
    type: "text",
    text: `Extract the pre-chart summary for this referral packet.${
      attachments.length > 0
        ? ` The packet includes ${attachments.length} attached document(s) (${attachments
            .map((a) => a.filename)
            .join(", ")}) — read them directly for imaging/lab findings rather than relying only on the text below.`
        : ""
    }\n\nCover text:\n${referralText || "(no cover text — see attached documents)"}`,
  });

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    system: template.systemPrompt,
    messages: [{ role: "user", content }],
    output_config: {
      format: zodOutputFormat(template.schema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("Claude did not return a parseable structured summary.");
  }

  return response.parsed_output;
}
