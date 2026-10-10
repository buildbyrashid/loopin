import OpenAI from "openai";
import JSZip from "jszip";
import { z } from "zod";
import { createRequestId, errorMessage, jsonError, jsonSuccess } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { formatConversation, parseWhatsAppChat } from "@/lib/whatsapp";

const extractionSchema = z.object({ name: z.string().min(1), phone: z.string().nullable().optional(), status: z.enum(["hot", "warm", "cold"]), priority: z.enum(["high", "low", "unclear"]).optional(), engagement_pattern: z.enum(["price_only", "engaged_evaluating", "unclear"]), engagement_reason: z.string().min(1).max(500).optional(), summary: z.string(), objections: z.string(), promises_made: z.string(), suggested_followup: z.string(), suggested_followup_date: z.string().nullable().optional() });

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeExtraction(payload: unknown) {
  const root = asRecord(payload);
  const candidate = Array.isArray(root.leads) ? root.leads[0] : root.lead ?? root;
  const data = asRecord(candidate);
  const text = (key: string, fallback: string) => typeof data[key] === "string" && data[key].trim() ? data[key].trim() : fallback;
  const engagementPattern = ["price_only", "engaged_evaluating", "unclear"].includes(String(data.engagement_pattern)) ? data.engagement_pattern as "price_only" | "engaged_evaluating" | "unclear" : "unclear";
  const status = ["hot", "warm", "cold"].includes(String(data.status)) ? data.status as "hot" | "warm" | "cold" : "warm";
  const priority = ["high", "low", "unclear"].includes(String(data.priority)) ? data.priority as "high" | "low" | "unclear" : undefined;
  const phone = typeof data.phone === "string" && data.phone.trim() ? data.phone.trim() : null;
  const suggestedFollowupDate = typeof data.suggested_followup_date === "string" && data.suggested_followup_date.trim() ? data.suggested_followup_date.trim() : null;
  return {
    name: text("name", "WhatsApp contact"), phone, status, priority,
    engagement_pattern: engagementPattern,
    engagement_reason: text("engagement_reason", engagementPattern === "price_only" ? "Asked for price or details and did not continue the conversation." : engagementPattern === "engaged_evaluating" ? "Discussed the offer with follow-up questions or concerns." : "There is not enough conversation to classify engagement yet."),
    summary: text("summary", "Conversation imported from WhatsApp."),
    objections: text("objections", "None captured yet."),
    promises_made: text("promises_made", "None captured yet."),
    suggested_followup: text("suggested_followup", "Review this conversation and decide on the next follow-up."),
    suggested_followup_date: suggestedFollowupDate,
  };
}

const classificationPrompt = `Extract one sales lead from a WhatsApp conversation. Classify engagement_pattern using these rules exactly:
1. price_only: the client asked for price or basic details but did not ask about features, use-cases, or doubts, then went silent after receiving the price. Set priority to low.
2. engaged_evaluating: the client discussed price and also asked follow-up questions about features or use-cases, or raised concerns. Genuine back-and-forth or a soft commitment such as “I will confirm in 1-2 days”, “I need to discuss with my partner”, or “I will check and get back” means engaged_evaluating. Set priority to high.
3. unclear: there is not enough conversation to classify. Set priority to unclear.

Return JSON fields: name, phone, status (hot/warm/cold), priority (high/low/unclear), engagement_pattern (price_only/engaged_evaluating/unclear), engagement_reason (one concise sentence citing evidence from the conversation), summary, objections, promises_made, suggested_followup, suggested_followup_date.
For suggested_followup_date, return an exact ISO date in YYYY-MM-DD when the client gave a timeframe. If engaged_evaluating has no explicit timeframe, return null; if price_only has no explicit timeframe, return null; if unclear, return null. Never invent facts. Return structured output in English.`;

function dateAfterDays(days: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeFollowupDate(value: string | null | undefined, pattern: "price_only" | "engaged_evaluating" | "unclear") {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value) return value;
  }
  if (pattern === "engaged_evaluating") return dateAfterDays(2);
  if (pattern === "price_only") return dateAfterDays(5);
  return null;
}

