// サイト設定（localStorage ベース）

export type FontFamily = "gothic" | "mincho";
export type FontSize = "sm" | "md" | "lg" | "xl";
export type ThemeMode = "light" | "dark" | "gothic" | "classic" | "yumekawa" | "mizuiro" | "system";
export type CitationStyle = "full" | "name_only" | "none";
export type RefClickBehavior = "navigate" | "highlight" | "popup";

export interface SiteSettings {
  fontFamily: FontFamily;
  fontSize: FontSize;
  theme: ThemeMode;
  citationStyle: CitationStyle;
  copyParagraphNum: boolean;
  refClickBehavior: RefClickBehavior;
  gamingMode: boolean;
  disableGamingData: boolean;
  aiMode: boolean;
}

export const DEFAULTS: SiteSettings = {
  fontFamily: "gothic",
  fontSize: "md",
  theme: "system",
  citationStyle: "full",
  copyParagraphNum: true,
  refClickBehavior: "navigate",
  gamingMode: false,
  disableGamingData: false,
  aiMode: false,
};

const VALID_THEMES: ThemeMode[] = [
  "light",
  "dark",
  "gothic",
  "classic",
  "yumekawa",
  "mizuiro",
  "system",
];

export const THEME_META: Record<Exclude<ThemeMode, "system">, { label: string; emoji: string }> = {
  light: { label: "ライト", emoji: "\u2600\uFE0F" },
  dark: { label: "ダーク", emoji: "\uD83C\uDF19" },
  gothic: { label: "ゴシック", emoji: "\uD83E\uDD87" },
  classic: { label: "クラシック", emoji: "\uD83D\uDCDC" },
  yumekawa: { label: "ゆめかわ", emoji: "\uD83C\uDF08" },
  mizuiro: { label: "みずいろ", emoji: "\uD83D\uDC8E" },
};

export const THEME_CYCLE: Exclude<ThemeMode, "system">[] = [
  "light",
  "dark",
  "gothic",
  "classic",
  "yumekawa",
  "mizuiro",
];

export const THEME_FONTS: Partial<Record<string, string>> = {
  gothic: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap",
  classic: "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600&display=swap",
  yumekawa: "https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700&display=swap",
};

export function resolveTheme(theme: ThemeMode): Exclude<ThemeMode, "system"> {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  gothic: '"Hiragino Sans", "BIZ UDGothic", "Yu Gothic UI", sans-serif',
  mincho: '"Hiragino Mincho ProN", "BIZ UDMincho", "Yu Mincho", serif',
};

export const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm: "0.85rem",
  md: "0.97rem",
  lg: "1.1rem",
  xl: "1.3rem",
};

const KEYS = {
  fontFamily: "lp_fontFamily",
  fontSize: "lp_fontSize",
  theme: "lp_theme",
  citationStyle: "lp_citationStyle",
  copyParagraphNum: "lp_copyParagraphNum",
  refClickBehavior: "lp_refClickBehavior",
  gamingMode: "lp_gamingMode",
  disableGamingData: "lp_disableGamingData",
  aiMode: "lp_aiMode",
} as const;

export function loadSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULTS;
  const ff = localStorage.getItem(KEYS.fontFamily);
  const fs = localStorage.getItem(KEYS.fontSize);
  const th = localStorage.getItem(KEYS.theme);
  const cs = localStorage.getItem(KEYS.citationStyle);
  const pn = localStorage.getItem(KEYS.copyParagraphNum);
  const rc = localStorage.getItem(KEYS.refClickBehavior);
  return {
    fontFamily: ff === "gothic" || ff === "mincho" ? ff : DEFAULTS.fontFamily,
    fontSize: fs === "sm" || fs === "md" || fs === "lg" || fs === "xl" ? fs : DEFAULTS.fontSize,
    theme: VALID_THEMES.includes(th as ThemeMode) ? (th as ThemeMode) : DEFAULTS.theme,
    citationStyle:
      cs === "full" || cs === "name_only" || cs === "none" ? cs : DEFAULTS.citationStyle,
    copyParagraphNum: pn === "false" ? false : DEFAULTS.copyParagraphNum,
    refClickBehavior:
      rc === "navigate" || rc === "highlight" || rc === "popup" ? rc : DEFAULTS.refClickBehavior,
    gamingMode: localStorage.getItem(KEYS.gamingMode) === "true",
    disableGamingData: localStorage.getItem(KEYS.disableGamingData) === "true",
    aiMode: localStorage.getItem(KEYS.aiMode) === "true",
  };
}

export function saveSetting<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS[key], String(value));
}

/* ── テーマ適用 ── */

const loadedFonts = new Set<string>();

function loadThemeFont(theme: string): void {
  const url = THEME_FONTS[theme];
  if (!url || loadedFonts.has(url)) return;
  if (typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.dataset.themeFont = theme;
  document.head.appendChild(link);
  loadedFonts.add(url);
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") return;
  const effective = resolveTheme(theme);
  document.documentElement.setAttribute("data-theme", effective);
  loadThemeFont(effective);
}

export function applyGamingMode(on: boolean): void {
  if (typeof document === "undefined") return;
  if (on) {
    document.documentElement.setAttribute("data-gaming", "true");
  } else {
    document.documentElement.removeAttribute("data-gaming");
  }
}

/** 引用文字列を組み立てる */
export function formatCitation(style: CitationStyle, lawTitle?: string, lawNum?: string): string {
  if (!lawTitle) return "";
  switch (style) {
    case "full":
      return lawNum ? `（${lawTitle}（${lawNum}））` : `（${lawTitle}）`;
    case "name_only":
      return `（${lawTitle}）`;
    case "none":
      return "";
  }
}
