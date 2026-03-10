import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  prefetchUrl,
  prefetchLawPage,
  prefetchSearchResults,
  clearPrefetchCache,
  getPrefetchCount,
} from "./prefetch-strategy";

describe("prefetch-strategy", () => {
  let appendChildSpy: ReturnType<typeof vi.fn>;
  let createdLinks: Array<{ rel: string; href: string; as: string }>;

  beforeEach(() => {
    clearPrefetchCache();
    createdLinks = [];
    appendChildSpy = vi.fn();

    const mockDoc = {
      createElement: vi.fn(() => {
        const link = { rel: "", href: "", as: "" };
        createdLinks.push(link);
        return link;
      }),
      head: { appendChild: appendChildSpy },
    };
    Object.defineProperty(globalThis, "document", {
      value: mockDoc,
      writable: true,
      configurable: true,
    });

    // navigator.connection のモック（saveData: false）
    Object.defineProperty(globalThis, "navigator", {
      value: { connection: { saveData: false } },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // @ts-expect-error -- テスト環境復元
    delete globalThis.document;
  });

  it("prefetchUrl で <link rel=prefetch> を挿入する", () => {
    prefetchUrl("/test");
    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    expect(createdLinks[0].rel).toBe("prefetch");
    expect(createdLinks[0].href).toBe("/test");
    expect(createdLinks[0].as).toBe("document");
  });

  it("同じURLは重複プリフェッチしない", () => {
    prefetchUrl("/test");
    prefetchUrl("/test");
    expect(appendChildSpy).toHaveBeenCalledTimes(1);
  });

  it("上限 (5) を超えるとプリフェッチしない", () => {
    for (let i = 0; i < 7; i++) {
      prefetchUrl(`/page/${i}`);
    }
    expect(getPrefetchCount()).toBe(5);
    expect(appendChildSpy).toHaveBeenCalledTimes(5);
  });

  it("prefetchLawPage で /law/ パスをプリフェッチする", () => {
    prefetchLawPage("129AC0000000089");
    expect(createdLinks[0].href).toBe("/law/129AC0000000089");
  });

  it("prefetchSearchResults で上位N件をプリフェッチする", () => {
    prefetchSearchResults(["a", "b", "c", "d", "e"], 3);
    expect(getPrefetchCount()).toBe(3);
  });

  it("clearPrefetchCache でカウントをリセットする", () => {
    prefetchUrl("/a");
    prefetchUrl("/b");
    expect(getPrefetchCount()).toBe(2);
    clearPrefetchCache();
    expect(getPrefetchCount()).toBe(0);
  });

  it("saveData モードではプリフェッチしない", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { connection: { saveData: true } },
      writable: true,
      configurable: true,
    });
    prefetchUrl("/test");
    expect(appendChildSpy).not.toHaveBeenCalled();
  });
});
