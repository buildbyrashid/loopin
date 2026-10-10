import OpenAI from "openai";
import JSZip from "jszip";
import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { formatConversation, parseWhatsAppChat } from "@/lib/whatsapp";

const extractionSchema = z.object({ name: z.string().min(1), phone: z.string().nullable().optional(), status: z.enum(["hot", "warm", "cold"]), priority: z.enum(["high", "low", "unclear"]), engagement_pattern: z.enum(["price_only", "engaged_evaluating", "unclear"]), summary: z.string(), objections: z.string(), promises_made: z.string(), suggested_followup: z.string(), suggested_followup_date: z.string() });

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
    const response = await openai.chat.completions.create({ model: "gpt-4o-mini", response_format: { type: "json_object" }, messages: [{ role: "system", content: "Extract one sales lead from a WhatsApp conversation. Return JSON fields: name, phone, status (hot/warm/cold), priority (high/low/unclear), engagement_pattern (price_only/engaged_evaluating/unclear), summary, objections, promises_made, suggested_followup, suggested_followup_date. Return structured output in English. Never invent facts." }, { role: "user", content: conversation }] });
    const raw = response.choices[0]?.message.content;
    const extracted = extractionSchema.safeParse(raw ? JSON.parse(raw) : null);
    if (!extracted.success) throw new Error("The AI response did not match the lead schema");
    const lead = extracted.data;
    const { data: savedLead, error: leadError } = await supabase.from("leads").insert({ user_id: user.id, name: lead.name, phone: lead.phone, status: lead.status, priority: lead.priority, engagement_pattern: lead.engagement_pattern, summary: lead.summary, objections: lead.objections, promises_made: lead.promises_made, suggested_followup: lead.suggested_followup, suggested_followup_date: lead.suggested_followup_date, raw_transcript: conversation }).select().single();
    if (leadError) throw leadError;
    await supabase.from("uploads").update({ status: "completed" }).eq("id", upload.id).eq("user_id", user.id);
    return jsonSuccess({ uploadId: upload.id, leads: [savedLead] });
  } catch (error) {
    console.error("POST /api/process", { userId, error });
    return jsonError("We could not finish processing this export. Please try again.", "PROCESSING_ERROR", 500);
  }
}
