import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateA11yId,
  contrastRatio,
  prefersReducedMotion,
  announceToScreenReader,
  trapFocus,
} from "./a11y-utils";

describe("generateA11yId", () => {
  it("ユニークなIDを生成する", () => {
    const id1 = generateA11yId("test");
    const id2 = generateA11yId("test");
    expect(id1).not.toBe(id2);
  });

  it("プレフィクスを含む", () => {
    const id = generateA11yId("dialog");
    expect(id).toMatch(/^dialog-\d+$/);
  });

  it("デフォルトプレフィクスはa11y", () => {
    const id = generateA11yId();
    expect(id).toMatch(/^a11y-\d+$/);
  });
});

describe("contrastRatio", () => {
  it("同じ色のコントラスト比は1:1", () => {
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 1);
  });

  it("白と黒のコントラスト比は21:1", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 0);
  });

  it("LexCardのプライマリテキスト (#1E3A5F on #EFF8FF) はAA合格", () => {
    const ratio = contrastRatio("#1E3A5F", "#EFF8FF");
    expect(ratio).toBeGreaterThan(4.5); // WCAG AA基準
  });

  it("LexCardのセカンダリテキスト (#4B6A8A on #EFF8FF) はAA合格", () => {
    const ratio = contrastRatio("#4B6A8A", "#EFF8FF");
    expect(ratio).toBeGreaterThan(4.5);
  });

  it("LexCardのアクセントカラー (#0369A1 on #EFF8FF) はAA合格", () => {
    const ratio = contrastRatio("#0369A1", "#EFF8FF");
    expect(ratio).toBeGreaterThan(4.5);
  });

  it("低コントラストの組み合わせを検出する", () => {
    // 薄いグレー同士
    const ratio = contrastRatio("#CCCCCC", "#EEEEEE");
    expect(ratio).toBeLessThan(4.5);
  });
});

describe("prefersReducedMotion", () => {
  it("Node.js環境ではfalseを返す", () => {
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("announceToScreenReader", () => {
  let originalDocument: typeof globalThis.document;

  beforeEach(() => {
    originalDocument = globalThis.document;
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "document", { value: originalDocument, writable: true });
  });

  it("document未定義の環境では何もしない", () => {
    // Node.js環境ではdocument未定義なのでエラーなく完了すること
    Object.defineProperty(globalThis, "document", { value: undefined, writable: true });
    expect(() => announceToScreenReader("テスト")).not.toThrow();
  });

  it("DOM環境でaria-live regionを作成する", () => {
    const mockRegion = {
      id: "",
      setAttribute: vi.fn(),
      style: {},
      textContent: "",
    };
    const mockBody = { appendChild: vi.fn() };
    const mockDoc = {
      getElementById: vi.fn().mockReturnValue(null),
      createElement: vi.fn().mockReturnValue(mockRegion),
      body: mockBody,
    };
    Object.defineProperty(globalThis, "document", { value: mockDoc, writable: true });
    // requestAnimationFrameも必要
    const origRaf = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });

    announceToScreenReader("検索完了", "assertive");

    expect(mockDoc.getElementById).toHaveBeenCalledWith("sr-announce-assertive");
    expect(mockDoc.createElement).toHaveBeenCalledWith("div");
    expect(mockRegion.setAttribute).toHaveBeenCalledWith("aria-live", "assertive");
    expect(mockBody.appendChild).toHaveBeenCalledWith(mockRegion);

    globalThis.requestAnimationFrame = origRaf;
  });

  it("既存のregionを再利用する", () => {
    const existingRegion = { textContent: "古い通知" };
    const mockDoc = {
      getElementById: vi.fn().mockReturnValue(existingRegion),
      createElement: vi.fn(),
      body: { appendChild: vi.fn() },
    };
    Object.defineProperty(globalThis, "document", { value: mockDoc, writable: true });
    const origRaf = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });

    announceToScreenReader("新しい通知");

    expect(mockDoc.createElement).not.toHaveBeenCalled();
    expect(existingRegion.textContent).toBe("新しい通知");

    globalThis.requestAnimationFrame = origRaf;
  });
});

describe("trapFocus", () => {
  it("コンテナ内でイベントリスナーを設定しクリーンアップを返す", () => {
    const mockContainer = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      querySelector: vi.fn().mockReturnValue(null),
      querySelectorAll: vi.fn().mockReturnValue([]),
    } as unknown as HTMLElement;

    const cleanup = trapFocus(mockContainer);

    expect(mockContainer.addEventListener).toHaveBeenCalledWith("keydown", expect.any(Function));
    expect(typeof cleanup).toBe("function");

    cleanup();
    expect(mockContainer.removeEventListener).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("初期フォーカスを最初のフォーカス可能要素に設定する", () => {
    const mockFirstFocusable = { focus: vi.fn() };
    const mockContainer = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      querySelector: vi.fn().mockReturnValue(mockFirstFocusable),
      querySelectorAll: vi.fn().mockReturnValue([mockFirstFocusable]),
    } as unknown as HTMLElement;

    trapFocus(mockContainer);

    expect(mockFirstFocusable.focus).toHaveBeenCalled();
  });

  // Note: Tab循環テスト (Shift+Tab/Tab) はdocument.activeElementのモックが
  // Node環境で不可能なため省略。jsdom環境への移行時に追加予定。

  it("Tab以外のキーは無視する", () => {
    let keyHandler: (e: KeyboardEvent) => void = () => {};
    const mockContainer = {
      addEventListener: vi.fn((_: string, handler: (e: KeyboardEvent) => void) => {
        keyHandler = handler;
      }),
      removeEventListener: vi.fn(),
      querySelector: vi.fn().mockReturnValue(null),
      querySelectorAll: vi.fn().mockReturnValue([]),
    } as unknown as HTMLElement;

    trapFocus(mockContainer);

    const event = {
      key: "Escape",
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;
    keyHandler(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("フォーカス可能な要素がない場合は何もしない", () => {
    let keyHandler: (e: KeyboardEvent) => void = () => {};
    const mockContainer = {
      addEventListener: vi.fn((_: string, handler: (e: KeyboardEvent) => void) => {
        keyHandler = handler;
      }),
      removeEventListener: vi.fn(),
      querySelector: vi.fn().mockReturnValue(null),
      querySelectorAll: vi.fn().mockReturnValue([]),
    } as unknown as HTMLElement;

    trapFocus(mockContainer);

    const event = {
      key: "Tab",
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;
    keyHandler(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