function archiveEntries(zip: JSZip) {
  const entries = Object.keys(zip.files);
  return entries.length > 40 ? [...entries.slice(0, 40), `...and ${entries.length - 40} more`] : entries;
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  let userId = "unknown";
  let uploadId: string | undefined;
  let supabase: Awaited<ReturnType<typeof createClient>> = null;
  try {
    supabase = await createClient();
    if (!supabase) return jsonError("Supabase is not configured.", "CONFIGURATION_ERROR", 503, { requestId });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Please sign in to continue.", "UNAUTHENTICATED", 401, { requestId });
    userId = user.id;
    if (!process.env.OPENAI_API_KEY) return jsonError("OpenAI is not configured yet.", "CONFIGURATION_ERROR", 503, { requestId });
    const body = await request.json() as { uploadId?: string };
    if (!body.uploadId) return jsonError("An upload id is required.", "VALIDATION_ERROR", 400, { requestId });
    uploadId = body.uploadId;
    const { data: upload } = await supabase.from("uploads").select("id").eq("id", uploadId).eq("user_id", user.id).single();
    if (!upload) return jsonError("Upload not found.", "NOT_FOUND", 404, { requestId });
    const { data: file, error: downloadError } = await supabase.storage.from("whatsapp-exports").download(`${user.id}/${upload.id}.zip`);
    if (downloadError || !file) return jsonError("The uploaded export is unavailable.", "STORAGE_ERROR", 500, { requestId, hint: downloadError?.message });
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const chatFile = zip.file(/(^|\/)(?:_chat|chat)\.txt$/i)[0];
    if (!chatFile) {
      const entries = archiveEntries(zip);
      const message = "The WhatsApp chat.txt or _chat.txt file is missing.";
      await supabase.from("uploads").update({ status: "failed", error_message: `[INVALID_EXPORT] ${message} Entries: ${entries.join(", ")}. Request: ${requestId}` }).eq("id", upload.id).eq("user_id", user.id);
      console.error("POST /api/process failed", { requestId, userId, uploadId, code: "INVALID_EXPORT", message, entries });
      return jsonError(message, "INVALID_EXPORT", 400, { requestId, hint: "The upload must contain chat.txt or _chat.txt.", entries });
    }
    const messages = parseWhatsAppChat(await chatFile.async("string"));
    const voiceNames = messages.map((message) => message.attachment).filter((name): name is string => typeof name === "string" && /\.(?:opus|ogg|m4a|mp3|wav|aac|amr|3gp)$/i.test(name));
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcripts: Record<string, string> = {};
    for (const voiceName of voiceNames) {
      const escaped = voiceName.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
      const voice = zip.file(new RegExp(`${escaped}$`, "i"))[0];
      if (!voice) continue;
      const buffer = Buffer.from(await voice.async("nodebuffer"));
      const transcription = await openai.audio.transcriptions.create({ file: await OpenAI.toFile(buffer, voiceName), model: "whisper-1" });
      transcripts[voiceName] = transcription.text;
    }
    const conversation = formatConversation(messages).replace(/<attached:\s*([^>]+)>/gi, (_, name: string) => `[Voice note transcript: ${transcripts[name.trim()] ?? "unavailable"}]`);
    const todayIso = new Date().toISOString().slice(0, 10);
    const response = await openai.chat.completions.create({ model: "gpt-4o-mini", response_format: { type: "json_object" }, messages: [{ role: "system", content: `${classificationPrompt}\nCurrent date for calculating explicit timeframes: ${todayIso}.` }, { role: "user", content: conversation }] });
    const raw = response.choices[0]?.message.content;
    let payload: unknown = null;
    try { payload = raw ? JSON.parse(raw) : null; } catch { throw new Error("The AI response was not valid JSON"); }
    const extracted = extractionSchema.safeParse(normalizeExtraction(payload));
    if (!extracted.success) {
      console.error("AI extraction validation failed", extracted.error.issues.map((issue) => ({ path: issue.path, code: issue.code })));
      throw new Error("The AI response did not match the lead schema");
    }
    const lead = extracted.data;
    const priority = lead.engagement_pattern === "engaged_evaluating" ? "high" : lead.engagement_pattern === "price_only" ? "low" : "unclear";
    const suggestedFollowupDate = normalizeFollowupDate(lead.suggested_followup_date, lead.engagement_pattern);
    const engagementReason = lead.engagement_reason?.trim() || (lead.engagement_pattern === "price_only" ? "Asked for price or details and did not continue the conversation." : lead.engagement_pattern === "engaged_evaluating" ? "Discussed the offer with follow-up questions or concerns." : "There is not enough conversation to classify engagement yet.");
    const { data: savedLead, error: leadError } = await supabase.from("leads").insert({ user_id: user.id, name: lead.name, phone: lead.phone, status: lead.status, priority, engagement_pattern: lead.engagement_pattern, engagement_reason: engagementReason, summary: lead.summary, objections: lead.objections, promises_made: lead.promises_made, suggested_followup: lead.suggested_followup, suggested_followup_date: suggestedFollowupDate, raw_transcript: conversation }).select().single();
    if (leadError) throw leadError;
    await supabase.from("uploads").update({ status: "completed" }).eq("id", upload.id).eq("user_id", user.id);
    return jsonSuccess({ uploadId: upload.id, leads: [savedLead] });
  } catch (error) {
    const message = errorMessage(error, "Processing failed; please retry this upload.");
    if (supabase && uploadId) {
      try { await supabase.from("uploads").update({ status: "failed", error_message: `[PROCESSING_ERROR] ${message} Request: ${requestId}` }).eq("id", uploadId).eq("user_id", userId); } catch { /* preserve the original processing error */ }
    }
    console.error("POST /api/process failed", { requestId, userId, uploadId, code: "PROCESSING_ERROR", error });
    return jsonError("We could not finish processing this export. Please try again.", "PROCESSING_ERROR", 500, { requestId, hint: message });
  }
}
