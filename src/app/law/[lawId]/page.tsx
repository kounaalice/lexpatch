import { getLawData } from "@/lib/egov/client";
import type { Chapter, Article } from "@/lib/egov/types";
import Link from "next/link";

export default async function LawPage({
  params,
}: {
  params: Promise<{ lawId: string }>;
}) {
  const { lawId } = await params;

  let law;
  let errorMessage = "";
  try {
    law = await getLawData(lawId);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "取得エラー";
  }

  if (errorMessage || !law) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ color: "var(--color-del-fg)" }}>エラー: {errorMessage}</p>
        <Link href="/" style={{ color: "var(--color-accent)" }}>← 検索に戻る</Link>
      </div>
    );
  }

  // 全条文を集める（章立てあり・なし両対応）
  const allArticles: { article: Article; chapterTitle?: string }[] = [];
  if (law.chapters.length > 0) {
    for (const ch of law.chapters) {
      for (const a of ch.articles) {
        allArticles.push({ article: a, chapterTitle: ch.title });
      }
    }
  } else {
    for (const a of law.articles) {
      allArticles.push({ article: a });
    }
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダ部 */}
      <div style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "1.5rem 2rem",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Link
            href="/"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            ← 検索に戻る
          </Link>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.75rem",
            color: "var(--color-text-primary)",
            marginTop: "0.5rem",
            marginBottom: "0.25rem",
          }}>
            {law.law_title}
          </h1>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)",
          }}>
            {law.law_num}　全 {allArticles.length} 条
          </p>
        </div>
      </div>

      {/* 条文一覧 */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        <ArticleList chapters={law.chapters} articles={law.articles} lawId={lawId} />
      </div>
    </div>
  );
}

function ArticleList({
  chapters,
  articles,
  lawId,
}: {
  chapters: Chapter[];
  articles: Article[];
  lawId: string;
}) {
  if (chapters.length > 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {chapters.map((ch, i) => (
          <section key={i}>
            <h2 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "0.4rem",
              marginBottom: "0.75rem",
            }}>
              {ch.title}
            </h2>
            <ArticleGrid articles={ch.articles} lawId={lawId} />
          </section>
        ))}
      </div>
    );
  }

  return <ArticleGrid articles={articles} lawId={lawId} />;
}

function ArticleGrid({ articles, lawId }: { articles: Article[]; lawId: string }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "0.5rem",
    }}>
      {articles.map((a) => (
        <Link
          key={a.num}
          href={`/law/${encodeURIComponent(lawId)}/article/${encodeURIComponent(a.num)}`}
          style={{
            display: "block",
            padding: "0.75rem 1rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            textDecoration: "none",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={undefined}
        >
          <div style={{
            fontFamily: "var(--font-serif)",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}>
            {a.title || `第${a.num}条`}
          </div>
          {a.caption && (
            <div style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.15rem",
            }}>
              {a.caption}
            </div>
          )}
          {a.paragraphs[0]?.sentences[0] && (
            <div style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.25rem",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
              {a.paragraphs[0].sentences[0]}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
