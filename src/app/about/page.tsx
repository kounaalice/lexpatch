import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LexCardとは",
  description:
    "LexCard（法令アクセス支援システム）は、法令の検索・閲覧から改正案の作成・逐条解説・AI法令検索まで。HIME Systems（こうな姫株式会社）が公共目的で無償提供する法令アクセス基盤です。",
};

export default function AboutPage() {
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
          <span>LexCardとは</span>
        </nav>

        {/* ヒーロー */}
        <div style={{ marginBottom: "3rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2rem",
              color: "var(--color-text-primary)",
              marginBottom: "0.75rem",
            }}
          >
            LexCard とは
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.8,
            }}
          >
            LexCard（法令アクセス支援システム）は、HIME
            Systems（こうな姫株式会社）が公共目的で無償提供する法令アクセス基盤です。
            法令の検索・閲覧から改正案の作成・逐条解説・AI法令検索まで。すべて無料・登録不要で提供しています。
          </p>
        </div>

        {/* 3つの顔 */}
        <section style={{ marginBottom: "3rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                icon: "\uD83D\uDCC4",
                title: "法令リーダー",
                desc: "日本の全法令の検索・閲覧・条文参照リンク。e-Gov法令API準拠で最新の現行法令を反映。50分野+47都道府県カテゴリ対応。",
                color: "#0369A1",
              },
              {
                icon: "✏️",
                title: "改正案エディタ",
                desc: "条文テキストを直接書き換えて改正案を作成。新旧対照表・改め文を自動生成。Lint検証で形式チェックも。",
                color: "#0284C7",
              },
              {
                icon: "\uD83E\uDD16",
                title: "AI法令検索",
                desc: "36,000超の条文をベクトル検索。法令に関するQ&A・要約・推薦をAIが支援。マルチモデル対応。",
                color: "#7C3AED",
              },
            ].map(({ icon, title, desc, color }) => (
              <div
                key={title}
                style={{
                  padding: "1.5rem 1.25rem",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "10px",
                  border: `2px solid ${color}22`,
                  borderTop: `3px solid ${color}`,
                }}
              >
                <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{icon}</div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--color-text-primary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 運営方針 */}
        <section style={{ marginBottom: "3rem" }}>
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
            運営方針
          </h2>
          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "var(--color-surface)",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                lineHeight: 1.8,
                color: "var(--color-text-secondary)",
                marginBottom: "1rem",
              }}
            >
              LexCard
              は、営利企業としての法的保護と意思決定の機動力を活かしながら、サービス自体は収益化を目的としない「公共目的の無償提供」という形態で運営しています。
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                {
                  label: "無料・登録不要",
                  desc: "すべての機能を無償で提供します。利用にあたってアカウント登録は不要です。",
                },
                {
                  label: "企業による継続運営",
                  desc: "HIME Systems（こうな姫株式会社）が責任主体として安定的に運営します。",
                },
                {
                  label: "広告なし",
                  desc: "第三者広告（行動ターゲティング広告を含む）を掲載しません。",
                },
                {
                  label: "データ販売なし",
                  desc: "個人情報および利用データを第三者に販売しません。",
                },
                {
                  label: "寄付・協力による運営",
                  desc: "本事業の収入は寄付に限り、サーバー・開発環境・セキュリティ等の維持改善に再投資します。",
                },
                {
                  label: "オープンソース",
                  desc: "ソースコードは GitHub で公開しています。バグ報告・機能提案を歓迎します。",
                },
              ].map(({ label, desc }) => (
                <div
                  key={label}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.8,
                  }}
                >
                  <strong style={{ color: "var(--color-text-primary)" }}>{label}</strong>：{desc}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 特徴 */}
        <section style={{ marginBottom: "3rem" }}>
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
            特徴
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                icon: "✏️",
                title: "直接編集",
                desc: "条文テキストを直接書き換えて改正案を作成。差分は自動計算され、新旧対照表・改め文を自動生成します。",
              },
              {
                icon: "🔍",
                title: "新旧対照・diff",
                desc: "現行法令との差分を新旧対照表・統合表示・改め文の各形式でリアルタイムに確認できます。",
              },
              {
                icon: "📚",
                title: "e-Gov 連携",
                desc: "デジタル庁のe-Gov法令検索APIから最新の法令データを直接取得。50分野 + 47都道府県の法令カテゴリに対応。",
              },
              {
                icon: "📖",
                title: "逐条解説",
                desc: "各条文に対してメンバーが解説を投稿・閲覧。出典付きで法令の趣旨や判例の解説を共有できます。",
              },
              {
                icon: "🔎",
                title: "Lint 検証",
                desc: "改正案の形式チェックを自動実行。対象条文・項番号の連番・追加削除バランスなど6種のルールで検証します。",
              },
              {
                icon: "\uD83E\uDD16",
                title: "AI法令アシスタント",
                desc: "法令に関するQ&A・要約・推薦をAIが支援。36,000超の条文をベクトル検索。マルチモデル対応。",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  padding: "1.25rem",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--color-text-primary)",
                    marginBottom: "0.4rem",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 使い方 */}
        <section style={{ marginBottom: "3rem" }}>
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
            使い方
          </h2>
          <ol
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              lineHeight: 2,
              color: "var(--color-text-primary)",
              paddingLeft: "1.5rem",
            }}
          >
            <li>トップページで法令名を検索、または50分野・47都道府県カテゴリから探す</li>
            <li>改正したい条文を選択（条文内テキスト検索で素早くジャンプ）</li>
            <li>「改正案を編集」パネルを開き、条文テキストを直接書き換えて改正案を作成</li>
            <li>タブ（改正案・新旧対照・改め文）でリアルタイムに確認</li>
            <li>タイトル・根拠資料を入力して保存・共有</li>
          </ol>
          <div style={{ marginTop: "1rem" }}>
            <Link
              href="/guide"
              style={{
                color: "var(--color-accent)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                textDecoration: "none",
              }}
            >
              詳しい使い方ガイドはこちら →
            </Link>
          </div>
        </section>

        {/* 主な機能 */}
        <section style={{ marginBottom: "3rem" }}>
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
            主な機能
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {[
              {
                category: "検索・閲覧",
                items: [
                  "法令の全文検索・閲覧（e-Gov API連携）",
                  "50分野 + 47都道府県の法令カテゴリ",
                  "横断検索（条文本文の全文検索）",
                  "条文参照リンク（navigate/highlight/popup）",
                  "ブックマーク・条文メモ・インライン注釈",
                  "最近公布・施行された法令の一覧",
                  "最新判例の表示",
                  "閲覧履歴",
                ],
              },
              {
                category: "改正案・Lint",
                items: [
                  "条文の直接編集による改正案作成",
                  "新旧対照表・改め文の自動生成",
                  "改正案のLint検証（6ルール）",
                  "改正案の保存・URL共有",
                ],
              },
              {
                category: "逐条解説・AI",
                items: [
                  "逐条解説の投稿・閲覧（出典付き）",
                  "AI法令アシスタント（Q&A・要約・推薦）",
                  "Vectorize AI検索（36,000超の条文）",
                  "マルチモデルルーティング",
                ],
              },
              {
                category: "カレンダー・通知",
                items: [
                  "月間カレンダー（公布日・施行日の表示）",
                  "施行スケジュール（6ヶ月タイムライン）",
                  "メール通知（法令公布・施行アラート + 頻度設定）",
                  "法令公布・施行の自動検知（Cron巡回）",
                ],
              },
            ].map(({ category, items }) => (
              <div key={category}>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                    marginBottom: "0.4rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  {category}
                </div>
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem 1.5rem" }}
                >
                  {items.map((feat) => (
                    <div
                      key={feat}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.8,
                        paddingLeft: "1rem",
                        position: "relative",
                      }}
                    >
                      <span style={{ position: "absolute", left: 0, color: "var(--color-accent)" }}>
                        -
                      </span>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1rem" }}>
            <Link
              href="/guide"
              style={{
                color: "var(--color-accent)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                textDecoration: "none",
              }}
            >
              詳しい使い方ガイドはこちら →
            </Link>
          </div>
        </section>

        {/* HIME OS エコシステム */}
        <section id="hime-os" style={{ marginBottom: "3rem" }}>
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
            HIME OS エコシステム
          </h2>
          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "var(--color-surface)",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                lineHeight: 1.8,
                color: "var(--color-text-secondary)",
              }}
            >
              LexCard は HIME Systems が提供するエコシステムの一部です。
              法令検索・閲覧・改正案作成に特化した LexCard と、HIME OS が連携し、
              法令業務を包括的にサポートします。
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  padding: "1.25rem",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "8px",
                  border: "2px solid var(--color-accent)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--color-accent)",
                    marginBottom: "0.4rem",
                  }}
                >
                  LexCard
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  法令検索・閲覧・改正案作成・逐条解説・AI検索に特化した法令アクセス基盤。
                </div>
              </div>
              <div
                style={{
                  padding: "1.25rem",
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--color-text-primary)",
                    marginBottom: "0.4rem",
                  }}
                >
                  HIME OS
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  知識分類・プロジェクト管理・コミュニケーションを統合したインテント・ベースOS。
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 運営会社 */}
        <section id="company" style={{ marginBottom: "3rem" }}>
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
            運営会社
          </h2>
          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "var(--color-surface)",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
            }}
          >
            <table
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.88rem",
                color: "var(--color-text-primary)",
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <tbody>
                {[
                  { label: "会社名", value: "こうな姫株式会社（HIME Systems / Kouna Hime Inc.）" },
                  { label: "代表者", value: "中川倖成（代表取締役社長）" },
                  { label: "設立", value: "2025年4月1日" },
                  { label: "所在地", value: "東京都渋谷区渋谷二丁目19番19号" },
                  {
                    label: "事業内容",
                    value:
                      "補助金・許認可・制度活用コンサルティング、法令アクセス支援システムの開発・運営、クリエイター支援",
                  },
                ].map((row) => (
                  <tr key={row.label}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem 1rem 0.5rem 0",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                        verticalAlign: "top",
                        borderBottom: "1px solid var(--color-border)",
                        width: "6rem",
                      }}
                    >
                      {row.label}
                    </th>
                    <td
                      style={{
                        padding: "0.5rem 0",
                        lineHeight: 1.7,
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      {row.value}
                    </td>
                  </tr>
                ))}
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.5rem 1rem 0.5rem 0",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      whiteSpace: "nowrap",
                      verticalAlign: "top",
                      borderBottom: "1px solid var(--color-border)",
                      width: "6rem",
                    }}
                  >
                    note
                  </th>
                  <td
                    style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)" }}
                  >
                    <a
                      href="https://note.com/kouna_alice"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--color-accent)", textDecoration: "none" }}
                    >
                      note.com/kouna_alice
                    </a>
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.5rem 1rem 0.5rem 0",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      whiteSpace: "nowrap",
                      verticalAlign: "top",
                      width: "6rem",
                    }}
                  >
                    代表著作
                  </th>
                  <td style={{ padding: "0.5rem 0" }}>
                    <a
                      href="https://ndlsearch.ndl.go.jp/books/R100000002-I034490094#store"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--color-text-secondary)",
                        textDecoration: "none",
                        fontSize: "0.82rem",
                      }}
                    >
                      国立国会図書館サーチで見る
                    </a>
                  </td>
                </tr>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.5rem 1rem 0.5rem 0",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      whiteSpace: "nowrap",
                      verticalAlign: "top",
                      width: "6rem",
                    }}
                  >
                    メディア
                  </th>
                  <td style={{ padding: "0.5rem 0" }}>
                    <a
                      href="https://youtu.be/7TsFK-j17j0"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--color-accent)",
                        textDecoration: "none",
                        fontSize: "0.82rem",
                      }}
                    >
                      ラジオ出演（代表紹介・経歴）→
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* オープンソース */}
        <section style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.3rem",
              color: "var(--color-text-primary)",
              borderBottom: "2px solid var(--color-accent)",
              paddingBottom: "0.4rem",
              marginBottom: "1rem",
            }}
          >
            オープンソース
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              lineHeight: 1.8,
              color: "var(--color-text-secondary)",
            }}
          >
            本サービスのソースコードは GitHub で公開されています。
            バグ報告・機能提案はIssueから、コード変更はプルリクエストで受け付けています。
          </p>
          <a
            href="https://github.com/kounaalice/lexpatch"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--color-accent)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
            }}
          >
            github.com/kounaalice/lexpatch →
          </a>
        </section>

        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "1.5rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/legal"
            style={{
              color: "var(--color-accent)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
            }}
          >
            利用規約・免責事項
          </Link>
          <Link
            href="/contact"
            style={{
              color: "var(--color-accent)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
            }}
          >
            お問い合わせ
          </Link>
          <Link
            href="/guide"
            style={{
              color: "var(--color-accent)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
            }}
          >
            使い方ガイド
          </Link>
          <Link
            href="/settings"
            style={{
              color: "var(--color-accent)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
            }}
          >
            サイト設定
          </Link>
        </div>
      </div>
    </div>
  );
}
