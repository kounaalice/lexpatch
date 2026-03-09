import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LexCardとは",
  description:
    "LexCard（法令アクセス支援システム）は、法令の検索・閲覧から改正案の作成・チーム管理・条文カードゲームまで。HIME Systems（こうな姫株式会社）が公共目的で無償提供する法令アクセス基盤です。",
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
            法令の検索・閲覧から改正案の作成・チーム管理・条文カードゲームまで。すべて無料・登録不要で提供しています。
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
                icon: "\uD83C\uDFDB\uFE0F",
                title: "法令ワークスペース",
                desc: "プロジェクト管理・コミュニティ・改正案作成・チームカレンダー・ファイル共有。法令業務をチームで進めるための統合環境。",
                color: "#0284C7",
              },
              {
                icon: "\uD83C\uDFAE",
                title: "条文カードゲーム",
                desc: "全法令の全条文がTCGカードに。ガチャ・収集・レベルアップ。法令を読みながら遊べる、完全無料のブラウザカードゲーム。",
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
                  desc: "本事業の収入は寄付およびプロジェクト支援協力金に限り、サーバー・開発環境・セキュリティ等の維持改善に再投資します。",
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
                icon: "🏛️",
                title: "プロジェクト管理",
                desc: "法令の調査・検討をまとめるワークスペース。タスク管理、チャット、参考資料の一元管理が可能です。",
              },
              {
                icon: "🔎",
                title: "Lint 検証",
                desc: "改正案の形式チェックを自動実行。対象条文・項番号の連番・追加削除バランスなど6種のルールで検証します。",
              },
              {
                icon: "💬",
                title: "コミュニティチャット",
                desc: "テーマ別コミュニティでリアルタイムにメッセージを交換。オーナーによる名称・公開設定の管理にも対応。",
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
                category: "プロジェクト・コミュニティ",
                items: [
                  "法令プロジェクト（タスク・フェーズ・ガントチャート）",
                  "議事録・ファイル添付（R2）",
                  "チェックリストテンプレート",
                  "法令案（統合法令の構造化編集）",
                  "コミュニティ（メッセージ・資料共有）",
                  "逐条解説の投稿・閲覧",
                  "チームカレンダー・iCalエクスポート",
                ],
              },
              {
                category: "カレンダー・通知",
                items: [
                  "月間カレンダー（公布/施行/タスク/フェーズ期限）",
                  "施行スケジュール（6ヶ月タイムライン）",
                  "メール通知（5カテゴリ + スコープ + 頻度設定）",
                  "法令公布・施行の自動検知（Cron巡回）",
                ],
              },
              {
                category: "ゲーミング・カード",
                items: [
                  "ゲーミングモード（XPバー・レベル・パーティクル演出）",
                  "条文カードゲーム（ガチャ・収集・レアリティ）",
                  "カード図鑑・法令コンプリート",
                  "端末間データ同期（ログイン時）",
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

        {/* W100・50法プロジェクト */}
        <section id="w100" style={{ marginBottom: "3rem" }}>
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
            W100・50法プロジェクト
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
              LexCard は「W100・50法」研究・創作・開発プロジェクトの一環として開発されています。
              こうな姫株式会社の代表・中川倖成が主宰する本プロジェクトは、知識の分類体系と法制度の再構築を同時に進める取り組みです。
            </p>

            {/* W100知識分類法 */}
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                W100知識分類法
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  lineHeight: 1.8,
                  color: "var(--color-text-secondary)",
                }}
              >
                W100は、100分野の大分類の中に10の観点から100テーマを内包する独自の知識分類体系です。
                図書分類（NDC）では不足する学習・教育・研究・実務の基盤として設計され、
                教育・研究・行政・産業・文化の横断的な知識整理を可能にします。
                分野コード（CC）・教育テーマ（TT）・学術側面（AA）・細分領域（UU）の4階層で構成されています。
              </p>
            </div>

            {/* 50法プロジェクト */}
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                50法プロジェクト
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  lineHeight: 1.8,
                  color: "var(--color-text-secondary)",
                }}
              >
                2,000以上の日本の法律を約50の統合法に再編する構想です。
                憲法・公共基盤（1〜9）、民事・経済（10〜20）、刑事・司法（21〜24）、行政・情報・地域（25〜29）、
                労働・福祉（30〜34）、産業・資源（35〜40）、国土・交通・防災（41〜45）、教育・文化・環境・外交（46〜50）の8領域で構成。
                LexCard はこの50法を閲覧・編集・検証するためのツールとして開発されています。
              </p>
            </div>

            {/* 著作物 */}
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                著作物
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-bg)",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    W100知識分類法 公共組織法［分類表・逐条解説］
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.7,
                    }}
                  >
                    B5・296頁｜サークル たぴたぴとりっぷ｜コミックマーケット107（2025.12.31）
                  </div>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <a
                      href="https://www.melonbooks.co.jp/detail/detail.php?product_id=3362530"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        color: "var(--color-accent)",
                        textDecoration: "none",
                      }}
                    >
                      メロンブックス →
                    </a>
                    <a
                      href="https://ndlsearch.ndl.go.jp/books/R100000002-I034490094#store"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        color: "var(--color-accent)",
                        textDecoration: "none",
                      }}
                    >
                      国立国会図書館サーチ →
                    </a>
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-bg)",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    2050年までに実現したい政策
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.7,
                    }}
                  >
                    2019年刊行｜共通試験法・教育庁法等を構想した前著
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    <a
                      href="https://note.com/kouna_alice/m/me3f9067b56a2"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        color: "var(--color-accent)",
                        textDecoration: "none",
                      }}
                    >
                      note マガジン →
                    </a>
                  </div>
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
