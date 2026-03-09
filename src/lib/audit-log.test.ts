import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "./logger";

vi.mock("./logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Supabase admin client のモック
const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({ insert: mockInsert }));

vi.mock("./supabase/server", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
  createClient: vi.fn(),
}));

// audit-log モジュールは Supabase モックの後にインポート
import { auditLog, extractActor } from "./audit-log";
import { createAdminClient } from "./supabase/server";

describe("auditLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

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

  it("Supabaseにaudit_logsをinsertする", async () => {
    auditLog(
      "patch.create",
      { id: "user-1", name: "作成者", role: "admin", ip: "127.0.0.1" },
      { type: "patch", id: "patch-1", name: "テストパッチ" },
      "success",
      { law_id: "law-123" },
    );

    // fire-and-forget なので少し待つ
    await vi.waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("audit_logs");
    });

    expect(mockInsert).toHaveBeenCalledWith({
      action: "patch.create",
      actor_id: "user-1",
      actor_name: "作成者",
      actor_ip: "127.0.0.1",
      resource_type: "patch",
      resource_id: "patch-1",
      detail: {
        law_id: "law-123",
        result: "success",
        resource_name: "テストパッチ",
        actor_role: "admin",
      },
    });
  });

  it("anonymousユーザーのactor_idはnullになる", async () => {
    auditLog(
      "auth.login",
      { id: "anonymous", ip: "10.0.0.1" },
      { type: "session", id: "n/a" },
      "failure",
    );

    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: null,
      }),
    );
  });

  it("Supabase insertエラー時は警告ログを出力し例外を投げない", async () => {
    mockInsert.mockResolvedValue({
      error: { message: "connection refused", code: "PGRST301" },
    });

    // 例外が投げられないことを確認
    expect(() => {
      auditLog("auth.login", { id: "user-1", ip: "127.0.0.1" }, { type: "session", id: "s-1" });
    }).not.toThrow();

    await vi.waitFor(() => {
      expect(logger.warn).toHaveBeenCalledWith(
        "Audit log persistence failed",
        expect.objectContaining({
          error: "connection refused",
          code: "PGRST301",
        }),
      );
    });
  });

  it("Supabaseクライアント初期化失敗時も例外を投げない", async () => {
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error("missing env var");
    });

    expect(() => {
      auditLog("auth.login", { id: "user-1", ip: "127.0.0.1" }, { type: "session", id: "s-1" });
    }).not.toThrow();

    await vi.waitFor(() => {
      expect(logger.warn).toHaveBeenCalledWith(
        "Audit log persistence error",
        expect.objectContaining({
          error: "missing env var",
        }),
      );
    });
  });

  it("detailなしでもSupabase insertが正常に動作する", async () => {
    auditLog("auth.logout", { id: "user-1", ip: "127.0.0.1" }, { type: "session", id: "s-1" });

    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          result: "success",
        }),
      }),
    );
  });

  it("resource.nameがない場合はdetailにresource_nameが含まれない", async () => {
    auditLog("auth.login", { id: "user-1", ip: "127.0.0.1" }, { type: "session", id: "s-1" });

    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });

    const insertedRow = mockInsert.mock.calls[0][0];
    expect(insertedRow.detail).not.toHaveProperty("resource_name");
  });

  it("actor.roleがない場合はdetailにactor_roleが含まれない", async () => {
    auditLog("auth.login", { id: "user-1", ip: "127.0.0.1" }, { type: "session", id: "s-1" });

    await vi.waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });

    const insertedRow = mockInsert.mock.calls[0][0];
    expect(insertedRow.detail).not.toHaveProperty("actor_role");
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
