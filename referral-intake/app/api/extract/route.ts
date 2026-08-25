import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { extractSummary } from "@/lib/extract";
import { isTemplateId } from "@/lib/templates";

const MAX_REFERRAL_LENGTH = 20_000;

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const { referralText, templateId } = (body as { referralText?: unknown; templateId?: unknown } | null) ?? {};

  if (typeof referralText !== "string" || referralText.trim().length === 0) {
    return NextResponse.json({ error: "referralText is required." }, { status: 400 });
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

  try {
    const summary = await extractSummary(templateId, referralText);
    return NextResponse.json({ summary, templateId });
  } catch (error: unknown) {
    return NextResponse.json({ error: describeError(error) }, { status: statusForError(error) });
  }
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
