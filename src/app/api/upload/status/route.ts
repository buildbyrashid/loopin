import { createRequestId, jsonError, jsonSuccess } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestId = createRequestId();
  const uploadId = new URL(request.url).searchParams.get("uploadId");
  if (!uploadId) return jsonError("An upload id is required.", "VALIDATION_ERROR", 400, { requestId });

  const supabase = await createClient();
  if (!supabase) return jsonError("Supabase is not configured.", "CONFIGURATION_ERROR", 503, { requestId });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to continue.", "UNAUTHENTICATED", 401, { requestId });

  const { data, error } = await supabase.from("uploads").select("id,status,progress,progress_message,error_message").eq("id", uploadId).eq("user_id", user.id).maybeSingle();
  if (error) {
    console.error("GET /api/upload/status failed", { requestId, userId: user.id, uploadId, error });
    return jsonError("Upload progress is unavailable. Run the upload progress migration.", "DATABASE_ERROR", 503, { requestId });
  }
  if (!data) return jsonError("Upload not found.", "NOT_FOUND", 404, { requestId });
  return jsonSuccess(data);
}
