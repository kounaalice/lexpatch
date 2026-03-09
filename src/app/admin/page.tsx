"use client";

import { useState, useEffect, useCallback } from "react";
import { getSession } from "@/lib/session";
import Link from "next/link";

type Section =
  | "stats"
  | "members"
  | "patches"
  | "projects"
  | "communities"
  | "contacts"
  | "analytics";

interface AnalyticsData {
  period: { since: string; until: string; days: number };
  totalRequests: number;
  totalErrors: number;
  errorRate: string;
  dailyAvg: number;
  uniquePages: number;
  daily: { date: string; requests: number; errors: number }[];
  topPages: { path: string; count: number }[];
  statusDist: { status: number; count: number }[];
}

interface Stats {
  members: number;
  patches: number;
  projects: number;
  communities: number;
  commentaries: number;
  contacts: number;
}

export default function AdminPage() {
  const [section, setSection] = useState<Section>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const session = getSession();

  const isAdmin = session?.role === "admin" || session?.role === "moderator";

  const fetchData = useCallback(
    async (sec: Section, days?: number) => {
      if (!session?.token) return;
      setLoading(true);
      setError(null);
      try {
        if (sec === "analytics") {
          const d = days ?? analyticsDays;
          const res = await fetch(`/api/admin/analytics?days=${d}`, {
            headers: { Authorization: `Bearer ${session.memberId}:${session.token}` },
          });
          if (!res.ok) {
            const body = await res.json();
            throw new Error(body.error ?? `Error ${res.status}`);
          }
          const body = await res.json();
          setAnalytics(body);
        } else {
          const res = await fetch(`/api/admin?section=${sec}`, {
            headers: { Authorization: `Bearer ${session.memberId}:${session.token}` },
          });
          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error ?? `Error ${res.status}`);
          }
          const d = await res.json();
          if (sec === "stats") {
            setStats(d);
          } else {
            setData(d);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "取得エラー");
      } finally {
        setLoading(false);
      }
    },
    [session?.memberId, session?.token, analyticsDays],
  );

  useEffect(() => {
    if (isAdmin) fetchData(section);
  }, [section, isAdmin, fetchData]);

  async function handleDelete(table: string, id: string, label: string) {
    if (!confirm(`「${label}」を削除しますか？この操作は元に戻せません。`)) return;
    try {
      const res = await fetch("/api/admin", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.memberId}:${session!.token}`,
        },
        body: JSON.stringify({ table, id }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "削除に失敗しました");
        return;
      }
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("ネットワークエラー");
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.memberId}:${session!.token}`,
        },
        body: JSON.stringify({
          table: "member_profiles",
          id: memberId,
          updates: { role: newRole },
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "更新失敗");
        return;
      }
      setData((prev) =>
        prev.map((item) => (item.id === memberId ? { ...item, role: newRole } : item)),
      );
    } catch {
      alert("ネットワークエラー");
    }
  }

  async function handleStatusChange(table: string, id: string, newStatus: string) {
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.memberId}:${session!.token}`,
        },
        body: JSON.stringify({ table, id, updates: { status: newStatus } }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "更新失敗");
        return;
      }
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
      );
    } catch {
      alert("ネットワークエラー");
    }
  }

  if (!session) {
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "600px",
          margin: "0 auto",
          fontFamily: "var(--font-sans)",
        }}
      >
        <p style={{ color: "var(--color-text-secondary)" }}>ログインが必要です。</p>
        <Link href="/login?return=/admin" style={{ color: "var(--color-accent)" }}>
          ログイン →
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "600px",
          margin: "0 auto",
          fontFamily: "var(--font-sans)",
        }}
      >
        <p style={{ color: "var(--color-del-fg)" }}>管理者権限が必要です。</p>
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          ← トップに戻る
        </Link>
      </div>
    );
  }

  const sections: { key: Section; label: string }[] = [
    { key: "stats", label: "統計" },
    { key: "members", label: "メンバー" },
    { key: "patches", label: "改正提案" },
    { key: "projects", label: "プロジェクト" },
    { key: "communities", label: "コミュニティ" },
    { key: "contacts", label: "問い合わせ" },
    { key: "analytics", label: "アクセス解析" },
  ];

  function fmtDate(d: string) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "8px",
    padding: "1rem",
  };
  const btnSmall: React.CSSProperties = {
    padding: "0.2rem 0.5rem",
    border: "1px solid var(--color-border)",
    borderRadius: "4px",
    backgroundColor: "var(--color-bg)",
    fontFamily: "var(--font-sans)",
    fontSize: "0.72rem",
    cursor: "pointer",
  };
  const delBtn: React.CSSProperties = {
    ...btnSmall,
    backgroundColor: "var(--color-del-bg)",
    color: "var(--color-del-fg)",
    borderColor: "var(--color-del-fg)",
  };

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <Link
            href="/"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            ← トップ
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.5rem",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            管理画面
          </h1>
        </div>

        {/* セクションタブ */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderBottom: "1px solid var(--color-border)",
            marginBottom: "1.5rem",
            overflowX: "auto",
          }}
        >
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                borderBottom:
                  section === s.key ? "2px solid var(--color-accent)" : "2px solid transparent",
                backgroundColor: "transparent",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: section === s.key ? "var(--color-accent)" : "var(--color-text-secondary)",
                cursor: "pointer",
                fontWeight: section === s.key ? 700 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && (
          <p
            style={{
              color: "var(--color-del-fg)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </p>
        )}
        {loading && (
          <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>
            読み込み中...
          </p>
        )}

        {/* 統計 */}
        {!loading && section === "stats" && stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {Object.entries(stats).map(([key, val]) => {
              const labels: Record<string, string> = {
                members: "メンバー",
                patches: "改正提案",
                projects: "プロジェクト",
                communities: "コミュニティ",
                commentaries: "逐条解説",
                contacts: "問い合わせ",
              };
              return (
                <div key={key} style={cardStyle}>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "var(--color-accent)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-text-secondary)",
                      fontFamily: "var(--font-sans)",
                      marginTop: "0.2rem",
                    }}
                  >
                    {labels[key] ?? key}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* メンバー一覧 */}
        {!loading && section === "members" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.map((m) => (
              <div
                key={String(m.id)}
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {String(m.name)}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {String(m.org || "")} {m.org_type ? `(${m.org_type})` : ""}
                  </div>
                </div>
                <select
                  value={String(m.role ?? "member")}
                  onChange={(e) => handleRoleChange(String(m.id), e.target.value)}
                  style={{ ...btnSmall, fontSize: "0.78rem" }}
                >
                  <option value="member">member</option>
                  <option value="moderator">moderator</option>
                  <option value="admin">admin</option>
                </select>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {fmtDate(String(m.created_at ?? ""))}
                </span>
                <button
                  onClick={() => handleDelete("member_profiles", String(m.id), String(m.name))}
                  style={delBtn}
                >
                  削除
                </button>
              </div>
            ))}
            {data.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>
                メンバーなし
              </p>
            )}
          </div>
        )}

        {/* 改正提案一覧 */}
        {!loading && section === "patches" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.map((p) => (
              <div
                key={String(p.id)}
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <Link
                    href={`/patch/${p.id}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "var(--color-accent)",
                      textDecoration: "none",
                    }}
                  >
                    {String(p.title)}
                  </Link>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {String(p.law_id ?? "")} /{" "}
                    {String((p.target_articles as string[])?.join(", ") ?? "")}
                  </div>
                </div>
                <select
                  value={String(p.status)}
                  onChange={(e) => handleStatusChange("patches", String(p.id), e.target.value)}
                  style={{ ...btnSmall, fontSize: "0.78rem" }}
                >
                  {["下書き", "議論中", "投票中", "反映済", "却下"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {fmtDate(String(p.created_at ?? ""))}
                </span>
                <button
                  onClick={() => handleDelete("patches", String(p.id), String(p.title))}
                  style={delBtn}
                >
                  削除
                </button>
              </div>
            ))}
            {data.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>
                改正提案なし
              </p>
            )}
          </div>
        )}

        {/* プロジェクト一覧 */}
        {!loading && section === "projects" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.map((p) => (
              <div
                key={String(p.id)}
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <Link
                    href={`/projects/${p.id}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "var(--color-accent)",
                      textDecoration: "none",
                    }}
                  >
                    {String(p.title)}
                  </Link>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {String(p.owner_name ?? "")} / {String(p.visibility ?? "public")}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {fmtDate(String(p.created_at ?? ""))}
                </span>
                <button
                  onClick={() => handleDelete("projects", String(p.id), String(p.title))}
                  style={delBtn}
                >
                  削除
                </button>
              </div>
            ))}
            {data.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>
                プロジェクトなし
              </p>
            )}
          </div>
        )}

        {/* コミュニティ一覧 */}
        {!loading && section === "communities" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.map((c) => (
              <div
                key={String(c.id)}
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <Link
                    href={`/communities/${c.id}`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "var(--color-accent)",
                      textDecoration: "none",
                    }}
                  >
                    {String(c.name)}
                  </Link>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {String(c.description ?? "").slice(0, 60)}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {fmtDate(String(c.created_at ?? ""))}
                </span>
                <button
                  onClick={() => handleDelete("communities", String(c.id), String(c.name))}
                  style={delBtn}
                >
                  削除
                </button>
              </div>
            ))}
            {data.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>
                コミュニティなし
              </p>
            )}
          </div>
        )}

        {/* 問い合わせ一覧 */}
        {!loading && section === "contacts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.map((c) => (
              <div key={String(c.id)} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.3rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {String(c.name ?? "匿名")}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {fmtDate(String(c.created_at ?? ""))}
                  </span>
                </div>
                {Boolean(c.email) && (
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      color: "var(--color-accent)",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {String(c.email)}
                  </div>
                )}
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-primary)",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {String(c.message ?? "")}
                </div>
              </div>
            ))}
            {data.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>
                問い合わせなし
              </p>
            )}
          </div>
        )}

        {/* アクセス解析 */}
        {!loading && section === "analytics" && analytics && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* 期間切替 */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                期間:
              </span>
              {[7, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setAnalyticsDays(d);
                    fetchData("analytics", d);
                  }}
                  style={{
                    ...btnSmall,
                    backgroundColor:
                      analyticsDays === d ? "var(--color-accent)" : "var(--color-bg)",
                    color: analyticsDays === d ? "#fff" : "var(--color-text-secondary)",
                    borderColor:
                      analyticsDays === d ? "var(--color-accent)" : "var(--color-border)",
                    fontWeight: analyticsDays === d ? 700 : 400,
                  }}
                >
                  過去{d}日
                </button>
              ))}
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  marginLeft: "0.5rem",
                }}
              >
                {analytics.period.since} 〜 {analytics.period.until}
              </span>
            </div>

            {/* サマリーカード */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                gap: "0.75rem",
              }}
            >
              <div style={cardStyle}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {analytics.totalRequests.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-sans)",
                    marginTop: "0.2rem",
                  }}
                >
                  総リクエスト数
                </div>
              </div>
              <div style={cardStyle}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color:
                      analytics.totalErrors > 0 ? "var(--color-del-fg)" : "var(--color-accent)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {analytics.totalErrors.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-sans)",
                    marginTop: "0.2rem",
                  }}
                >
                  エラー数 (4xx/5xx)
                </div>
              </div>
              <div style={cardStyle}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {analytics.errorRate}%
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-sans)",
                    marginTop: "0.2rem",
                  }}
                >
                  エラー率
                </div>
              </div>
              <div style={cardStyle}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {(analytics.dailyAvg ?? 0).toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-sans)",
                    marginTop: "0.2rem",
                  }}
                >
                  日次平均
                </div>
              </div>
              <div style={cardStyle}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {(analytics.uniquePages ?? 0).toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-sans)",
                    marginTop: "0.2rem",
                  }}
                >
                  ユニークページ数
                </div>
              </div>
            </div>

            {/* 日別リクエスト数 */}
            <div style={cardStyle}>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                日別リクエスト数
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                {analytics.daily.map((d) => {
                  const maxReq = Math.max(...analytics.daily.map((x) => x.requests), 1);
                  const pct = (d.requests / maxReq) * 100;
                  return (
                    <div
                      key={d.date}
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          color: "var(--color-text-secondary)",
                          minWidth: "5.5rem",
                        }}
                      >
                        {d.date}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "1.2rem",
                          backgroundColor: "var(--color-bg)",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            backgroundColor:
                              d.errors > 0 ? "var(--color-del-fg)" : "var(--color-accent)",
                            borderRadius: "3px",
                            opacity: 0.7,
                            minWidth: "2px",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          color: "var(--color-text-secondary)",
                          minWidth: "4rem",
                          textAlign: "right",
                        }}
                      >
                        {d.requests.toLocaleString()}
                      </span>
                      {d.errors > 0 && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color: "var(--color-del-fg)",
                          }}
                        >
                          ({d.errors}err)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 人気ページ Top 20 */}
            <div style={cardStyle}>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                人気ページ Top 20
              </h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.25rem 0.5rem",
                        color: "var(--color-text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.25rem 0.5rem",
                        color: "var(--color-text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      パス
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "0.25rem 0.5rem",
                        color: "var(--color-text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      リクエスト数
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topPages.map((p, i) => (
                    <tr key={p.path} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td
                        style={{ padding: "0.25rem 0.5rem", color: "var(--color-text-secondary)" }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          padding: "0.25rem 0.5rem",
                          color: "var(--color-text-primary)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {p.path}
                      </td>
                      <td
                        style={{
                          padding: "0.25rem 0.5rem",
                          color: "var(--color-text-primary)",
                          textAlign: "right",
                        }}
                      >
                        {p.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ステータスコード分布 */}
            <div style={cardStyle}>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                ステータスコード分布
              </h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {analytics.statusDist.map((s) => {
                  const isError = s.status >= 400;
                  return (
                    <span
                      key={s.status}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        backgroundColor: isError ? "var(--color-del-bg)" : "var(--color-add-bg)",
                        color: isError ? "var(--color-del-fg)" : "var(--color-accent)",
                        fontWeight: 600,
                      }}
                    >
                      {s.status}: {s.count.toLocaleString()}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* アクセス解析: 未設定時 */}
        {!loading && section === "analytics" && !analytics && !error && (
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
            }}
          >
            アクセス解析データを読み込んでいます...
          </p>
        )}
      </div>
    </div>
  );
}
