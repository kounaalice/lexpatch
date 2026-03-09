/**
 * API入力検証スキーマ — Zod v4
 * 全APIルートの入力をランタイムで検証する
 */
import { z } from "zod";

// ─── 共通バリデーター ────────────────────────────────────

/** メールアドレス (RFC 5322 簡易) */
const email = z.string().email().max(254);

/** 安全な文字列 (制御文字除外) */
const safeString = (max: number) =>
  z
    .string()
    .max(max)
    .refine((s) => !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(s), {
      message: "制御文字を含むことはできません",
    });

/** UUID v4 */
const uuid = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

// ─── お問い合わせ ────────────────────────────────────────

export const contactSchema = z.object({
  name: safeString(100),
  email: email,
  organization: safeString(200).optional(),
  subject: safeString(200),
  message: safeString(5000),
  honeypot: z.string().max(0).optional(), // ボット検知
});

// ─── 認証 ────────────────────────────────────────────────

/** ログイン: メールアドレス or 表示名+所属 */
export const loginSchema = z.object({
  name: safeString(50).optional(),
  email: email.optional(),
  org: safeString(200).optional(),
  password: z.string().min(1).max(128),
});

export const registerSchema = z.object({
  name: safeString(50),
  email: email,
  password: z.string().min(8).max(128),
  org: safeString(200).optional(),
  org_type: z.enum(["government", "corporation", "individual", "npo", "education", ""]).optional(),
  bio: safeString(2000).optional(),
  experience: safeString(2000).optional(),
  preferred_areas: z.array(safeString(100)).max(20).optional(),
});

export const resetPasswordSchema = z.object({
  email: email,
});

/** パスワードリセット実行 (PATCH) */
export const resetPasswordExecuteSchema = z.object({
  email: email,
  token: z.string().min(1).max(500),
  newPassword: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

// ─── パッチ操作 ──────────────────────────────────────────

export const patchLineSchema = z.object({
  op: z.enum(["add", "del", "ctx"]),
  num: z.string().nullable(),
  text: z.string().max(10000),
});

export const createPatchSchema = z.object({
  lawId: safeString(100),
  targetArticle: safeString(200),
  description: safeString(1000).optional(),
  lines: z.array(patchLineSchema).min(1).max(500),
});

// ─── コメンタリー ────────────────────────────────────────

export const commentarySchema = z.object({
  lawId: safeString(100),
  articleNum: safeString(50),
  content: safeString(10000),
  parentId: uuid.optional(),
});

// ─── コミュニティ ────────────────────────────────────────

export const communitySchema = z.object({
  name: safeString(100),
  description: safeString(2000).optional(),
  isPublic: z.boolean().default(true),
});

// ─── エラーレポート ──────────────────────────────────────

export const errorReportSchema = z.object({
  message: safeString(1000),
  stack: safeString(2048).optional(),
  url: safeString(2000).optional(),
  digest: safeString(100).optional(),
  timestamp: z.string().datetime().optional(),
  userAgent: safeString(500).optional(),
});

// ─── ヘルパー ────────────────────────────────────────────

/**
 * APIルートでリクエストボディを検証する
 * 失敗時は { success: false, error: Response } を返す
 */
export async function validateRequest<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: Response }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return {
        success: false,
        error: Response.json(
          {
            error: "Validation failed",
            details: result.error.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
            })),
          },
          { status: 400 },
        ),
      };
    }
    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      error: Response.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}
