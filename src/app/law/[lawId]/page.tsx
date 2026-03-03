import { getLawData } from "@/lib/egov/client";
import type { Chapter, Article } from "@/lib/egov/types";
import Link from "next/link";
import { LawCopyButton } from "./LawCopyButton";
import { FollowButton } from "@/components/FollowButton";
import { getMinistryLinks } from "@/lib/ministries";
import { saveCanonSnapshot, getCanonVersions } from "@/lib/canon";
import { CanonVersionHistory } from "./CanonVersionHistory";
import { ArticleJump } from "./ArticleJump";

// ISR: 1時間キャッシュ（R2 永続化により Worker CPU を大幅削減）
export const revalidate = 3600;

const LAW_TYPE_JA: Record<string, string> = {
  Act: "法律",
  CabinetOrder: "政令",
  ImperialOrder: "勅令",
  MinisterialOrdinance: "省令",
  Rule: "規則",
  Misc: "告示等",
};

function fmtDate(d?: string): string {
  if (!d || d === "null" || d === "") return "";
  const m = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return d;
  return `${m[1]}年${parseInt(m[2])}月${parseInt(m[3])}日`;
}

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

  // スナップショット保存（fire-and-forget）+ バージョン履歴取得（タイムアウト付き）
  let canonVersions: Array<{ id: string; version: string; released_at: string }> = [];
  if (law && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    saveCanonSnapshot(law).catch(() => {});
    try {
      canonVersions = await Promise.race([
        getCanonVersions(lawId),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
      ]);
    } catch { /* タイムアウト時は空配列で表示続行 */ }
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

  // 全文テキスト（コピー用）
  const lawFullText = [
    `${law.law_title}（${law.law_num}）`,
    "",
    ...allArticles.map(({ article, chapterTitle }) => {
      const lines: string[] = [];
      if (chapterTitle) lines.push(`【${chapterTitle}】`);
      lines.push(article.title + (article.caption ? `　${article.caption}` : ""));
      for (const p of article.paragraphs) {
        lines.push(p.num ? `${p.num}　${p.sentences.join("")}` : p.sentences.join(""));
      }
      return lines.join("\n");
    }),
  ].join("\n\n");

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
          {/* 法令番号・条数・種別 */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
              {law.law_num}
            </span>
            {law.law_type && LAW_TYPE_JA[law.law_type] && (
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700,
                padding: "0.1rem 0.45rem", borderRadius: "3px",
                backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
              }}>
                {LAW_TYPE_JA[law.law_type]}
              </span>
            )}
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
              全 {allArticles.length} 条
            </span>
          </div>

          {/* 最終改正日・施行日・データ取得日 */}
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {law.amendment_date && (
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                最終改正：<strong style={{ color: "var(--color-text-primary)" }}>{fmtDate(law.amendment_date)}</strong>
              </span>
            )}
            {law.enforcement_date && (
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                施行：<strong style={{ color: "var(--color-text-primary)" }}>{fmtDate(law.enforcement_date)}</strong>
              </span>
            )}
            {!law.amendment_date && law.promulgation_date && (
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                公布：<strong style={{ color: "var(--color-text-primary)" }}>{fmtDate(law.promulgation_date)}</strong>
              </span>
            )}
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-secondary)", opacity: 0.6 }}>
              データ取得：{fmtDate(new Date().toISOString().split("T")[0])}（e-Gov API）
            </span>
          </div>

          {/* アクションボタン */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <a
              href={`https://laws.e-gov.go.jp/law/${lawId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--color-accent)",
                textDecoration: "none",
                border: "1px solid var(--color-accent)",
                borderRadius: "4px",
                padding: "0.1rem 0.5rem",
                opacity: 0.85,
                whiteSpace: "nowrap",
              }}
            >
              e-Gov ↗
            </a>
            <a
              href={`https://kokkai.ndl.go.jp/?keyword=${encodeURIComponent(law.law_title)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "#5B3F8F",
                textDecoration: "none",
                border: "1px solid #9C6FD6",
                borderRadius: "4px",
                padding: "0.1rem 0.5rem",
                opacity: 0.85,
                whiteSpace: "nowrap",
              }}
            >
              国会審議録 ↗
            </a>
            <a
              href={`https://public-comment.e-gov.go.jp/servlet/Public?CLASSNAME=PCMMSTLIST&Mode=0&keyword=${encodeURIComponent(law.law_title)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "#2D6A4F",
                textDecoration: "none",
                border: "1px solid #52A67B",
                borderRadius: "4px",
                padding: "0.1rem 0.5rem",
                opacity: 0.85,
                whiteSpace: "nowrap",
              }}
            >
              パブコメ ↗
            </a>
            <LawCopyButton text={lawFullText} lawId={lawId} lawTitle={law.law_title} lawNum={law.law_num} />
            <FollowButton type="law" id={lawId} title={law.law_title} />
          </div>
          {/* 所管省庁リンク */}
          <MinistryBar lawTitle={law.law_title} lawNum={law.law_num} lawType={law.law_type} />
          {/* バージョン履歴 */}
          <CanonVersionHistory versions={canonVersions} />
        </div>
      </div>

      {/* 条文ジャンプ + 一覧 */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        <ArticleJump articles={allArticles.map((a) => a.article)} lawId={lawId} />
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

// ─── 所管省庁リンクバー ───────────────────────────────
function MinistryBar({ lawTitle, lawNum, lawType }: { lawTitle: string; lawNum: string; lawType?: string }) {
  const ministries = getMinistryLinks(lawTitle, lawNum, lawType);
  if (ministries.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
        所管省庁:
      </span>
      {ministries.map((m) => (
        <a
          key={m.name}
          href={m.lawPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            color: "#8B7355",
            textDecoration: "none",
            border: "1px solid #C4A97A",
            borderRadius: "4px",
            padding: "0.1rem 0.5rem",
            whiteSpace: "nowrap",
          }}
        >
          {m.name} ↗
        </a>
      ))}
    </div>
  );
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
          id={`article-${a.num}`}
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
