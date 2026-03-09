"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function ArticleError({ error, reset }: { error: Error; reset: () => void }) {
  const [isOffline, setIsOffline] = useState(false);
  const [waitingOnline, setWaitingOnline] = useState(false);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // エラー発生時に管理者へ自動通知
  useEffect(() => {
    if (isOffline) return; // オフライン時は送信しない
    fetch("/api/error-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        error: error.message || "Unknown error",
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {}); // 通知失敗は無視
  }, [error, isOffline]);

  // オンライン復帰時に自動リトライ
  useEffect(() => {
    if (!isOffline && waitingOnline) {
      setWaitingOnline(false);
      reset();
    }
  }, [isOffline, waitingOnline, reset]);

  const handleRetry = () => {
    if (isOffline) {
      setWaitingOnline(true);
    } else {
      reset();
    }
  };

  const isTimeout = error.message?.includes("abort") || error.message?.includes("timeout");
  const isApiError = error.message?.includes("e-Gov API error");

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "var(--font-sans)",
      }}
    >
      <h2
        style={{ color: "var(--color-text-primary)", fontSize: "1.2rem", marginBottom: "0.5rem" }}
      >
        {isOffline
          ? "オフラインです"
          : isTimeout
            ? "接続がタイムアウトしました"
            : "条文データの読み込みに失敗しました"}
      </h2>
      <p
        style={{
          color: "var(--color-text-secondary)",
          fontSize: "0.85rem",
          marginBottom: "1rem",
          lineHeight: 1.7,
        }}
      >
        {isOffline
          ? "このページはまだキャッシュされていません。インターネットに接続されたら自動で再読み込みします。"
          : isApiError
            ? "e-Gov 法令APIに一時的な問題が発生しています。しばらくお待ちください。"
            : error.message || "一時的なエラーが発生しました。時間をおいて再度お試しください。"}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={handleRetry}
          disabled={isOffline && waitingOnline}
          style={{
            padding: "0.5rem 1.25rem",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: isOffline && waitingOnline ? "not-allowed" : "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
            opacity: isOffline && waitingOnline ? 0.6 : 1,
          }}
        >
          {isOffline && waitingOnline ? "接続待機中..." : "再読み込み"}
        </button>
        <Link
          href="/"
          style={{
            padding: "0.5rem 1.25rem",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          トップに戻る
        </Link>
      </div>
      {isOffline && (
        <p
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1rem",
            backgroundColor: "#FEF3C7",
            border: "1px solid #F59E0B",
            borderRadius: "6px",
            color: "#92400E",
            fontSize: "0.8rem",
            lineHeight: 1.6,
          }}
        >
          過去に閲覧した法令はオフラインでもご覧いただけます。トップページから履歴をお試しください。
        </p>
      )}
    </div>
  );
}
