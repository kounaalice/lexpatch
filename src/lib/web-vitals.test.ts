import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// web-vitals モジュールのモック（テスト環境ではインストール不要）
vi.mock("web-vitals", () => ({
  onCLS: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
  onINP: vi.fn(),
}));

describe("reportWebVitals", () => {
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    originalWindow = globalThis.window;
    vi.resetModules();
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      // @ts-expect-error -- Node環境復元
      delete globalThis.window;
    }
    vi.restoreAllMocks();
  });

  it("サーバー環境では何もしない", async () => {
    // @ts-expect-error -- Node環境シミュレーション
    delete globalThis.window;
    const { reportWebVitals } = await import("./web-vitals");
    // エラーが発生しないことを確認
    expect(() => reportWebVitals()).not.toThrow();
  });
});
