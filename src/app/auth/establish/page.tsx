"use client";

import { useEffect, useState } from "react";
import { login } from "@/lib/session";

/**
 * OAuth session establishment trampoline page.
 * Reads the __oauth_session cookie set by the callback route,
 * stores session in localStorage via login(), then redirects.
 */
export default function EstablishPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Read the short-lived OAuth session cookie
      const match = document.cookie.match(/(?:^|; )__oauth_session=([^;]*)/);
      if (!match) {
        setError("セッション情報が見つかりません。もう一度ログインしてください。");
        return;
      }

      const sessionData = JSON.parse(decodeURIComponent(match[1]));

      if (!sessionData.memberId || !sessionData.token) {
        setError("セッション情報が不正です。");
        return;
      }

      // Store in localStorage
      login(sessionData);

      // Clear the cookie
      document.cookie = "__oauth_session=; path=/auth/establish; max-age=0";

      // Redirect
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("return") || "/";
      window.location.href = returnTo;
    } catch {
      setError("認証処理中にエラーが発生しました。");
    }
  }, []);

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-primary)",
          backgroundColor: "var(--color-bg)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--color-del-fg)", marginBottom: "1rem" }}>{error}</p>
          <a href="/login" style={{ color: "var(--color-accent)" }}>
            ログインページへ戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        color: "var(--color-text-secondary)",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <p>認証中...</p>
    </div>
  );
}
