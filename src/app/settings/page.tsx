"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  loadSettings,
  saveSetting,
  DEFAULTS,
  FONT_FAMILY_MAP,
  FONT_SIZE_MAP,
  formatCitation,
  applyTheme,
  applyGamingMode,
  type SiteSettings,
  type FontFamily,
  type FontSize,
  type ThemeMode,
  type CitationStyle,
  type RefClickBehavior,
} from "@/lib/settings";
import { clearHistory, getHistory } from "@/lib/history";
import { getBookmarks } from "@/lib/bookmarks";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettings()); // eslint-disable-line react-hooks/set-state-in-effect
    setLoaded(true);
  }, []);

  const update = useCallback(<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    saveSetting(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));

    // テーマ変更は即時反映
    if (key === "theme") {
      applyTheme(value as ThemeMode);
    }
    if (key === "gamingMode") {
      applyGamingMode(value as unknown as boolean);
    }
    if (key === "aiMode") {
      // ヘッダーの AI トグルと同期
      window.dispatchEvent(
        new CustomEvent("lexcard:ai-mode-change", { detail: { aiMode: value } }),
      );
    }
  }, []);

  // データ管理用の件数
  const [dataCounts, setDataCounts] = useState({
    history: 0,
    bookmarks: 0,
    memos: 0,
    annotations: 0,
  });
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  function refreshDataCounts() {
    const history = getHistory().length;
    const bookmarks = getBookmarks().length;
    let memos = 0;
    let annotations = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("lp_memo_")) memos++;
      if (key?.startsWith("lp_annot_")) annotations++;
    }
    setDataCounts({ history, bookmarks, memos, annotations });
  }

  useEffect(() => {
    if (!loaded) return;
    refreshDataCounts(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loaded]);

  function clearDataType(type: string) {
    if (type === "history") {
      clearHistory();
    } else if (type === "bookmarks") {
      localStorage.removeItem("lp_bookmarks");
    } else if (type === "memos") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("lp_memo_")) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } else if (type === "annotations") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("lp_annot_")) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } else if (type === "all") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("lp_")) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      // 設定をデフォルトに戻す
      setSettings(DEFAULTS);
      document.documentElement.setAttribute(
        "data-theme",
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      );
    }
    setConfirmTarget(null);
    refreshDataCounts();
  }

  if (!loaded) return null;

  const sampleText = "何人も、公共の福祉に反しない限り、居住、移転及び職業選択の自由を有する。";

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダ */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <Link
            href="/"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            ← ホーム
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.4rem",
              fontWeight: 700,
              marginTop: "0.5rem",
              color: "var(--color-text-primary)",
            }}
          >
            サイト設定
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        {/* 表示設定 */}
        <Section title="表示設定">
          {/* フォント */}
          <SettingRow label="条文フォント">
            <ToggleGroup<FontFamily>
              value={settings.fontFamily}
              onChange={(v) => update("fontFamily", v)}
              options={[
                { value: "gothic", label: "ゴシック体" },
                { value: "mincho", label: "明朝体" },
              ]}
            />
          </SettingRow>

          {/* 文字サイズ */}
          <SettingRow label="条文文字サイズ">
            <ToggleGroup<FontSize>
              value={settings.fontSize}
              onChange={(v) => update("fontSize", v)}
              options={[
                { value: "sm", label: "小" },
                { value: "md", label: "中" },
                { value: "lg", label: "大" },
                { value: "xl", label: "特大" },
              ]}
            />
          </SettingRow>

          {/* プレビュー */}
          <div
            style={{
              marginTop: "0.75rem",
              padding: "1rem 1.25rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontFamily: FONT_FAMILY_MAP[settings.fontFamily],
              fontSize: FONT_SIZE_MAP[settings.fontSize],
              lineHeight: 2.1,
              color: "var(--color-text-primary)",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans)",
                marginBottom: "0.5rem",
              }}
            >
              プレビュー
            </div>
            {sampleText}
          </div>

          {/* テーマ */}
          <div style={{ marginTop: "1rem" }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-primary)",
              }}
            >
              テーマ
            </span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "0.6rem",
                marginTop: "0.5rem",
              }}
            >
              {[
                {
                  value: "light" as ThemeMode,
                  label: "\u2600\uFE0F ライト",
                  bg: "#EFF8FF",
                  fg: "#1E3A5F",
                  accent: "#0369A1",
                },
                {
                  value: "dark" as ThemeMode,
                  label: "\uD83C\uDF19 ダーク",
                  bg: "#0F172A",
                  fg: "#E2E8F0",
                  accent: "#38BDF8",
                },
                {
                  value: "gothic" as ThemeMode,
                  label: "\uD83E\uDD87 ゴシック",
                  bg: "#1A0A0A",
                  fg: "#E8D5C4",
                  accent: "#8B0000",
                },
                {
                  value: "classic" as ThemeMode,
                  label: "\uD83D\uDCDC クラシック",
                  bg: "#FDF8F0",
                  fg: "#3A2A15",
                  accent: "#B8860B",
                },
                {
                  value: "yumekawa" as ThemeMode,
                  label: "\uD83C\uDF08 ゆめかわ",
                  bg: "#FFF0F5",
                  fg: "#5A2050",
                  accent: "#D946A8",
                },
                {
                  value: "mizuiro" as ThemeMode,
                  label: "\uD83D\uDC8E みずいろ",
                  bg: "#EFF8FF",
                  fg: "#1E3A5F",
                  accent: "#0EA5E9",
                },
                {
                  value: "system" as ThemeMode,
                  label: "\uD83D\uDCBB 自動",
                  bg: null,
                  fg: null,
                  accent: null,
                },
              ].map((opt) => {
                const active = opt.value === settings.theme;
                return (
                  <button
                    key={opt.value}
                    onClick={() => update("theme", opt.value)}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      padding: "0.5rem",
                      border: active
                        ? "2px solid var(--color-accent)"
                        : "1px solid var(--color-border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "border-color 0.15s",
                    }}
                  >
                    {opt.bg ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "3px",
                          marginBottom: "0.35rem",
                          height: "18px",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ flex: 3, backgroundColor: opt.bg }} />
                        <div style={{ flex: 1, backgroundColor: opt.accent ?? undefined }} />
                        <div style={{ flex: 1, backgroundColor: opt.fg ?? undefined }} />
                      </div>
                    ) : (
                      <div
                        style={{
                          height: "18px",
                          marginBottom: "0.35rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)" }}>
                          OS設定に追従
                        </span>
                      </div>
                    )}
                    <div style={{ fontWeight: active ? 700 : 400 }}>{opt.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI機能 */}
          <SettingRow label="AI機能" style={{ marginTop: "1rem" }}>
            <ToggleGroup<"true" | "false">
              value={settings.aiMode ? "true" : "false"}
              onChange={(v) => update("aiMode", v === "true")}
              options={[
                { value: "false", label: "OFF" },
                { value: "true", label: "ON" },
              ]}
            />
          </SettingRow>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.3rem",
              paddingLeft: "0.2rem",
              lineHeight: 1.7,
            }}
          >
            ONにすると、横断検索に「AI検索 β」タブが追加され、自然言語で106法令を横断検索できます。
            条文ページのAI質問機能や法令要約機能も有効になります。
            ヘッダー右上の「AI」ボタンからも切り替えられます。
          </div>

          {/* ゲーミングモード */}
          <SettingRow label="ゲーミングモード" style={{ marginTop: "1rem" }}>
            <ToggleGroup<"true" | "false">
              value={settings.gamingMode ? "true" : "false"}
              onChange={(v) => update("gamingMode", v === "true")}
              options={[
                { value: "false", label: "通常" },
                { value: "true", label: "ゲーミング" },
              ]}
            />
          </SettingRow>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.5rem",
              padding: "0.6rem 0.8rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              lineHeight: 1.8,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: "0.25rem",
                color: "var(--color-text-primary)",
              }}
            >
              法令をゲーム感覚で読もう
            </div>
            <div>法令をスクロールして読むとXPが貯まり、レベルが上がります。</div>
            <div style={{ marginTop: "0.2rem" }}>
              称号: 見習い → 法令探究者 → 条文読み → 法令通 → 法令マスター → 法令賢者 → 法令王
            </div>
            <div style={{ marginTop: "0.3rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <span>XPバー</span>
              <span>・</span>
              <span>フロートパーティクル</span>
              <span>・</span>
              <span>カードキラキラエフェクト</span>
            </div>
            <div style={{ marginTop: "0.3rem", fontSize: "0.68rem", opacity: 0.8 }}>
              ※
              XP・活動ポイントは通常モードでもバックグラウンドで蓄積されます。ゲーミングモードをONにすると表示されます。
            </div>
          </div>

          {/* データ蓄積無効化 */}
          <SettingRow label="データ蓄積" style={{ marginTop: "0.8rem" }}>
            <ToggleGroup<"true" | "false">
              value={settings.disableGamingData ? "true" : "false"}
              onChange={(v) => update("disableGamingData", v === "true")}
              options={[
                { value: "false", label: "蓄積する" },
                { value: "true", label: "無効化" },
              ]}
            />
          </SettingRow>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.68rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.3rem",
              paddingLeft: "0.2rem",
            }}
          >
            無効化すると
            XP・活動ポイント・カードの蓄積を完全に停止します。組織のポリシー等で不要な場合にご利用ください。
          </div>

          {/* 参照リンク動作 */}
          <SettingRow label="参照リンク動作" style={{ marginTop: "1rem" }}>
            <ToggleGroup<RefClickBehavior>
              value={settings.refClickBehavior}
              onChange={(v) => update("refClickBehavior", v)}
              options={[
                { value: "navigate", label: "ページ遷移" },
                { value: "highlight", label: "ハイライト" },
                { value: "popup", label: "ポップアップ" },
              ]}
            />
          </SettingRow>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.25rem",
            }}
          >
            条文内の項参照（第○項、前項など）をクリックした際の動作
          </div>
        </Section>

        {/* コピー設定 */}
        <Section title="コピー設定">
          {/* 引用形式 */}
          <SettingRow label="引用形式">
            <ToggleGroup<CitationStyle>
              value={settings.citationStyle}
              onChange={(v) => update("citationStyle", v)}
              options={[
                { value: "full", label: "法令名＋法令番号" },
                { value: "name_only", label: "法令名のみ" },
                { value: "none", label: "引用なし" },
              ]}
            />
          </SettingRow>

          {/* 引用プレビュー */}
          <div
            style={{
              marginTop: "0.5rem",
              padding: "0.75rem 1rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              コピー例
            </div>
            <div
              style={{
                color: "var(--color-text-primary)",
                fontFamily: FONT_FAMILY_MAP[settings.fontFamily],
              }}
            >
              {sampleText}
              {settings.copyParagraphNum && (
                <>
                  <br />
                  ２　前項の規定は、外国人に適用しない。
                </>
              )}
              {formatCitation(settings.citationStyle, "日本国憲法", "昭和21年憲法") && (
                <div style={{ marginTop: "0.25rem", color: "var(--color-text-secondary)" }}>
                  {formatCitation(settings.citationStyle, "日本国憲法", "昭和21年憲法")}
                </div>
              )}
            </div>
          </div>

          {/* 項番号 */}
          <SettingRow label="項番号を含める" style={{ marginTop: "1rem" }}>
            <ToggleGroup<"true" | "false">
              value={settings.copyParagraphNum ? "true" : "false"}
              onChange={(v) => update("copyParagraphNum", v === "true")}
              options={[
                { value: "true", label: "含める" },
                { value: "false", label: "含めない" },
              ]}
            />
          </SettingRow>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.25rem",
            }}
          >
            第2項以降の番号（２、３…）をコピーテキストに含めるかどうか
          </div>
        </Section>

        {/* データ管理 */}
        <Section title="データ管理">
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              marginBottom: "1rem",
            }}
          >
            以下のデータはブラウザのローカルストレージに保存されています。削除するとデータは復元できません。
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { key: "history", label: "閲覧履歴", count: dataCounts.history, unit: "件" },
              { key: "bookmarks", label: "ブックマーク", count: dataCounts.bookmarks, unit: "件" },
              { key: "memos", label: "条文メモ", count: dataCounts.memos, unit: "件" },
              {
                key: "annotations",
                label: "インライン注釈",
                count: dataCounts.annotations,
                unit: "件",
              },
            ].map((item) => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.6rem 1rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {item.count}
                    {item.unit}
                  </span>
                </div>
                {confirmTarget === item.key ? (
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      onClick={() => clearDataType(item.key)}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        padding: "0.25rem 0.6rem",
                        border: "none",
                        borderRadius: "4px",
                        backgroundColor: "#DC2626",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      削除する
                    </button>
                    <button
                      onClick={() => setConfirmTarget(null)}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        padding: "0.25rem 0.6rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "4px",
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => item.count > 0 && setConfirmTarget(item.key)}
                    disabled={item.count === 0}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      padding: "0.25rem 0.6rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      backgroundColor: "var(--color-surface)",
                      color: item.count > 0 ? "var(--color-text-secondary)" : "var(--color-border)",
                      cursor: item.count > 0 ? "pointer" : "default",
                    }}
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 全データ初期化 */}
          <div
            style={{
              marginTop: "1.25rem",
              padding: "0.75rem 1rem",
              border: "1px solid #FCA5A5",
              borderRadius: "6px",
              backgroundColor: "#FEF2F2",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "#991B1B",
                    fontWeight: 600,
                  }}
                >
                  全データを初期化
                </span>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    color: "#B91C1C",
                    marginTop: "0.15rem",
                  }}
                >
                  閲覧履歴・ブックマーク・メモ・注釈・表示設定をすべて削除します
                </div>
              </div>
              {confirmTarget === "all" ? (
                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                  <button
                    onClick={() => clearDataType("all")}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      padding: "0.25rem 0.6rem",
                      border: "none",
                      borderRadius: "4px",
                      backgroundColor: "#DC2626",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    初期化する
                  </button>
                  <button
                    onClick={() => setConfirmTarget(null)}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      padding: "0.25rem 0.6rem",
                      border: "1px solid #FCA5A5",
                      borderRadius: "4px",
                      backgroundColor: "#FEF2F2",
                      color: "#991B1B",
                      cursor: "pointer",
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmTarget("all")}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    padding: "0.25rem 0.6rem",
                    border: "1px solid #FCA5A5",
                    borderRadius: "4px",
                    backgroundColor: "#FEF2F2",
                    color: "#991B1B",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  初期化
                </button>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ── 共通コンポーネント ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: "1rem",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.85rem",
          color: "var(--color-text-primary)",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              padding: "0.35rem 0.75rem",
              border: "none",
              borderLeft: i > 0 ? "1px solid var(--color-border)" : "none",
              backgroundColor: active ? "var(--color-accent)" : "var(--color-surface)",
              color: active ? "#fff" : "var(--color-text-secondary)",
              cursor: "pointer",
              fontWeight: active ? 600 : 400,
              transition: "background-color 0.15s, color 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
