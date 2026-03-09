/**
 * 権限ロール管理 — D-6
 * workspace_members テーブルの role カラムに基づく権限チェック
 */

export type WsRole = "owner" | "admin" | "member" | "viewer";

const ROLE_LEVELS: Record<WsRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

/** ロールの権限レベル比較 */
export function hasPermission(userRole: WsRole, requiredRole: WsRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

/** 各機能に必要な最低ロール */
export const FEATURE_PERMISSIONS: Record<string, WsRole> = {
  // 閲覧系
  view_bulletin: "viewer",
  view_circular: "viewer",
  view_approvals: "viewer",
  view_datatable: "viewer",
  view_forms: "viewer",
  view_docs: "viewer",
  view_timetrack: "viewer",
  view_calendar: "viewer",
  // 投稿・作成系
  create_bulletin: "member",
  create_circular: "member",
  create_approval: "member",
  create_form: "member",
  create_doc: "member",
  clock_in: "member",
  create_event: "member",
  // 管理系
  pin_bulletin: "admin",
  manage_members: "admin",
  close_circular: "admin",
  manage_roles: "owner",
  delete_workspace: "owner",
};

/** 機能が使えるかチェック */
export function canAccess(userRole: WsRole, feature: keyof typeof FEATURE_PERMISSIONS): boolean {
  const required = FEATURE_PERMISSIONS[feature];
  return required ? hasPermission(userRole, required) : false;
}

/** ロールの日本語ラベル */
export const ROLE_LABELS: Record<WsRole, string> = {
  owner: "オーナー",
  admin: "管理者",
  member: "メンバー",
  viewer: "閲覧者",
};

export const ALL_ROLES: WsRole[] = ["owner", "admin", "member", "viewer"];
