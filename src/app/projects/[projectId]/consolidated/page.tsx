import { createAdminClient } from "@/lib/supabase/server";
import { getLawTitle } from "@/lib/egov/client";
import Link from "next/link";
import { ConsolidatedLawView } from "./ConsolidatedLawView";

interface ConsolidatedLawData {
  id: string;
  project_id: string;
  title: string;
  law_num: string | null;
  description: string | null;
  books: ConsolidatedBook[];
  created_at: string;
  updated_at: string;
}

interface ConsolidatedBook {
  id: string;
  title: string;
  articles: ConsolidatedArticle[];
}

interface ConsolidatedArticle {
  id: string;
  num: string;
  title: string;
  caption: string;
  text: string;
  source_refs: SourceRef[];
}

interface SourceRef {
  law_id: string;
  article_num: string;
  article_title: string;
}

interface ProjectData {
  id: string;
  title: string;
  law_ids: string[];
}

export default async function ConsolidatedLawPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ color: "var(--color-del-fg)" }}>Supabase が未設定です。</p>
        <Link href={`/projects/${projectId}`} style={{ color: "var(--color-accent)" }}>
          ← プロジェクトに戻る
        </Link>
      </div>
    );
  }

  const supabase = createAdminClient();

  // プロジェクト情報を取得
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project, error: projectError } = await (supabase as any)
    .from("projects")
    .select("id, title, law_ids")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ color: "var(--color-del-fg)" }}>プロジェクトが見つかりませんでした。</p>
        <Link href="/projects" style={{ color: "var(--color-accent)" }}>
          ← プロジェクト一覧に戻る
        </Link>
      </div>
    );
  }

  const proj = project as ProjectData;

  // 統合法データを取得
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: consolidated } = await (supabase as any)
    .from("consolidated_laws")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  // 関連法令名マップ取得
  const lawTitleMap: Record<string, string> = {};
  for (const lawId of proj.law_ids ?? []) {
    try {
      const title = await getLawTitle(lawId);
      if (title) lawTitleMap[lawId] = title;
    } catch {
      /* ignore */
    }
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダー */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.25rem 2rem",
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
            <Link href="/projects" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              法令プロジェクト
            </Link>
            <span>›</span>
            <Link
              href={`/projects/${projectId}`}
              style={{ color: "var(--color-accent)", textDecoration: "none" }}
            >
              {proj.title}
            </Link>
            <span>›</span>
            <span>法令案</span>
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <ConsolidatedLawView
        projectId={projectId}
        projectTitle={proj.title}
        initial={consolidated as ConsolidatedLawData | null}
        lawIds={proj.law_ids ?? []}
        lawTitleMap={lawTitleMap}
      />
    </div>
  );
}
