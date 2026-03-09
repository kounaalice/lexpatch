import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "./logger";

describe("logger - 構造化ログユーティリティ", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  /** 出力された JSON 文字列をパースして返すヘルパー */
  function parseOutput(spy: ReturnType<typeof vi.spyOn>): Record<string, unknown> {
    expect(spy).toHaveBeenCalledOnce();
    const raw = spy.mock.calls[0][0] as string;
    return JSON.parse(raw);
  }

  describe("info()", () => {
    it("console.log に JSON を出力する", () => {
      logger.info("テストメッセージ");
      const entry = parseOutput(logSpy);
      expect(entry.level).toBe("info");
      expect(entry.message).toBe("テストメッセージ");
    });

    it("context を含めて出力する", () => {
      logger.info("法令取得", { lawId: "123", count: 5 });
      const entry = parseOutput(logSpy);
      expect(entry.level).toBe("info");
      expect(entry.message).toBe("法令取得");
      expect(entry.context).toEqual({ lawId: "123", count: 5 });
    });

    it("context が空オブジェクトの場合は含めない", () => {
      logger.info("空コンテキスト", {});
      const entry = parseOutput(logSpy);
      expect(entry).not.toHaveProperty("context");
    });

    it("context 省略時は context キーが存在しない", () => {
      logger.info("コンテキストなし");
      const entry = parseOutput(logSpy);
      expect(entry).not.toHaveProperty("context");
    });
  });

  describe("warn()", () => {
    it("console.warn に JSON を出力する", () => {
      logger.warn("キャッシュ期限切れ");
      const entry = parseOutput(warnSpy);
      expect(entry.level).toBe("warn");
      expect(entry.message).toBe("キャッシュ期限切れ");
    });

    it("context 付きで出力できる", () => {
      logger.warn("レート制限", { remaining: 3 });
      const entry = parseOutput(warnSpy);
      expect(entry.context).toEqual({ remaining: 3 });
    });
  });

  describe("error()", () => {
    it("console.error に JSON を出力する", () => {
      logger.error("API接続失敗");
      const entry = parseOutput(errorSpy);
      expect(entry.level).toBe("error");
      expect(entry.message).toBe("API接続失敗");
    });

    it("context 付きで出力できる", () => {
      logger.error("DB書き込みエラー", { table: "laws", code: "42P01" });
      const entry = parseOutput(errorSpy);
      expect(entry.context).toEqual({ table: "laws", code: "42P01" });
    });
  });

  describe("debug()", () => {
    it("開発環境では console.log に出力する", () => {
      vi.stubEnv("NODE_ENV", "development");
      logger.debug("デバッグ情報");
      const entry = parseOutput(logSpy);
      expect(entry.level).toBe("debug");
      expect(entry.message).toBe("デバッグ情報");
    });

    it("本番環境では出力しない", () => {
      vi.stubEnv("NODE_ENV", "production");
      logger.debug("本番では見えない");
      expect(logSpy).not.toHaveBeenCalled();
    });

    it("開発環境で context 付きで出力できる", () => {
      vi.stubEnv("NODE_ENV", "development");
      logger.debug("パース中", { articleNum: "第1条" });
      const entry = parseOutput(logSpy);
      expect(entry.context).toEqual({ articleNum: "第1条" });
    });
  });

  describe("タイムスタンプ形式", () => {
    it("ISO 8601 形式のタイムスタンプが含まれる", () => {
      logger.info("タイムスタンプ検証");
      const entry = parseOutput(logSpy);
      expect(entry.timestamp).toBeDefined();
      // ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ
      const ts = entry.timestamp as string;
      expect(new Date(ts).toISOString()).toBe(ts);
    });

    it("タイムスタンプが現在時刻に近い", () => {
      const before = Date.now();
      logger.info("時刻チェック");
      const after = Date.now();

      const entry = parseOutput(logSpy);
      const ts = new Date(entry.timestamp as string).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  describe("JSON出力の妥当性", () => {
    it("出力が有効な JSON 文字列である", () => {
      logger.info("JSON検証", { nested: { key: "value" } });
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
    });

    it("全フィールドが正しい型を持つ", () => {
      logger.info("型チェック", { data: [1, 2, 3] });
      const entry = parseOutput(logSpy);
      expect(typeof entry.timestamp).toBe("string");
      expect(typeof entry.level).toBe("string");
      expect(typeof entry.message).toBe("string");
      expect(entry.context).toEqual({ data: [1, 2, 3] });
    });
  });
});
