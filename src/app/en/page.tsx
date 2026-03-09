import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LexCard — Free Public Legal Access Platform for Japanese Law",
  description:
    "LexCard is a free, open-source legal access platform for Japanese statutes, operated as a public-purpose service by Kouna Hime Inc. Browse, search, and annotate 9,000+ laws — no registration required.",
  openGraph: {
    title: "LexCard — Free Public Legal Access Platform",
    description:
      "A public-purpose, free and open-source platform for accessing Japanese law. Browse 9,000+ statutes from the official e-Gov API.",
    locale: "en_US",
  },
  alternates: {
    canonical: "/en",
    languages: { ja: "/", en: "/en" },
  },
};

/* ────────────────── Styles ────────────────── */

const sectionH2: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "1.4rem",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  borderBottom: "2px solid var(--color-accent)",
  paddingBottom: "0.4rem",
  marginBottom: "1.5rem",
};

const cardStyle: React.CSSProperties = {
  padding: "1.25rem",
  backgroundColor: "var(--color-surface)",
  borderRadius: "8px",
  border: "1px solid var(--color-border)",
};

const langBadge: React.CSSProperties = {
  display: "inline-block",
  padding: "0.1rem 0.5rem",
  borderRadius: "3px",
  fontFamily: "var(--font-sans)",
  fontSize: "0.65rem",
  fontWeight: 700,
  marginRight: "0.4rem",
};

/* ────────────────── Page ────────────────── */

