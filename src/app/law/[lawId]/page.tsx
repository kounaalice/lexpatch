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

// 主要法令をビルド時に静的生成（CDNから即返却、Workerの負荷ゼロ）
// 判例六法プロフェッショナル＋ポケット六法の最大公約数＋実務需要（106法令）
export function generateStaticParams() {
  return [
    // ═══ 公法 ═══
    // ── 憲法・基本法 ──
    { lawId: "321CONSTITUTION" },         // 日本国憲法
    { lawId: "322AC0000000003" },          // 皇室典範
    { lawId: "325AC0000000147" },          // 国籍法
    // ── 国会・選挙 ──
    { lawId: "322AC1000000079" },          // 国会法
    { lawId: "325AC1000000100" },          // 公職選挙法
    // ── 裁判法 ──
    { lawId: "322AC0000000059" },          // 裁判所法
    { lawId: "322AC0000000061" },          // 検察庁法
    { lawId: "324AC1000000205" },          // 弁護士法
    { lawId: "416AC0000000063" },          // 裁判員法
    { lawId: "141AC0000000053" },          // 公証人法
    // ── 行政組織 ──
    { lawId: "322AC0000000005" },          // 内閣法
    { lawId: "323AC0000000120" },          // 国家行政組織法
    { lawId: "322AC0000000120" },          // 国家公務員法
    { lawId: "322AC0000000067" },          // 地方自治法
    { lawId: "325AC0000000261" },          // 地方公務員法
    // ── 行政通則 ──
    { lawId: "405AC0000000088" },          // 行政手続法
    { lawId: "323AC0000000043" },          // 行政代執行法
    { lawId: "426AC0000000068" },          // 行政不服審査法
    { lawId: "337AC0000000139" },          // 行政事件訴訟法
    { lawId: "322AC0000000125" },          // 国家賠償法
    { lawId: "411AC0000000042" },          // 情報公開法
    { lawId: "415AC0000000057" },          // 個人情報保護法
    // ── 財政・租税 ──
    { lawId: "337AC0000000066" },          // 国税通則法
    { lawId: "334AC0000000147" },          // 国税徴収法
    { lawId: "340AC0000000033" },          // 所得税法
    { lawId: "340AC0000000034" },          // 法人税法
    { lawId: "363AC0000000108" },          // 消費税法
    { lawId: "325AC0000000073" },          // 相続税法
    { lawId: "325AC0000000226" },          // 地方税法
    // ── 警察・治安 ──
    { lawId: "323AC0000000136" },          // 警察官職務執行法
    { lawId: "323AC1000000186" },          // 消防法
    { lawId: "335AC0000000105" },          // 道路交通法
    { lawId: "326CO0000000319" },          // 入管法
    // ── 国土整備 ──
    { lawId: "326AC0100000219" },          // 土地収用法
    { lawId: "343AC0000000100" },          // 都市計画法
    { lawId: "325AC0000000201" },          // 建築基準法
    { lawId: "327AC1000000180" },          // 道路法
    { lawId: "339AC0000000167" },          // 河川法
    // ── 環境 ──
    { lawId: "405AC0000000091" },          // 環境基本法
    { lawId: "322AC0000000233" },          // 食品衛生法
    { lawId: "332AC0000000177" },          // 水道法
    // ── 教育 ──
    { lawId: "418AC0000000120" },          // 教育基本法
    { lawId: "322AC0000000026" },          // 学校教育法

    // ═══ 民事法 ═══
    // ── 民法・関連法 ──
    { lawId: "129AC0000000089" },          // 民法
    { lawId: "322AC0000000224" },          // 戸籍法
    { lawId: "132AC0000000015" },          // 供託法
    { lawId: "329AC0000000100" },          // 利息制限法
    { lawId: "406AC0000000085" },          // 製造物責任法
    { lawId: "330AC0000000097" },          // 自動車損害賠償保障法
    { lawId: "403AC0000000090" },          // 借地借家法
    { lawId: "416AC0000000123" },          // 不動産登記法
    { lawId: "327AC1000000176" },          // 宅地建物取引業法
    { lawId: "418AC0000000078" },          // 法の適用に関する通則法
    // ── 商法 ──
    { lawId: "132AC0000000048" },          // 商法
    { lawId: "417AC0000000086" },          // 会社法
    { lawId: "338AC0000000125" },          // 商業登記法
    { lawId: "420AC0000000056" },          // 保険法
    { lawId: "307AC0000000020" },          // 手形法
    { lawId: "308AC0000000057" },          // 小切手法
    { lawId: "323AC0000000025" },          // 金融商品取引法
    // ── 民事訴訟・倒産 ──
    { lawId: "408AC0000000109" },          // 民事訴訟法
    { lawId: "415AC0000000109" },          // 人事訴訟法
    { lawId: "423AC0000000051" },          // 非訟事件手続法
    { lawId: "423AC0000000052" },          // 家事事件手続法
    { lawId: "354AC0000000004" },          // 民事執行法
    { lawId: "401AC0000000091" },          // 民事保全法
    { lawId: "416AC0000000075" },          // 破産法
    { lawId: "411AC0000000225" },          // 民事再生法
    { lawId: "414AC0000000154" },          // 会社更生法

    // ═══ 刑事法 ═══
    { lawId: "140AC0000000045" },          // 刑法
    { lawId: "323AC0000000131" },          // 刑事訴訟法
    { lawId: "323AC0000000168" },          // 少年法
    { lawId: "417AC0000000050" },          // 刑事収容施設法

    // ═══ 社会法 ═══
    // ── 労働法 ──
    { lawId: "322AC0000000049" },          // 労働基準法
    { lawId: "419AC0000000128" },          // 労働契約法
    { lawId: "324AC0000000174" },          // 労働組合法
    { lawId: "321AC0000000025" },          // 労働関係調整法
    { lawId: "347AC0000000057" },          // 労働安全衛生法
    { lawId: "334AC0000000137" },          // 最低賃金法
    { lawId: "347AC0000000113" },          // 男女雇用機会均等法
    { lawId: "403AC0000000076" },          // 育児介護休業法
    { lawId: "360AC0000000088" },          // 労働者派遣法
    { lawId: "405AC0000000076" },          // パートタイム有期雇用法
    { lawId: "322AC0000000050" },          // 労災保険法
    { lawId: "349AC0000000116" },          // 雇用保険法
    { lawId: "416AC0000000045" },          // 労働審判法
    { lawId: "416AC0000000122" },          // 公益通報者保護法
    // ── 社会保障 ──
    { lawId: "211AC0000000070" },          // 健康保険法
    { lawId: "333AC0000000192" },          // 国民健康保険法
    { lawId: "334AC0000000141" },          // 国民年金法
    { lawId: "329AC0000000115" },          // 厚生年金保険法
    { lawId: "409AC0000000123" },          // 介護保険法
    { lawId: "322AC0000000164" },          // 児童福祉法
    { lawId: "325AC0000000144" },          // 生活保護法

    // ═══ 産業法 ═══
    // ── 経済法・消費者法 ──
    { lawId: "322AC0000000054" },          // 独占禁止法
    { lawId: "343AC1000000078" },          // 消費者基本法
    { lawId: "412AC0000000061" },          // 消費者契約法
    { lawId: "351AC0000000057" },          // 特定商取引法
    { lawId: "337AC0000000134" },          // 景品表示法
    // ── 知的財産 ──
    { lawId: "345AC0000000048" },          // 著作権法
    { lawId: "334AC0000000121" },          // 特許法
    { lawId: "334AC0000000125" },          // 意匠法
    { lawId: "334AC0000000127" },          // 商標法
    { lawId: "405AC0000000047" },          // 不正競争防止法
    // ── 情報通信 ──
    { lawId: "359AC0000000086" },          // 電気通信事業法
  ];
}

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
