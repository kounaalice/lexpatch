/**
 * 監査証跡 (Audit Trail) — 公共インフラ基準
 *
 * 全ての重要操作を構造化ログとして記録する。
 * 「誰が (actor)・いつ (timestamp)・何を (action)・どのリソースに (resource)」を
 * 説明責任のために残す。
 *
 * Phase 1: console ログ (Cloudflare Workers のログに残る)
 * Phase 2: Supabase audit_logs テーブルに永続化
 */

import { logger } from "./logger";
import { createAdminClient } from "./supabase/server";
import type { Json } from "@/types/database";

export type AuditAction =
  // 認証
  | "auth.login"
  | "auth.logout"
  | "auth.register"
  | "auth.password_change"
  | "auth.password_reset_request"
  // パッチ操作
  | "patch.create"
  | "patch.update"
  | "patch.delete"
  // コメンタリー
  | "commentary.create"
  | "commentary.update"
  | "commentary.delete"
  // コミュニティ
  | "community.create"
  | "community.join"
  | "community.leave"
  // プロジェクト
  | "project.create"
  | "project.update"
  | "project.delete"
  // 管理者
  | "admin.member_role_change"
  | "admin.content_moderate"
  | "admin.system_config"
  // ワークスペース
  | "workspace.create"
  | "workspace.member_add"
  | "workspace.member_remove"
  | "workspace.document_create"
  | "workspace.document_update"
  | "workspace.approval_submit"
  | "workspace.approval_decide";

export interface AuditEntry {
  timestamp: string;
  action: AuditAction;
  actor: {
    id: string;
    name?: string;
    role?: string;
    ip?: string;
  };
  resource: {
    type: string;
    id: string;
    name?: string;
  };
  detail?: Record<string, unknown>;
  result: "success" | "failure" | "denied";
}

/**
 * 監査ログをSupabaseに永続化する (fire-and-forget)
 * エラーが発生しても例外を投げず、警告ログのみ出力する。
 */
async function persistToSupabase(entry: AuditEntry): Promise<void> {
  try {
    const supabase = createAdminClient();

    const detail: { [key: string]: Json | undefined } = {
      ...(entry.detail as { [key: string]: Json | undefined } | undefined),
      result: entry.result,
      ...(entry.resource.name ? { resource_name: entry.resource.name } : {}),
      ...(entry.actor.role ? { actor_role: entry.actor.role } : {}),
    };

    const { error } = await supabase.from("audit_logs").insert({
      action: entry.action,
      actor_id: entry.actor.id === "anonymous" ? null : entry.actor.id,
      actor_name: entry.actor.name ?? null,
      actor_ip: entry.actor.ip ?? null,
      resource_type: entry.resource.type,
      resource_id: entry.resource.id,
      detail,
    });

    if (error) {
      logger.warn("Audit log persistence failed", {
        error: error.message,
        code: error.code,
        action: entry.action,
      });
    }
  } catch (err) {
    // Supabase クライアント初期化失敗等 — ログだけ出して握りつぶす
    logger.warn("Audit log persistence error", {
      error: err instanceof Error ? err.message : String(err),
      action: entry.action,
    });
  }
}

/**
 * 監査ログを記録する
 */
export function auditLog(
  action: AuditAction,
  actor: AuditEntry["actor"],
  resource: AuditEntry["resource"],
  result: AuditEntry["result"] = "success",
  detail?: Record<string, unknown>,
): void {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action,
    actor,
    resource,
    result,
    ...(detail ? { detail } : {}),
  };

  // Phase 1: 構造化ログとして出力 (CF Workers ログに永続化)
  logger.info(`AUDIT: ${action}`, entry as unknown as Record<string, unknown>);

  // Phase 2: Supabase に fire-and-forget で永続化
  // await しない — リクエストをブロックしない
  persistToSupabase(entry).catch(() => {
    // persistToSupabase 内部で既にエラーハンドリング済み
    // ここは Promise の unhandled rejection 防止のみ
  });
}

/**
 * リクエストからアクター情報を抽出する
 */
export function extractActor(
  request: Request,
  session?: { memberId: string; name?: string; role?: string },
): AuditEntry["actor"] {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (session) {
    return {
      id: session.memberId,
      name: session.name,
      role: session.role,
      ip,
    };
  }

  return { id: "anonymous", ip };
}
