import OpenAI from "openai";
import JSZip from "jszip";
import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { formatConversation, parseWhatsAppChat } from "@/lib/whatsapp";

const extractionSchema = z.object({ name: z.string().min(1), phone: z.string().nullable().optional(), status: z.enum(["hot", "warm", "cold"]), priority: z.enum(["high", "low", "unclear"]).optional(), engagement_pattern: z.enum(["price_only", "engaged_evaluating", "unclear"]), engagement_reason: z.string().min(1).max(500).optional(), summary: z.string(), objections: z.string(), promises_made: z.string(), suggested_followup: z.string(), suggested_followup_date: z.string().nullable().optional() });

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

export async function POST(request: Request) {
  let userId = "unknown";
  try {
    const supabase = await createClient();
    if (!supabase) return jsonError("Supabase is not configured.", "CONFIGURATION_ERROR", 503);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Please sign in to continue.", "UNAUTHENTICATED", 401);
    userId = user.id;
    if (!process.env.OPENAI_API_KEY) return jsonError("OpenAI is not configured yet.", "CONFIGURATION_ERROR", 503);
    const body = await request.json() as { uploadId?: string };
    if (!body.uploadId) return jsonError("An upload id is required.", "VALIDATION_ERROR", 400);
    const { data: upload } = await supabase.from("uploads").select("id").eq("id", body.uploadId).eq("user_id", user.id).single();
    if (!upload) return jsonError("Upload not found.", "NOT_FOUND", 404);
    const { data: file, error: downloadError } = await supabase.storage.from("whatsapp-exports").download(`${user.id}/${upload.id}.zip`);
    if (downloadError || !file) return jsonError("The uploaded export is unavailable.", "STORAGE_ERROR", 500);
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const chatFile = zip.file(/(^|\/)\_chat\.txt$/i)[0];
    if (!chatFile) return jsonError("The WhatsApp chat text is missing.", "INVALID_EXPORT", 400);
    const messages = parseWhatsAppChat(await chatFile.async("string"));
    const voiceNames = messages.map((message) => message.attachment).filter((name): name is string => Boolean(name));
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
    const extracted = extractionSchema.safeParse(raw ? JSON.parse(raw) : null);
    if (!extracted.success) throw new Error("The AI response did not match the lead schema");
    const lead = extracted.data;
    const priority = lead.engagement_pattern === "engaged_evaluating" ? "high" : lead.engagement_pattern === "price_only" ? "low" : "unclear";
    const suggestedFollowupDate = normalizeFollowupDate(lead.suggested_followup_date, lead.engagement_pattern);
    const engagementReason = lead.engagement_reason?.trim() || (lead.engagement_pattern === "price_only" ? "Asked for price or details and did not continue the conversation." : lead.engagement_pattern === "engaged_evaluating" ? "Discussed the offer with follow-up questions or concerns." : "There is not enough conversation to classify engagement yet.");
    const { data: savedLead, error: leadError } = await supabase.from("leads").insert({ user_id: user.id, name: lead.name, phone: lead.phone, status: lead.status, priority, engagement_pattern: lead.engagement_pattern, engagement_reason: engagementReason, summary: lead.summary, objections: lead.objections, promises_made: lead.promises_made, suggested_followup: lead.suggested_followup, suggested_followup_date: suggestedFollowupDate, raw_transcript: conversation }).select().single();
    if (leadError) throw leadError;
    await supabase.from("uploads").update({ status: "completed" }).eq("id", upload.id).eq("user_id", user.id);
    return jsonSuccess({ uploadId: upload.id, leads: [savedLead] });
  } catch (error) {
    console.error("POST /api/process", { userId, error });
    return jsonError("We could not finish processing this export. Please try again.", "PROCESSING_ERROR", 500);
  }
}
