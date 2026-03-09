import { getLawData, getLawRevisions } from "@/lib/egov/client";
import type { LawRevisionEntry, Item } from "@/lib/egov/types";
import { paragraphsToCanonLines } from "@/lib/patch/apply";
import type { CanonLine } from "@/lib/patch/apply";
import { sideBySideDiff } from "@/lib/patch/diff";
import type { SideBySideRow } from "@/lib/patch/types";
import Link from "next/link";
import { ArticlePatchView } from "./ArticlePatchView";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { CommentarySection } from "./CommentarySection";
import { ArticleMemo } from "@/components/ArticleMemo";
import { ArticleHistoryRecorder } from "./ArticleHistoryRecorder";
import AiArticleAssistant from "@/components/ai/AiArticleAssistant";
import { redirect } from "next/navigation";
import { resolveLawName } from "@/lib/law-names";

// ISR: 30日キャッシュ（法令は年数回の改正、デプロイ時に全再生成。長周期で CDN エッジ s-maxage を最大化）
export const revalidate = 2592000;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lawId: string; articleNum: string }>;
}) {
  const { lawId: rawLawId, articleNum: rawArticleNum } = await params;

  // A-6: 法令名による直リンク（例: /law/民法/article/709 → /law/129AC0000000089/article/709）
  const resolvedId = resolveLawName(decodeURIComponent(rawLawId));
  if (resolvedId) {
    redirect(`/law/${resolvedId}/article/${rawArticleNum}`);
  }
  const lawId = decodeURIComponent(rawLawId);

  // Cloudflare Workers では params が自動デコードされないため手動でデコード
  const articleNum = decodeURIComponent(rawArticleNum);

  let law;
  try {
    law = await getLawData(lawId);
  } catch {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "var(--color-del-fg)" }}>法令データの取得に失敗しました。</p>
        <Link href={`/law/${lawId}`} style={{ color: "var(--color-accent)" }}>
          ← 条文一覧に戻る
        </Link>
      </div>
    );
  }

  // 条を探す
  const allArticles =
    law.chapters.length > 0 ? law.chapters.flatMap((ch) => ch.articles) : law.articles;

  // num（URL用）またはtitle（"第一条"等）どちらでもマッチ
  const article = allArticles.find((a) => a.num === articleNum || a.title === articleNum);
  if (!article) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "var(--color-del-fg)" }}>条文が見つかりませんでした（{articleNum}）。</p>
        <Link href={`/law/${lawId}`} style={{ color: "var(--color-accent)" }}>
          ← 条文一覧に戻る
        </Link>
      </div>
    );
  }

  const articleTitle = article.title; // TS narrowing 用

  // 前後の条を取得
  const articleIndex = allArticles.findIndex((a) => a.num === articleNum);
  const prevArticle =
    articleIndex > 0
      ? {
          num: allArticles[articleIndex - 1].num,
          title: allArticles[articleIndex - 1].title,
          caption: allArticles[articleIndex - 1].caption,
        }
      : null;
  const nextArticle =
    articleIndex < allArticles.length - 1
      ? {
          num: allArticles[articleIndex + 1].num,
          title: allArticles[articleIndex + 1].title,
          caption: allArticles[articleIndex + 1].caption,
        }
      : null;

  // 全文表示用: 章付き条文リスト構築
  type FullTextArticle = {
    num: string;
    title: string;
    caption?: string;
    chapterTitle?: string;
    paragraphs: { num: string; sentences: string[]; items?: Item[] }[];
  };
  const fullTextArticles: FullTextArticle[] = [];
  let lastChapter: string | undefined;
  if (law.chapters.length > 0) {
    for (const ch of law.chapters) {
      for (const a of ch.articles) {
        fullTextArticles.push({
          num: a.num,
          title: a.title,
          caption: a.caption,
          chapterTitle: ch.title !== lastChapter ? ch.title : undefined,
          paragraphs: a.paragraphs,
        });
        lastChapter = ch.title;
      }
    }
  } else {
    for (const a of law.articles) {
      fullTextArticles.push({
        num: a.num,
        title: a.title,
        caption: a.caption,
        paragraphs: a.paragraphs,
      });
    }
  }

  const canonLines = paragraphsToCanonLines(article.paragraphs);

  // 初期パッチテキスト（条文をそのままctx行として）
  const initialPatchText = [
    article.title,
    ...article.paragraphs.map((p) =>
      p.num ? `${p.num}　${p.sentences.join("")}` : p.sentences.join(""),
    ),
  ].join("\n");

  // ── 改正差分データ + DB クエリを並列取得 ──
  type AmendmentDiffData = {
    rows: SideBySideRow[];
    prevDate: string;
    currentDate: string;
    isNewArticle: boolean;
    isUnchanged: boolean;
    initialRevisionIdx: number;
  };
  type PatchRow = {
    id: string;
    title: string;
    status: string;
    patch_type: string;
    created_at: string;
  };
  type CommentaryRow = {
    id: string;
    law_id: string;
    article_title: string;
    content: string;
    author_name: string | null;
    sources: Array<{ tier: "一次" | "準一次" | "二次" | "三次"; label: string; url: string }>;
    created_at: string;
    updated_at: string;
  };

  let amendmentDiff: AmendmentDiffData | null = null;
  let revisions: LawRevisionEntry[] = [];
  let existingPatches: PatchRow[] = [];
  let commentaries: CommentaryRow[] = [];
  let relatedProjects: { id: string; title: string; owner_name: string | null }[] = [];

  // 改正差分計算: この条文を実際に変更した直近の改正を探す
  // 最大 MAX_LOOKBACK 回遡って比較（API コール数制御）
  // ループ全体に LOOKBACK_TIMEOUT_MS のタイムアウトを設定
  const MAX_LOOKBACK = 15;
  const LOOKBACK_TIMEOUT_MS = 8_000;
  async function computeAmendmentDiff(): Promise<void> {
    try {
      revisions = await getLawRevisions(lawId);
      if (revisions.length < 2) return;

      // CurrentEnforced（現在施行中）を基準にする。UnEnforced（未施行）はスキップ。
      const currentIdx = revisions.findIndex(
        (r) => r.current_revision_status === "CurrentEnforced",
      );
      const effectiveIdx = currentIdx >= 0 ? currentIdx : 0;

      // 改正履歴を遡り、この条文を変更した改正を探す
      let afterLines = canonLines; // 最初は現行条文
      const limit = Math.min(effectiveIdx + MAX_LOOKBACK, revisions.length - 1);
      const deadline = Date.now() + LOOKBACK_TIMEOUT_MS; // eslint-disable-line react-hooks/purity

      for (let i = effectiveIdx; i < limit; i++) {
        if (Date.now() > deadline) break; // eslint-disable-line react-hooks/purity -- timeout check

        const enfDate = new Date(revisions[i].amendment_enforcement_date);
        enfDate.setDate(enfDate.getDate() - 1);
        const asof = enfDate.toISOString().split("T")[0];

        const prevLaw = await getLawData(lawId, { asof });
        const prevAllArticles =
          prevLaw.chapters.length > 0
            ? prevLaw.chapters.flatMap((ch) => ch.articles)
            : prevLaw.articles;
        const prevArticle = prevAllArticles.find(
          (a) => a.num === articleNum || a.title === articleTitle,
        );
        const prevLines: CanonLine[] = prevArticle
          ? paragraphsToCanonLines(prevArticle.paragraphs)
          : [];

        const diffResult = sideBySideDiff(prevLines, afterLines);
        const hasChange = diffResult.stats.added > 0 || diffResult.stats.deleted > 0;

        if (hasChange) {
          // この改正がこの条文を変更した
          amendmentDiff = {
            rows: diffResult.rows,
            prevDate: revisions[i + 1]?.amendment_enforcement_date ?? "",
            currentDate: revisions[i].amendment_enforcement_date,
            isNewArticle: prevArticle === null || prevLines.length === 0,
            isUnchanged: false,
            initialRevisionIdx: i,
          };
          return;
        }

        // この改正では変更なし — 次の改正を遡る
        afterLines = prevLines;
      }

      // 遡り切っても変更が見つからない場合
      amendmentDiff = {
        rows: [],
        prevDate: "",
        currentDate: revisions[effectiveIdx].amendment_enforcement_date,
        isNewArticle: false,
        isUnchanged: true,
        initialRevisionIdx: effectiveIdx,
      };
    } catch {
      /* 改正差分取得失敗 — 無視して続行 */
    }
  }

  // DB クエリ
  async function fetchDbData(): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    try {
      const supabase = await createClient();
      const admin = createAdminClient();
      const timeout = <T,>(p: Promise<T>, ms = 5000): Promise<T> =>
        Promise.race([
          p,
          new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
        ]);

      // Supabase query type inference breaks with Promise.all + timeout wrapper
      const [patchRes, commentaryRes, projectRes] = await timeout(
        Promise.all([
          supabase
            .from("patches")
            .select("id, title, status, patch_type, created_at")
            .eq("law_id", lawId)
            .contains("target_articles", [articleTitle])
            .order("created_at", { ascending: false })
            .limit(20),
          admin
            .from("commentaries")
            .select(
              "id, law_id, article_title, content, author_name, sources, created_at, updated_at",
            )
            .eq("law_id", lawId)
            .eq("article_title", articleTitle)
            .order("created_at", { ascending: true })
            .limit(50),
          admin
            .from("projects")
            .select("id, title, owner_name")
            .contains("law_ids", [lawId])
            .order("updated_at", { ascending: false })
            .limit(10),
        ]),
      );
      existingPatches = patchRes.data ?? [];
      commentaries = commentaryRes.data ?? [];
      relatedProjects = projectRes.data ?? [];
    } catch {
      /* Supabase 未設定・タイムアウト時は空データで表示を続行 */
    }
  }

  // 並列実行
  await Promise.all([computeAmendmentDiff(), fetchDbData()]);

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダ */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          padding: "1.25rem 1.25rem 0.25rem",
        }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "0.2rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>›</span>
            <Link
              href={`/law/${lawId}`}
              style={{ color: "var(--color-accent)", textDecoration: "none" }}
            >
              {law.law_title}
            </Link>
            <span>›</span>
            <span>{article.title}</span>
          </nav>
          {/* 法律名 */}
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: "0 0 0.1rem",
            }}
          >
            {law.law_title}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                fontWeight: 400,
                color: "var(--color-text-secondary)",
                marginLeft: "0.5rem",
              }}
            >
              {law.law_num}
            </span>
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.4rem",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            {article.title}
            {article.caption && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  color: "var(--color-text-secondary)",
                  marginLeft: "0.5rem",
                }}
              >
                {article.caption}
              </span>
            )}
            {amendmentDiff && !(amendmentDiff as { isUnchanged: boolean }).isUnchanged && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.6rem",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "3px",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  marginLeft: "0.5rem",
                  verticalAlign: "middle",
                }}
              >
                改正あり
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* パッチエディタ + diff ビュー + メモ + 解説（横幅統一のため一体化） */}
      <ArticlePatchView
        canonLines={canonLines}
        initialPatchText={initialPatchText}
        articleTitle={article.title}
        articleCaption={article.caption || undefined}
        articleNum={articleNum}
        lawId={lawId}
        lawTitle={law.law_title}
        lawNum={law.law_num}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
        fullTextArticles={fullTextArticles}
        amendmentDiff={amendmentDiff}
        revisions={revisions}
        memoSlot={
          <ArticleMemo
            lawId={lawId}
            lawTitle={law.law_title}
            articleTitle={article.title}
            embedded
          />
        }
        commentarySlot={
          <CommentarySection
            lawId={lawId}
            articleTitle={article.title}
            initialCommentaries={commentaries}
          />
        }
        aiSlot={
          <AiArticleAssistant
            lawId={lawId}
            lawTitle={law.law_title}
            articleNum={articleNum}
            articleTitle={article.title}
            hasAmendment={
              !!(amendmentDiff && !(amendmentDiff as { isUnchanged?: boolean }).isUnchanged)
            }
          />
        }
      />

      {/* 閲覧履歴記録（client component） */}
      <ArticleHistoryRecorder
        lawId={lawId}
        lawTitle={law.law_title}
        articleNum={article.num}
        articleTitle={article.title}
      />

      {/* 既存の改正案 + 関連プロジェクト（全幅白背景 + 内部 maxWidth） */}
      {(existingPatches.length > 0 || relatedProjects.length > 0) && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "1rem 1.25rem 2rem" }}>
            {/* 既存の改正案一覧 */}
            {existingPatches.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    margin: "0 0 0.5rem",
                  }}
                >
                  この条文の改正案 ({existingPatches.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {existingPatches.map((p) => {
                    const STATUS_BG: Record<string, string> = {
                      下書き: "#F1F5F9",
                      議論中: "#FFFBEB",
                      投票中: "#F0F9FF",
                      反映済: "#ECFDF5",
                      却下: "#FEF2F2",
                    };
                    const STATUS_FG: Record<string, string> = {
                      下書き: "#475569",
                      議論中: "#D97706",
                      投票中: "#0284C7",
                      反映済: "#059669",
                      却下: "#DC2626",
                    };
                    return (
                      <Link
                        key={p.id}
                        href={`/patch/${p.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.6rem 0.85rem",
                          backgroundColor: "var(--color-bg)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "6px",
                          textDecoration: "none",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            padding: "0.1rem 0.5rem",
                            borderRadius: "4px",
                            backgroundColor: STATUS_BG[p.status] ?? "#F1F5F9",
                            color: STATUS_FG[p.status] ?? "#475569",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.status}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.85rem",
                            color: "var(--color-text-primary)",
                            flex: 1,
                          }}
                        >
                          {p.title}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            color: "var(--color-text-secondary)",
                            whiteSpace: "nowrap",
                          }}
                        >
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
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    margin: "0 0 0.5rem",
                  }}
                >
                  関連プロジェクト ({relatedProjects.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {relatedProjects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.6rem 0.85rem",
                        backgroundColor: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {p.title}
                      </span>
                      {p.owner_name && (
                        <span style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
                          {p.owner_name}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
