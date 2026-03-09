import type { Metadata } from "next";
import Link from "next/link";
import { NewsFeed } from "@/components/NewsFeed";

export const metadata: Metadata = {
  title: "お知らせ",
  description:
    "LexCard（法令アクセス支援システム）のサービスに関するお知らせ・更新情報をお届けします。",
};

/* ── 静的お知らせデータ（新しい順） ── */
const ANNOUNCEMENTS = [
  {
    date: "2026-03-05",
    title: "サイト設定ページ・コピー機能改善・日本法令索引リンクを追加しました",
    body: "条文のフォント・文字サイズ・テーマ・引用形式をカスタマイズできる「サイト設定」ページを新設しました。条文コピー時の項番号表示を修正し、法令概要・条文ページに国立国会図書館「日本法令索引」へのリンクを追加しました。",
    href: "/settings",
  },
  {
    date: "2026-03-04",
    title: "Lint検証・コミュニティチャット・逐条解説の強化を実施しました",
    body: "改正案のLint検証機能（6ルール自動チェック）、コミュニティのチャット・設定管理、逐条解説の投稿者管理・権限チェック、ニュースフィードへのコミュニティ新着表示を追加しました。",
    href: "/about",
  },
  {
    date: "2026-03-03",
    title: "W100・50法プロジェクトページを更新しました",
    body: "「LexCardとは」ページのW100・50法プロジェクトセクションを拡充し、著作物情報（メロンブックス・国立国会図書館サーチへのリンク）を追加しました。",
    href: "/about#w100",
  },
  {
    date: "2026-03-01",
    title: "LexCard を公開しました",
    body: "法令アクセス支援システム「LexCard」を公開しました。e-Gov法令検索APIに基づく法令の閲覧・検索、条文の直接編集による改正案作成、新旧対照表・改め文の自動生成をご利用いただけます。",
    href: "/about",
  },
  {
    date: "2025-12-31",
    title: "W100知識分類法 公共組織法［分類表・逐条解説］を刊行",
    body: "コミックマーケット107にて、W100知識分類法と50法プロジェクトの研究成果をまとめた書籍（B5・296頁）を頒布しました。メロンブックスでも通販中です。",
    href: "https://www.melonbooks.co.jp/detail/detail.php?product_id=3362530",
    external: true,
  },
];

export default function NewsPage() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <nav
          style={{
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          <Link href="/" style={{ color: "var(--color-accent)" }}>
            トップ
          </Link>
          <span style={{ margin: "0 0.4rem" }}>›</span>
          <span>お知らせ</span>
        </nav>

        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "2rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          お知らせ
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.88rem",
            color: "var(--color-text-secondary)",
            marginBottom: "2.5rem",
          }}
        >
          LexCard のサービスに関するお知らせ・更新情報
        </p>

        {/* お知らせ一覧 */}
        <section style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {ANNOUNCEMENTS.map((item, i) => {
              const isExternal = "external" in item && item.external;
              const linkProps = isExternal
                ? { target: "_blank" as const, rel: "noopener noreferrer" }
                : {};
              return (
                <a
                  key={i}
                  href={item.href}
                  {...linkProps}
                  style={{
                    display: "block",
                    padding: "1.25rem 0",
                    borderBottom: "1px solid var(--color-border)",
                    textDecoration: "none",
                    transition: "opacity 0.15s",
                  }}
                  className="hover:opacity-70"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <time
                      dateTime={item.date}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        color: "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.date}
                    </time>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {item.title}
                    {isExternal && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          marginLeft: "0.3rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        ↗
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.7,
                    }}
                  >
                    {item.body}
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* 新着アクティビティ */}
        <section>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.3rem",
              color: "var(--color-text-primary)",
              borderBottom: "2px solid var(--color-accent)",
              paddingBottom: "0.4rem",
              marginBottom: "1.5rem",
            }}
          >
            新着アクティビティ
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1rem",
            }}
          >
            改正案・プロジェクト・逐条解説・コミュニティの最新投稿
          </p>
          <NewsFeed />
        </section>
      </div>
    </div>
  );
}
