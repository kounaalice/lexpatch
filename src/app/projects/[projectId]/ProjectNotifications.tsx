"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/session";

interface Notification {
  id: string;
  title: string;
  content: string;
  target_type: string;
  sender_member_id: string;
  is_read: boolean;
  created_at: string;
}

interface ProjectNotificationsProps {
  projectId: string;
  members: Array<{ name: string; org: string; role: string }>;
}

const ORG_TYPES = ["国", "都道府県", "市区町村", "民間", "その他"] as const;

export function ProjectNotifications({ projectId, members }: ProjectNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState<"all" | "org_type" | "individual">("all");
  const [selectedOrgTypes, setSelectedOrgTypes] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const session = getSession();
  const isMember = session && members.some((m) => m.name === session.name);

  useEffect(() => {
    if (session?.memberId) fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNotifications() {
    if (!session?.memberId) return;
    try {
      const res = await fetch(
        `/api/notifications?project_id=${projectId}&member_id=${session.memberId}`,
      );
      if (res.ok) setNotifications(await res.json());
    } catch {
      /* ignore */
    }
  }

  async function markRead(notifId: string) {
    if (!session?.memberId) return;
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: notifId, member_id: session.memberId }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)));
    } catch {
      /* ignore */
    }
  }

  async function sendNotification() {
    if (!session?.memberId || !title.trim() || !content.trim() || sending) return;
    setSending(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (targetType === "org_type") filter.org_types = selectedOrgTypes;
    if (targetType === "individual") filter.member_ids = selectedMembers;

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          sender_member_id: session.memberId,
          title: title.trim(),
          content: content.trim(),
          target_type: targetType,
          target_filter: filter,
        }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setShowForm(false);
        setTargetType("all");
        setSelectedOrgTypes([]);
        setSelectedMembers([]);
        fetchNotifications();
      }
    } catch {
      /* ignore */
    }
    setSending(false);
  }

  function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    const notif = notifications.find((n) => n.id === id);
    if (notif && !notif.is_read) markRead(id);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  const targetLabel = (t: string) => (t === "all" ? "全体" : t === "org_type" ? "組織宛" : "個別");

  if (!session) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // org_typeでメンバーをグルーピング
  const membersByOrg: Record<string, typeof members> = {};
  for (const m of members) {
    const key = "メンバー";
    if (!membersByOrg[key]) membersByOrg[key] = [];
    membersByOrg[key].push(m);
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            margin: 0,
          }}
        >
          <span
            style={{
              width: "3px",
              height: "1rem",
              backgroundColor: "var(--color-accent)",
              borderRadius: "2px",
            }}
          />
          お知らせ
          {unreadCount > 0 && (
            <span
              style={{
                backgroundColor: "#DC2626",
                color: "#fff",
                fontSize: "0.6rem",
                fontWeight: 700,
                padding: "0.1rem 0.35rem",
                borderRadius: "8px",
              }}
            >
              {unreadCount}件未読
            </span>
          )}
        </h3>
        {isMember && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-accent)",
              border: "1px solid var(--color-accent)",
              borderRadius: "4px",
              padding: "0.2rem 0.6rem",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          >
            {showForm ? "閉じる" : "+ 新規"}
          </button>
        )}
      </div>

      {/* 送信フォーム */}
      {showForm && (
        <div
          style={{
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            padding: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="件名"
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              marginBottom: "0.4rem",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              boxSizing: "border-box",
            }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="本文"
            rows={3}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              marginBottom: "0.4rem",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />

          <div style={{ marginBottom: "0.4rem" }}>
            <label
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
              }}
            >
              宛先:
            </label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as "all" | "org_type" | "individual")}
              style={{
                marginLeft: "0.4rem",
                padding: "0.25rem 0.5rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="all">全メンバー</option>
              <option value="org_type">組織区分で選択</option>
              <option value="individual">個別選択</option>
            </select>
          </div>

          {targetType === "org_type" && (
            <div
              style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.4rem" }}
            >
              {ORG_TYPES.map((ot) => (
                <label
                  key={ot}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedOrgTypes.includes(ot)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedOrgTypes([...selectedOrgTypes, ot]);
                      else setSelectedOrgTypes(selectedOrgTypes.filter((t) => t !== ot));
                    }}
                  />
                  {ot}
                </label>
              ))}
            </div>
          )}

          {targetType === "individual" && (
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                padding: "0.4rem",
                marginBottom: "0.4rem",
              }}
            >
              {members.map((m, i) => (
                <label
                  key={i}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.15rem 0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(m.name)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedMembers([...selectedMembers, m.name]);
                      else setSelectedMembers(selectedMembers.filter((n) => n !== m.name));
                    }}
                  />
                  {m.name}
                  {m.org && (
                    <span style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)" }}>
                      （{m.org}）
                    </span>
                  )}
                  <span style={{ fontSize: "0.6rem", color: "var(--color-accent)" }}>
                    [{m.role}]
                  </span>
                </label>
              ))}
            </div>
          )}

          <button
            onClick={sendNotification}
            disabled={sending || !title.trim() || !content.trim()}
            style={{
              padding: "0.35rem 0.75rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: 600,
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              opacity: sending || !title.trim() || !content.trim() ? 0.5 : 1,
            }}
          >
            送信
          </button>
        </div>
      )}

      {/* 通知一覧 */}
      {notifications.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
          }}
        >
          お知らせはありません
        </p>
      ) : (
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            overflow: "hidden",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {notifications.map((n) => (
            <div key={n.id}>
              <button
                onClick={() => toggleExpand(n.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "transparent",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {!n.is_read && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#0284C7",
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.65rem",
                    color: "var(--color-text-secondary)",
                    flexShrink: 0,
                  }}
                >
                  {formatDate(n.created_at)}
                </span>
                <span
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    padding: "0.05rem 0.3rem",
                    borderRadius: "3px",
                    backgroundColor:
                      n.target_type === "all"
                        ? "#EBF2FD"
                        : n.target_type === "org_type"
                          ? "#FFFBEB"
                          : "#F5F3FF",
                    color:
                      n.target_type === "all"
                        ? "#1B4B8A"
                        : n.target_type === "org_type"
                          ? "#D97706"
                          : "#7C3AED",
                    flexShrink: 0,
                  }}
                >
                  {targetLabel(n.target_type)}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--color-text-primary)",
                    fontWeight: n.is_read ? 400 : 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {n.title}
                </span>
              </button>
              {expanded === n.id && (
                <div
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--color-bg)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "var(--color-text-primary)",
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {n.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
