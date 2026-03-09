import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { MemberProfileEditor } from "./MemberProfileEditor";

interface PageProps {
  params: Promise<{ encodedNameOrg: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { encodedNameOrg } = await params;
  const decoded = decodeURIComponent(encodedNameOrg);
  const [name, org] = decoded.split("___");
  const displayName = org ? `${name}（${org}）` : name;
  return {
    title: `${displayName} | メンバー | LexCard`,
    description: `${displayName} のプロフィールページ`,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export default async function MemberProfilePage({ params }: PageProps) {
  const { encodedNameOrg } = await params;
  const decoded = decodeURIComponent(encodedNameOrg);
  const sepIdx = decoded.indexOf("___");
  const name = sepIdx >= 0 ? decoded.slice(0, sepIdx) : decoded;
  const org = sepIdx >= 0 ? decoded.slice(sepIdx + 3) : "";
  const displayName = org ? `${name}（${org}）` : name;

  // ── Supabase データ取得 ──
  const admin = createAdminClient();

  // プロフィール
  const { data: profile } = await (admin as AnyRow)
    .from("member_profiles")
    .select(
      "id, name, org, org_type, bio, experience, preferred_areas, email, email_verified, notification_prefs, situation_profile, auth_provider, password_hash, created_at, updated_at",
    )
    .eq("name", name)
    .eq("org", org)
    .maybeSingle();

  // プロフィール未登録
  if (!profile) {
    return (
      <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "2rem 1.5rem",
            fontFamily: "var(--font-sans)",
          }}
        >
          {/* パンくず */}
          <Breadcrumb name={displayName} />

          <div
            style={{
              marginTop: "3rem",
              textAlign: "center",
              padding: "3rem 2rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
                opacity: 0.4,
              }}
            >
              ?
            </div>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.2rem",
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              プロフィール未登録
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}
            >
              「{name}」{org ? `（${org}）` : ""} のプロフィールはまだ登録されていません。
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                padding: "0.6rem 1.5rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              ログイン / 新規登録
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // プロジェクト
  const { data: projects } = await (admin as AnyRow)
    .from("projects")
    .select("id, title, status, members, tasks, updated_at")
    .contains("members", [{ name, org }])
    .order("updated_at", { ascending: false });

  const projectSummaries: {
    id: string;
    title: string;
    status: string;
    role: string;
    tasksDone: number;
    tasksTotal: number;
    updatedAt: string;
  }[] = (projects ?? []).map((p: AnyRow) => {
    const memberEntry = (p.members as AnyRow[])?.find(
      (m: AnyRow) => m.name === name && m.org === org,
    );
    const assignedTasks = (p.tasks as AnyRow[])?.filter((t: AnyRow) => t.assignee === name) ?? [];
    return {
      id: p.id as string,
      title: p.title as string,
      status: p.status as string,
      role: (memberEntry?.role ?? "") as string,
      tasksDone: assignedTasks.filter((t: { done: boolean }) => t.done).length,
      tasksTotal: assignedTasks.length,
      updatedAt: p.updated_at as string,
    };
  });

  // 横断タスク (全プロジェクトからこのメンバーのタスクを抽出)
  const allTasks: {
    projectId: string;
    projectTitle: string;
    id: string;
    title: string;
    done: boolean;
    due?: string;
  }[] = [];
  for (const p of (projects ?? []) as AnyRow[]) {
    const tasks = (p.tasks as AnyRow[]) ?? [];
    for (const t of tasks) {
      if (t.assignee === name) {
        allTasks.push({
          projectId: p.id,
          projectTitle: p.title,
          id: t.id,
          title: t.title,
          done: !!t.done,
          due: t.due,
        });
      }
    }
  }

  // コミュニティ
  let communities: { id: string; name: string }[] = [];
  if (profile.id) {
    const { data: memberships } = await (admin as AnyRow)
      .from("community_members")
      .select("community_id, communities(id, name)")
      .eq("member_id", profile.id);
    if (memberships) {
      communities = (memberships as AnyRow[])
        .map((m: AnyRow) => ({
          id: m.communities?.id as string,
          name: m.communities?.name as string,
        }))
        .filter((c: { id: string | undefined }) => !!c.id);
    }
  }

  const preferredAreas: string[] = Array.isArray(profile.preferred_areas)
    ? profile.preferred_areas
    : [];

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* パンくず */}
        <Breadcrumb name={displayName} />

        {/* ── プロフィール ── */}
        <section style={{ marginBottom: "2.5rem" }}>
          <SectionHeading>プロフィール</SectionHeading>

          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            {/* 名前・所属 */}
            <div style={{ marginBottom: "1.25rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.4rem",
                }}
              >
                {profile.name}
              </h2>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}
              >
                {profile.org && (
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.88rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {profile.org}
                  </span>
                )}
                {profile.org_type && <OrgTypeBadge type={profile.org_type} />}
              </div>
            </div>

