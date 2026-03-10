/**
 * Core Web Vitals 計測
 *
 * LCP, CLS, TTFB, INP を計測し、
 * /api/analytics/vitals エンドポイントにバッチ送信する。
 *
 * 使い方: クライアントコンポーネントで reportWebVitals() を呼ぶだけ。
 * 送信は navigator.sendBeacon (ページ離脱時も確実) を使用。
 */

interface VitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

const REPORT_ENDPOINT = "/api/analytics/vitals";
const BATCH_SIZE = 5;
const FLUSH_INTERVAL_MS = 10_000;

let buffer: VitalMetric[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (buffer.length === 0) return;
  const payload = JSON.stringify({ metrics: buffer, url: location.href, timestamp: Date.now() });
  buffer = [];

  if (navigator.sendBeacon) {
    navigator.sendBeacon(REPORT_ENDPOINT, payload);
  } else {
    fetch(REPORT_ENDPOINT, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }
}

function enqueue(metric: VitalMetric) {
  buffer.push(metric);
  if (buffer.length >= BATCH_SIZE) {
    flush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flush();
    }, FLUSH_INTERVAL_MS);
  }
}

/**
 * Web Vitals 計測を開始する。
 * 動的 import で web-vitals ライブラリを読み込む（なければ無視）。
 */
export function reportWebVitals() {
  if (typeof window === "undefined") return;

  // ページ離脱時にバッファをフラッシュ
  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });

  // web-vitals ライブラリの動的読み込み
  import("web-vitals")
    .then(({ onCLS, onLCP, onTTFB, onINP }) => {
      const handle = (metric: VitalMetric) => enqueue(metric);
      onCLS(handle);
      onLCP(handle);
      onTTFB(handle);
      onINP(handle);
    })
    .catch(() => {
      // web-vitals パッケージ未インストール時はサイレントスキップ
    });
}
