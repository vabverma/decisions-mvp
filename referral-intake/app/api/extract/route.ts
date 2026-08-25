import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { extractSummary } from "@/lib/extract";
import { isTemplateId } from "@/lib/templates";
import { isAllowedAttachmentType, MAX_ATTACHMENTS, type Attachment } from "@/lib/attachments";

const MAX_REFERRAL_LENGTH = 20_000;
const MAX_ATTACHMENT_BASE64_LENGTH = 27_000_000; // ~20MB decoded

interface RawAttachment {
  filename?: unknown;
  mediaType?: unknown;
  base64?: unknown;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const {
    referralText,
    templateId,
    attachments: rawAttachments,
  } = (body as { referralText?: unknown; templateId?: unknown; attachments?: unknown } | null) ?? {};

  if (typeof referralText !== "string") {
    return NextResponse.json({ error: "referralText must be a string." }, { status: 400 });
  }
  if (referralText.length > MAX_REFERRAL_LENGTH) {
    return NextResponse.json(
      { error: `referralText exceeds the ${MAX_REFERRAL_LENGTH.toLocaleString()} character limit.` },
      { status: 400 },
    );
  }
  if (!isTemplateId(templateId)) {
    return NextResponse.json({ error: "templateId must be one of the supported templates." }, { status: 400 });
  }

  const attachmentsResult = parseAttachments(rawAttachments);
  if ("error" in attachmentsResult) {
    return NextResponse.json({ error: attachmentsResult.error }, { status: 400 });
  }
  const attachments = attachmentsResult.attachments;

  if (referralText.trim().length === 0 && attachments.length === 0) {
    return NextResponse.json(
      { error: "Provide referral text, at least one attachment, or both." },
      { status: 400 },
    );
  }

  try {
    const summary = await extractSummary(templateId, referralText, attachments);
    return NextResponse.json({ summary, templateId });
  } catch (error: unknown) {
    return NextResponse.json({ error: describeError(error) }, { status: statusForError(error) });
  }
}

function parseAttachments(raw: unknown): { attachments: Attachment[] } | { error: string } {
  if (raw === undefined) return { attachments: [] };
  if (!Array.isArray(raw)) return { error: "attachments must be an array." };
  if (raw.length > MAX_ATTACHMENTS) {
    return { error: `A maximum of ${MAX_ATTACHMENTS} attachments is supported.` };
  }

  const attachments: Attachment[] = [];
  for (const item of raw as RawAttachment[]) {
    const { filename, mediaType, base64 } = item ?? {};
    if (typeof filename !== "string" || !filename.trim()) {
      return { error: "Each attachment needs a filename." };
    }
    if (typeof mediaType !== "string" || !isAllowedAttachmentType(mediaType)) {
      return { error: `Attachment "${filename}" has an unsupported file type. Use PDF, PNG, JPEG, WEBP, or GIF.` };
    }
    if (typeof base64 !== "string" || base64.length === 0) {
      return { error: `Attachment "${filename}" is missing file data.` };
    }
    if (base64.length > MAX_ATTACHMENT_BASE64_LENGTH) {
      return { error: `Attachment "${filename}" is too large.` };
    }
    attachments.push({ filename, mediaType, base64 });
  }
  return { attachments };
}

function statusForError(error: unknown): number {
  if (error instanceof Anthropic.AuthenticationError) return 500;
  if (error instanceof Anthropic.RateLimitError) return 429;
  if (error instanceof Anthropic.APIError) return 502;
  return 500;
}

function describeError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) {
    return "The extraction service is not configured correctly (invalid API key). Contact the site administrator.";
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "The extraction service is rate limited right now. Please try again shortly.";
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return "Could not reach the extraction service. Check your connection and try again.";
  }
  if (error instanceof Anthropic.APIError) {
    return "The extraction service returned an error. Please try again.";
  }
  return "Something went wrong while extracting the referral. Please try again.";
}
