import { createAdminClient } from "@/lib/supabase/server";
import { getLawTitle } from "@/lib/egov/client";
import Link from "next/link";
import { ProjectWorkspace } from "./ProjectWorkspace";
import { FollowButton } from "@/components/FollowButton";
import { AccessGate } from "./AccessGate";

interface ProjectNote {
  id: string;
  project_id: string;
  content: string;
  author_name: string | null;
  created_at: string;
}

interface ProjectReference {
  tier: "一次" | "準一次" | "二次" | "三次";
  label: string;
  url: string;
}

interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
}

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  law_ids: string[];
  bookmarks: Array<{ law_id: string; article_title: string }>;
  owner_name: string | null;
  status: string;
  references: ProjectReference[];
  tasks: ProjectTask[];
  members: Array<{ name: string; org: string; role: string }>;
  approvals?: Record<string, { by: string; at: string }>;
  activity_log?: Array<{ action: string; by?: string; at: string }>;
  phase_deadlines?: Record<string, string>;
  visibility?: string;
  created_at: string;
  updated_at: string;
  project_notes: ProjectNote[];
  meeting_minutes: Array<{
    id: string;
    project_id: string;
    title: string;
    meeting_date: string;
    attendees: string[];
    agenda: string | null;
    decisions: string | null;
    action_items: Array<{
      description: string;
      assignee?: string;
      taskId?: string;
      done?: boolean;
    }>;
    author_name: string | null;
    created_at: string;
    updated_at: string;
  }>;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ color: "var(--color-del-fg)" }}>Supabase が未設定です。</p>
        <Link href="/projects" style={{ color: "var(--color-accent)" }}>
          ← プロジェクト一覧に戻る
        </Link>
      </div>
    );
  }

  const admin = createAdminClient();
  const sb = admin;
  const { data, error } = await sb
    .from("projects")
    .select("*, project_notes(*)")
    .eq("id", projectId)
    .single();

  // 議事録を別クエリで取得（テーブル未作成時はエラー無視）
  let meetingMinutesRaw: ProjectData["meeting_minutes"] = [];
  try {
    const { data: mmData } = await sb
      .from("meeting_minutes")
      .select("*")
      .eq("project_id", projectId)
      .order("meeting_date", { ascending: false });
    if (Array.isArray(mmData))
      meetingMinutesRaw = mmData as unknown as ProjectData["meeting_minutes"];
  } catch {
    /* table may not exist yet */
  }

  if (error || !data) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ color: "var(--color-del-fg)" }}>プロジェクトが見つかりませんでした。</p>
        <Link href="/projects" style={{ color: "var(--color-accent)" }}>
          ← プロジェクト一覧に戻る
        </Link>
      </div>
    );
  }

  const project = data as ProjectData;

  // ノートを日付降順にソート
  project.project_notes.sort(
    (a: ProjectNote, b: ProjectNote) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // 議事録（別クエリで取得済み）
  const meetingMinutes = meetingMinutesRaw;

  // 法令名を取得
  const lawTitleMap: Record<string, string> = {};
  for (const lawId of project.law_ids) {
    try {
      const title = await getLawTitle(lawId);
      if (title) lawTitleMap[lawId] = title;
    } catch {
      /* ignore */
    }
  }

  // ブックマーク用の法令名もマージ
  const bookmarks = Array.isArray(project.bookmarks) ? project.bookmarks : [];
  for (const bm of bookmarks) {
    if (bm.law_id && !lawTitleMap[bm.law_id]) {
      try {
        const title = await getLawTitle(bm.law_id);
        if (title) lawTitleMap[bm.law_id] = title;
      } catch {
        /* ignore */
      }
    }
  }

  const visibility = project.visibility ?? "public";
  const members = Array.isArray(project.members) ? project.members : [];

  return (
    <AccessGate projectId={project.id} visibility={visibility} members={members}>
      <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
        {/* ヘッダー */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            padding: "1.25rem 2rem",
          }}
        >
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
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
              <Link
                href="/projects"
                style={{ color: "var(--color-accent)", textDecoration: "none" }}
              >
                法令プロジェクト
              </Link>
              <span>›</span>
              <span>{project.title}</span>
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.4rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.15rem",
                }}
              >
                {project.title}
              </h1>
              {visibility !== "public" && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    padding: "0.1rem 0.4rem",
                    borderRadius: "3px",
                    backgroundColor: visibility === "private" ? "#FEF2F2" : "#F5F3FF",
                    color: visibility === "private" ? "#DC2626" : "#7C3AED",
                  }}
                >
                  {visibility === "private" ? "非公開" : "メンバー限定"}
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  padding: "0.15rem 0.55rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor:
                    project.status === "完了"
                      ? "#ECFDF5"
                      : project.status === "提出"
                        ? "#EBF2FD"
                        : "#FFFBEB",
                  color:
                    project.status === "完了"
                      ? "#059669"
                      : project.status === "提出"
                        ? "#1B4B8A"
                        : "#D97706",
                }}
              >
                {project.status ?? "調査"}
              </span>
              {project.owner_name && <span>{project.owner_name}</span>}
              <span>作成 {new Date(project.created_at).toLocaleDateString("ja-JP")}</span>
              <span>更新 {new Date(project.updated_at).toLocaleDateString("ja-JP")}</span>
              <FollowButton type="project" id={project.id} title={project.title} />
            </div>
          </div>
        </div>

        {/* ワークスペース */}
        <ProjectWorkspace
          project={{
            id: project.id,
            title: project.title,
            description: project.description,
            law_ids: project.law_ids,
            bookmarks,
            owner_name: project.owner_name,
            status: project.status ?? "調査",
            references: Array.isArray(project.references) ? project.references : [],
            tasks: Array.isArray(project.tasks) ? project.tasks : [],
            members,
            phase_deadlines:
              typeof project.phase_deadlines === "object" && project.phase_deadlines !== null
                ? project.phase_deadlines
                : undefined,
            visibility,
          }}
          notes={project.project_notes}
          meetingMinutes={meetingMinutes}
          lawTitleMap={lawTitleMap}
          approvals={
            typeof project.approvals === "object" && project.approvals !== null
              ? project.approvals
              : undefined
          }
          activity_log={Array.isArray(project.activity_log) ? project.activity_log : undefined}
        />
      </div>
    </AccessGate>
  );
}
