import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { uuid } from "./uuid";

describe("uuid", () => {
  const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  it("UUID v4形式の文字列を返す", () => {
    const id = uuid();
    expect(id).toMatch(UUID_V4_RE);
  });

  it("バージョンビットが4である", () => {
    const id = uuid();
    expect(id[14]).toBe("4");
  });

  it("バリアントビットが8-bの範囲", () => {
    const id = uuid();
    expect("89ab").toContain(id[19]);
  });

  it("ユニークな値を生成する", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(uuid());
    }
    expect(ids.size).toBe(100);
  });

  it("36文字（ハイフン含む）の長さ", () => {
    expect(uuid()).toHaveLength(36);
  });
});

describe("uuid fallback: getRandomValues", () => {
  const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  let originalCrypto: Crypto;

  beforeEach(() => {
    originalCrypto = globalThis.crypto;
    // Replace crypto with an object that has getRandomValues but NOT randomUUID
    const realGetRandomValues = originalCrypto.getRandomValues.bind(originalCrypto);
    Object.defineProperty(globalThis, "crypto", {
      value: {
        getRandomValues: realGetRandomValues,
        // randomUUID intentionally omitted
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  });

  it("getRandomValuesフォールバックでUUID v4形式を返す", async () => {
    // Re-import to pick up the modified crypto
    const { uuid: uuidFallback } = await import("./uuid");
    const id = uuidFallback();
    expect(id).toMatch(UUID_V4_RE);
    expect(id).toHaveLength(36);
  });

  it("getRandomValuesフォールバックでバージョン4・バリアントビット正常", async () => {
    const { uuid: uuidFallback } = await import("./uuid");
    const id = uuidFallback();
    expect(id[14]).toBe("4");
    expect("89ab").toContain(id[19]);
  });

  it("getRandomValuesフォールバックでユニーク値を生成する", async () => {
    const { uuid: uuidFallback } = await import("./uuid");
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(uuidFallback());
    }
    expect(ids.size).toBe(50);
  });
});

describe("uuid fallback: Math.random (last resort)", () => {
  const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  let originalCrypto: Crypto;

  beforeEach(() => {
    originalCrypto = globalThis.crypto;
    // Remove crypto entirely to force Math.random fallback
    Object.defineProperty(globalThis, "crypto", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  });

  it("Math.randomフォールバックでUUID v4形式を返す", async () => {
    const { uuid: uuidFallback } = await import("./uuid");
    const id = uuidFallback();
    expect(id).toMatch(UUID_V4_RE);
    expect(id).toHaveLength(36);
  });

  it("Math.randomフォールバックでバージョン4・バリアントビット正常", async () => {
    const { uuid: uuidFallback } = await import("./uuid");
    const id = uuidFallback();
    expect(id[14]).toBe("4");
    expect("89ab").toContain(id[19]);
  });

  it("Math.randomフォールバックでユニーク値を生成する", async () => {
    const { uuid: uuidFallback } = await import("./uuid");
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(uuidFallback());
    }
    expect(ids.size).toBe(50);
  });
});
