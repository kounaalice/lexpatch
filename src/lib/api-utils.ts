/**
 * APIレスポンスヘルパー — 統一的なレスポンス形式
 */

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ ok: true, data }, { status });
}

export function apiError(message: string, status = 400, details?: unknown): Response {
  return Response.json({ ok: false, error: message, ...(details ? { details } : {}) }, { status });
}

export function apiNotFound(message = "リソースが見つかりません"): Response {
  return apiError(message, 404);
}

export function apiUnauthorized(message = "認証が必要です"): Response {
  return apiError(message, 401);
}

export function apiForbidden(message = "権限がありません"): Response {
  return apiError(message, 403);
}

export function apiRateLimit(retryAfterSeconds = 60): Response {
  return Response.json(
    { ok: false, error: "リクエスト数の上限に達しました" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}
