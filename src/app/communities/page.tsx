"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, type Session } from "@/lib/session";

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

export default function CommunitiesPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createVis, setCreateVis] = useState("public");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // join loading state
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  useEffect(() => {
    fetchCommunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function fetchCommunities() {
    setLoading(true);
    setError(null);
    try {
      const qs = session?.memberId ? `?member_id=${session.memberId}` : "";
      const res = await fetch(`/api/communities${qs}`);
      if (!res.ok) {
        setCommunities([]);
        setLoading(false);
        return;
      }
      const data: Community[] = await res.json();
      setCommunities(data);
    } catch {
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(communityId: string) {
    if (!session) return;
    setJoiningId(communityId);
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
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId ? { ...c, is_joined: true, member_count: c.member_count + 1 } : c,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "参加に失敗しました");
    } finally {
      setJoiningId(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          description: createDesc,
          visibility: createVis,
          owner_member_id: session.memberId,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "作成エラー");
      }
      const created = await res.json();
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      setCreateVis("public");
      router.push(`/communities/${created.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setCreating(false);
    }
  }

  const joinedCommunities = communities.filter((c) => c.is_joined);
  const exploreCommunities = communities.filter((c) => !c.is_joined);

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダー */}
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
            <span>›</span>
            <span>コミュニティ</span>
          </nav>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "0.25rem",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.75rem",
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              コミュニティ
            </h1>
            <button
              onClick={() => {
                if (!session) {
                  alert("ログインが必要です");
                  return;
                }
                setShowCreate(true);
              }}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 600,
                padding: "0.5rem 1.2rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              + コミュニティを作成
            </button>
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            法令・行政に関心のあるメンバー同士の交流スペースです。プロジェクトとは独立した自由参加グループで、勉強会・情報交換・雑談など幅広い話題を扱えます。
          </p>
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {loading && (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              color: "var(--color-text-secondary)",
              padding: "2rem 0",
              textAlign: "center",
            }}
          >
            読み込み中...
          </p>
        )}

        {error && (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-del-fg)",
              padding: "0.75rem 1rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {/* Joined communities section */}
            {session && (
              <section style={{ marginBottom: "2.5rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "1rem",
                    paddingLeft: "0.85rem",
                    borderLeft: "3px solid var(--color-accent)",
                  }}
                >
                  参加中のコミュニティ
                </h2>
                {joinedCommunities.length === 0 ? (
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      color: "var(--color-text-secondary)",
                      padding: "1rem",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                    }}
                  >
                    まだコミュニティに参加していません。
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: "0.5rem",
                    }}
                  >
                    {joinedCommunities.map((c) => (
                      <CommunityCard
                        key={c.id}
                        community={c}
                        session={session}
                        joiningId={joiningId}
                        onJoin={handleJoin}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Explore communities section */}
            <section>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "1rem",
                  paddingLeft: "0.85rem",
                  borderLeft: "3px solid var(--color-accent)",
                }}
              >
                コミュニティを探す
              </h2>
              {exploreCommunities.length === 0 ? (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    padding: "1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                  }}
                >
                  {session
                    ? "すべてのコミュニティに参加済みです。"
                    : "公開コミュニティはまだありません。ログインしてコミュニティを作成できます。"}
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: "0.5rem",
                  }}
                >
                  {exploreCommunities.map((c) => (
                    <CommunityCard
                      key={c.id}
                      community={c}
                      session={session}
                      joiningId={joiningId}
                      onJoin={handleJoin}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Create community modal */}
      {showCreate && (
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
            if (e.target === e.currentTarget) setShowCreate(false);
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
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "1.5rem",
              }}
            >
              コミュニティを作成
            </h3>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  コミュニティ名 <span style={{ color: "var(--color-del-fg)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="例: 行政手続法改正検討会"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    fontFamily: "var(--font-sans)",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text-primary)",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  説明
                </label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="コミュニティの目的や対象分野を記入してください"
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    fontFamily: "var(--font-sans)",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text-primary)",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  公開設定
                </label>
                <select
                  value={createVis}
                  onChange={(e) => setCreateVis(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.75rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    fontFamily: "var(--font-sans)",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text-primary)",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="public">公開（誰でも参加可能）</option>
                  <option value="private">非公開（招待制）</option>
                </select>
              </div>

              {createError && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--color-del-fg)",
                    marginBottom: "1rem",
                  }}
                >
                  {createError}
                </p>
              )}

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    padding: "0.5rem 1rem",
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
                  type="submit"
                  disabled={creating || !createName.trim()}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    padding: "0.5rem 1.2rem",
                    backgroundColor: creating ? "var(--color-border)" : "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: creating ? "default" : "pointer",
                    opacity: !createName.trim() ? 0.5 : 1,
                  }}
                >
                  {creating ? "作成中..." : "作成する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Community card component ── */

function CommunityCard({
  community,
}: {
  community: Community;
  session: Session | null;
  joiningId: string | null;
  onJoin: (id: string) => void;
}) {
  return (
    <Link
      href={`/communities/${community.id}`}
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        padding: "0.6rem 0.85rem",
        textDecoration: "none",
        display: "block",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {community.name}
        </span>
        {community.is_joined ? (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontWeight: 600,
              padding: "0.1rem 0.4rem",
              backgroundColor: "var(--color-add-bg)",
              color: "var(--color-add-fg)",
              borderRadius: "3px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            参加中
          </span>
        ) : community.visibility === "private" ? (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontWeight: 600,
              padding: "0.1rem 0.4rem",
              backgroundColor: "var(--color-warn-bg)",
              color: "var(--color-warn-fg)",
              borderRadius: "3px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            非公開
          </span>
        ) : null}
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.72rem",
          color: "var(--color-text-secondary)",
          marginTop: "0.15rem",
        }}
      >
        {community.member_count} メンバー
      </div>
    </Link>
  );
}
