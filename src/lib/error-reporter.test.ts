/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// --- グローバル環境のモック ---

// error-reporter は import 時に `typeof window !== "undefined"` を評価し
// "online" リスナーを登録するため、各テストで動的 import + モジュールキャッシュリセットを行う。

describe("error-reporter - クライアントサイドエラーレポーター", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchSpy = vi.fn().mockResolvedValue(new Response("ok"));
    vi.stubGlobal("fetch", fetchSpy);

    // navigator.onLine を制御可能にする
    Object.defineProperty(navigator, "onLine", {
      value: true,
      writable: true,
      configurable: true,
    });

    // location.href
    Object.defineProperty(window, "location", {
      value: { href: "https://lexcard.jp/law/123" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.resetModules();
  });

  /** モジュールをフレッシュな状態で読み込む */
  async function freshImport() {
    return await import("./error-reporter");
  }

  describe("reportError()", () => {
    it("文字列エラーをキューに追加する", async () => {
      const mod = await freshImport();
      mod.reportError("テストエラー");
      // フラッシュタイマー (10秒) を発火
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalledOnce();
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.message).toBe("テストエラー");
      expect(body.url).toBe("https://lexcard.jp/law/123");
      expect(body.timestamp).toBeDefined();
    });

    it("Error オブジェクトのメッセージとスタックを送信する", async () => {
      const mod = await freshImport();
      const err = new Error("DB接続エラー");
      mod.reportError(err);
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalledOnce();
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.message).toBe("DB接続エラー");
      expect(body.stack).toBeDefined();
    });

    it("extra.digest と extra.url が反映される", async () => {
      const mod = await freshImport();
      mod.reportError("カスタムエラー", {
        digest: "abc123",
        url: "https://lexcard.jp/custom",
      });
      vi.advanceTimersByTime(10_000);
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.digest).toBe("abc123");
      expect(body.url).toBe("https://lexcard.jp/custom");
    });

    it("サーバーサイド (window === undefined) では何もしない", async () => {
      const origWindow = globalThis.window;
      // @ts-expect-error -- window を一時的に undefined にする
      delete globalThis.window;
      try {
        const mod = await freshImport();
        mod.reportError("サーバー側エラー");
        vi.advanceTimersByTime(10_000);
        expect(fetchSpy).not.toHaveBeenCalled();
      } finally {
        globalThis.window = origWindow;
      }
    });

    it("userAgent が含まれる", async () => {
      const mod = await freshImport();
      mod.reportError("UA検証");
      vi.advanceTimersByTime(10_000);
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.userAgent).toBeDefined();
      expect(typeof body.userAgent).toBe("string");
    });
  });

  describe("重複排除", () => {
    it("同一メッセージ+URL のエラーは 1回しか送信しない", async () => {
      const mod = await freshImport();
      mod.reportError("重複エラー");
      mod.reportError("重複エラー");
      mod.reportError("重複エラー");
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalledOnce();
    });

    it("メッセージが異なればそれぞれ送信される", async () => {
      const mod = await freshImport();
      mod.reportError("エラーA");
      mod.reportError("エラーB");
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("同一メッセージでも URL が異なれば別エントリ", async () => {
      const mod = await freshImport();
      mod.reportError("共通エラー", { url: "https://lexcard.jp/page1" });
      mod.reportError("共通エラー", { url: "https://lexcard.jp/page2" });
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("レート制限 (最大5件/分)", () => {
    it("6件目以降は次の分まで送信されない", async () => {
      const mod = await freshImport();
      for (let i = 0; i < 7; i++) {
        mod.reportError(`エラー${i}`);
      }
      // 最初のフラッシュ
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalledTimes(5);

      // もう一度フラッシュしても sentCount 上限で送れない
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalledTimes(5);

      // 1分経過で sentCount リセット → 次のフラッシュで残り2件
      vi.advanceTimersByTime(60_000);
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalledTimes(7);
    });
  });

  describe("スタックトレース切り詰め", () => {
    it("2048文字を超えるスタックは切り詰められる", async () => {
      const mod = await freshImport();
      const err = new Error("長大スタック");
      // 3000文字のスタックを設定
      err.stack = "X".repeat(3000);
      mod.reportError(err);
      vi.advanceTimersByTime(10_000);
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.stack.length).toBe(2048);
    });
  });

  describe("オフライン時の挙動", () => {
    it("オフライン時はキューに保持し送信しない", async () => {
      Object.defineProperty(navigator, "onLine", { value: false });
      const mod = await freshImport();
      mod.reportError("オフラインエラー");
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("フラッシュタイマー", () => {
    it("キューが空になるとタイマーが停止する", async () => {
      const mod = await freshImport();
      mod.reportError("1回だけ");
      vi.advanceTimersByTime(10_000); // フラッシュ → 送信
      expect(fetchSpy).toHaveBeenCalledOnce();

      // 次のフラッシュでキュー空 → タイマークリア
      vi.advanceTimersByTime(10_000);
      // fetch は追加呼び出しなし
      expect(fetchSpy).toHaveBeenCalledOnce();
    });
  });

  describe("送信失敗時のリトライ", () => {
    it("fetch 失敗時はキューに戻す", async () => {
      // 1回目は失敗、2回目は成功
      fetchSpy.mockRejectedValueOnce(new Error("Network error"));
      fetchSpy.mockResolvedValueOnce(new Response("ok"));

      const mod = await freshImport();
      mod.reportError("リトライエラー");
      // 1回目のフラッシュ → 失敗 → キューに戻る
      vi.advanceTimersByTime(10_000);
      // catch は非同期なので microtask を flush
      await vi.advanceTimersByTimeAsync(0);

      // 2回目のフラッシュ → 成功
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("installGlobalErrorHandlers()", () => {
    // installGlobalErrorHandlers は window にリスナーを追加する。
    // vi.resetModules() でモジュールは再生成されるが、jsdom の window は
    // テスト間で共有されるため、前のテストで追加されたリスナーが残る。
    // そのため fetch 呼び出し回数ではなく、送信されたペイロードの内容で検証する。

    it("window.addEventListener を error と unhandledrejection で呼ぶ", async () => {
      const addEventSpy = vi.spyOn(window, "addEventListener");
      const mod = await freshImport();
      mod.installGlobalErrorHandlers();

      const registeredEvents = addEventSpy.mock.calls.map((c) => c[0]);
      expect(registeredEvents).toContain("error");
      expect(registeredEvents).toContain("unhandledrejection");
      addEventSpy.mockRestore();
    });

    it("error イベント発火でレポートされる", async () => {
      const mod = await freshImport();
      mod.installGlobalErrorHandlers();

      const errorEvent = new ErrorEvent("error", {
        error: new Error("グローバルエラー"),
        message: "グローバルエラー",
      });
      window.dispatchEvent(errorEvent);

      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalled();
      const bodies = fetchSpy.mock.calls.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any[]) => JSON.parse((c[1] as RequestInit).body as string),
      );
      const matched = bodies.find((b: { message: string }) => b.message === "グローバルエラー");
      expect(matched).toBeDefined();
    });

    it("error イベントで error が null の場合は message を使う", async () => {
      const mod = await freshImport();
      mod.installGlobalErrorHandlers();

      const errorEvent = new ErrorEvent("error", {
        error: null,
        message: "スクリプトエラー",
      });
      window.dispatchEvent(errorEvent);

      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalled();
      const bodies = fetchSpy.mock.calls.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any[]) => JSON.parse((c[1] as RequestInit).body as string),
      );
      const matched = bodies.find((b: { message: string }) => b.message === "スクリプトエラー");
      expect(matched).toBeDefined();
    });

    it("unhandledrejection で Error を受け取れる", async () => {
      const mod = await freshImport();
      mod.installGlobalErrorHandlers();

      // jsdom の PromiseRejectionEvent は PromiseRejectionEvent コンストラクタ対応が
      // 限定的なため、CustomEvent ではなく直接 dispatchEvent を使う
      const event = new Event("unhandledrejection") as Event & {
        reason: unknown;
      };
      Object.defineProperty(event, "reason", {
        value: new Error("未処理rejection"),
      });
      window.dispatchEvent(event);

      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalled();
      const bodies = fetchSpy.mock.calls.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any[]) => JSON.parse((c[1] as RequestInit).body as string),
      );
      const matched = bodies.find((b: { message: string }) => b.message === "未処理rejection");
      expect(matched).toBeDefined();
    });

    it("unhandledrejection で非 Error の reason は文字列化される", async () => {
      const mod = await freshImport();
      mod.installGlobalErrorHandlers();

      const event = new Event("unhandledrejection") as Event & {
        reason: unknown;
      };
      Object.defineProperty(event, "reason", { value: 42 });
      window.dispatchEvent(event);

      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalled();
      const bodies = fetchSpy.mock.calls.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any[]) => JSON.parse((c[1] as RequestInit).body as string),
      );
      const matched = bodies.find((b: { message: string }) => b.message === "42");
      expect(matched).toBeDefined();
    });
  });

  describe("fetch 送信先", () => {
    it("/api/error-report に POST で送信する", async () => {
      const mod = await freshImport();
      mod.reportError("送信先チェック");
      vi.advanceTimersByTime(10_000);
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/error-report",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });
  });
});
