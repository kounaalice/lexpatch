/**
 * 監査証跡 (Audit Trail) — 公共インフラ基準
 *
 * 全ての重要操作を構造化ログとして記録する。
 * 「誰が (actor)・いつ (timestamp)・何を (action)・どのリソースに (resource)」を
 * 説明責任のために残す。
 *
 * Phase 1: console ログ (Cloudflare Workers のログに残る)
 * Phase 2: Supabase audit_logs テーブルに永続化 (将来)
 */

import { logger } from "./logger";

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
