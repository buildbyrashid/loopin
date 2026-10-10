export function jsonError(message: string, code = "INTERNAL_ERROR", status = 500) {
  return Response.json({ success: false, error: { code, message } }, { status });
}

export function jsonSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}
