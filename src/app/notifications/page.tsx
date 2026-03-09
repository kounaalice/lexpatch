"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";

/* ── 型定義 ── */
interface Notification {
  id: string;
  project_id: string;
  sender_member_id: string | null;
  title: string;
  content: string;
  target_type: string; // "all" | "org_type" | "individual"
  created_at: string;
  is_read: boolean;
}

interface NotificationData {
  unread_count: number;
  notifications: Notification[];
  projects: Record<string, string>; // project_id → title
}

/* ── target_type ラベル ── */
function targetBadge(type: string): { label: string; color: string; bg: string } {
  switch (type) {
    case "all":
      return { label: "全体", color: "#0369A1", bg: "#EFF8FF" };
    case "org_type":
      return { label: "組織宛", color: "#7C3AED", bg: "#F5F3FF" };
    case "individual":
      return { label: "個別", color: "#059669", bg: "#ECFDF5" };
    default:
      return { label: type, color: "var(--color-text-secondary)", bg: "var(--color-bg)" };
  }
}

/* ── 日付フォーマット ── */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}`;
}

/* ── メインコンポーネント ── */
export default function NotificationsPage() {
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NotificationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // セッション確認
  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s) setLoading(false);
  }, []);

  // お知らせ取得
  const fetchNotifications = useCallback(async (memberId: string) => {
    try {
      const res = await fetch(`/api/notifications?member_id=${encodeURIComponent(memberId)}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error ?? "お知らせの取得に失敗しました");
        return;
      }
      const json: NotificationData = await res.json();
      setData(json);
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.memberId) {
      fetchNotifications(session.memberId);
    }
  }, [session, fetchNotifications]);

  // 展開時に既読マーク
  async function handleExpand(notification: Notification) {
    const newId = expandedId === notification.id ? null : notification.id;
    setExpandedId(newId);

    if (newId && !notification.is_read && session?.memberId) {
      try {
        await fetch("/api/notifications/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notification_id: notification.id,
            member_id: session.memberId,
          }),
        });
        // ローカルで既読に更新
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            unread_count: Math.max(0, prev.unread_count - 1),
            notifications: prev.notifications.map((n) =>
              n.id === notification.id ? { ...n, is_read: true } : n,
            ),
          };
        });
        // Headerバッジ即時更新
        window.dispatchEvent(new CustomEvent("lexcard:notification-read"));
      } catch {
        // 既読マーク失敗は無視
      }
    }
  }

  // ── 未ログイン ──
  if (!loading && !session) {
    return (
      <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%", padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>&rsaquo;</span>
            <span>お知らせ</span>
          </nav>

          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "3rem 2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.1rem",
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
                fontWeight: 700,
              }}
            >
              ログインが必要です
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginBottom: "1.5rem",
                lineHeight: 1.7,
              }}
            >
              お知らせを表示するにはログインしてください。
            </p>
            <Link
              href={`/login?return=${encodeURIComponent("/notifications")}`}
              style={{
                display: "inline-block",
                padding: "0.6rem 1.5rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ログインする
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── プロジェクトごとにグループ化 ──
  const grouped: Record<string, Notification[]> = {};
  if (data?.notifications) {
    for (const n of data.notifications) {
      const pid = n.project_id;
      if (!grouped[pid]) grouped[pid] = [];
      grouped[pid].push(n);
    }
  }
  const groupEntries = Object.entries(grouped);

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ── ヘッダー ── */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>&rsaquo;</span>
            <span>お知らせ</span>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div
              style={{
                width: "3px",
                height: "1.8rem",
                backgroundColor: "var(--color-accent)",
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              お知らせ
            </h1>
            {data && data.unread_count > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "0.15rem 0.5rem",
                }}
              >
                {data.unread_count} 件未読
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── コンテンツ ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        {/* ローディング */}
        {loading && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
              }}
            >
              読み込み中...
            </p>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div
            style={{
              padding: "1rem 1.25rem",
              backgroundColor: "var(--color-del-bg)",
              border: "1px solid var(--color-del-fg)",
              borderRadius: "8px",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-del-fg)",
                margin: 0,
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* 空状態 */}
        {!loading && !error && data && data.notifications.length === 0 && (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "3rem 2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              お知らせはありません
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              プロジェクトに参加すると、お知らせがここに表示されます。
            </p>
          </div>
        )}

        {/* プロジェクトごとのお知らせ */}
        {!loading &&
          !error &&
          groupEntries.map(([projectId, notifications]) => (
            <section key={projectId} style={{ marginBottom: "2rem" }}>
              {/* プロジェクト名ヘッダー */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "1.2rem",
                    backgroundColor: "var(--color-accent)",
                    borderRadius: "2px",
                    flexShrink: 0,
                  }}
                />
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    margin: 0,
                  }}
                >
                  <Link
                    href={`/projects/${projectId}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {data?.projects?.[projectId] ?? "プロジェクト"}
                  </Link>
                </h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  ({notifications.length})
                </span>
              </div>

              {/* お知らせリスト */}
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {notifications.map((n, idx) => {
                  const badge = targetBadge(n.target_type);
                  const isExpanded = expandedId === n.id;

                  return (
                    <div key={n.id}>
                      {idx > 0 && <div style={{ borderTop: "1px solid var(--color-border)" }} />}

                      {/* ヘッダー行（クリックで展開） */}
                      <button
                        onClick={() => handleExpand(n)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          padding: "0.85rem 1rem",
                          border: "none",
                          backgroundColor: isExpanded ? "var(--color-bg)" : "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background-color 0.15s",
                        }}
                      >
                        {/* 未読インジケータ */}
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: n.is_read ? "transparent" : "var(--color-accent)",
                            border: n.is_read ? "1px solid var(--color-border)" : "none",
                            flexShrink: 0,
                          }}
                        />

                        {/* 日付 */}
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.72rem",
                            color: "var(--color-text-secondary)",
                            flexShrink: 0,
                            minWidth: "6.5rem",
                          }}
                        >
                          {formatDate(n.created_at)}
                        </span>

                        {/* target_type バッジ */}
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: badge.color,
                            backgroundColor: badge.bg,
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {badge.label}
                        </span>

                        {/* タイトル */}
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.88rem",
                            color: "var(--color-text-primary)",
                            fontWeight: n.is_read ? 400 : 700,
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {n.title}
                        </span>

                        {/* 展開矢印 */}
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.7rem",
                            color: "var(--color-text-secondary)",
                            flexShrink: 0,
                            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 0.15s",
                          }}
                        >
                          ▶
                        </span>
                      </button>

                      {/* 展開コンテンツ */}
                      {isExpanded && (
                        <div
                          style={{
                            padding: "0 1rem 1rem 2.2rem",
                            backgroundColor: "var(--color-bg)",
                          }}
                        >
                          {/* 本文 */}
                          <div
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.88rem",
                              color: "var(--color-text-primary)",
                              lineHeight: 1.8,
                              whiteSpace: "pre-wrap",
                              padding: "0.75rem 1rem",
                              backgroundColor: "var(--color-surface)",
                              border: "1px solid var(--color-border)",
                              borderRadius: "6px",
                              marginBottom: "0.5rem",
                            }}
                          >
                            {n.content}
                          </div>

                          {/* メタ情報 */}
                          <div
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.75rem",
                              color: "var(--color-text-secondary)",
                              display: "flex",
                              gap: "1rem",
                              flexWrap: "wrap",
                            }}
                          >
                            {n.sender_member_id && (
                              <span>送信者 ID: {n.sender_member_id.slice(0, 8)}...</span>
                            )}
                            <span>送信日時: {formatDate(n.created_at)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
