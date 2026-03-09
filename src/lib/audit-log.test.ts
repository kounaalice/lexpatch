import { describe, it, expect, vi } from "vitest";
import { auditLog, extractActor } from "./audit-log";
import { logger } from "./logger";

vi.mock("./logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("auditLog", () => {
  it("正しい構造でログを出力する", () => {
    auditLog(
      "auth.login",
      { id: "user-123", name: "テストユーザー", role: "member", ip: "192.168.1.1" },
      { type: "session", id: "sess-abc" },
    );

    expect(logger.info).toHaveBeenCalledWith(
      "AUDIT: auth.login",
      expect.objectContaining({
        action: "auth.login",
        actor: expect.objectContaining({ id: "user-123" }),
        resource: expect.objectContaining({ type: "session" }),
        result: "success",
      }),
    );
  });

  it("失敗結果を記録できる", () => {
    auditLog(
      "auth.login",
      { id: "attacker", ip: "10.0.0.1" },
      { type: "session", id: "n/a" },
      "failure",
      { reason: "invalid_password" },
    );

    expect(logger.info).toHaveBeenCalledWith(
      "AUDIT: auth.login",
      expect.objectContaining({
        result: "failure",
        detail: { reason: "invalid_password" },
      }),
    );
  });

  it("denied結果を記録できる", () => {
    auditLog(
      "admin.member_role_change",
      { id: "user-456", role: "member", ip: "10.0.0.2" },
      { type: "member", id: "user-789" },
      "denied",
    );

    expect(logger.info).toHaveBeenCalledWith(
      "AUDIT: admin.member_role_change",
      expect.objectContaining({ result: "denied" }),
    );
  });

  it("タイムスタンプが含まれる", () => {
    auditLog("patch.create", { id: "user-1", ip: "127.0.0.1" }, { type: "patch", id: "patch-1" });

    expect(logger.info).toHaveBeenCalledWith(
      "AUDIT: patch.create",
      expect.objectContaining({
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      }),
    );
  });
});

describe("extractActor", () => {
  it("セッション情報からアクターを抽出する", () => {
    const req = new Request("https://lexcard.jp/api/test", {
      headers: { "cf-connecting-ip": "203.0.113.1" },
    });
    const actor = extractActor(req, {
      memberId: "user-123",
      name: "テスト",
      role: "admin",
    });

    expect(actor).toEqual({
      id: "user-123",
      name: "テスト",
      role: "admin",
      ip: "203.0.113.1",
    });
  });

  it("未認証ユーザーはanonymousになる", () => {
    const req = new Request("https://lexcard.jp/api/test");
    const actor = extractActor(req);
    expect(actor.id).toBe("anonymous");
  });

  it("X-Forwarded-Forから最初のIPを取得する", () => {
    const req = new Request("https://lexcard.jp/api/test", {
      headers: { "x-forwarded-for": "10.0.0.1, 10.0.0.2, 10.0.0.3" },
    });
    const actor = extractActor(req);
    expect(actor.ip).toBe("10.0.0.1");
  });

  it("IPヘッダーがない場合はunknown", () => {
    const req = new Request("https://lexcard.jp/api/test");
    const actor = extractActor(req);
    expect(actor.ip).toBe("unknown");
  });
});
