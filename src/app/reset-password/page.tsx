"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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

export default function ResetPasswordPage() {
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const urlToken = params.get("token") || "";
  const urlEmail = params.get("email") || "";

  const isResetMode = !!urlToken && !!urlEmail;

  const [email, setEmail] = useState(urlEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setMessage(data.message);
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    }
    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("パスワードは8文字以上必要です");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: urlEmail,
          token: urlToken,
          newPassword: password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setMessage("パスワードがリセットされました。ログインページからログインしてください。");
      }
    } catch {
      setError("ネットワークエラーが発生しました");
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
          <Link href="/login" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            ログイン
          </Link>
          <span>&rsaquo;</span>
          <span>パスワードリセット</span>
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
            パスワードリセット
          </h1>

          {!isResetMode ? (
            <form
              onSubmit={handleRequestReset}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
              </p>

              <div>
                <label style={labelStyle}>メールアドレス *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="例: user@example.com"
                  required
                  autoComplete="email"
                  style={inputStyle}
                />
              </div>

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

              {message && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-ins-fg)",
                    margin: 0,
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--color-ins-bg)",
                    borderRadius: "4px",
                  }}
                >
                  {message}
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
                }}
              >
                {loading ? "送信中..." : "リセットリンクを送信"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleResetPassword}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                新しいパスワードを設定してください（8文字以上）。
              </p>

              <div>
                <label style={labelStyle}>新しいパスワード *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  style={inputStyle}
                />
                {password.length > 0 && (
                  <div style={{ marginTop: "0.4rem" }}>
                    <div style={{ display: "flex", gap: "3px", height: "4px" }}>
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            borderRadius: "2px",
                            backgroundColor:
                              i <= pwStrength ? STRENGTH_COLORS[pwStrength] : "var(--color-border)",
                          }}
                        />
                      ))}
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
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
                <label style={labelStyle}>パスワード確認 *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>

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

              {message && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-ins-fg)",
                    margin: 0,
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--color-ins-bg)",
                    borderRadius: "4px",
                  }}
                >
                  {message}{" "}
                  <Link href="/login" style={{ color: "var(--color-accent)" }}>
                    ログインする
                  </Link>
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
                }}
              >
                {loading ? "処理中..." : "パスワードを変更"}
              </button>
            </form>
          )}

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              textAlign: "center",
              marginTop: "1rem",
            }}
          >
            <Link href="/login" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              ログインページへ戻る
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
