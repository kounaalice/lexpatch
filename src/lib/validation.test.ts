import { describe, it, expect } from "vitest";
import {
  contactSchema,
  loginSchema,
  registerSchema,
  errorReportSchema,
  createPatchSchema,
  commentarySchema,
  validateRequest,
} from "./validation";

describe("contactSchema", () => {
  it("有効なお問い合わせを受け入れる", () => {
    const result = contactSchema.safeParse({
      name: "テストユーザー",
      email: "test@example.com",
      subject: "テスト件名",
      message: "テストメッセージ",
    });
    expect(result.success).toBe(true);
  });

  it("無効なメールを拒否する", () => {
    const result = contactSchema.safeParse({
      name: "テスト",
      email: "not-an-email",
      subject: "件名",
      message: "本文",
    });
    expect(result.success).toBe(false);
  });

  it("制御文字を含む名前を拒否する", () => {
    const result = contactSchema.safeParse({
      name: "テスト\x00ユーザー",
      email: "test@example.com",
      subject: "件名",
      message: "本文",
    });
    expect(result.success).toBe(false);
  });

  it("honeypotが空でないとボットとして拒否する", () => {
    const result = contactSchema.safeParse({
      name: "テスト",
      email: "test@example.com",
      subject: "件名",
      message: "本文",
      honeypot: "bot-filled",
    });
    expect(result.success).toBe(false);
  });

  it("5000文字を超えるメッセージを拒否する", () => {
    const result = contactSchema.safeParse({
      name: "テスト",
      email: "test@example.com",
      subject: "件名",
      message: "あ".repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("有効なログイン情報を受け入れる", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("空パスワードを拒否する", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("128文字を超えるパスワードを拒否する", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("有効な登録情報を受け入れる", () => {
    const result = registerSchema.safeParse({
      name: "新規ユーザー",
      email: "new@example.com",
      password: "securepass123",
      org_type: "government",
    });
    expect(result.success).toBe(true);
  });

  it("不正なorg_typeを拒否する", () => {
    const result = registerSchema.safeParse({
      name: "ユーザー",
      email: "user@example.com",
      password: "password123",
      org_type: "unknown",
    });
    expect(result.success).toBe(false);
  });
});

describe("errorReportSchema", () => {
  it("有効なエラーレポートを受け入れる", () => {
    const result = errorReportSchema.safeParse({
      message: "TypeError: Cannot read property",
      stack: "at Object.<anonymous>...",
      url: "https://lexcard.jp/law/321",
    });
    expect(result.success).toBe(true);
  });

  it("1000文字を超えるメッセージを拒否する", () => {
    const result = errorReportSchema.safeParse({
      message: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe("createPatchSchema", () => {
  it("有効なパッチを受け入れる", () => {
    const result = createPatchSchema.safeParse({
      lawId: "321",
      targetArticle: "第一条",
      lines: [{ op: "ctx", num: "１", text: "既存テキスト" }],
    });
    expect(result.success).toBe(true);
  });

  it("空のlinesを拒否する", () => {
    const result = createPatchSchema.safeParse({
      lawId: "321",
      targetArticle: "第一条",
      lines: [],
    });
    expect(result.success).toBe(false);
  });

  it("不正なopを拒否する", () => {
    const result = createPatchSchema.safeParse({
      lawId: "321",
      targetArticle: "第一条",
      lines: [{ op: "invalid", num: "１", text: "テスト" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("commentarySchema", () => {
  it("有効なコメンタリーを受け入れる", () => {
    const result = commentarySchema.safeParse({
      lawId: "321",
      articleNum: "1",
      content: "この条文は...",
    });
    expect(result.success).toBe(true);
  });

  it("10000文字を超えるコンテンツを拒否する", () => {
    const result = commentarySchema.safeParse({
      lawId: "321",
      articleNum: "1",
      content: "あ".repeat(10001),
    });
    expect(result.success).toBe(false);
  });
});

describe("validateRequest", () => {
  /** Helper to create a Request with JSON body */
  function jsonRequest(body: unknown): Request {
    return new Request("https://lexcard.jp/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("有効なボディでsuccess: trueとパース済みdataを返す", async () => {
    const req = jsonRequest({
      name: "テスト",
      email: "test@example.com",
      subject: "件名",
      message: "本文",
    });
    const result = await validateRequest(req, contactSchema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("テスト");
      expect(result.data.email).toBe("test@example.com");
      expect(result.data.subject).toBe("件名");
      expect(result.data.message).toBe("本文");
    }
  });

  it("バリデーション失敗時にsuccess: falseと400 Responseを返す", async () => {
    const req = jsonRequest({
      name: "テスト",
      email: "not-valid-email",
      subject: "件名",
      message: "本文",
    });
    const result = await validateRequest(req, contactSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Response);
      expect(result.error.status).toBe(400);
      const body = await result.error.json();
      expect(body.error).toBe("Validation failed");
      expect(body.details).toBeInstanceOf(Array);
      expect(body.details.length).toBeGreaterThan(0);
      // Each detail should have path and message
      expect(body.details[0]).toHaveProperty("path");
      expect(body.details[0]).toHaveProperty("message");
    }
  });

  it("不正なJSONでsuccess: falseと400 'Invalid JSON'を返す", async () => {
    const req = new Request("https://lexcard.jp/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "this is not json{{{",
    });
    const result = await validateRequest(req, contactSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Response);
      expect(result.error.status).toBe(400);
      const body = await result.error.json();
      expect(body.error).toBe("Invalid JSON");
    }
  });

  it("複数フィールドのバリデーションエラーでdetailsに全エラーを含む", async () => {
    const req = jsonRequest({
      // name missing, email invalid, subject missing, message missing
    });
    const result = await validateRequest(req, contactSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      const body = await result.error.json();
      expect(body.details.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("detailsのpathがドット区切り形式である", async () => {
    // Use createPatchSchema with invalid nested data
    const req = jsonRequest({
      lawId: "321",
      targetArticle: "第一条",
      lines: [{ op: "invalid", num: "1", text: "テスト" }],
    });
    const result = await validateRequest(req, createPatchSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      const body = await result.error.json();
      // The path for nested array element errors should use dot notation
      const paths = body.details.map((d: { path: string }) => d.path);
      expect(paths.some((p: string) => p.includes("lines"))).toBe(true);
    }
  });
});
