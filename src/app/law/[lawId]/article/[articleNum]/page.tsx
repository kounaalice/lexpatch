import { getLawData } from "@/lib/egov/client";
import { paragraphsToCanonLines } from "@/lib/patch/apply";
import Link from "next/link";
import { ArticlePatchView } from "./ArticlePatchView";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { CommentarySection } from "./CommentarySection";
import { ArticleMemo } from "@/components/ArticleMemo";
import { ArticleHistoryRecorder } from "./ArticleHistoryRecorder";
import BookmarkButton from "@/components/BookmarkButton";

// ISR: 1時間キャッシュ（R2 永続化により Worker CPU を大幅削減）
export const revalidate = 3600;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lawId: string; articleNum: string }>;
}) {
  const { lawId, articleNum: rawArticleNum } = await params;
  // Cloudflare Workers では params が自動デコードされないため手動でデコード
  const articleNum = decodeURIComponent(rawArticleNum);

  let law;
  try {
    law = await getLawData(lawId);
  } catch {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "var(--color-del-fg)" }}>法令データの取得に失敗しました。</p>
        <Link href={`/law/${lawId}`} style={{ color: "var(--color-accent)" }}>← 条文一覧に戻る</Link>
      </div>
    );
  }

  // 条を探す
  const allArticles = law.chapters.length > 0
    ? law.chapters.flatMap((ch) => ch.articles)
    : law.articles;

  // num（URL用）またはtitle（"第一条"等）どちらでもマッチ
  const article = allArticles.find(
    (a) => a.num === articleNum || a.title === articleNum
  );
  if (!article) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "var(--color-del-fg)" }}>条文が見つかりませんでした（{articleNum}）。</p>
        <Link href={`/law/${lawId}`} style={{ color: "var(--color-accent)" }}>← 条文一覧に戻る</Link>
      </div>
    );
  }

  // 前後の条を取得
  const articleIndex = allArticles.findIndex((a) => a.num === articleNum);
  const prevArticle = articleIndex > 0
    ? { num: allArticles[articleIndex - 1].num, title: allArticles[articleIndex - 1].title, caption: allArticles[articleIndex - 1].caption }
    : null;
  const nextArticle = articleIndex < allArticles.length - 1
    ? { num: allArticles[articleIndex + 1].num, title: allArticles[articleIndex + 1].title, caption: allArticles[articleIndex + 1].caption }
    : null;

  const canonLines = paragraphsToCanonLines(article.paragraphs);

  // 初期パッチテキスト（条文をそのままctx行として）
  const initialPatchText = [
    article.title,
    ...article.paragraphs.map((p) =>
      p.num ? `${p.num}　${p.sentences.join("")}` : p.sentences.join("")
    ),
  ].join("\n");

  // この条文の既存パッチ一覧 + 逐条解説を取得
  type PatchRow = { id: string; title: string; status: string; patch_type: string; created_at: string };
  type CommentaryRow = { id: string; law_id: string; article_title: string; content: string; author_name: string | null; sources: Array<{ tier: "一次" | "準一次" | "二次" | "三次"; label: string; url: string }>; created_at: string; updated_at: string };
  let existingPatches: PatchRow[] = [];
  let commentaries: CommentaryRow[] = [];
  let relatedProjects: { id: string; title: string; owner_name: string | null }[] = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const admin = createAdminClient();
      // Supabase クエリにもタイムアウト（5秒）を設定し Worker の時間超過を防止
      const timeout = <T,>(p: Promise<T>, ms = 5000): Promise<T> =>
        Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [patchRes, commentaryRes, projectRes] = await timeout(Promise.all([
        (supabase as any)
          .from("patches")
          .select("id, title, status, patch_type, created_at")
          .eq("law_id", lawId)
          .contains("target_articles", [article.title])
          .order("created_at", { ascending: false })
          .limit(20),
        (admin as any)
          .from("commentaries")
          .select("id, law_id, article_title, content, author_name, sources, created_at, updated_at")
          .eq("law_id", lawId)
          .eq("article_title", article.title)
          .order("created_at", { ascending: true })
          .limit(50),
        (admin as any)
          .from("projects")
          .select("id, title, owner_name")
          .contains("law_ids", [lawId])
          .order("updated_at", { ascending: false })
          .limit(10),
      ]));
      existingPatches = patchRes.data ?? [];
      commentaries = commentaryRes.data ?? [];
      relatedProjects = projectRes.data ?? [];
    } catch { /* Supabase 未設定・タイムアウト時は空データで表示を続行 */ }
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダ */}
      <div style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "1.25rem 2rem",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <nav style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}>
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>トップ</Link>
            <span>›</span>
            <Link href={`/law/${lawId}`} style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              {law.law_title}
            </Link>
            <span>›</span>
            <span>{article.title}</span>
          </nav>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.4rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.15rem",
          }}>
            {article.title}
            {article.caption && (
              <span style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
                marginLeft: "0.5rem",
              }}>
                {article.caption}
              </span>
            )}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: 0 }}>
              {law.law_title}　{law.law_num}
            </p>
            <a
              href={`https://laws.e-gov.go.jp/law/${lawId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-accent)", textDecoration: "none", border: "1px solid var(--color-accent)", borderRadius: "4px", padding: "0.1rem 0.5rem", opacity: 0.85 }}
            >
              e-Gov ↗
            </a>
            <BookmarkButton lawId={lawId} lawTitle={law.law_title} articleNum={article.num} articleTitle={article.title} />
          </div>
        </div>
      </div>

      {/* パッチエディタ + diff ビュー */}
      <ArticlePatchView
        canonLines={canonLines}
        initialPatchText={initialPatchText}
        articleTitle={article.title}
        lawId={lawId}
        lawTitle={law.law_title}
        lawNum={law.law_num}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
      />

      {/* 閲覧履歴記録（client component） */}
      <ArticleHistoryRecorder lawId={lawId} lawTitle={law.law_title} articleNum={article.num} articleTitle={article.title} />

      {/* 個人メモ */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.25rem 0.5rem" }}>
        <ArticleMemo lawId={lawId} lawTitle={law.law_title} articleTitle={article.title} />
      </div>

      {/* 逐条解説 */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.25rem 1rem" }}>
        <CommentarySection
          lawId={lawId}
          articleTitle={article.title}
          initialCommentaries={commentaries}
        />
      </div>

      {/* 既存の改正案一覧 */}
      {existingPatches.length > 0 && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 3rem" }}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.75rem", borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem" }}>
            この条文の改正案 ({existingPatches.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {existingPatches.map((p) => {
              const STATUS_BG: Record<string, string> = { "下書き": "#F1F5F9", "議論中": "#FFFBEB", "投票中": "#F0F9FF", "反映済": "#ECFDF5", "却下": "#FEF2F2" };
              const STATUS_FG: Record<string, string> = { "下書き": "#475569", "議論中": "#D97706", "投票中": "#0284C7", "反映済": "#059669", "却下": "#DC2626" };
              return (
                <Link
                  key={p.id}
                  href={`/patch/${p.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", padding: "0.1rem 0.5rem", borderRadius: "4px", backgroundColor: STATUS_BG[p.status] ?? "#F1F5F9", color: STATUS_FG[p.status] ?? "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {p.status}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-text-primary)", flex: 1 }}>
                    {p.title}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                    {new Date(p.created_at).toLocaleDateString("ja-JP")}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 関連プロジェクト */}
      {relatedProjects.length > 0 && (
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.25rem 2rem" }}>
          <h2 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "0.75rem",
          }}>
            関連プロジェクト ({relatedProjects.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {relatedProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 1rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  textDecoration: "none",
                  transition: "border-color 0.15s",
                  fontFamily: "var(--font-sans)",
                }}
                className="hover:border-sky-600"
              >
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {p.title}
                </span>
                {p.owner_name && (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    {p.owner_name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
