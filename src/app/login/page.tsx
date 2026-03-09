"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { login } from "@/lib/session";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/csrf";
import { createClient } from "@/lib/supabase/client";

const ORG_TYPES = ["", "国", "都道府県", "市区町村", "民間", "その他"] as const;
const ORG_TYPE_LABELS: Record<string, string> = {
  "": "未選択",
  国: "国",
  都道府県: "都道府県",
  市区町村: "市区町村",
  民間: "民間",
  その他: "その他",
};

/** Read CSRF cookie value */
function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

/** Password strength (0-3) */
function getPasswordStrength(pw: string): number {
  if (pw.length < 8) return 0;
  let types = 0;
  if (/[a-z]/.test(pw)) types++;
  if (/[A-Z]/.test(pw)) types++;
  if (/\d/.test(pw)) types++;
  if (/[^a-zA-Z0-9]/.test(pw)) types++;
  if (pw.length >= 12 && types >= 3) return 3;
  if (types >= 2) return 2;
  return 1;
}

const STRENGTH_LABELS = ["弱い", "普通", "良好", "強い"];
const STRENGTH_COLORS = ["#DC2626", "#F59E0B", "#16A34A", "#0369A1"];

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState(""); // email or display name (login)
  const [name, setName] = useState(""); // display name (register)
  const [email, setEmail] = useState(""); // email (register)
  const [org, setOrg] = useState("");
  const [orgType, setOrgType] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOrg, setShowOrg] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [showMagicLink, setShowMagicLink] = useState(false);

  // Auto-detect email login
  const isEmailLogin = identifier.includes("@");

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const csrfToken = getCsrfToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      [CSRF_HEADER_NAME]: csrfToken,
    };

    try {
      if (mode === "login") {
        const res = await fetch("/api/members/auth", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: isEmailLogin ? undefined : identifier.trim(),
            email: isEmailLogin ? identifier.trim() : undefined,
            org: isEmailLogin ? undefined : org.trim(),
            password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "ログインに失敗しました");
          setLoading(false);
          return;
        }
        login(data);
      } else {
        if (password.length < 8) {
          setError("パスワードは8文字以上必要です");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/members", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            org: org.trim(),
            org_type: orgType,
            password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "登録に失敗しました");
          setLoading(false);
          return;
        }
        login(data);
      }
      if (mode === "register") {
        window.location.href = "/onboarding";
      } else {
        const returnTo = new URLSearchParams(window.location.search).get("return") || "/";
        window.location.href = returnTo;
      }
    } catch {
      setError("ネットワークエラーが発生しました");
      setLoading(false);
    }
  }

  async function handleOAuthLogin(provider: "google" | "azure") {
    setError(null);
    setMessage(null);
    setLoading(true);
    const label = provider === "azure" ? "Microsoft" : "Google";
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          ...(provider === "azure" ? { scopes: "openid email profile" } : {}),
        },
      });
      if (oauthError) {
        setError(`${label}認証に失敗しました: ${oauthError.message}`);
        setLoading(false);
      }
    } catch {
      setError(`${label}認証に失敗しました`);
      setLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!magicLinkEmail.trim()) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (otpError) {
        setError("メール送信に失敗しました: " + otpError.message);
      } else {
        setMessage("ログインリンクを送信しました。メールをご確認ください。");
      }
    } catch {
      setError("メール送信に失敗しました");
    }
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    padding: "0.6rem 0.75rem",
    border: "1px solid var(--color-border)",
    borderRadius: "6px",
    fontFamily: "var(--font-sans)",
    fontSize: "16px",
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box" as const,
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: "0.8rem",
    color: "var(--color-text-secondary)",
    marginBottom: "0.25rem",
    display: "block",
  };

  const hintStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: "0.72rem",
    color: "var(--color-text-secondary)",
    margin: "0.3rem 0 0",
    lineHeight: 1.4,
  };

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <nav
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
            display: "flex",
            gap: "0.4rem",
          }}
        >
          <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            トップ
          </Link>
          <span>&rsaquo;</span>
          <span>{mode === "login" ? "ログイン" : "新規登録"}</span>
        </nav>

        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "10px",
            padding: "2rem",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.3rem",
              color: "var(--color-text-primary)",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            {mode === "login" ? "メンバーログイン" : "メンバー新規登録"}
          </h1>

          {/* モード切替タブ */}
          <div
            style={{
              display: "flex",
              gap: "0",
              marginBottom: "1.5rem",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setMessage(null);
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: mode === m ? "var(--color-accent)" : "var(--color-surface)",
                  color: mode === m ? "#fff" : "var(--color-text-secondary)",
                  fontWeight: mode === m ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                {m === "login" ? "ログイン" : "新規登録"}
              </button>
            ))}
          </div>

          {/* ソーシャルログインボタン */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.6rem 1rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 500,
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                cursor: loading ? "wait" : "pointer",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "background 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Googleでログイン
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin("azure")}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.6rem 1rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 500,
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                cursor: loading ? "wait" : "pointer",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "background 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              Microsoftでログイン
            </button>
          </div>

          {/* マジックリンク */}
          {!showMagicLink ? (
            <button
              type="button"
              onClick={() => {
                setShowMagicLink(true);
                setError(null);
                setMessage(null);
              }}
              style={{
                width: "100%",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-accent)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.3rem 0",
                textDecoration: "underline",
                marginBottom: "0.5rem",
              }}
            >
              パスワードなしでメールログイン
            </button>
          ) : (
            <form
              onSubmit={handleMagicLink}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginBottom: "0.75rem",
                padding: "0.75rem",
                backgroundColor: "var(--color-bg)",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
              }}
            >
              <label style={{ ...labelStyle, margin: 0 }}>メールアドレスを入力</label>
              <input
                type="email"
                value={magicLinkEmail}
                onChange={(e) => setMagicLinkEmail(e.target.value)}
                placeholder="user@example.com"
                required
                style={{ ...inputStyle, fontSize: "14px" }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "0.45rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "wait" : "pointer",
                    backgroundColor: "var(--color-accent)",
                    color: "#fff",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "送信中..." : "ログインリンクを送信"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMagicLink(false)}
                  style={{
                    padding: "0.45rem 0.75rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  閉じる
                </button>
              </div>
            </form>
          )}

          {/* メッセージ（マジックリンク送信成功等） */}
          {message && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-ins-fg)",
                margin: "0 0 0.75rem",
                padding: "0.5rem 0.75rem",
                backgroundColor: "var(--color-ins-bg)",
                borderRadius: "4px",
              }}
            >
              {message}
            </p>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
              }}
            >
              または
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {mode === "login" ? (
              <>
                {/* ─── ログインモード ──── */}
                <div>
                  <label style={labelStyle}>メールアドレスまたは表示名 *</label>
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      // Hide org field when email detected
                      if (e.target.value.includes("@")) setShowOrg(false);
                    }}
                    placeholder="例: user@example.com, tanaka"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>パスワード *</label>
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* 所属（表示名ログイン時のみ） */}
                {!isEmailLogin && (
                  <div>
                    {!showOrg ? (
                      <button
                        type="button"
                        onClick={() => setShowOrg(true)}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.78rem",
                          color: "var(--color-accent)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline",
                        }}
                      >
                        所属を指定してログイン
                      </button>
                    ) : (
                      <>
                        <label style={labelStyle}>所属（任意）</label>
                        <input
                          type="text"
                          name="organization"
                          autoComplete="organization"
                          value={org}
                          onChange={(e) => setOrg(e.target.value)}
                          placeholder="例: 総務省, 東京都"
                          style={inputStyle}
                        />
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* ─── 新規登録モード ──── */}
                <div>
                  <label style={labelStyle}>表示名（アカウント名） *</label>
                  <input
                    type="text"
                    name="display-name"
                    autoComplete="username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例: tanaka, 田中太郎, LegalExpert"
                    required
                    style={inputStyle}
                  />
                  <p style={hintStyle}>
                    本名でなくても構いません。任意のニックネームやハンドルネームで登録できます。
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>メールアドレス *</label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="例: user@example.com"
                    required
                    style={inputStyle}
                  />
                  <p style={hintStyle}>パスワードリセットや通知に使用します。公開されません。</p>
                </div>

                <div>
                  <label style={labelStyle}>パスワード *（8文字以上）</label>
                  <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    style={inputStyle}
                  />
                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div style={{ marginTop: "0.4rem" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "3px",
                          height: "4px",
                        }}
                      >
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              borderRadius: "2px",
                              backgroundColor:
                                i <= pwStrength
                                  ? STRENGTH_COLORS[pwStrength]
                                  : "var(--color-border)",
                              transition: "background-color 0.2s",
                            }}
                          />
                        ))}
                      </div>
                      <p
                        style={{
                          ...hintStyle,
                          margin: "0.2rem 0 0",
                          color: STRENGTH_COLORS[pwStrength],
                          fontWeight: 500,
                        }}
                      >
                        {STRENGTH_LABELS[pwStrength]}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>所属（任意）</label>
                  <input
                    type="text"
                    name="organization"
                    autoComplete="organization"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="例: 総務省, 東京都, フリーランス"
                    style={inputStyle}
                  />
                  <p style={hintStyle}>
                    未記入でも登録できます。ログイン時は登録時と同じ値を入力してください。
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>組織区分</label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {ORG_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {error && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--color-del-fg)",
                  margin: 0,
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "var(--color-del-bg)",
                  borderRadius: "4px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.65rem 1.5rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: 600,
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "wait" : "pointer",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                opacity: loading ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "処理中..." : mode === "login" ? "ログイン" : "登録する"}
            </button>
          </form>

          {/* パスワードリセットリンク */}
          {mode === "login" && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                textAlign: "center",
                marginTop: "0.75rem",
              }}
            >
              <Link
                href="/reset-password"
                style={{ color: "var(--color-accent)", textDecoration: "none" }}
              >
                パスワードを忘れた方はこちら
              </Link>
            </p>
          )}

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              textAlign: "center",
              marginTop: "0.75rem",
              lineHeight: 1.5,
            }}
          >
            {mode === "login"
              ? "Google・Microsoft・メールリンク・パスワードのいずれかでログインできます。アカウントがない場合は「新規登録」タブへ。"
              : "任意の表示名とメールアドレスで登録できます。メールアドレスは公開されません。"}
          </p>
        </div>
      </div>
    </div>
  );
}
