import Link from "next/link";

export function Footer() {
  return (
    <footer
      aria-label="サイトフッター"
      style={{
        backgroundColor: "var(--color-footer-bg)",
        borderTop: "1px solid var(--color-footer-border)",
        color: "var(--color-footer-link)",
        fontFamily: "var(--font-sans)",
      }}
      className="w-full px-6 py-8 text-xs"
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* LexCard */}
          <div>
            <div
              style={{
                color: "var(--color-footer-accent)",
                fontWeight: 700,
                fontSize: "0.9rem",
                marginBottom: "0.75rem",
              }}
            >
              LexCard
            </div>
            <div style={{ lineHeight: 2 }}>
              <div style={{ color: "var(--color-footer-muted)" }}>法令アクセス支援システム</div>
            </div>
          </div>

          {/* サービス */}
          <div>
            <div
              style={{
                color: "var(--color-footer-accent)",
                fontWeight: 600,
                marginBottom: "0.75rem",
              }}
            >
              サービス
            </div>
            <nav
              aria-label="サービス"
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              <Link
                href="/"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                法令検索
              </Link>
              <Link
                href="/search"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                横断検索
              </Link>
              <Link
                href="/patches"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                改正提案
              </Link>
              <Link
                href="/projects"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                法令プロジェクト
              </Link>
              <Link
                href="/commentaries"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                逐条解説
              </Link>
              <Link
                href="/communities"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                コミュニティ
              </Link>
              <Link
                href="/cards"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                カード図鑑
              </Link>
              <Link
                href="/calendar"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                カレンダー
              </Link>
              <Link
                href="/category/jorei-tokyo"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                条例・都道府県
              </Link>
              <Link
                href="/guide"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                使い方ガイド
              </Link>
              <Link
                href="/news"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                お知らせ
              </Link>
              <Link
                href="/settings"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                サイト設定
              </Link>
              <Link
                href="/about"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                LexCardとは
              </Link>
              <Link
                href="/en"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                English / 多言語
              </Link>
            </nav>
          </div>

          {/* 法的情報 */}
          <div>
            <div
              style={{
                color: "var(--color-footer-accent)",
                fontWeight: 600,
                marginBottom: "0.75rem",
              }}
            >
              法的情報
            </div>
            <nav
              aria-label="法的情報"
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              <Link
                href="/legal"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                利用規約
              </Link>
              <Link
                href="/legal#disclaimer"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                免責事項
              </Link>
              <Link
                href="/legal#privacy"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                プライバシーポリシー
              </Link>
              <Link
                href="/contact"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                お問い合わせ
              </Link>
            </nav>
          </div>

          {/* 関連プロジェクト */}
          <div>
            <div
              style={{
                color: "var(--color-footer-accent)",
                fontWeight: 600,
                marginBottom: "0.75rem",
              }}
            >
              関連プロジェクト
            </div>
            <nav
              aria-label="関連プロジェクト"
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              <a
                href="https://tapitapitrip.jp"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                HIME Systems
              </a>
              <Link
                href="/about#w100"
                style={{ color: "var(--color-footer-link)" }}
                className="hover:opacity-70 transition-opacity"
              >
                W100・50法プロジェクト
              </Link>
            </nav>
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "6px",
                border: "1px solid var(--color-footer-border)",
              }}
            >
              <div
                style={{ fontSize: "0.72rem", lineHeight: 1.8, color: "var(--color-footer-muted)" }}
              >
                LexCard
                は公共目的で無償提供しています。広告は掲載せず、データを販売しません。運営収入は寄付およびプロジェクト支援協力金に限り、サーバー・開発環境・セキュリティ等の維持改善に再投資します。寄付によるご支援やプロジェクトへの参加・協力を歓迎します。
                <Link
                  href="/contact"
                  style={{ color: "var(--color-footer-accent)", marginLeft: "0.3rem" }}
                  className="hover:opacity-70 transition-opacity"
                >
                  お問い合わせ →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ボトムバー */}
        <div
          style={{
            borderTop: "1px solid var(--color-footer-border)",
            paddingTop: "1rem",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span style={{ color: "var(--color-footer-muted)" }}>
            © {new Date().getFullYear()} こうな姫株式会社 — A HIME Systems service.
          </span>
          <span style={{ color: "var(--color-footer-muted)" }}>
            法令データ出典：
            <a
              href="https://laws.e-gov.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-footer-accent)" }}
              className="hover:opacity-70 transition-opacity"
            >
              e-Gov法令検索（デジタル庁）
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
