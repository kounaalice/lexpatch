import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "使い方ガイド",
  description: "LexCardの操作手順を説明します。法令の検索・条文閲覧・直接編集による改正案作成・新旧対照表の確認・共有の各手順を記載しています。",
};

export default function GuidePage() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>

      {/* ── ページヘッダ ── */}
      <div style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "1.5rem 2rem",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
            <span>使い方ガイド</span>
          </nav>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.75rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.25rem",
          }}>
            使い方ガイド
          </h1>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)",
            margin: 0,
            lineHeight: 1.6,
          }}>
            法令の検索・条文閲覧・改正案の作成および共有手順を説明します。初めての方はまず「基本の流れ」をご覧ください。
          </p>
        </div>
      </div>

      {/* ── セクションナビ ── */}
      <div style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0.75rem 2rem",
      }}>
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {[
            { href: "#flow", label: "基本の流れ" },
            { href: "#search", label: "①検索" },
            { href: "#article", label: "②条文を読む" },
            { href: "#edit", label: "③改正案を作る" },
            { href: "#share", label: "④共有・保存" },
            { href: "#features", label: "その他の機能" },
            { href: "#faq", label: "よくある質問" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                color: "var(--color-accent)",
                textDecoration: "none",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── コンテンツ ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>

        {/* ── 基本の流れ ── */}
        <section id="flow" style={{ marginBottom: "3.5rem", scrollMarginTop: "80px" }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.4rem",
            color: "var(--color-text-primary)",
            marginBottom: "1.5rem",
          }}>
            基本の流れ
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0",
            marginBottom: "0.5rem",
            position: "relative",
          }}>
            {[
              { num: "01", icon: "🔍", label: "法令を検索", sub: "法令名・分野で探す" },
              { num: "02", icon: "📄", label: "条文を読む", sub: "現行法テキスト閲覧" },
              { num: "03", icon: "✏️", label: "改正案を作る", sub: "直接編集で改正案作成" },
              { num: "04", icon: "🔗", label: "共有・保存", sub: "コピーやリンク共有" },
            ].map((step, i) => (
              <div key={step.num} style={{ display: "flex", alignItems: "stretch" }}>
                <div style={{
                  flex: 1,
                  padding: "1.25rem 1rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRight: i < 3 ? "none" : "1px solid var(--color-border)",
                  borderRadius: i === 0 ? "8px 0 0 8px" : i === 3 ? "0 8px 8px 0" : "0",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{step.icon}</div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    color: "var(--color-accent)",
                    fontWeight: 700,
                    marginBottom: "0.25rem",
                    letterSpacing: "0.05em",
                  }}>STEP {step.num}</div>
                  <div style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.2rem",
                  }}>{step.label}</div>
                  <div style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                  }}>{step.sub}</div>
                </div>
                {i < 3 && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    color: "var(--color-accent)",
                    fontSize: "0.9rem",
                    padding: "0 0.1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderLeft: "none",
                    borderRight: "none",
                    zIndex: 1,
                  }}>›</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── STEP 01: 検索 ── */}
        <section id="search" style={{ marginBottom: "3.5rem", scrollMarginTop: "80px" }}>
          <StepHeader num="01" title="法令を検索する" color="#0369A1" />

          <p style={bodyText}>
            トップページの検索バーから法令名を入力するか、50の分野カテゴリから探すことができます。
          </p>

          {/* 検索バーのモックアップ */}
          <MockupFrame label="トップページ — 法令検索">
            <div style={{
              padding: "1.5rem",
              background: "linear-gradient(160deg, #EFF8FF, #DBEAFE)",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}>
              <div style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                color: "#1E3A5F",
                marginBottom: "1rem",
                textAlign: "center",
                fontWeight: 700,
              }}>現行法令の検索・<span style={{ color: "#0369A1" }}>条文閲覧</span></div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{
                  flex: 1,
                  padding: "0.6rem 1rem",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #93C5FD",
                  borderRadius: "8px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "#4B6A8A",
                }}>
                  労働基準法<span style={{ borderLeft: "2px solid #0369A1", marginLeft: "2px" }} />
                </div>
                <div style={{
                  padding: "0.6rem 1.2rem",
                  backgroundColor: "#0369A1",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}>検索</div>
              </div>
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)", marginBottom: "0.75rem", fontWeight: 700 }}>
              または 50分野カテゴリから探す ↓
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {["憲法", "国会", "民事", "刑事", "労働", "国税", "社会保険", "教育", "環境保全"].map((cat) => (
                <span key={cat} style={{
                  padding: "0.25rem 0.65rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-primary)",
                }}>{cat}</span>
              ))}
              <span style={{
                padding: "0.25rem 0.65rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-accent)",
              }}>+41分野</span>
            </div>
          </MockupFrame>

          <TipBox>
            法令名の一部からでも検索できます。「労働」などのキーワードで関連法令を一覧表示します。法令の分野が不明な場合は50分野カテゴリを利用してください。
            <br /><br />
            <span style={{ fontSize: "0.82rem" }}>
              試してみる：
              <Link href="/law/321CONSTITUTION" style={{ color: "var(--color-accent)", textDecoration: "none", marginLeft: "0.3rem" }}>日本国憲法</Link>
              <span style={{ margin: "0 0.3rem", color: "var(--color-text-secondary)" }}>|</span>
              <Link href="/law/129AC0000000089" style={{ color: "var(--color-accent)", textDecoration: "none" }}>民法</Link>
              <span style={{ margin: "0 0.3rem", color: "var(--color-text-secondary)" }}>|</span>
              <Link href="/law/322AC0000000049" style={{ color: "var(--color-accent)", textDecoration: "none" }}>労働基準法</Link>
              <span style={{ margin: "0 0.3rem", color: "var(--color-text-secondary)" }}>|</span>
              <Link href="/law/417AC0000000086" style={{ color: "var(--color-accent)", textDecoration: "none" }}>会社法</Link>
            </span>
          </TipBox>
        </section>

        {/* ── STEP 02: 条文を読む ── */}
        <section id="article" style={{ marginBottom: "3.5rem", scrollMarginTop: "80px" }}>
          <StepHeader num="02" title="条文を読む" color="#0369A1" />

          <p style={bodyText}>
            法令を選択すると全条文が一覧表示されます。条文カードをクリックすると、その条文の詳細ページが開きます。
            フォント・文字サイズの変更、テキストコピー、リンク共有ができます。
          </p>

          {/* 条文ページのモックアップ */}
          <MockupFrame label="条文ページ — 第一条（労働条件の原則）">
            {/* タブ */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "0" }}>
              {[
                { label: "現行法", active: true, note: "←今ここ" },
                { label: "改正案", active: false, note: "" },
                { label: "新旧対照", active: false, note: "" },
              ].map((tab) => (
                <div key={tab.label} style={{
                  padding: "0.45rem 0.9rem",
                  borderBottom: tab.active ? "2px solid #0369A1" : "2px solid transparent",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: tab.active ? "#0369A1" : "var(--color-text-secondary)",
                  fontWeight: tab.active ? 700 : 400,
                  whiteSpace: "nowrap",
                }}>
                  {tab.label}
                  {tab.note && (
                    <span style={{ fontSize: "0.65rem", marginLeft: "0.3rem", color: "#0369A1", opacity: 0.7 }}>{tab.note}</span>
                  )}
                </div>
              ))}
            </div>
            {/* フォントコントロール */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 0.75rem",
              backgroundColor: "var(--color-bg)",
              borderBottom: "1px solid var(--color-border)",
              flexWrap: "wrap",
            }}>
              {["ゴシック", "明朝"].map((f, i) => (
                <span key={f} style={{
                  padding: "0.15rem 0.5rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  backgroundColor: i === 0 ? "#0369A1" : "transparent",
                  color: i === 0 ? "#fff" : "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                }}>{f}</span>
              ))}
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--color-text-secondary)", marginLeft: "0.25rem" }}>文字サイズ</span>
              {["小", "中", "大", "特大"].map((s) => (
                <span key={s} style={{
                  width: "1.6rem",
                  height: "1.6rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  backgroundColor: s === "中" ? "#0369A1" : "transparent",
                  color: s === "中" ? "#fff" : "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.7rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>{s}</span>
              ))}
              <span style={{ marginLeft: "auto", display: "flex", gap: "0.3rem" }}>
                <MockupButton>テキストをコピー</MockupButton>
                <MockupButton>リンク共有</MockupButton>
              </span>
            </div>
            {/* 本文 */}
            <div style={{ padding: "1rem 1.25rem", fontFamily: "var(--font-sans)", fontSize: "0.92rem", lineHeight: 2.1, color: "var(--color-text-primary)" }}>
              <p style={{ margin: "0 0 0.5rem" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--color-text-secondary)", marginRight: "0.5rem" }}>１</span>
                労働条件は、労働者が人たるに値する生活を営むための必要を充たすべきものでなければならない。
              </p>
              <p style={{ margin: 0 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--color-text-secondary)", marginRight: "0.5rem" }}>２</span>
                この法律で定める労働条件の基準は最低のものであるから、労働関係の当事者は…
              </p>
            </div>
          </MockupFrame>

          <TipBox>
            「前後ナビ」で隣接する条文に移動できます。「テキストをコピー」ボタンで条番号・見出しを含む条文テキストをクリップボードに取得できます。
            <br /><br />
            <span style={{ fontSize: "0.82rem" }}>
              条文を読んでみる：
              <Link href="/law/140AC0000000045" style={{ color: "var(--color-accent)", textDecoration: "none", marginLeft: "0.3rem" }}>刑法</Link>
              <span style={{ margin: "0 0.3rem", color: "var(--color-text-secondary)" }}>|</span>
              <Link href="/law/345AC0000000048" style={{ color: "var(--color-accent)", textDecoration: "none" }}>著作権法</Link>
              <span style={{ margin: "0 0.3rem", color: "var(--color-text-secondary)" }}>|</span>
              <Link href="/law/415AC0000000057" style={{ color: "var(--color-accent)", textDecoration: "none" }}>個人情報保護法</Link>
            </span>
          </TipBox>
        </section>

        {/* ── STEP 03: 改正案を作る ── */}
        <section id="edit" style={{ marginBottom: "3.5rem", scrollMarginTop: "80px" }}>
          <StepHeader num="03" title="改正案を作る（直接編集）" color="#059669" />

          <p style={bodyText}>
            条文ページ下部の「改正案を編集」パネルを開くと、現行法テキストをそのまま編集して改正案を作成できます。
            変更箇所は自動的に検出され、新旧対照表や改め文が自動生成されます。
          </p>

          {/* 直接編集の説明 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}>
            {[
              { icon: "✏️", label: "直接編集", desc: "現行法テキストを直接書き換え。差分は自動計算されます。", color: "var(--color-accent)" },
              { icon: "🔄", label: "新旧対照表", desc: "編集結果は新旧対照表としてリアルタイムに表示されます。", color: "var(--color-add-fg)" },
              { icon: "📝", label: "改め文の自動生成", desc: "変更内容から改め文（「第○条中「A」を「B」に改める」）を自動生成します。", color: "#7C3AED" },
            ].map((row) => (
              <div key={row.label} style={{
                padding: "0.75rem 1rem",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                backgroundColor: "var(--color-surface)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>{row.icon}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700, color: row.color }}>{row.label}</span>
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                }}>{row.desc}</div>
              </div>
            ))}
          </div>

          {/* エディタのモックアップ */}
          <MockupFrame label="条文ページ下部 — 改正案を編集パネル（直接編集モード）">
            {/* トグルヘッダー */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 0.85rem",
              backgroundColor: "var(--color-bg)",
              borderBottom: "1px solid var(--color-border)",
            }}>
              <span style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)" }}>▼</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-primary)" }}>改正案を編集</span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--color-add-fg)",
                backgroundColor: "var(--color-add-bg)",
                padding: "0.1rem 0.35rem",
                borderRadius: "3px",
                marginLeft: "0.3rem",
              }}>+1</span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--color-del-fg)",
                backgroundColor: "var(--color-del-bg)",
                padding: "0.1rem 0.35rem",
                borderRadius: "3px",
              }}>-1</span>
            </div>
            {/* ヒント */}
            <div style={{ padding: "0.5rem 0.85rem 0.25rem", fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
              現行法テキストを直接編集してください。差分は自動的に計算されます。
            </div>
            {/* テキストエリアモック */}
            <div style={{
              margin: "0.5rem 0.75rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              overflow: "hidden",
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              lineHeight: 1.9,
              padding: "0.75rem",
              backgroundColor: "var(--color-bg)",
            }}>
              <div style={{ color: "var(--color-text-primary)" }}>第一条</div>
              <div style={{ color: "var(--color-text-primary)" }}>労働条件は、労働者が<span style={{ backgroundColor: "var(--color-add-bg)", color: "var(--color-add-fg)", padding: "0 0.15rem", borderRadius: "2px" }}>尊厳ある</span>生活を営むための必要を充たすべきものでなければならない。</div>
            </div>
            {/* 保存ボタン */}
            <div style={{ padding: "0.5rem 0.75rem 0.75rem", display: "flex", justifyContent: "flex-end" }}>
              <span style={{
                padding: "0.4rem 1rem",
                backgroundColor: "#0369A1",
                color: "#fff",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                fontWeight: 700,
              }}>改正案を保存</span>
            </div>
          </MockupFrame>

          {/* 新旧対照モックアップ */}
          <MockupFrame label="「新旧対照」タブ — 変更点がひと目でわかる">
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  <th style={{ padding: "0.3rem 0.75rem", textAlign: "left", fontFamily: "var(--font-sans)", fontWeight: 700, color: "var(--color-text-secondary)", width: "50%" }}>現行</th>
                  <th style={{ padding: "0.3rem 0.75rem", textAlign: "left", fontFamily: "var(--font-sans)", fontWeight: 700, color: "var(--color-text-secondary)", width: "50%", borderLeft: "1px solid var(--color-border)" }}>改正案</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "0.4rem 0.75rem", backgroundColor: "var(--color-del-bg)", color: "var(--color-del-fg)", lineHeight: 1.7, verticalAlign: "top" }}>
                    労働者が人たるに値する生活を…
                  </td>
                  <td style={{ padding: "0.4rem 0.75rem", backgroundColor: "var(--color-add-bg)", color: "var(--color-add-fg)", lineHeight: 1.7, verticalAlign: "top", borderLeft: "1px solid var(--color-border)" }}>
                    労働者が尊厳ある生活を…
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "0.4rem 0.75rem", color: "var(--color-text-primary)", lineHeight: 1.7, verticalAlign: "top" }}>
                    この法律で定める労働条件の基準は…
                  </td>
                  <td style={{ padding: "0.4rem 0.75rem", color: "var(--color-text-primary)", lineHeight: 1.7, verticalAlign: "top", borderLeft: "1px solid var(--color-border)" }}>
                    この法律で定める労働条件の基準は…
                  </td>
                </tr>
              </tbody>
            </table>
          </MockupFrame>

          <TipBox>
            テキストを直接編集するだけで改正案が完成します。「改正案」タブで改正後の条文を通読、「新旧対照」タブで変更箇所を並べて確認、「改め文」タブで正式な改め文形式を確認できます。
            <br /><br />
            <span style={{ fontSize: "0.82rem" }}>
              編集を試してみる：
              <Link href="/law/405AC0000000088" style={{ color: "var(--color-accent)", textDecoration: "none", marginLeft: "0.3rem" }}>行政手続法</Link>
              <span style={{ margin: "0 0.3rem", color: "var(--color-text-secondary)" }}>|</span>
              <Link href="/law/363AC0000000108" style={{ color: "var(--color-accent)", textDecoration: "none" }}>消費税法</Link>
              <span style={{ margin: "0 0.3rem", color: "var(--color-text-secondary)" }}>|</span>
              <Link href="/law/334AC0000000121" style={{ color: "var(--color-accent)", textDecoration: "none" }}>特許法</Link>
            </span>
          </TipBox>
        </section>

        {/* ── STEP 04: 共有・保存 ── */}
        <section id="share" style={{ marginBottom: "3.5rem", scrollMarginTop: "80px" }}>
          <StepHeader num="04" title="共有・保存する" color="#7C3AED" />

          <p style={bodyText}>
            作成した改正案はタイトルと改正理由を付けて保存できます。保存した改正案は改正提案に集約され、URLで共有できます。
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}>
            {[
              {
                icon: "💾",
                title: "改正案を保存",
                desc: "タイトル・改正理由・根拠資料を入力して保存。「改正案を保存」ボタンから。",
                color: "#059669",
              },
              {
                icon: "🔗",
                title: "リンク共有",
                desc: "「リンク共有」ボタンで条文ページのURLをコピー。メール・SNS・チャットで共有。",
                color: "#0369A1",
              },
              {
                icon: "📋",
                title: "テキストコピー",
                desc: "「テキストをコピー」ボタンで条文テキストを取得。資料・レポートにそのまま貼り付け。",
                color: "#D97706",
              },
              {
                icon: "🏛️",
                title: "改正提案で一覧",
                desc: "「改正提案」では改正案が条文ごとにまとめて表示。ステータスでフィルター可能。",
                color: "#7C3AED",
              },
            ].map((item) => (
              <div key={item.title} style={{
                padding: "1rem 1.25rem",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                display: "flex",
                gap: "0.75rem",
              }}>
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.88rem", color: item.color, marginBottom: "0.3rem" }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 改正提案のモックアップ */}
          <MockupFrame label="改正提案 (/patches) — 改正案の一覧">
            <div style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)", marginBottom: "0.75rem", display: "flex", gap: "0" }}>
              {["すべて", "下書き", "提案中", "採択済"].map((t, i) => (
                <span key={t} style={{
                  padding: "0.3rem 0.75rem",
                  borderBottom: i === 0 ? "2px solid #0369A1" : "2px solid transparent",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: i === 0 ? "#0369A1" : "var(--color-text-secondary)",
                  fontWeight: i === 0 ? 700 : 400,
                }}>{t}</span>
              ))}
            </div>
            <div style={{
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "0.4rem 0.75rem",
                backgroundColor: "var(--color-bg)",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-accent)" }}>第一条</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>労働基準法</span>
              </div>
              {[
                { status: "提案中", title: "労働条件原則の表現改正案", color: "#D97706", bg: "#FFFBEB" },
                { status: "下書き", title: "第一条第二項の基準明確化", color: "#475569", bg: "#F1F5F9" },
              ].map((p) => (
                <div key={p.title} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.75rem",
                  borderTop: "1px solid var(--color-border)",
                }}>
                  <span style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "0.1rem 0.4rem",
                    borderRadius: "4px",
                    backgroundColor: p.bg,
                    color: p.color,
                    whiteSpace: "nowrap",
                  }}>{p.status}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-primary)" }}>{p.title}</span>
                </div>
              ))}
            </div>
          </MockupFrame>
        </section>

        {/* ── FAQ ── */}
        {/* ── その他の機能 ── */}
        <section id="features" style={{ marginBottom: "3.5rem", scrollMarginTop: "80px" }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.4rem",
            color: "var(--color-text-primary)",
            marginBottom: "1.25rem",
          }}>
            その他の機能
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {[
              {
                title: "横断検索",
                desc: "法令・改正案・プロジェクトをキーワードで一括検索できます。ヘッダーの「横断検索」からアクセスできます。",
                link: "/search",
              },
              {
                title: "法令プロジェクト",
                desc: "法令の調査・検討をまとめるワークスペースです。タスク管理（詳細記述・リンク添付対応）、フェーズ管理、メンバー管理、チャット、参考資料の一元管理ができます。改正案の紐付け・パッチ検索にも対応しています。",
                link: "/projects",
              },
              {
                title: "逐条解説",
                desc: "各条文に対して解説を投稿・閲覧できます。一次資料や参考文献の出典管理にも対応。投稿者管理により、自分の解説のみ編集・削除が可能です（管理者は全件操作可）。",
                link: "/commentaries",
              },
              {
                title: "コミュニティ",
                desc: "テーマ別のコミュニティを作成し、チャットでリアルタイムに情報交換ができます。オーナーはコミュニティ名・説明・公開設定の変更や削除が可能です。",
                link: "/communities",
              },
              {
                title: "Lint 検証",
                desc: "改正案の形式チェックを自動実行します。対象条文の有無、追加・削除のバランス、項番号の連番チェックなど6種のルールで検証し、結果を保存できます。",
                link: null,
              },
              {
                title: "改め文の自動生成",
                desc: "直接編集で作成した改正案から、「第○条中「A」を「B」に改める」形式の改め文を自動生成します。",
                link: null,
              },
              {
                title: "法令スナップショット",
                desc: "閲覧した法令の条文はバージョン管理されます。取得日時ごとの変遷を確認できます。",
                link: null,
              },
              {
                title: "条文メモ",
                desc: "各条文のページで個人メモを残せます。メモはブラウザに保存され、ダッシュボードから一覧できます。",
                link: "/dashboard",
              },
              {
                title: "メンバー登録",
                desc: "任意のニックネームとパスワードで登録できます。登録すると改正案の投稿やプロジェクト参加が可能になります。",
                link: "/login",
              },
              {
                title: "分野別・条例検索",
                desc: "50の法令分野から法令を探せます。都道府県別の条例カテゴリも用意しています。",
                link: "/category/kenpo",
              },
              {
                title: "表示カスタマイズ",
                desc: "条文閲覧時にフォント（ゴシック体／明朝体）とフォントサイズ（4段階）を切り替えられます。ダークモードにも対応しています。",
                link: null,
              },
            ].map((feat) => (
              <div
                key={feat.title}
                style={{
                  padding: "1.25rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              >
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.4rem",
                }}>
                  {feat.title}
                </div>
                <p style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {feat.desc}
                </p>
                {feat.link && (
                  <Link href={feat.link} style={{
                    display: "inline-block",
                    marginTop: "0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    color: "var(--color-accent)",
                    textDecoration: "none",
                  }}>
                    詳しく見る →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="faq" style={{ scrollMarginTop: "80px", marginBottom: "2rem" }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.4rem",
            color: "var(--color-text-primary)",
            marginBottom: "1.25rem",
          }}>
            よくある質問
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} style={{
                padding: "1.25rem 1.5rem",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
              }}>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                  display: "flex",
                  gap: "0.5rem",
                }}>
                  <span style={{ color: "var(--color-accent)", flexShrink: 0 }}>Q.</span>
                  <span>{item.q}</span>
                </div>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.75,
                  paddingLeft: "1.5rem",
                }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{
          marginTop: "2rem",
          textAlign: "center",
          padding: "2rem",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
        }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>
            さっそく使ってみる
          </div>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{
              padding: "0.6rem 1.5rem",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              textDecoration: "none",
              fontWeight: 600,
            }}>
              法令を検索する →
            </Link>
            <Link href="/patches" style={{
              padding: "0.6rem 1.5rem",
              border: "1px solid var(--color-accent)",
              color: "var(--color-accent)",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              textDecoration: "none",
            }}>
              改正提案 →
            </Link>
            <Link href="/projects" style={{
              padding: "0.6rem 1.5rem",
              border: "1px solid var(--color-accent)",
              color: "var(--color-accent)",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              textDecoration: "none",
            }}>
              プロジェクト →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 共通スタイル ──────────────────────────────────────
