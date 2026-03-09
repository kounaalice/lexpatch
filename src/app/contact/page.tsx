"use client";
import Link from "next/link";
import { useState } from "react";

const CATEGORIES = [
  { value: "", label: "選択してください / Please select", labelShort: "" },
  { value: "question", label: "ご質問 / Question", labelShort: "ご質問" },
  { value: "feature", label: "ご要望・機能提案 / Feature Request", labelShort: "ご要望・機能提案" },
  { value: "bug", label: "不具合報告 / Bug Report", labelShort: "不具合報告" },
  { value: "donation", label: "寄付・支援について / Donation & Support", labelShort: "寄付・支援" },
  {
    value: "collaboration",
    label: "プロジェクト協力 / Project Collaboration",
    labelShort: "プロジェクト協力",
  },
  { value: "media", label: "取材・メディア / Media Inquiry", labelShort: "取材・メディア" },
  { value: "other", label: "その他 / Other", labelShort: "その他" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ category: "", name: "", email: "", subject: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      // カテゴリを件名に組み込む
      const cat = CATEGORIES.find((c) => c.value === form.category);
      const prefix = cat?.labelShort ? `[${cat.labelShort}] ` : "";
      const fullSubject = prefix + form.subject;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: fullSubject,
          message: form.message,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErrorMsg((json as { error?: string }).error ?? "送信に失敗しました / Submission failed");
      } else {
        setSent(true);
      }
    } catch {
      setErrorMsg("ネットワークエラーが発生しました / A network error occurred");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.6rem 0.8rem",
    border: "1px solid var(--color-border)",
    borderRadius: "6px",
    fontFamily: "var(--font-sans)",
    fontSize: "16px",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: "0.82rem",
    color: "var(--color-text-secondary)",
    display: "block",
    marginBottom: "0.3rem",
  };

  const enHint: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "var(--color-text-secondary)",
    opacity: 0.7,
    marginLeft: "0.4rem",
  };

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
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
          <span>お問い合わせ</span>
        </nav>

        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.8rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          お問い合わせ
          <span style={{ fontSize: "1rem", fontWeight: 400, marginLeft: "0.5rem", opacity: 0.6 }}>
            Contact
          </span>
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            marginBottom: "0.5rem",
            lineHeight: 1.7,
          }}
        >
          LexCard に関するご質問・ご要望・不具合報告・寄付のご相談はこちらからお送りください。
        </p>
        <p
          lang="en"
          style={{
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
            marginBottom: "2rem",
            lineHeight: 1.7,
            opacity: 0.8,
          }}
        >
          Questions, feature requests, bug reports, donations, and partnership inquiries are welcome
          in any language.
        </p>

        {sent ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: "2rem",
              backgroundColor: "var(--color-add-bg)",
              border: "1px solid var(--color-add-fg)",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "var(--color-add-fg)",
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              ✓ 送信が完了しました
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.3rem",
              }}
            >
              お問い合わせありがとうございます。順次ご返答いたします。
            </p>
            <p
              lang="en"
              style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", opacity: 0.8 }}
            >
              Thank you for your message. We will reply as soon as possible.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* お問い合わせ種別 */}
            <label style={{ display: "block" }}>
              <span style={labelStyle}>
                お問い合わせ種別<span style={enHint}>Category</span>{" "}
                <span style={{ color: "var(--color-del-fg)" }} aria-hidden="true">
                  *
                </span>
                <span className="sr-only">（必須）</span>
              </span>
              <select
                required
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} disabled={c.value === ""}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>
                お名前<span style={enHint}>Name</span>{" "}
                <span style={{ color: "var(--color-del-fg)" }} aria-hidden="true">
                  *
                </span>
                <span className="sr-only">（必須）</span>
              </span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle}
                placeholder="山田 太郎 / Taro Yamada"
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>
                メールアドレス<span style={enHint}>Email</span>{" "}
                <span style={{ color: "var(--color-del-fg)" }} aria-hidden="true">
                  *
                </span>
                <span className="sr-only">（必須）</span>
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                style={inputStyle}
                placeholder="example@email.com"
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>
                件名<span style={enHint}>Subject</span>
              </span>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                style={inputStyle}
                placeholder="具体的な内容 / Details"
              />
            </label>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>
                メッセージ<span style={enHint}>Message</span>{" "}
                <span style={{ color: "var(--color-del-fg)" }} aria-hidden="true">
                  *
                </span>
                <span className="sr-only">（必須）</span>
              </span>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder={
                  "お問い合わせ内容をご記入ください\nPlease write your message in any language."
                }
              />
            </label>

            {errorMsg && (
              <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                style={{ color: "var(--color-del-fg)", fontSize: "0.85rem", margin: 0 }}
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: loading ? "var(--color-text-secondary)" : "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                alignSelf: "flex-start",
              }}
            >
              {loading ? "送信中… / Sending…" : "送信する / Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
