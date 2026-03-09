import { describe, it, expect } from "vitest";
import {
  apiSuccess,
  apiError,
  apiNotFound,
  apiUnauthorized,
  apiForbidden,
  apiRateLimit,
} from "./api-utils";

describe("apiSuccess", () => {
  it("200ステータスでデータを返す", async () => {
    const res = apiSuccess({ items: [1, 2, 3] });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.items).toEqual([1, 2, 3]);
  });

  it("カスタムステータスを設定できる", async () => {
    const res = apiSuccess({ id: "new" }, 201);
    expect(res.status).toBe(201);
  });
});

describe("apiError", () => {
  it("400ステータスでエラーメッセージを返す", async () => {
    const res = apiError("入力が不正です");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("入力が不正です");
  });

  it("詳細情報を含められる", async () => {
    const res = apiError("検証失敗", 422, [{ field: "email" }]);
    const body = await res.json();
    expect(body.details).toEqual([{ field: "email" }]);
  });
});

describe("apiNotFound", () => {
  it("404ステータスを返す", () => {
    expect(apiNotFound().status).toBe(404);
  });
});

describe("apiUnauthorized", () => {
  it("401ステータスを返す", () => {
    expect(apiUnauthorized().status).toBe(401);
  });
});

describe("apiForbidden", () => {
  it("403ステータスを返す", () => {
    expect(apiForbidden().status).toBe(403);
  });
});

describe("apiRateLimit", () => {
  it("429ステータスとRetry-Afterヘッダーを返す", () => {
    const res = apiRateLimit(120);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("120");
  });
});