const bodyText: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.925rem",
  color: "var(--color-text-secondary)",
  lineHeight: 1.85,
  marginBottom: "1.25rem",
};

// ─── ステップヘッダー ──────────────────────────────────
function StepHeader({ num, title, color }: { num: string; title: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: "0.72rem",
        fontWeight: 700,
        flexShrink: 0,
      }}>
        {num}
      </div>
      <h2 style={{
        fontFamily: "var(--font-serif)",
        fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
        color: "var(--color-text-primary)",
        margin: 0,
      }}>
        {title}
      </h2>
    </div>
  );
}

// ─── 画面モックアップフレーム ──────────────────────────
function MockupFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{
        backgroundColor: "#0C2340",
        padding: "0.4rem 0.75rem",
        borderRadius: "8px 8px 0 0",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
      }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "inline-block" }} />
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "inline-block" }} />
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "inline-block" }} />
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "rgba(186,230,253,0.5)",
          marginLeft: "0.35rem",
        }}>{label}</span>
      </div>
      <div style={{
        border: "1px solid var(--color-border)",
        borderTop: "none",
        borderRadius: "0 0 8px 8px",
        backgroundColor: "var(--color-surface)",
        overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── 小さいモックアップボタン ────────────────────────
function MockupButton({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      padding: "0.15rem 0.55rem",
      border: "1px solid var(--color-border)",
      borderRadius: "4px",
      fontFamily: "var(--font-sans)",
      fontSize: "0.7rem",
      color: "var(--color-text-secondary)",
      backgroundColor: "var(--color-bg)",
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

// ─── ヒントボックス ────────────────────────────────────
function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: "0.85rem 1.1rem",
      backgroundColor: "var(--color-warn-bg)",
      border: "1px solid var(--color-border)",
      borderRadius: "6px",
      marginBottom: "0.5rem",
      display: "flex",
      gap: "0.5rem",
      alignItems: "flex-start",
    }}>
      <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>💡</span>
      <p style={{
        margin: 0,
        fontFamily: "var(--font-sans)",
        fontSize: "0.85rem",
        color: "var(--color-text-primary)",
        lineHeight: 1.7,
      }}>{children}</p>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "法令データはどこから取得していますか？",
    a: "デジタル庁が提供するe-Gov法令検索（laws.e-gov.go.jp）の法令データAPIを利用しています。最新の現行法令を反映しています。",
  },
  {
    q: "改正案を保存・共有することはできますか？",
    a: "はい。「改正案を保存」ボタンからタイトル・改正理由を入力して保存できます。保存した改正案はURLで共有可能です。「改正提案」ページで一覧を確認できます。",
  },
  {
    q: "メンバー登録は必要ですか？",
    a: "法令の検索・閲覧は登録不要です。改正案の投稿、プロジェクトへの参加、逐条解説の作成、コミュニティの利用にはメンバー登録が必要です。任意のニックネームとパスワードで登録できます。",
  },
  {
    q: "プロジェクト機能とは何ですか？",
    a: "法令に関する調査・検討をまとめるワークスペースです。タスク管理（詳細記述・リンク添付）、フェーズ管理、メンバー間のチャット、参考資料のリンク管理、改正案の紐付けなどの機能を備えています。",
  },
  {
    q: "逐条解説は誰が書いていますか？",
    a: "登録メンバーが各条文に対して解説を投稿できます。出典（一次資料・二次資料等）の明記が推奨されます。内容は投稿者の見解であり、公式な解釈ではありません。",
  },
  {
    q: "条文メモはどこに保存されますか？",
    a: "条文メモはお使いのブラウザのローカルストレージに保存されます。サーバーには送信されないため、他の端末やブラウザからはアクセスできません。",
  },
  {
    q: "スマートフォンでも使えますか？",
    a: "はい。レスポンシブデザインに対応しており、スマートフォン・タブレットからも利用できます。",
  },
  {
    q: "利用料金はかかりますか？",
    a: "LexCardは無料でご利用いただけます。法令データはe-Gov法令検索の利用規約に従い提供されています。",
  },
  {
    q: "法的アドバイスを提供していますか？",
    a: "いいえ。LexCardは法令テキストの閲覧・編集ツールであり、法的アドバイスや解釈の提供は行っておりません。具体的な法的問題については弁護士等の専門家にご相談ください。",
  },
];
