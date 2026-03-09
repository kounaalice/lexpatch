/**
 * アクセシビリティユーティリティ — JIS X 8341-3 / WCAG 2.1 AA 準拠
 */

let idCounter = 0;

/**
 * ユニークなIDを生成 (aria-labelledby, aria-describedby 用)
 */
export function generateA11yId(prefix = "a11y"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * スクリーンリーダーにメッセージを通知する (aria-live region)
 * @param message 通知メッセージ
 * @param priority "polite" (通常) | "assertive" (緊急)
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite",
): void {
  if (typeof document === "undefined") return;

  const regionId = `sr-announce-${priority}`;
  let region = document.getElementById(regionId);

  if (!region) {
    region = document.createElement("div");
    region.id = regionId;
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", priority);
    region.setAttribute("aria-atomic", "true");
    Object.assign(region.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: "0",
    });
    document.body.appendChild(region);
  }

  // 同じメッセージの再通知のため一度クリア
  region.textContent = "";
  requestAnimationFrame(() => {
    region!.textContent = message;
  });
}

/**
 * フォーカストラップ — モーダル/ダイアログ内でTabキーを閉じ込める
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(", ");

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;

    const focusables = container.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }

  container.addEventListener("keydown", handleKeyDown);

  // 初期フォーカス
  const firstFocusable = container.querySelector<HTMLElement>(focusableSelectors);
  firstFocusable?.focus();

  // クリーンアップ関数を返す
  return () => container.removeEventListener("keydown", handleKeyDown);
}

/**
 * reduced-motion を尊重するかチェック
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * コントラスト比を計算 (WCAG 2.1 基準: AA=4.5:1, AAA=7:1)
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hex1);
  const lum2 = relativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