export default function EnglishPage() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ── Hero ── */}
      <div
        style={{
          background: "linear-gradient(160deg, #EFF8FF 0%, #DBEAFE 55%, #BFDBFE 100%)",
          padding: "4rem 1.5rem 3rem",
          textAlign: "center",
          borderBottom: "1px solid #BAE6FD",
        }}
      >
        <h1
          lang="en"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "2.5rem",
            fontWeight: 700,
            color: "#1E3A5F",
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          LexCard
        </h1>
        <p
          lang="en"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.05rem",
            color: "#4B6A8A",
            marginBottom: "1.5rem",
          }}
        >
          A free, public-purpose legal access platform for Japanese law
        </p>

        {/* 多言語タグライン */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            maxWidth: "600px",
            margin: "0 auto 2rem",
            fontSize: "0.85rem",
            lineHeight: 1.8,
            color: "#4B6A8A",
          }}
        >
          <div lang="ja">公共目的で無償提供する法令アクセス基盤 — 無料・登録不要</div>
          <div lang="zh">面向公众免费提供的日本法令访问平台 — 免费、无需注册</div>
          <div lang="ko">공공 목적으로 무상 제공하는 일본 법령 접근 플랫폼 — 무료, 가입 불필요</div>
        </div>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "0.75rem 2rem",
            backgroundColor: "#0369A1",
            color: "#fff",
            borderRadius: "6px",
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Start Browsing — Free, No Sign-up
        </Link>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* ── Mission ── */}
        <section lang="en" style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>Our Mission</h2>
          <div style={{ ...cardStyle, borderLeft: "4px solid var(--color-accent)" }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                color: "var(--color-text-primary)",
                lineHeight: 1.9,
                marginBottom: "1rem",
              }}
            >
              Access to legislation is a public good.
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.8,
                marginBottom: "1rem",
              }}
            >
              LexCard is operated by Kouna Hime Inc., a Japanese corporation, as a{" "}
              <strong>public-purpose, non-monetized service</strong>. We leverage the legal
              protection and agility of a commercial entity while making the service itself entirely
              free with no intent to generate revenue.
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.8,
              }}
            >
              All features are available at no cost, with no registration required. Source code is
              open on GitHub.
            </p>
          </div>
        </section>

        {/* ── 多言語ミッション ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>
            <span style={{ ...langBadge, backgroundColor: "var(--color-accent)", color: "#fff" }}>
              多言語
            </span>
            Mission
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            {[
              {
                lang: "ja",
                badge: "日本語",
                badgeColor: "#0369A1",
                text: "LexCard（法令アクセス支援システム）は、こうな姫株式会社が公共目的で無償提供する法令アクセス基盤です。法令へのアクセスは公共財であるという理念のもと、e-Gov法令検索APIに基づく日本の現行法令の閲覧・検索・改正案作成機能を、すべて無料・登録不要で提供しています。営利企業としての法的保護と意思決定の機動力を活かしながら、サービス自体は収益化を目的としません。",
              },
              {
                lang: "en",
                badge: "English",
                badgeColor: "#1B4B8A",
                text: "LexCard is a legal access platform provided free of charge by Kouna Hime Inc. for the public good. Based on the principle that access to legislation is a public good, we offer full access to Japan's current statutes — browsing, searching, and amendment drafting — via the e-Gov Laws API, entirely free and without registration. As a commercial entity, we maintain legal protection and decision-making agility, while the service itself is not intended to generate revenue.",
              },
              {
                lang: "zh",
                badge: "中文",
                badgeColor: "#B91C1C",
                text: "LexCard（法令访问支援系统）是由こうな姫株式会社（Kouna Hime Inc.）出于公共目的免费提供的法令访问平台。基于「法令访问是公共财产」的理念，我们通过 e-Gov 法令检索 API 提供日本现行法令的浏览、搜索、修正案编辑功能，全部免费且无需注册。作为营利企业，我们拥有法律保护和灵活的决策能力，而服务本身不以盈利为目的。",
              },
              {
                lang: "ko",
                badge: "한국어",
                badgeColor: "#1E40AF",
                text: "LexCard(법령 접근 지원 시스템)는 こうな姫株式会社(Kouna Hime Inc.)가 공공 목적으로 무상 제공하는 법령 접근 플랫폼입니다. '법령에 대한 접근은 공공재'라는 이념 아래, e-Gov 법령검색 API를 통해 일본 현행 법령의 열람・검색・개정안 작성 기능을 전부 무료로 제공하며 가입이 필요 없습니다. 영리기업으로서의 법적 보호와 의사결정의 기동력을 활용하면서도, 서비스 자체는 수익화를 목적으로 하지 않습니다.",
              },
            ].map(({ lang, badge, badgeColor, text }) => (
              <div key={lang} lang={lang} style={cardStyle}>
                <span
                  style={{
                    ...langBadge,
                    backgroundColor: badgeColor,
                    color: "#fff",
                    marginBottom: "0.5rem",
                  }}
                >
                  {badge}
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.9,
                    marginTop: "0.5rem",
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What LexCard Does ── */}
        <section lang="en" style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>What LexCard Does</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                step: "1",
                title: "Search & Browse",
                desc: "Access 9,000+ Japanese statutes from the official e-Gov API. Full-text search across 50 legal categories + 47 prefectures.",
              },
              {
                step: "2",
                title: "Direct Editing",
                desc: "Edit statute text directly in the browser. Auto-generate amendment comparison tables (新旧対照表) and formal amendment text (改め文).",
              },
              {
                step: "3",
                title: "Projects & Community",
                desc: "Organize legal research into projects with task management and chat. Join theme-based communities for collaboration.",
              },
              {
                step: "4",
                title: "Commentary & Lint",
                desc: "Publish article-by-article commentary with citations. Auto-validate amendments with 6 lint rules.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} style={cardStyle}>
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {step}
                </div>
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

        {/* ── Principles ── */}
        <section lang="en" style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>Principles</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                icon: "🆓",
                title: "Free & No Registration",
                desc: "All features are free to use. No account creation required. No paywalls, no premium tiers.",
              },
              {
                icon: "🏛️",
                title: "Corporate Stewardship",
                desc: "Operated by Kouna Hime Inc. — a Japanese corporation providing legal protection, accountability, and sustainable maintenance.",
              },
              {
                icon: "🔓",
                title: "Open Source",
                desc: "Source code is public on GitHub. Bug reports and feature requests welcome. Fork freely.",
              },
              {
                icon: "🎯",
                title: "No AI, No Hallucination",
                desc: "All content comes directly from the official e-Gov database. Zero AI generation — zero fabrication risk.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={cardStyle}>
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

        {/* ── Get Involved ── */}
        <section lang="en" style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>Get Involved</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            <div style={cardStyle}>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                Contribute
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.8,
                }}
              >
                LexCard is open source. Submit bug reports, feature requests, or pull requests on
                GitHub. Commentary contributions and community participation are also welcome.
              </div>
              <a
                href="https://github.com/kounaalice/lexpatch"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "0.75rem",
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  textDecoration: "none",
                }}
              >
                github.com/kounaalice/lexpatch →
              </a>
            </div>
            <div style={cardStyle}>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                Support
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.8,
                }}
              >
                LexCard is sustained by voluntary support. Donations, partnerships, and
                institutional collaborations help keep the service free for everyone.
              </div>
              <Link
                href="/contact"
                style={{
                  display: "inline-block",
                  marginTop: "0.75rem",
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  textDecoration: "none",
                }}
              >
                Contact us →
              </Link>
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section lang="en" style={{ marginBottom: "3rem" }}>
          <h2 style={sectionH2}>About</h2>
          <div style={cardStyle}>
            <table
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <tbody>
                {[
                  { label: "Operator", value: "Kouna Hime Inc. (こうな姫株式会社)" },
                  { label: "Location", value: "Shibuya, Tokyo, Japan" },
                  {
                    label: "Service",
                    value: "LexCard — Legal Access Platform (法令アクセス支援システム)",
                  },
                  { label: "Data Source", value: "e-Gov Laws API (Digital Agency of Japan)" },
                  { label: "Cost", value: "Free — all features, no registration" },
                  { label: "Revenue Model", value: "None — public-purpose, non-monetized service" },
                ].map((r) => (
                  <tr key={r.label}>
                    <td
                      style={{
                        padding: "0.4rem 0.75rem 0.4rem 0",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid var(--color-border)",
                        verticalAlign: "top",
                      }}
                    >
                      {r.label}
                    </td>
                    <td
                      style={{
                        padding: "0.4rem 0",
                        color: "var(--color-text-secondary)",
                        borderBottom: "1px solid var(--color-border)",
                        lineHeight: 1.7,
                      }}
                    >
                      {r.value}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td
                    style={{
                      padding: "0.4rem 0.75rem 0.4rem 0",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      whiteSpace: "nowrap",
                      verticalAlign: "top",
                    }}
                  >
                    Open Source
                  </td>
                  <td style={{ padding: "0.4rem 0", lineHeight: 1.7 }}>
                    <a
                      href="https://github.com/kounaalice/lexpatch"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--color-accent)" }}
                    >
                      github.com/kounaalice/lexpatch
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── CTA ── */}
        <section lang="en" style={{ marginBottom: "2rem" }}>
          <div style={{ ...cardStyle, textAlign: "center", padding: "2.5rem 1.5rem" }}>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Start Using LexCard
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginBottom: "1.5rem",
                lineHeight: 1.7,
              }}
            >
              No registration needed. Start browsing Japanese statutes today.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  padding: "0.7rem 2rem",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Browse Laws →
              </Link>
              <Link
                href="/contact"
                style={{
                  display: "inline-block",
                  padding: "0.7rem 2rem",
                  backgroundColor: "transparent",
                  color: "var(--color-accent)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid var(--color-accent)",
                }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "1.5rem",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
          }}
        >
          <Link href="/" style={{ color: "var(--color-accent)" }}>
            ← 日本語版
          </Link>
          <Link href="/about" style={{ color: "var(--color-accent)" }}>
            About (日本語)
          </Link>
          <Link href="/guide" style={{ color: "var(--color-accent)" }}>
            User Guide (日本語)
          </Link>
          <Link href="/contact" style={{ color: "var(--color-accent)" }}>
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
