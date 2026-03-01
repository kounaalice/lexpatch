import { getLawData } from "@/lib/egov/client";
import { paragraphsToCanonLines } from "@/lib/patch/apply";
import Link from "next/link";
import { ArticlePatchView } from "./ArticlePatchView";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lawId: string; articleNum: string }>;
}) {
  const { lawId, articleNum } = await params;

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

  const article = allArticles.find((a) => a.num === articleNum);
  if (!article) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "var(--color-del-fg)" }}>条文が見つかりませんでした（{articleNum}）。</p>
        <Link href={`/law/${lawId}`} style={{ color: "var(--color-accent)" }}>← 条文一覧に戻る</Link>
      </div>
    );
  }

  const canonLines = paragraphsToCanonLines(article.paragraphs);

  // 初期パッチテキスト（条文をそのままctx行として）
  const initialPatchText = [
    article.title,
    ...article.paragraphs.map((p) =>
      p.num ? `${p.num}　${p.sentences.join("")}` : p.sentences.join("")
    ),
  ].join("\n");

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
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
          }}>
            {law.law_title}　{law.law_num}
          </p>
        </div>
      </div>

      {/* パッチエディタ + diff ビュー */}
      <ArticlePatchView
        canonLines={canonLines}
        initialPatchText={initialPatchText}
        articleTitle={article.title}
      />
    </div>
  );
}
