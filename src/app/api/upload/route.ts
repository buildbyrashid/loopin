import JSZip from "jszip";
import { jsonError, jsonSuccess } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { parseWhatsAppChat } from "@/lib/whatsapp";

const MAX_SIZE = 25 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) return jsonError("Supabase is not configured.", "CONFIGURATION_ERROR", 503);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonError("Please sign in to continue.", "UNAUTHENTICATED", 401);
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) return jsonError("Upload a .zip file.", "VALIDATION_ERROR", 400);
    if (!file.name.toLowerCase().endsWith(".zip") || file.size > MAX_SIZE) return jsonError("Only .zip files up to 25MB are supported.", "VALIDATION_ERROR", 400);

    const bytes = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(bytes);
    const chat = zip.file(/(^|\/)(?:_chat|chat)\.txt$/i)[0];
    if (!chat) return jsonError("This archive does not contain a WhatsApp chat.txt or _chat.txt export.", "INVALID_EXPORT", 400);
    const messages = parseWhatsAppChat(await chat.async("string"));
    if (!messages.length) return jsonError("We could not find readable messages in this export.", "INVALID_EXPORT", 400);

    const { data: upload, error: insertError } = await supabase.from("uploads").insert({ user_id: user.id, file_name: file.name, status: "processing" }).select().single();
    if (insertError || !upload) { console.error("POST /api/upload insert", user.id, insertError); return jsonError("Unable to save this upload.", "DATABASE_ERROR", 500); }
    const storagePath = `${user.id}/${upload.id}.zip`;
    const { error: storageError } = await supabase.storage.from("whatsapp-exports").upload(storagePath, bytes, { contentType: "application/zip", upsert: false });
    if (storageError) { await supabase.from("uploads").update({ status: "failed", error_message: "Storage upload failed" }).eq("id", upload.id); console.error("POST /api/upload storage", user.id, storageError); return jsonError("We could not store this export.", "STORAGE_ERROR", 500); }
    return jsonSuccess({ uploadId: upload.id, fileName: file.name, messageCount: messages.length, voiceNotes: Object.keys(zip.files).filter((name) => /\.(opus|ogg|m4a|mp3)$/i.test(name)).length }, 201);
  } catch (error) {
    console.error("POST /api/upload", error);
    return jsonError("We could not read this WhatsApp export.", "INVALID_EXPORT", 400);
  }
}