            {/* 自己紹介 */}
            {profile.bio && (
              <div style={{ marginBottom: "1rem" }}>
                <FieldLabel>自己紹介</FieldLabel>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    color: "var(--color-text-primary)",
                    lineHeight: 1.8,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {profile.bio}
                </p>
              </div>
            )}

            {/* 経験・専門 */}
            {profile.experience && (
              <div style={{ marginBottom: "1rem" }}>
                <FieldLabel>経験・専門分野</FieldLabel>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    color: "var(--color-text-primary)",
                    lineHeight: 1.8,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {profile.experience}
                </p>
              </div>
            )}

            {/* 関心分野タグ */}
            {preferredAreas.length > 0 && (
              <div>
                <FieldLabel>関心分野</FieldLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {preferredAreas.map((area) => (
                    <span
                      key={area}
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.7rem",
                        backgroundColor: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "14px",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8rem",
                        color: "var(--color-accent)",
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* プロフィール編集ボタン (client component) */}
            <MemberProfileEditor
              name={profile.name}
              org={profile.org}
              currentBio={profile.bio ?? ""}
              currentExperience={profile.experience ?? ""}
              currentPreferredAreas={preferredAreas}
              currentOrgType={profile.org_type ?? ""}
              currentEmail={profile.email ?? ""}
              currentNotificationPrefs={profile.notification_prefs ?? null}
              currentSituationProfile={profile.situation_profile ?? null}
              authProvider={profile.auth_provider ?? "local"}
              hasPassword={
                !!profile.password_hash &&
                !profile.password_hash.startsWith("oauth:") &&
                profile.password_hash !== "magiclink"
              }
              emailVerified={profile.email_verified ?? false}
            />
          </div>
        </section>

        {/* ── プロジェクト ── */}
        <section style={{ marginBottom: "2.5rem" }}>
          <SectionHeading>参加プロジェクト</SectionHeading>

          {projectSummaries.length === 0 ? (
            <EmptyState>参加しているプロジェクトはありません</EmptyState>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {projectSummaries.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                      transition: "border-color 0.15s",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "180px" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.92rem",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {proj.title}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <StatusBadge status={proj.status} />
                        {proj.role && <RoleBadge role={proj.role} />}
                      </div>
                    </div>
                    {/* タスク進捗 */}
                    {proj.tasksTotal > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            width: "80px",
                            height: "6px",
                            backgroundColor: "var(--color-border)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${(proj.tasksDone / proj.tasksTotal) * 100}%`,
                              height: "100%",
                              backgroundColor: "var(--color-accent)",
                              borderRadius: "3px",
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {proj.tasksDone}/{proj.tasksTotal}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── タスク ── */}
        <section style={{ marginBottom: "2.5rem" }}>
          <SectionHeading>担当タスク</SectionHeading>

          {allTasks.length === 0 ? (
            <EmptyState>担当タスクはありません</EmptyState>
          ) : (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {allTasks.map((task, i) => (
                <div
                  key={`${task.projectId}-${task.id}`}
                  style={{
                    padding: "0.75rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    borderTop: i > 0 ? "1px solid var(--color-border)" : "none",
                    flexWrap: "wrap",
                  }}
                >
                  {/* チェック状態 */}
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "4px",
                      border: task.done
                        ? "2px solid var(--color-accent)"
                        : "2px solid var(--color-border)",
                      backgroundColor: task.done ? "var(--color-accent)" : "transparent",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "0.7rem",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {task.done ? "\u2713" : ""}
                  </span>

                  <div style={{ flex: 1, minWidth: "140px" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.88rem",
                        color: task.done
                          ? "var(--color-text-secondary)"
                          : "var(--color-text-primary)",
                        textDecoration: task.done ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.75rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <Link
                        href={`/projects/${task.projectId}`}
                        style={{ color: "var(--color-accent)", textDecoration: "none" }}
                      >
                        {task.projectTitle}
                      </Link>
                    </div>
                  </div>

                  {/* 期限 */}
                  {task.due && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        color: isOverdue(task.due, task.done)
                          ? "var(--color-del-fg)"
                          : "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {task.due}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── コミュニティ ── */}
        <section style={{ marginBottom: "2rem" }}>
          <SectionHeading>参加コミュニティ</SectionHeading>

          {communities.length === 0 ? (
            <EmptyState>参加しているコミュニティはありません</EmptyState>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {communities.map((c) => (
                <Link
                  key={c.id}
                  href={`/communities?id=${c.id}`}
                  style={{
                    display: "inline-block",
                    padding: "0.5rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.88rem",
                    color: "var(--color-text-primary)",
                    textDecoration: "none",
                    transition: "border-color 0.15s",
                  }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── パンくず ────────────────────────────────────────────
function Breadcrumb({ name }: { name: string }) {
  return (
    <nav
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.82rem",
        color: "var(--color-text-secondary)",
        marginBottom: "1.5rem",
      }}
    >
      <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
        トップ
      </Link>
      <span style={{ margin: "0 0.4rem" }}>&rsaquo;</span>
      <span style={{ color: "var(--color-text-secondary)" }}>メンバー</span>
      <span style={{ margin: "0 0.4rem" }}>&rsaquo;</span>
      <span style={{ color: "var(--color-text-primary)" }}>{name}</span>
    </nav>
  );
}

// ─── セクション見出し（左青バー） ────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        fontFamily: "var(--font-sans)",
        fontSize: "1.1rem",
        fontWeight: 700,
        color: "var(--color-text-primary)",
        marginBottom: "1rem",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "3px",
          height: "1.2em",
          backgroundColor: "var(--color-accent)",
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />
      {children}
    </h2>
  );
}

// ─── フィールドラベル ────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.78rem",
        fontWeight: 700,
        color: "var(--color-text-secondary)",
        marginBottom: "0.35rem",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </div>
  );
}

// ─── 空状態 ──────────────────────────────────────────────
function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        fontFamily: "var(--font-sans)",
        fontSize: "0.88rem",
        color: "var(--color-text-secondary)",
      }}
    >
      {children}
    </div>
  );
}

// ─── 組織種別バッジ ──────────────────────────────────────
function OrgTypeBadge({ type }: { type: string }) {
  if (!type) return null;
  const colorMap: Record<string, { bg: string; fg: string }> = {
    大学: { bg: "#EFF6FF", fg: "#1D4ED8" },
    企業: { bg: "#F0FDF4", fg: "#15803D" },
    官公庁: { bg: "#FEF3C7", fg: "#92400E" },
    NPO: { bg: "#FDF2F8", fg: "#9D174D" },
    法律事務所: { bg: "#F5F3FF", fg: "#6D28D9" },
    個人: { bg: "#F1F5F9", fg: "#475569" },
  };
  const colors = colorMap[type] ?? { bg: "#F1F5F9", fg: "#475569" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.15rem 0.55rem",
        backgroundColor: colors.bg,
        color: colors.fg,
        borderRadius: "4px",
        fontFamily: "var(--font-sans)",
        fontSize: "0.72rem",
        fontWeight: 700,
      }}
    >
      {type}
    </span>
  );
}

// ─── ステータスバッジ ────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { bg: string; fg: string }> = {
    進行中: { bg: "#DBEAFE", fg: "#1D4ED8" },
    active: { bg: "#DBEAFE", fg: "#1D4ED8" },
    完了: { bg: "#DCFCE7", fg: "#15803D" },
    done: { bg: "#DCFCE7", fg: "#15803D" },
    アーカイブ: { bg: "#F1F5F9", fg: "#64748B" },
    archived: { bg: "#F1F5F9", fg: "#64748B" },
  };
  const colors = colorMap[status] ?? { bg: "#F1F5F9", fg: "#475569" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.12rem 0.5rem",
        backgroundColor: colors.bg,
        color: colors.fg,
        borderRadius: "4px",
        fontFamily: "var(--font-sans)",
        fontSize: "0.7rem",
        fontWeight: 700,
      }}
    >
      {status}
    </span>
  );
}

// ─── 役割バッジ ──────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.12rem 0.5rem",
        border: "1px solid var(--color-border)",
        borderRadius: "4px",
        fontFamily: "var(--font-sans)",
        fontSize: "0.7rem",
        color: "var(--color-text-secondary)",
      }}
    >
      {role}
    </span>
  );
}

// ─── ヘルパー ────────────────────────────────────────────
function isOverdue(due: string, done: boolean): boolean {
  if (done) return false;
  try {
    return new Date(due) < new Date();
  } catch {
    return false;
  }
}
