"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * 再利用可能なルートエラーバウンダリ
 * 各ルートセグメントの error.tsx から使う
 */
export function RouteErrorBoundary({
  error,
  reset,
  segment,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  segment: string;
}) {
  useEffect(() => {
    fetch("/api/error-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        stack: error.stack?.slice(0, 2048),
        url: typeof window !== "undefined" ? window.location.href : "",
        segment,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }, [error, segment]);

  return (
    <div className="flex justify-center items-center min-h-[60vh] p-8">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">エラーが発生しました</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {error.message || "予期しないエラーが発生しました。"}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-[var(--accent)] text-white border-none rounded-lg px-5 py-2 cursor-pointer text-sm hover:opacity-90"
          >
            再試行
          </button>
          <Link
            href="/"
            className="border border-[var(--border)] text-[var(--text-primary)] rounded-lg px-5 py-2 text-sm no-underline hover:bg-[var(--surface)]"
          >
            トップへ
          </Link>
        </div>
      </div>
    </div>
  );
}
