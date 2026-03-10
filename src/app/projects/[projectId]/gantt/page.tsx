import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import GanttClient from "./GanttClient";

const PHASES = ["調査", "立案", "検討", "提出", "完了"];

interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
  assignee?: string;
  due?: string;
  start_date?: string;
}

export default async function GanttPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <div style={{ padding: "2rem" }}>Supabase が未設定です。</div>;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("id, title, tasks, phase_deadlines, status")
    .eq("id", projectId)
    .single();

  if (error || !data) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ color: "var(--color-del-fg)" }}>プロジェクトが見つかりませんでした。</p>
        <Link href="/projects" style={{ color: "var(--color-accent)" }}>
          ← プロジェクト一覧
        </Link>
      </div>
    );
  }

  const tasks: ProjectTask[] = Array.isArray(data.tasks)
    ? (data.tasks as unknown as ProjectTask[])
    : [];
  const deadlines =
    typeof data.phase_deadlines === "object" && data.phase_deadlines ? data.phase_deadlines : {};
  const phases = PHASES.map((name) => ({
    name,
    deadline: (deadlines as Record<string, string>)[name] || undefined,
  }));

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1rem 2rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
            <Link href="/projects" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              プロジェクト
            </Link>
            <span>›</span>
            <Link
              href={`/projects/${projectId}`}
              style={{ color: "var(--color-accent)", textDecoration: "none" }}
            >
              {data.title}
            </Link>
            <span>›</span>
            <span>ガントチャート</span>
          </nav>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.3rem",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            ガントチャート
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        <GanttClient projectId={projectId} initialTasks={tasks} phases={phases} />
      </div>
    </div>
  );
}
