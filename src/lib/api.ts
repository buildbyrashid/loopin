export type ApiErrorDetails = {
  requestId?: string;
  hint?: string;
  entries?: string[];
};

export function jsonError(message: string, code = "INTERNAL_ERROR", status = 500, details?: ApiErrorDetails) {
  return Response.json({ success: false, error: { code, message, ...details } }, { status });
}

export function createRequestId() {
  return crypto.randomUUID();
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message.trim() : fallback;
}

export function jsonSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}
