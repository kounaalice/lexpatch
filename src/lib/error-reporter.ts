/**
 * クライアントサイド エラーレポーター
 * - バッチ送信 (最大5件/分)
 * - スタックトレース 2KB切り詰め
 * - 重複排除 (同一メッセージ × URL)
 * - オフラインキュー (復帰時自動送信)
 */

const MAX_REPORTS_PER_MINUTE = 5;
const MAX_STACK_LENGTH = 2048;
const FLUSH_INTERVAL_MS = 10_000; // 10秒

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  digest?: string;
  userAgent?: string;
}

const queue: ErrorReport[] = [];
let sentCount = 0;
let sentResetTimer: ReturnType<typeof setTimeout> | null = null;
const sentKeys = new Set<string>();
let flushTimer: ReturnType<typeof setInterval> | null = null;

function dedupeKey(report: ErrorReport): string {
  return `${report.message}::${report.url}`;
}

export function reportError(
  error: Error | string,
  extra?: { digest?: string; url?: string },
): void {
  if (typeof window === "undefined") return;

  const message = typeof error === "string" ? error : error.message;
  const stack = typeof error === "string" ? undefined : error.stack?.slice(0, MAX_STACK_LENGTH);

  const report: ErrorReport = {
    message,
    stack,
    url: extra?.url ?? window.location.href,
    timestamp: new Date().toISOString(),
    digest: extra?.digest,
    userAgent: navigator.userAgent,
  };

  const key = dedupeKey(report);
  if (sentKeys.has(key)) return;
  sentKeys.add(key);

  queue.push(report);
  ensureFlushTimer();
}

function ensureFlushTimer(): void {
  if (flushTimer) return;
  flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);
}

function flush(): void {
  if (queue.length === 0) {
    if (flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
    return;
  }

  if (sentCount >= MAX_REPORTS_PER_MINUTE) return;

  if (!navigator.onLine) return; // オフライン時はキューに保持

  const batch = queue.splice(0, MAX_REPORTS_PER_MINUTE - sentCount);
  sentCount += batch.length;

  if (!sentResetTimer) {
    sentResetTimer = setTimeout(() => {
      sentCount = 0;
      sentResetTimer = null;
    }, 60_000);
  }

  for (const report of batch) {
    fetch("/api/error-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }).catch(() => {
      // 送信失敗 — キューに戻す (リトライは次フラッシュ)
      queue.unshift(report);
    });
  }
}

/** オンライン復帰時にキュー送信 */
if (typeof window !== "undefined") {
  window.addEventListener("online", flush);
}

/**
 * グローバル unhandledrejection / error リスナー設定
 * アプリ初期化時に1回呼ぶ
 */
export function installGlobalErrorHandlers(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    reportError(event.error ?? event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (reason instanceof Error) {
      reportError(reason);
    } else {
      reportError(String(reason));
    }
  });
}
