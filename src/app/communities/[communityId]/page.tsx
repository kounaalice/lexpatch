"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSession, type Session } from "@/lib/session";
import FileUploader from "@/components/FileUploader";
import FileList from "@/components/FileList";

interface Community {
  id: string;
  name: string;
  description: string;
  visibility: string;
  owner_member_id: string;
  member_count: number;
  is_joined: boolean;
  created_at: string;
  updated_at: string;
}

interface Member {
  member_id: string;
  name: string;
  org: string;
  org_type: string;
  joined_at: string;
}

interface Message {
  id: string;
  content: string;
  author_name: string;
  author_org: string;
  created_at: string;
}

const ORG_TYPE_ORDER = ["国", "都道府県", "市区町村", "民間", "その他"] as const;
const ORG_TYPE_LABELS: Record<string, string> = {
  国: "国",
  都道府県: "都道府県",
  市区町村: "市区町村",
  民間: "民間",
  その他: "その他",
};

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params?.communityId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 設定モーダル
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editVis, setEditVis] = useState("public");
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [fileRefreshKey, setFileRefreshKey] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  const fetchCommunity = useCallback(async () => {
    try {
      const qs = session?.memberId ? `?member_id=${session.memberId}` : "";
      const res = await fetch(`/api/communities${qs}`);
      if (!res.ok) throw new Error("コミュニティの取得に失敗しました");
      const all: Community[] = await res.json();
      const found = all.find((c) => c.id === communityId);
      if (!found) throw new Error("コミュニティが見つかりません");
      setCommunity(found);
      setEditName(found.name);
      setEditDesc(found.description);
      setEditVis(found.visibility);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラー");
    }
  }, [communityId, session?.memberId]);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/communities/members?community_id=${communityId}`);
      if (!res.ok) throw new Error("メンバーの取得に失敗しました");
      const data: Member[] = await res.json();
      setMembers(data);
    } catch {
      // non-critical
    }
  }, [communityId]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/communities/messages?community_id=${communityId}`);
      if (!res.ok) throw new Error("メッセージの取得に失敗しました");
      const data: Message[] = await res.json();
      setMessages(data);
    } catch {
      // non-critical
    }
  }, [communityId]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchCommunity(), fetchMembers(), fetchMessages()]);
      setLoading(false);
    }
    init();
  }, [fetchCommunity, fetchMembers, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleJoin() {
    if (!session || !community) return;
    setJoining(true);
    try {
      const res = await fetch("/api/communities/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ community_id: communityId, member_id: session.memberId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "参加エラー");
      }
      setCommunity((prev) =>
        prev ? { ...prev, is_joined: true, member_count: prev.member_count + 1 } : prev,
      );
      await fetchMembers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "参加に失敗しました");
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    if (!session || !community) return;
    if (!confirm("このコミュニティから退出しますか？")) return;
    setLeaving(true);
    try {
      const res = await fetch(
        `/api/communities/members?community_id=${communityId}&member_id=${session.memberId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "退出エラー");
      }
      setCommunity((prev) =>
        prev
          ? { ...prev, is_joined: false, member_count: Math.max(0, prev.member_count - 1) }
          : prev,
      );
      await fetchMembers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "退出に失敗しました");
    } finally {
      setLeaving(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !msgInput.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/communities/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          community_id: communityId,
          author_member_id: session.memberId,
          content: msgInput.trim(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "送信エラー");
      }
      const newMsg: Message = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setMsgInput("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setSending(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  }

  async function saveSettings() {
    if (!editName.trim()) return;
    setSettingsSaving(true);
    try {
      const res = await fetch(`/api/communities?id=${communityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), description: editDesc, visibility: editVis }),
      });
      if (res.ok) {
        setCommunity((prev) =>
          prev
            ? { ...prev, name: editName.trim(), description: editDesc, visibility: editVis }
            : prev,
        );
        setShowSettings(false);
      }
    } catch {
      /* ignore */
    }
    setSettingsSaving(false);
  }

  async function handleDelete() {
    if (!session || !community) return;
    if (!confirm("このコミュニティを削除しますか？この操作は元に戻せません。")) return;
    const token = localStorage.getItem("lp_session_token") ?? "";
    const res = await fetch(`/api/communities?id=${communityId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.memberId}:${token}` },
    });
    if (res.ok) router.push("/communities");
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Group members by org_type
  const membersByOrgType: Record<string, Member[]> = {};
  for (const m of members) {
    const key = m.org_type || "その他";
    if (!membersByOrgType[key]) membersByOrgType[key] = [];
    membersByOrgType[key].push(m);
  }

  const isMember = community?.is_joined ?? false;
  const isOwner = session?.memberId && community?.owner_member_id === session.memberId;

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          minHeight: "100%",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
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
    );
  }

  if (error || !community) {
    return (
      <div
        style={{ backgroundColor: "var(--color-bg)", minHeight: "100%", padding: "3rem 1.5rem" }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>›</span>
            <Link
              href="/communities"
              style={{ color: "var(--color-accent)", textDecoration: "none" }}
            >
              コミュニティ
            </Link>
            <span>›</span>
            <span>エラー</span>
          </nav>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              color: "var(--color-del-fg)",
              padding: "1rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
            }}
          >
            {error ?? "コミュニティが見つかりません"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Breadcrumb */}
        <nav
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            トップ
          </Link>
          <span>›</span>
          <Link
            href="/communities"
            style={{ color: "var(--color-accent)", textDecoration: "none" }}
          >
            コミュニティ
          </Link>
          <span>›</span>
          <span>{community.name}</span>
        </nav>

        {/* Community header */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.5rem",
                  color: "var(--color-text-primary)",
                  margin: "0 0 0.5rem 0",
                }}
              >
                {community.name}
              </h1>
              {community.description && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    margin: "0 0 0.5rem 0",
                    lineHeight: 1.7,
                  }}
                >
                  {community.description}
                </p>
              )}
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span>{community.member_count} メンバー</span>
                {community.visibility === "private" && (
                  <span
                    style={{
                      padding: "0.1rem 0.4rem",
                      backgroundColor: "var(--color-warn-bg)",
                      color: "var(--color-warn-fg)",
                      borderRadius: "3px",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    非公開
                  </span>
                )}
              </div>
            </div>

            {/* Join/Leave/Settings buttons */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {isMember ? (
                <>
                  <button
                    onClick={handleLeave}
                    disabled={leaving}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      padding: "0.45rem 1rem",
                      backgroundColor: "transparent",
                      color: "var(--color-del-fg)",
                      border: "1px solid var(--color-del-fg)",
                      borderRadius: "6px",
                      cursor: leaving ? "default" : "pointer",
                      opacity: leaving ? 0.6 : 1,
                    }}
                  >
                    {leaving ? "退出中..." : "退出する"}
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => setShowSettings(true)}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8rem",
                        padding: "0.45rem 1rem",
                        backgroundColor: "var(--color-bg)",
                        color: "var(--color-text-primary)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      設定
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    if (!session) {
                      alert("ログインが必要です");
                      return;
                    }
                    handleJoin();
                  }}
                  disabled={joining}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    padding: "0.45rem 1rem",
                    backgroundColor: joining ? "var(--color-border)" : "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: joining ? "default" : "pointer",
                  }}
                >
                  {joining ? "参加中..." : "参加する"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Two-column layout: members + chat */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* Members panel */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1.25rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "1rem",
                paddingLeft: "0.75rem",
                borderLeft: "3px solid var(--color-accent)",
              }}
            >
              メンバー ({members.length})
            </h2>

            {members.length === 0 ? (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                メンバーはいません。
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {ORG_TYPE_ORDER.map((orgType) => {
                  const group = membersByOrgType[orgType];
                  if (!group || group.length === 0) return null;
                  return (
                    <div key={orgType}>
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "var(--color-text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          marginBottom: "0.4rem",
                          paddingBottom: "0.25rem",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        {ORG_TYPE_LABELS[orgType] ?? orgType}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {group.map((m) => (
                          <div
                            key={m.member_id}
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.8rem",
                              color: "var(--color-text-primary)",
                              padding: "0.3rem 0",
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>{m.name}</span>
                            {m.org && (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  color: "var(--color-text-secondary)",
                                  marginLeft: "0.4rem",
                                }}
                              >
                                ({m.org})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat panel */}
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Chat header */}
            <div
              style={{
                padding: "0.75rem 1.25rem",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                  paddingLeft: "0.75rem",
                  borderLeft: "3px solid var(--color-accent)",
                }}
              >
                チャット
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  padding: "0.3rem 0.7rem",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  cursor: refreshing ? "default" : "pointer",
                  opacity: refreshing ? 0.6 : 1,
                }}
              >
                {refreshing ? "更新中..." : "更新"}
              </button>
            </div>

            {/* Messages area */}
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {messages.length === 0 ? (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    textAlign: "center",
                    padding: "2rem 0",
                  }}
                >
                  まだメッセージがありません。
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.15rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {msg.author_name}
                      </span>
                      {msg.author_org && (
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.65rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {msg.author_org}
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: "var(--color-text-secondary)",
                          marginLeft: "auto",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
                        color: "var(--color-text-primary)",
                        margin: 0,
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message input */}
            <div
              style={{
                padding: "0.75rem 1.25rem",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              {isMember ? (
                <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    placeholder="メッセージを入力..."
                    maxLength={2000}
                    style={{
                      flex: 1,
                      padding: "0.6rem 0.75rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-sans)",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !msgInput.trim()}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      padding: "0.5rem 1rem",
                      backgroundColor:
                        sending || !msgInput.trim() ? "var(--color-border)" : "var(--color-accent)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: sending || !msgInput.trim() ? "default" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sending ? "送信中..." : "送信"}
                  </button>
                </form>
              ) : (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    margin: 0,
                    textAlign: "center",
                    padding: "0.25rem 0",
                  }}
                >
                  {session
                    ? "メッセージを送信するにはコミュニティに参加してください。"
                    : "ログインが必要です。"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 資料・ファイル */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "1.25rem",
            marginTop: "1.5rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "1rem",
              paddingLeft: "0.75rem",
              borderLeft: "3px solid var(--color-accent)",
            }}
          >
            資料・ファイル
          </h2>

          {isMember && session && (
            <FileUploader
              contextType="community"
              contextId={communityId}
              memberId={session.memberId}
              memberName={session.name}
              token={localStorage.getItem("lp_session_token") ?? ""}
              onUploaded={() => setFileRefreshKey((k) => k + 1)}
            />
          )}

          <FileList
            contextType="community"
            contextId={communityId}
            memberId={session?.memberId}
            token={session ? (localStorage.getItem("lp_session_token") ?? "") : undefined}
            refreshKey={fileRefreshKey}
          />
        </div>

        {/* Responsive: stack on mobile */}
        <style>{`
          @media (max-width: 700px) {
            div[style*="grid-template-columns: 280px 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>

      {/* 設定モーダル */}
      {showSettings && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSettings(false);
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "10px",
              padding: "2rem",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "1.5rem",
              }}
            >
              コミュニティ設定
            </h3>

            <label style={{ display: "block", marginBottom: "1rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  display: "block",
                  marginBottom: "0.35rem",
                }}
              >
                コミュニティ名
              </span>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  boxSizing: "border-box",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "1rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  display: "block",
                  marginBottom: "0.35rem",
                }}
              >
                説明
              </span>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "1.5rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  display: "block",
                  marginBottom: "0.35rem",
                }}
              >
                公開設定
              </span>
              <select
                value={editVis}
                onChange={(e) => setEditVis(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 0.75rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  boxSizing: "border-box",
                }}
              >
                <option value="public">公開</option>
                <option value="private">非公開</option>
              </select>
            </label>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
              <button
                onClick={handleDelete}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  color: "#DC2626",
                  border: "1px solid #DC2626",
                  cursor: "pointer",
                }}
              >
                削除
              </button>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setShowSettings(false)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    padding: "0.45rem 1rem",
                    backgroundColor: "transparent",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  キャンセル
                </button>
                <button
                  onClick={saveSettings}
                  disabled={settingsSaving || !editName.trim()}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    padding: "0.45rem 1rem",
                    borderRadius: "6px",
                    backgroundColor: settingsSaving ? "var(--color-border)" : "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    cursor: settingsSaving ? "default" : "pointer",
                  }}
                >
                  {settingsSaving ? "保存中…" : "保存"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
