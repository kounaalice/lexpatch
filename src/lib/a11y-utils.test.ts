import { describe, it, expect } from "vitest";
import { generateA11yId, contrastRatio, prefersReducedMotion } from "./a11y-utils";

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
