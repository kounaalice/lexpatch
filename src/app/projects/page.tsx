import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { getLawTitle } from "@/lib/egov/client";
import Link from "next/link";
import { ProjectCreateButton } from "./ProjectCreateButton";

export const metadata: Metadata = {
  title: "法令プロジェクト",
  description:
    "法令に関する調査・検討をまとめるワークスペース。タスク管理、フェーズ管理、メンバー間チャット、参考資料管理、改正案の紐付けに対応。",
};

interface ProjectRow {
  id: string;
  title: string;
  description: string | null;
  law_ids: string[];
  owner_name: string | null;
  status: string;
  visibility: string;
  phase_deadlines: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export default async function ProjectsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ color: "var(--color-del-fg)" }}>Supabase が未設定です。</p>
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          ← トップに戻る
        </Link>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select(
      "id, title, description, law_ids, owner_name, status, visibility, phase_deadlines, created_at, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  const projects: ProjectRow[] = error ? [] : ((data ?? []) as unknown as ProjectRow[]);

  // 法令名をまとめて取得
  const allLawIds = [...new Set(projects.flatMap((p) => p.law_ids))];
  const lawTitleMap = new Map<string, string>();
  for (const lawId of allLawIds) {
    try {
      const title = await getLawTitle(lawId);
      if (title) lawTitleMap.set(lawId, title);
    } catch {
      /* ignore */
    }
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダー */}
      <div
        className="proj-header"
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
            <span>法令プロジェクト</span>
          </nav>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.75rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                法令プロジェクト
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                法令に関する調査・検討をまとめるワークスペース　{projects.length} 件
              </p>
            </div>
            <ProjectCreateButton />
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div
        className="proj-content"
        style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}
      >
        {projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                color: "var(--color-text-secondary)",
                marginBottom: "1rem",
              }}
            >
              まだプロジェクトがありません
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                maxWidth: "480px",
                margin: "0 auto 1.5rem",
              }}
            >
              「+ 新規プロジェクト」から法令の調査・検討プロジェクトを作成できます。
              改正案の紐付け、フェーズ管理、メンバー間の共同作業に対応しています。
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="hover:border-sky-600 hover:shadow-sm"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <h2
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      margin: 0,
                    }}
                  >
                    {p.title}
                  </h2>
                  {p.visibility === "private" && (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        padding: "0.05rem 0.3rem",
                        borderRadius: "3px",
                        backgroundColor: "#FEF2F2",
                        color: "#DC2626",
                        fontWeight: 600,
                      }}
                    >
                      &#128274;
                    </span>
                  )}
                  {p.visibility === "members_only" && (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        padding: "0.05rem 0.3rem",
                        borderRadius: "3px",
                        backgroundColor: "#F5F3FF",
                        color: "#7C3AED",
                        fontWeight: 600,
                      }}
                    >
                      &#128101;
                    </span>
                  )}
                </div>
                {p.description && (
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "var(--color-text-secondary)",
                      margin: 0,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.description}
                  </p>
                )}
                {p.law_ids.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                    {p.law_ids.slice(0, 3).map((lawId) => (
                      <span
                        key={lawId}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.7rem",
                          backgroundColor: "var(--color-bg)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "3px",
                          padding: "0.1rem 0.4rem",
                          color: "var(--color-text-secondary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "150px",
                        }}
                      >
                        {lawTitleMap.get(lawId) ?? lawId}
                      </span>
                    ))}
                    {p.law_ids.length > 3 && (
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.7rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        +{p.law_ids.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "var(--color-text-secondary)",
                    marginTop: "auto",
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "0.1rem 0.35rem",
                      borderRadius: "3px",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      backgroundColor:
                        (p.status ?? "調査") === "完了"
                          ? "#ECFDF5"
                          : (p.status ?? "調査") === "提出"
                            ? "#EBF2FD"
                            : "#FFFBEB",
                      color:
                        (p.status ?? "調査") === "完了"
                          ? "#059669"
                          : (p.status ?? "調査") === "提出"
                            ? "#1B4B8A"
                            : "#D97706",
                    }}
                  >
                    {p.status ?? "調査"}
                  </span>
                  {p.owner_name && <span>{p.owner_name}</span>}
                  <span>{new Date(p.updated_at).toLocaleDateString("ja-JP")} 更新</span>
                  {(() => {
                    if (!p.phase_deadlines || !p.status) return null;
                    const deadline = p.phase_deadlines[p.status];
                    if (!deadline) return null;
                    const daysLeft = Math.ceil(
                      (new Date(deadline).getTime() - Date.now()) / 86400000,
                    );
                    if (daysLeft < 0)
                      return (
                        <span style={{ color: "#DC2626", fontWeight: 600 }}>
                          {Math.abs(daysLeft)}日超過
                        </span>
                      );
                    if (daysLeft <= 3)
                      return (
                        <span style={{ color: "#D97706", fontWeight: 600 }}>残り{daysLeft}日</span>
                      );
                    return null;
                  })()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .proj-header { padding: 1rem 1rem !important; }
          .proj-content { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
