import JSZip from "jszip";
import { createRequestId, errorMessage, jsonError, jsonSuccess } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { findWhatsAppChat } from "@/lib/whatsapp";

const MAX_SIZE = 25 * 1024 * 1024;

function archiveEntries(zip: JSZip) {
  const entries = Object.keys(zip.files);
  return entries.length > 40 ? [...entries.slice(0, 40), `...and ${entries.length - 40} more`] : entries;
}

function persistedError(code: string, message: string, requestId: string, entries?: string[]) {
  const entryText = entries?.length ? ` Entries: ${entries.join(", ")}.` : "";
  return `[${code}] ${message}${entryText} Request: ${requestId}`;
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  let userId = "unknown";
  let uploadId: string | undefined;
  let supabase: Awaited<ReturnType<typeof createClient>> = null;
  try {
    supabase = await createClient();
    if (!supabase) return jsonError("Supabase is not configured.", "CONFIGURATION_ERROR", 503, { requestId });
    const database = supabase;
    const { data: { user } } = await database.auth.getUser();
    if (!user) return jsonError("Please sign in to continue.", "UNAUTHENTICATED", 401, { requestId });
    userId = user.id;
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) return jsonError("Upload a .zip file.", "VALIDATION_ERROR", 400, { requestId });
    if (!file.name.toLowerCase().endsWith(".zip") || file.size > MAX_SIZE) return jsonError("Only .zip files up to 25MB are supported.", "VALIDATION_ERROR", 400, { requestId });

    const { data: upload, error: insertError } = await database.from("uploads").insert({ user_id: user.id, file_name: file.name, status: "processing" }).select().single();
    if (insertError || !upload) {
      console.error("POST /api/upload failed", { requestId, userId, code: "DATABASE_ERROR", error: insertError });
      return jsonError("Unable to save this upload.", "DATABASE_ERROR", 500, { requestId });
    }
    uploadId = upload.id;
    const fail = async (message: string, code: string, status: number, details?: { hint?: string; entries?: string[] }) => {
      const savedMessage = persistedError(code, message, requestId, details?.entries);
      await database.from("uploads").update({ status: "failed", error_message: savedMessage }).eq("id", upload.id).eq("user_id", user.id);
      console.error("POST /api/upload failed", { requestId, userId, uploadId: upload.id, code, message, details });
      return jsonError(message, code, status, { requestId, ...details });
    };

    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(await file.arrayBuffer());
    } catch (error) {
      return fail(`The ZIP archive could not be opened: ${errorMessage(error, "invalid ZIP archive")}.`, "INVALID_EXPORT", 400);
    }
    const entries = archiveEntries(zip);
    const chat = await findWhatsAppChat(zip);
    if (!chat) return fail("This archive does not contain a readable WhatsApp chat text export.", "INVALID_EXPORT", 400, { hint: "The ZIP must contain a .txt file with WhatsApp messages. Custom names such as WhatsApp Chat with Dipin Aicura.txt are supported.", entries });
    const { messages } = chat;

    const bytes = await file.arrayBuffer();
    const storagePath = `${user.id}/${upload.id}.zip`;
    const { error: storageError } = await database.storage.from("whatsapp-exports").upload(storagePath, bytes, { contentType: "application/zip", upsert: false });
    if (storageError) return fail("We could not store this export.", "STORAGE_ERROR", 500, { hint: storageError.message });
    return jsonSuccess({ uploadId: upload.id, fileName: file.name, messageCount: messages.length, voiceNotes: entries.filter((name) => /\.(opus|ogg|m4a|mp3|wav|aac|amr|3gp)$/i.test(name)).length }, 201);
  } catch (error) {
    const message = errorMessage(error, "We could not read this WhatsApp export.");
    if (supabase && uploadId) {
      try { await supabase.from("uploads").update({ status: "failed", error_message: persistedError("INVALID_EXPORT", message, requestId) }).eq("id", uploadId).eq("user_id", userId); } catch { /* preserve the original upload error */ }
    }
    console.error("POST /api/upload failed", { requestId, userId, uploadId, code: "INVALID_EXPORT", error });
    return jsonError(`We could not read this WhatsApp export: ${message}`, "INVALID_EXPORT", 400, { requestId });
  }
}
