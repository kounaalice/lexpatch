"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { CanonLine } from "@/lib/patch/apply";
import { parsePatch } from "@/lib/patch/parser";
import { applyPatch } from "@/lib/patch/apply";
import { sideBySideDiff, unifiedDiff } from "@/lib/patch/diff";
import type { SideBySideRow } from "@/lib/patch/types";
import {
  LAW_REF_MAP,
  getUnifiedRefRegex,
  articleRefToNum,
  paragraphRefToNum,
  resolveRelativeArticle,
  resolveRelativeParagraph,
} from "@/lib/lawrefs";
import {
  textToCanonLines,
  canonLinesToText,
  autoRenumber,
  diffToPlainText,
} from "@/lib/patch/directDiff";
import { generateKaramebun, karamebunToText } from "@/lib/patch/karamebun";
import BookmarkButton from "@/components/BookmarkButton";
import { ShareUrlButton, CopyArticleButton } from "@/components/ArticleActions";
import { SideBySideView } from "@/components/diff/SideBySideView";
import { getSession } from "@/lib/session";
import type { LawRevisionEntry } from "@/lib/egov/types";
import {
  loadSettings,
  formatCitation,
  FONT_FAMILY_MAP,
  FONT_SIZE_MAP,
  type FontFamily,
  type FontSize,
  type CitationStyle,
  type RefClickBehavior,
} from "@/lib/settings";
import { RefPopup, useRefPopup } from "@/components/RefPopup";
import { getNdlLawIndexUrl } from "@/lib/ndl-law-index";
import PrecedentList from "@/components/PrecedentList";
import { InlineAnnotation } from "@/components/InlineAnnotation";
import ExportButtons from "@/components/ExportButtons";
import { getAnnotation } from "@/lib/annotations";
import { addCard, cacheLawName } from "@/lib/cards";
import { ItemRenderer } from "@/components/law/ItemRenderer";
import type { Item } from "@/lib/egov/types";

type ViewMode = "canon" | "patch";
type SourceTier = "一次" | "準一次" | "二次" | "三次";

interface Source {
  tier: SourceTier;
  label: string;
  url: string;
  excerpt: string;
}

type PanelId = "none" | "memo" | "editor";

interface FullTextArticle {
  num: string;
  title: string;
  caption?: string;
  chapterTitle?: string;
  paragraphs: { num: string; sentences: string[]; items?: Item[] }[];
}

interface AmendmentDiffProp {
  rows: SideBySideRow[];
  prevDate: string;
  currentDate: string;
  isNewArticle: boolean;
  isUnchanged: boolean;
  initialRevisionIdx?: number;
}

interface Props {
  canonLines: CanonLine[];
  initialPatchText: string;
  articleTitle: string;
  articleCaption?: string;
  articleNum?: string;
  lawId?: string;
  lawTitle?: string;
  lawNum?: string;
  prevArticle?: { num: string; title: string; caption?: string } | null;
  nextArticle?: { num: string; title: string; caption?: string } | null;
  fullTextArticles?: FullTextArticle[];
  amendmentDiff?: AmendmentDiffProp | null;
  revisions?: LawRevisionEntry[];
  memoSlot?: React.ReactNode;
  commentarySlot?: React.ReactNode;
  aiSlot?: React.ReactNode;
}

const TIER_COLORS: Record<SourceTier, { fg: string; bg: string }> = {
  一次: { fg: "var(--color-accent)", bg: "var(--color-add-bg)" },
  準一次: { fg: "#1B4B8A", bg: "#EBF2FD" },
  二次: { fg: "var(--color-warn-fg)", bg: "var(--color-warn-bg)" },
  三次: { fg: "var(--color-text-secondary)", bg: "var(--color-bg)" },
};

// 日付フォーマット: "2024-04-01" → "令和6年4月1日" (2019年以降は和暦、それ以外は西暦)
function fmtEnforcementDate(d: string): string {
  const m = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return d;
  const year = parseInt(m[1]);
  const month = parseInt(m[2]);
  const day = parseInt(m[3]);
  if (year >= 2019) return `令和${year - 2018}年${month}月${day}日`;
  if (year >= 1989) return `平成${year - 1988}年${month}月${day}日`;
  return `${year}年${month}月${day}日`;
}

export function ArticlePatchView({
  canonLines,
  initialPatchText,
  articleTitle,
  articleCaption: _articleCaption,
  articleNum,
  lawId,
  lawTitle,
  lawNum,
  prevArticle,
  nextArticle,
  fullTextArticles,
  amendmentDiff: initialAmendmentDiff,
  revisions = [],
  memoSlot,
  commentarySlot,
  aiSlot,
}: Props) {
  const hasAmendment = initialAmendmentDiff && !initialAmendmentDiff.isUnchanged;
  const [patchText, _setPatchText] = useState(initialPatchText);
  const [mode, setMode] = useState<ViewMode>("canon");
  const [fontFamily, setFontFamily] = useState<FontFamily>("gothic");
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("full");
  const [copyParagraphNum, setCopyParagraphNum] = useState(true);
  const [refClickBehavior, setRefClickBehavior] = useState<RefClickBehavior>("navigate");
  const [activePanel, setActivePanel] = useState<PanelId>("none");
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const { popup: refPopup, showPopup: showRefPopup, hidePopup: hideRefPopup } = useRefPopup();

  // 改正差分表示 state（プルダウン選択で変更可能）
  const [amendmentDiff, setAmendmentDiff] = useState<AmendmentDiffProp | null>(
    initialAmendmentDiff ?? null,
  );
  const [selectedRevisionIdx, setSelectedRevisionIdx] = useState(
    initialAmendmentDiff?.initialRevisionIdx ?? 0,
  );
  const [loadingRevision, setLoadingRevision] = useState(false);

  // プルダウンで改正を選択した時のハンドラ
  const handleRevisionChange = useCallback(
    async (idx: number) => {
      if (idx === selectedRevisionIdx) return;
      if (!revisions[idx] || !revisions[idx + 1] || !lawId) return;
      setSelectedRevisionIdx(idx);
      setLoadingRevision(true);

      try {
        const current = revisions[idx];
        // 施行日の前日を asof に
        const enfDate = new Date(current.amendment_enforcement_date);
        enfDate.setDate(enfDate.getDate() - 1);
        const asof = enfDate.toISOString().split("T")[0];

        const res = await fetch(
          `/api/egov/law-at?law_id=${encodeURIComponent(lawId)}&asof=${asof}&article_num=${encodeURIComponent(articleNum ?? "")}&article_title=${encodeURIComponent(articleTitle)}`,
        );
        const data = await res.json();

        const prevCanonLines: CanonLine[] = data.canonLines ?? [];
        const diffResult = sideBySideDiff(prevCanonLines, canonLines);
        const isUnchanged = diffResult.stats.added === 0 && diffResult.stats.deleted === 0;

        setAmendmentDiff({
          rows: diffResult.rows,
          prevDate: revisions[idx + 1].amendment_enforcement_date,
          currentDate: current.amendment_enforcement_date,
          isNewArticle: !data.articleFound,
          isUnchanged,
        });
      } catch {
        // 取得失敗時は差分なし表示
        setAmendmentDiff(null);
      } finally {
        setLoadingRevision(false);
      }
    },
    [selectedRevisionIdx, revisions, lawId, articleNum, articleTitle, canonLines],
  );

  useEffect(() => {
    setLoggedIn(!!getSession());
  }, []);

  function togglePanel(id: PanelId) {
    setActivePanel((prev) => (prev === id ? "none" : id));
  }

  // 直接編集モード
  const originalText = useMemo(() => canonLinesToText(canonLines), [canonLines]);
  const [editedText, setEditedText] = useState("");
  const [editorInitialized, setEditorInitialized] = useState(false);
  useEffect(() => {
    const s = loadSettings();
    setFontFamily(s.fontFamily);
    setFontSize(s.fontSize);
    setCitationStyle(s.citationStyle);
    setCopyParagraphNum(s.copyParagraphNum);
    setRefClickBehavior(s.refClickBehavior);
  }, []);

  const [highlightText, setHighlightText] = useState<string | null>(null);

  // Read highlight from URL hash on mount
  useEffect(() => {
    function readHash() {
      const hash = window.location.hash;
      const match = hash.match(/^#highlight=(.+)$/);
      if (match) {
        try {
          setHighlightText(decodeURIComponent(match[1]));
        } catch {
          setHighlightText(null);
        }
      } else {
        setHighlightText(null);
      }
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "j" && nextArticle && lawId) {
        window.location.href = `/law/${encodeURIComponent(lawId)}/article/${encodeURIComponent(nextArticle.num)}`;
      } else if (e.key === "k" && prevArticle && lawId) {
        window.location.href = `/law/${encodeURIComponent(lawId)}/article/${encodeURIComponent(prevArticle.num)}`;
      } else if (e.key === "e") {
        setMode("patch");
        setActivePanel((prev) => (prev === "editor" ? "none" : "editor"));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextArticle, prevArticle, lawId]);

  // 全文表示: マウント時に現在の条文へコンテナ内スクロール
  const fullTextCurrentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = fullTextCurrentRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      // コンテナ（overflow: auto の親要素）を探してスクロール
      const container = el.closest<HTMLElement>("[data-fulltext-container]");
      if (container) {
        const scrollTarget =
          el.offsetTop - container.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
        container.scrollTop = Math.max(0, scrollTarget);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // コピーボタン用データ（第1項は番号なし、第2項以降は丸数字、号・号細分は字下げ）
  const articleTextForCopy = useMemo(
    () =>
      [
        articleTitle,
        ...canonLines.map((l) => {
          const indent = l.indent ?? 0;
          if (indent > 0) return "　".repeat(indent) + l.text;
          const isFirst = !l.num || l.num === "1";
          if (isFirst) return l.text;
          const displayNum = toFullWidth(l.num!);
          return copyParagraphNum && displayNum ? `${displayNum}　${l.text}` : l.text;
        }),
      ].join("\n"),
    [articleTitle, canonLines, copyParagraphNum],
  );
  const citation = formatCitation(citationStyle, lawTitle, lawNum);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSavePanel, setShowSavePanel] = useState(false);

  // 直接編集モードの diff 計算
  const { sideBySide, unified, karamebunLines } = useMemo(() => {
    let editLines: CanonLine[];
    if (editorInitialized && editedText !== originalText) {
      // 直接編集モード（項番号を自動繰り下げ）
      editLines = autoRenumber(textToCanonLines(editedText));
    } else if (patchText.trim()) {
      // レガシーモード（既存パッチの表示用）
      const patch = parsePatch(patchText, articleTitle);
      editLines = applyPatch(canonLines, patch);
    } else {
      editLines = canonLines;
    }
    const u = unifiedDiff(canonLines, editLines);
    const s = sideBySideDiff(canonLines, editLines);
    const k = generateKaramebun(articleTitle, canonLines, editLines);
    return { newLines: editLines, sideBySide: s, unified: u, karamebunLines: k };
  }, [editedText, editorInitialized, originalText, patchText, canonLines, articleTitle]);

  const hasChanges = unified.stats.added > 0 || unified.stats.deleted > 0;

  function addSource() {
    setSources((prev) => [...prev, { tier: "二次", label: "", url: "", excerpt: "" }]);
  }
  function updateSource(i: number, key: keyof Source, value: string) {
    setSources((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));
  }
  function removeSource(i: number) {
    setSources((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!title.trim()) {
      setSaveError("タイトルを入力してください");
      return;
    }
    if (!hasChanges) {
      setSaveError("変更がありません");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      // 直接編集モード: plain_textに+/-記法のdiffを生成、structuredにoriginal/editedを保存
      const isDirectEdit = editorInitialized && editedText !== originalText;
      const plainText = isDirectEdit ? diffToPlainText(articleTitle, unified.lines) : patchText;
      const structuredData = isDirectEdit
        ? { original: originalText, edited: editedText, mode: "direct" }
        : undefined;

      const res = await fetch("/api/patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          plain_text: plainText,
          description,
          target_articles: [articleTitle],
          ...(lawId ? { law_id: lawId } : {}),
          ...(lawTitle ? { law_title: lawTitle } : {}),
          ...(structuredData ? { structured_override: structuredData } : {}),
          sources: sources.filter((s) => s.label.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存エラー");
      setSavedId(data.id);
      setShowSavePanel(false);
      // カード報酬: 改正案作成 → 対象条文カード確定
      if (lawId && articleNum) {
        if (lawTitle) cacheLawName(lawId, lawTitle);
        addCard(`${lawId}:${articleNum}`);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  const userHasEdits = editorInitialized && editedText !== originalText;
  const showAmendmentDiff = mode === "patch" && !userHasEdits && amendmentDiff;

  const tabLabels: Record<ViewMode, string> = {
    canon: "現行法・解説",
    patch: revisions.length >= 2 ? "新旧対照" : "改正案・新旧対照",
  };

  // 付箋タブのスタイル生成
  const tabStyle = (active: boolean) => ({
    padding: "0.35rem 0.6rem",
    border: "none",
    borderBottom: active ? "2px solid var(--color-accent)" : "2px solid transparent",
    backgroundColor: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: "0.75rem",
    color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
    cursor: "pointer" as const,
    fontWeight: active ? 700 : 400,
    whiteSpace: "nowrap" as const,
  });

  // ボタン共通スタイル
  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-sans)",
    fontSize: "0.75rem",
    lineHeight: 1,
    border: active ? "1px solid var(--color-add-fg)" : "1px solid var(--color-border)",
    borderRadius: "4px",
    padding: "0.1rem 0.5rem",
    opacity: 0.85,
    backgroundColor: active ? "var(--color-add-bg)" : "transparent",
    color: active ? "var(--color-add-fg)" : "inherit",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  });

  return (
    <div style={{ backgroundColor: "var(--color-surface)" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.25rem 2rem" }}>
        {/* アクションボタン行 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "0.3rem",
          }}
        >
          {lawId && (
            <>
              <a
                href={`https://laws.e-gov.go.jp/law/${lawId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  lineHeight: 1,
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  border: "1px solid var(--color-accent)",
                  borderRadius: "4px",
                  padding: "0.1rem 0.5rem",
                  opacity: 0.85,
                }}
              >
                e-Gov ↗
              </a>
              {getNdlLawIndexUrl(lawId) && (
                <a
                  href={getNdlLawIndexUrl(lawId)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    lineHeight: 1,
                    color: "var(--color-accent)",
                    textDecoration: "none",
                    border: "1px solid var(--color-accent)",
                    borderRadius: "4px",
                    padding: "0.1rem 0.5rem",
                    opacity: 0.85,
                  }}
                >
                  法令索引 ↗
                </a>
              )}
            </>
          )}
          {lawId && lawTitle && (
            <BookmarkButton
              lawId={lawId}
              lawTitle={lawTitle}
              articleNum={articleNum}
              articleTitle={articleTitle}
            />
          )}
          <ShareUrlButton />
          <CopyArticleButton articleText={articleTextForCopy} citation={citation} />
          <button onClick={() => togglePanel("memo")} style={btnStyle(activePanel === "memo")}>
            {activePanel === "memo" ? "✓ メモ" : "メモ"}
          </button>
          <button onClick={() => setShowAnnotations((v) => !v)} style={btnStyle(showAnnotations)}>
            {showAnnotations ? "✓ 注釈" : "注釈"}
          </button>
          <ExportButtons
            title={articleTitle}
            content={articleTextForCopy}
            lawTitle={lawTitle}
            lawNum={lawNum}
            memo={(() => {
              if (typeof window === "undefined" || !lawId) return undefined;
              try {
                const raw = localStorage.getItem(`lp_memo_${lawId}_${articleTitle}`);
                if (!raw) return undefined;
                const parsed = JSON.parse(raw);
                return typeof parsed === "string" ? parsed : parsed.text;
              } catch {
                return undefined;
              }
            })()}
            annotations={(() => {
              if (typeof window === "undefined" || !lawId) return undefined;
              const result: { lineIndex: number; text: string }[] = [];
              for (let i = 0; i < canonLines.length; i++) {
                const a = getAnnotation(lawId, articleTitle, i);
                if (a) result.push({ lineIndex: i, text: a.text });
              }
              return result.length > 0 ? result : undefined;
            })()}
          />
          {lawId && (
            <a
              href={`/compare`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                lineHeight: 1.4,
                textDecoration: "none",
                transition: "border-color 0.15s ease",
              }}
            >
              比較
            </a>
          )}
        </div>

        {/* メインコンテンツ */}
        {mode === "canon" && fullTextArticles && fullTextArticles.length > 0 ? (
          /* 現行法モード: 全文ビュー（現在の条文にフォーカス、高さは条文内容に合わせる） */
          <div
            data-fulltext-container
            style={{ maxHeight: "70vh", overflow: "auto", padding: "0.4rem 0" }}
          >
            {fullTextArticles.map((a, i) => {
              const isCurrent = a.num === articleNum;
              return (
                <React.Fragment key={a.num || i}>
                  {a.chapterTitle && (
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--color-text-secondary)",
                        borderBottom: "1px solid var(--color-border)",
                        paddingBottom: "0.25rem",
                        marginTop: i > 0 ? "1.25rem" : "0.25rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {a.chapterTitle}
                    </h3>
                  )}
                  <div
                    ref={isCurrent ? fullTextCurrentRef : undefined}
                    style={{
                      padding: isCurrent ? "0.6rem 1rem" : "0.4rem 0.6rem",
                      marginBottom: "0.15rem",
                      borderRadius: "5px",
                      backgroundColor: isCurrent ? "var(--color-surface)" : "transparent",
                      borderLeft: isCurrent
                        ? "3px solid var(--color-accent)"
                        : "3px solid transparent",
                    }}
                  >
                    <a
                      href={`/law/${encodeURIComponent(lawId!)}/article/${encodeURIComponent(a.num)}`}
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontWeight: 700,
                        fontSize: isCurrent ? "1rem" : "0.88rem",
                        color: isCurrent ? "var(--color-accent)" : "var(--color-text-primary)",
                        textDecoration: "none",
                      }}
                    >
                      {a.title}
                      {a.caption && (
                        <span
                          style={{
                            fontWeight: 400,
                            color: "var(--color-text-secondary)",
                            marginLeft: "0.4rem",
                            fontSize: isCurrent ? "0.88rem" : "0.82rem",
                          }}
                        >
                          {a.caption}
                        </span>
                      )}
                    </a>
                    {a.paragraphs.map((p, pi) => {
                      const showNum = p.num && p.num !== "1";
                      const displayNum = showNum ? toFullWidth(p.num) : null;
                      const isCurrentStyle = isCurrent;
                      const pFontFamily = isCurrentStyle
                        ? FONT_FAMILY_MAP[fontFamily]
                        : "var(--font-sans)";
                      const pFontSize = isCurrentStyle ? FONT_SIZE_MAP[fontSize] : "0.82rem";
                      return (
                        <div
                          key={pi}
                          id={isCurrent ? `p-${p.num || "1"}` : undefined}
                          style={{
                            margin: "0 0 0.15rem",
                            fontFamily: pFontFamily,
                            fontSize: pFontSize,
                            lineHeight: isCurrentStyle ? 2.1 : 1.8,
                            color: isCurrent
                              ? "var(--color-text-primary)"
                              : "var(--color-text-secondary)",
                            transition: "background-color 0.3s",
                          }}
                        >
                          <p style={{ margin: 0 }}>
                            {displayNum && (
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  marginRight: "0.4rem",
                                  color: "var(--color-text-secondary)",
                                  fontSize: isCurrentStyle ? "0.9rem" : "0.78rem",
                                }}
                              >
                                {displayNum}
                              </span>
                            )}
                            {isCurrent && lawId ? (
                              <LinkifyLawRefs
                                text={p.sentences.join("")}
                                currentLawId={lawId}
                                currentArticleNum={a.num}
                                currentParagraphNum={p.num || "1"}
                                refClickBehavior={refClickBehavior}
                                onShowPopup={showRefPopup}
                              />
                            ) : (
                              p.sentences.join("")
                            )}
                            {isCurrent && showAnnotations && lawId && (
                              <InlineAnnotation
                                lawId={lawId}
                                articleTitle={articleTitle}
                                lineIndex={pi}
                                lineText={p.sentences.join("")}
                                lawTitle={lawTitle}
                              />
                            )}
                          </p>
                          {p.items && p.items.length > 0 && (
                            <ItemRenderer
                              items={p.items}
                              renderText={
                                isCurrent && lawId
                                  ? (text: string) => (
                                      <LinkifyLawRefs
                                        text={text}
                                        currentLawId={lawId}
                                        currentArticleNum={a.num}
                                        currentParagraphNum={p.num || "1"}
                                        refClickBehavior={refClickBehavior}
                                        onShowPopup={showRefPopup}
                                      />
                                    )
                                  : undefined
                              }
                              fontSize={pFontSize}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : mode === "canon" ? (
          /* 全文データなし: 従来のCanonView */
          <div style={{ maxHeight: "60vh", overflow: "auto" }}>
            <CanonView
              lines={canonLines}
              fontFamily={FONT_FAMILY_MAP[fontFamily]}
              fontSize={FONT_SIZE_MAP[fontSize]}
              currentLawId={lawId}
              highlightText={highlightText}
              showAnnotations={showAnnotations}
              lawId={lawId}
              articleTitle={articleTitle}
              articleNum={articleNum}
              lawTitle={lawTitle}
              refClickBehavior={refClickBehavior}
              onShowPopup={showRefPopup}
            />
          </div>
        ) : (
          /* 新旧対照モード: 改正差分 or ユーザー編集差分 */
          <div style={{ maxHeight: "60vh", overflow: "auto" }}>
            {/* 改正タイムライン + プルダウン（改正が2件以上ある場合） */}
            {revisions.length >= 2 && !userHasEdits && (
              <div style={{ marginBottom: "0.5rem" }}>
                {/* 視覚タイムライン */}
                {revisions.length <= 20 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0,
                      padding: "0.5rem 0.5rem 0.3rem",
                      overflow: "auto",
                    }}
                  >
                    {revisions.slice(0, -1).map((rev, i) => {
                      const isSelected = i === selectedRevisionIdx;
                      const date = fmtEnforcementDate(rev.amendment_enforcement_date);
                      return (
                        <div
                          key={rev.law_revision_id}
                          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
                        >
                          <button
                            onClick={() => handleRevisionChange(i)}
                            disabled={loadingRevision}
                            title={`${date} 施行${rev.amendment_law_title ? ` — ${rev.amendment_law_title}` : ""}`}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "0.15rem",
                              padding: "0.2rem 0.3rem",
                              border: "none",
                              borderRadius: "4px",
                              cursor: loadingRevision ? "wait" : "pointer",
                              backgroundColor: isSelected ? "var(--color-accent)" : "transparent",
                              transition: "background-color 0.15s",
                            }}
                          >
                            <span
                              style={{
                                width: isSelected ? "10px" : "8px",
                                height: isSelected ? "10px" : "8px",
                                borderRadius: "50%",
                                backgroundColor: isSelected ? "#fff" : "var(--color-border)",
                                border: isSelected
                                  ? "none"
                                  : "2px solid var(--color-text-secondary)",
                                transition: "all 0.15s",
                              }}
                            />
                            <span
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.58rem",
                                color: isSelected ? "#fff" : "var(--color-text-secondary)",
                                whiteSpace: "nowrap",
                                lineHeight: 1,
                              }}
                            >
                              {date}
                            </span>
                          </button>
                          {i < revisions.length - 2 && (
                            <div
                              style={{
                                width: "16px",
                                height: "2px",
                                backgroundColor: "var(--color-border)",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* プルダウン（タイムラインが多すぎる場合の代替 + 詳細選択） */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.2rem 0.5rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                  }}
                >
                  <label style={{ color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                    改正:
                  </label>
                  <select
                    value={selectedRevisionIdx}
                    onChange={(e) => handleRevisionChange(Number(e.target.value))}
                    disabled={loadingRevision}
                    style={{
                      flex: 1,
                      maxWidth: "400px",
                      padding: "0.25rem 0.4rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "4px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {revisions.slice(0, -1).map((rev, i) => (
                      <option key={rev.law_revision_id} value={i}>
                        {fmtEnforcementDate(rev.amendment_enforcement_date)} 施行
                        {rev.amendment_law_title ? ` — ${rev.amendment_law_title}` : ""}
                      </option>
                    ))}
                  </select>
                  {loadingRevision && (
                    <span style={{ color: "var(--color-text-secondary)" }}>読込中...</span>
                  )}
                </div>
              </div>
            )}

            {/* 差分表示 */}
            {loadingRevision ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                }}
              >
                改正差分を読み込み中...
              </div>
            ) : showAmendmentDiff && !amendmentDiff.isUnchanged && !amendmentDiff.isNewArticle ? (
              <SideBySideView
                rows={amendmentDiff.rows}
                leftHeader={`改正前（${fmtEnforcementDate(amendmentDiff.prevDate)} 施行）`}
                rightHeader={`改正後（現行）`}
              />
            ) : showAmendmentDiff && amendmentDiff.isUnchanged ? (
              <div
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                }}
              >
                この条文は選択した改正（{fmtEnforcementDate(amendmentDiff.currentDate)}{" "}
                施行）では変更されていません。
              </div>
            ) : showAmendmentDiff && amendmentDiff.isNewArticle ? (
              <div
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                  color: "var(--color-add-fg)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                }}
              >
                この条文は{fmtEnforcementDate(amendmentDiff.currentDate)}{" "}
                施行の改正で新設されました。
              </div>
            ) : revisions.length < 2 && !userHasEdits ? (
              <div
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                }}
              >
                この法令は制定以来改正されていません。
              </div>
            ) : (
              /* ユーザー編集モード: 従来通りの差分表示 */
              <SideBySideView rows={sideBySide.rows} />
            )}
          </div>
        )}

        {/* タブバー（帯 = 仕切り） */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.15rem",
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
            padding: "0.2rem 0",
          }}
        >
          {prevArticle && lawId ? (
            <a
              href={`/law/${encodeURIComponent(lawId)}/article/${encodeURIComponent(prevArticle.num)}`}
              title={prevArticle.title}
              style={{
                flexShrink: 0,
                padding: "0.25rem 0.4rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-accent)",
                textDecoration: "none",
              }}
            >
              ←
            </a>
          ) : (
            <span />
          )}
          <div
            role="tablist"
            style={{
              display: "flex",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              gap: 0,
              minWidth: 0,
            }}
          >
            {(["canon", "patch"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setActivePanel("none");
                }}
                style={tabStyle(mode === m)}
              >
                {tabLabels[m]}
                {m === "patch" && hasAmendment && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor:
                        mode === "patch" ? "var(--color-accent)" : "var(--color-warn-fg)",
                      marginLeft: 4,
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          {nextArticle && lawId ? (
            <a
              href={`/law/${encodeURIComponent(lawId)}/article/${encodeURIComponent(nextArticle.num)}`}
              title={nextArticle.title}
              style={{
                flexShrink: 0,
                padding: "0.25rem 0.4rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-accent)",
                textDecoration: "none",
              }}
            >
              →
            </a>
          ) : (
            <span />
          )}
        </div>

        {/* 帯と全文の間: 解説・エディタ・メモ */}
        {mode === "canon" && <div style={{ paddingTop: "0.5rem" }}>{commentarySlot}</div>}
        {activePanel === "memo" && <div style={{ paddingTop: "0.5rem" }}>{memoSlot}</div>}

        {/* AI法令アシスタント */}
        {aiSlot}

        {/* 関連判例 */}
        {lawId && articleNum && <PrecedentList lawId={lawId} articleNum={articleNum} />}

        {/* ログイン案内（未ログイン時のみ） */}
        {!loggedIn && (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              color: "var(--color-text-secondary)",
              opacity: 0.6,
              margin: "0.4rem 0 0",
              textAlign: "right",
            }}
          >
            <a href="/login" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              ログイン
            </a>
            すると解説の投稿や改正案の編集ができます
          </p>
        )}

        {/* 改正案エディタ（改正案・新旧対照タブ時 + ログイン済みのみ表示） */}
        {mode === "patch" && loggedIn && (
          <>
            <div style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
              {/* ヘッダー（逐条解説と同じパターン） */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.25rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  改正案を編集
                  {hasChanges && (
                    <span style={{ display: "inline-flex", gap: "0.3rem", marginLeft: "0.25rem" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          color: "var(--color-add-fg)",
                          backgroundColor: "var(--color-add-bg)",
                          padding: "0.1rem 0.35rem",
                          borderRadius: "3px",
                          fontWeight: 400,
                        }}
                      >
                        +{unified.stats.added}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          color: "var(--color-del-fg)",
                          backgroundColor: "var(--color-del-bg)",
                          padding: "0.1rem 0.35rem",
                          borderRadius: "3px",
                          fontWeight: 400,
                        }}
                      >
                        -{unified.stats.deleted}
                      </span>
                    </span>
                  )}
                </h3>
                {activePanel !== "editor" && (
                  <button
                    onClick={() => togglePanel("editor")}
                    style={{
                      padding: "0.3rem 0.75rem",
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "5px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      color: "var(--color-accent)",
                      cursor: "pointer",
                    }}
                  >
                    + 編集する
                  </button>
                )}
              </div>

              {/* エディタ本体（直接編集モード） */}
              {activePanel === "editor" && (
                <div
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-accent)",
                    borderRadius: "8px",
                    padding: "1rem 1.25rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      color: "var(--color-text-secondary)",
                      margin: "0 0 0.5rem",
                      lineHeight: 1.6,
                    }}
                  >
                    現行法テキストを直接編集してください。差分は自動的に計算されます。
                  </p>

                  <textarea
                    value={editorInitialized ? editedText : originalText}
                    onChange={(e) => {
                      if (!editorInitialized) setEditorInitialized(true);
                      setEditedText(e.target.value);
                    }}
                    onFocus={() => {
                      if (!editorInitialized) {
                        setEditorInitialized(true);
                        setEditedText(originalText);
                      }
                    }}
                    onBlur={() => {
                      if (editorInitialized && editedText !== originalText) {
                        const renumbered = canonLinesToText(
                          autoRenumber(textToCanonLines(editedText)),
                        );
                        if (renumbered !== editedText) setEditedText(renumbered);
                      }
                    }}
                    spellCheck={false}
                    style={{
                      width: "100%",
                      minHeight: "200px",
                      padding: "0.75rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.85rem",
                      lineHeight: 1.7,
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text-primary)",
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* 改め文 出力 */}
                  {hasChanges && karamebunLines.length > 0 && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "0.3rem",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          改め文
                        </span>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(karamebunToText(karamebunLines))
                          }
                          style={{
                            padding: "0.15rem 0.5rem",
                            border: "1px solid var(--color-border)",
                            borderRadius: "4px",
                            backgroundColor: "var(--color-bg)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          コピー
                        </button>
                      </div>
                      <div
                        style={{
                          padding: "0.75rem",
                          backgroundColor: "var(--color-bg)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "6px",
                          fontFamily: "var(--font-serif)",
                          fontSize: "0.85rem",
                          lineHeight: 1.8,
                          color: "var(--color-text-primary)",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {karamebunLines.map((l, i) => (
                          <div key={i} style={{ marginBottom: "0.5rem" }}>
                            <div>{l.text}</div>
                            {l.detail && (
                              <div
                                style={{ paddingLeft: "1em", color: "var(--color-text-secondary)" }}
                              >
                                {l.detail}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 統計 + ボタン行 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--color-border)",
                      paddingTop: "0.5rem",
                      marginTop: "0.6rem",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {hasChanges ? (
                        <>
                          <span
                            style={{
                              color: "var(--color-add-fg)",
                              backgroundColor: "var(--color-add-bg)",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "4px",
                            }}
                          >
                            +{unified.stats.added}
                          </span>
                          <span
                            style={{
                              color: "var(--color-del-fg)",
                              backgroundColor: "var(--color-del-bg)",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "4px",
                            }}
                          >
                            -{unified.stats.deleted}
                          </span>
                          <span
                            style={{
                              color: "var(--color-text-secondary)",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.78rem",
                            }}
                          >
                            {unified.stats.unchanged} 行変更なし
                          </span>
                        </>
                      ) : (
                        <span
                          style={{
                            color: "var(--color-text-secondary)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.8rem",
                          }}
                        >
                          変更なし
                        </span>
                      )}
                      {savedId && (
                        <a
                          href={`/patch/${savedId}`}
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.78rem",
                            color: "var(--color-add-fg)",
                            textDecoration: "none",
                          }}
                        >
                          ✓ 保存済み →
                        </a>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", marginLeft: "auto" }}>
                      <button
                        onClick={() => togglePanel("editor")}
                        style={{
                          padding: "0.35rem 0.75rem",
                          backgroundColor: "var(--color-bg)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "5px",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.78rem",
                          cursor: "pointer",
                        }}
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={() => setShowSavePanel((v) => !v)}
                        disabled={!hasChanges}
                        style={{
                          padding: "0.35rem 0.75rem",
                          backgroundColor: hasChanges
                            ? "var(--color-accent)"
                            : "var(--color-border)",
                          color: hasChanges ? "#fff" : "var(--color-text-secondary)",
                          border: "none",
                          borderRadius: "5px",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.78rem",
                          cursor: hasChanges ? "pointer" : "not-allowed",
                        }}
                      >
                        {showSavePanel ? "キャンセル" : "改正案を保存"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 保存パネル */}
            {showSavePanel && activePanel === "editor" && (
              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                    color: "var(--color-text-primary)",
                  }}
                >
                  改正案を保存
                </h3>

                <label style={{ display: "block", marginBottom: "0.75rem" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      color: "var(--color-text-secondary)",
                      display: "block",
                      marginBottom: "0.25rem",
                    }}
                  >
                    タイトル <span style={{ color: "var(--color-del-fg)" }}>*</span>
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例：第一条 労働条件原則の明確化"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9rem",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text-primary)",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </label>

                <label style={{ display: "block", marginBottom: "1rem" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      color: "var(--color-text-secondary)",
                      display: "block",
                      marginBottom: "0.25rem",
                    }}
                  >
                    改正理由・説明
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="なぜこの改正を提案するか、期待される効果など"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.875rem",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text-primary)",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                </label>

                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      根拠資料
                    </span>
                    <button
                      onClick={addSource}
                      style={{
                        padding: "0.2rem 0.6rem",
                        backgroundColor: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "4px",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                      }}
                    >
                      + 追加
                    </button>
                  </div>
                  {sources.map((src, i) => (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "80px 1fr auto",
                        gap: "0.4rem",
                        marginBottom: "0.4rem",
                        alignItems: "start",
                      }}
                    >
                      <select
                        value={src.tier}
                        onChange={(e) => updateSource(i, "tier", e.target.value)}
                        style={{
                          padding: "0.4rem",
                          border: "1px solid var(--color-border)",
                          borderRadius: "4px",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.78rem",
                          backgroundColor: TIER_COLORS[src.tier].bg,
                          color: TIER_COLORS[src.tier].fg,
                        }}
                      >
                        {(["一次", "準一次", "二次", "三次"] as SourceTier[]).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <input
                          type="text"
                          value={src.label}
                          onChange={(e) => updateSource(i, "label", e.target.value)}
                          placeholder="資料名"
                          style={{
                            padding: "0.4rem 0.5rem",
                            border: "1px solid var(--color-border)",
                            borderRadius: "4px",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.78rem",
                            backgroundColor: "var(--color-bg)",
                          }}
                        />
                        <input
                          type="url"
                          value={src.url}
                          onChange={(e) => updateSource(i, "url", e.target.value)}
                          placeholder="URL（任意）"
                          style={{
                            padding: "0.4rem 0.5rem",
                            border: "1px solid var(--color-border)",
                            borderRadius: "4px",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.78rem",
                            backgroundColor: "var(--color-bg)",
                          }}
                        />
                      </div>
                      <button
                        onClick={() => removeSource(i)}
                        style={{
                          padding: "0.4rem 0.5rem",
                          backgroundColor: "var(--color-del-bg)",
                          border: "1px solid var(--color-del-fg)",
                          borderRadius: "4px",
                          color: "var(--color-del-fg)",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                        }}
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>

                {saveError && (
                  <p
                    style={{
                      color: "var(--color-del-fg)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {saveError}
                  </p>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "0.6rem 1.5rem",
                    backgroundColor: saving ? "var(--color-border)" : "var(--color-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "保存中…" : "保存する"}
                </button>
              </div>
            )}

            {/* 印刷ボタン（控えめに） */}
            {hasChanges && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: "0.2rem 0.6rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    backgroundColor: "var(--color-bg)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    opacity: 0.7,
                  }}
                >
                  印刷 / PDF保存
                </button>
              </div>
            )}
          </>
        )}

        {/* 全文は現行法モードのメインコンテンツに統合済み */}

        {/* 印刷用CSS */}
        <style>{`
        @media print {
          header, footer, nav, .homepage-stats-grid { display: none !important; }
          body { background: white !important; }
          [role="tablist"] { display: none !important; }
        }
      `}</style>
      </div>
      {/* 参照ポップアップ */}
      {refPopup && (
        <RefPopup text={refPopup.text} anchorRect={refPopup.anchorRect} onClose={hideRefPopup} />
      )}
    </div>
  );
}

// ── 項スクロール＋ハイライト ──
function scrollToAndHighlight(paragraphId: string) {
  const el = document.getElementById(paragraphId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.style.backgroundColor = "var(--color-add-bg)";
  setTimeout(() => {
    el.style.backgroundColor = "";
  }, 2000);
}

// ── 項テキスト取得（popup用）──
function getParagraphText(paragraphId: string): string {
  const el = document.getElementById(paragraphId);
  if (!el) return "";
  return el.textContent || "";
}

// ── ハイライトテキスト分割 ──
function highlightSegments(text: string, highlight: string): (string | React.ReactElement)[] {
  if (!highlight) return [text];
  const parts: (string | React.ReactElement)[] = [];
  let remaining = text;
  let keyIdx = 0;
  while (remaining.length > 0) {
    const idx = remaining.indexOf(highlight);
    if (idx === -1) {
      parts.push(remaining);
      break;
    }
    if (idx > 0) {
      parts.push(remaining.slice(0, idx));
    }
    parts.push(
      <mark
        key={`hl-${keyIdx++}`}
        style={{ background: "#FBBF24", color: "#1E3A5F", padding: "0 2px", borderRadius: "2px" }}
      >
        {highlight}
      </mark>,
    );
    remaining = remaining.slice(idx + highlight.length);
  }
  return parts;
}

// ASCII 数字 → 全角数字変換
function toFullWidth(s: string): string {
  return s.replace(/[0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
}

// ── 現行法ビュー（パラグラフのみ、タイトルはヘッダーh1でカバー）──
function CanonView({
  lines,
  fontFamily,
  fontSize,
  currentLawId,
  highlightText,
  showAnnotations,
  lawId,
  articleTitle,
  articleNum,
  lawTitle,
  refClickBehavior,
  onShowPopup,
}: {
  lines: CanonLine[];
  fontFamily: string;
  fontSize: string;
  currentLawId?: string;
  highlightText?: string | null;
  showAnnotations?: boolean;
  lawId?: string;
  articleTitle?: string;
  articleNum?: string;
  lawTitle?: string;
  refClickBehavior?: RefClickBehavior;
  onShowPopup?: (text: string, event: React.MouseEvent) => void;
}) {
  const renderText = (text: string, paragraphNum?: string) =>
    highlightText ? (
      <LinkifyLawRefsWithHighlight
        text={text}
        currentLawId={currentLawId}
        currentArticleNum={articleNum}
        currentParagraphNum={paragraphNum || "1"}
        refClickBehavior={refClickBehavior}
        onShowPopup={onShowPopup}
        highlightText={highlightText}
      />
    ) : (
      <LinkifyLawRefs
        text={text}
        currentLawId={currentLawId}
        currentArticleNum={articleNum}
        currentParagraphNum={paragraphNum || "1"}
        refClickBehavior={refClickBehavior}
        onShowPopup={onShowPopup}
      />
    );

  const renderAnnotation = (lineIndex: number, lineText: string) =>
    showAnnotations && lawId && articleTitle ? (
      <InlineAnnotation
        lawId={lawId}
        articleTitle={articleTitle}
        lineIndex={lineIndex}
        lineText={lineText}
        lawTitle={lawTitle}
      />
    ) : null;

  return (
    <div
      style={{
        padding: "0.4rem 1.25rem 1rem",
        fontFamily,
        fontSize,
        lineHeight: 2.1,
        color: "var(--color-text-primary)",
      }}
    >
      {lines.map((l, i) => {
        const indent = l.indent ?? 0;

        // 号・号細分（indent >= 1）: 字下げ表示
        if (indent > 0) {
          return (
            <div key={i} style={{ paddingLeft: `${indent * 2}em`, margin: "0 0 0.1rem" }}>
              {renderText(l.text, l.num || "1")}
            </div>
          );
        }

        const isFirstParagraph = !l.num || l.num === "1";

        if (isFirstParagraph) {
          // 第一項: 番号なし、テキストのみ
          return (
            <div
              key={i}
              id="p-1"
              style={{ margin: "0 0 0.2rem", transition: "background-color 0.3s" }}
            >
              {renderText(l.text, "1")}
              {renderAnnotation(i, l.text)}
            </div>
          );
        }

        // 第二項以降: 全角数字（２　テキスト…）
        const displayNum = toFullWidth(l.num!);

        return (
          <div
            key={i}
            id={`p-${l.num}`}
            style={{ display: "flex", margin: "0 0 0.2rem", transition: "background-color 0.3s" }}
          >
            <span style={{ flexShrink: 0, whiteSpace: "nowrap", fontWeight: 600 }}>
              {displayNum}
              {"　"}
            </span>
            <span>
              {renderText(l.text, l.num!)}
              {renderAnnotation(i, l.text)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── 共通リンクスタイル ──
const REF_LINK_STYLE: React.CSSProperties = {
  color: "var(--color-accent)",
  textDecoration: "underline dotted",
  textUnderlineOffset: "2px",
  cursor: "pointer",
};

// ── 法令名 + 条文参照 + 項参照 + 相対参照リンク化 ──
//
// getUnifiedRefRegex() の12グループ:
//  [1][2][3]  = 法令名+条+項（他法令）
//  [4][5]     = 法令名+条（他法令）
//  [6][7]     = 条+項（同一法令）
//  [8]        = 条のみ（同一法令）
//  [9]        = 法令名のみ
//  [10][11]   = 相対条文（前条/次条/同条）+項（任意）
//  [12]       = 相対項（前項/同項/次項）

interface LinkifyProps {
  text: string;
  currentLawId?: string;
  currentArticleNum?: string;
  currentParagraphNum?: string;
  refClickBehavior?: RefClickBehavior;
  onShowPopup?: (text: string, event: React.MouseEvent) => void;
}

/** 同一条文内の項参照アクション要素を生成 */
function paragraphRefElement(
  key: string,
  displayText: string,
  paragraphNum: string,
  behavior: RefClickBehavior,
  onShowPopup?: (text: string, event: React.MouseEvent) => void,
): React.ReactElement {
  const pId = `p-${paragraphNum}`;

  if (behavior === "highlight") {
    return (
      <span key={key} style={REF_LINK_STYLE} onClick={() => scrollToAndHighlight(pId)}>
        {displayText}
      </span>
    );
  }

  if (behavior === "popup") {
    return (
      <span
        key={key}
        style={REF_LINK_STYLE}
        onClick={(e) => {
          const txt = getParagraphText(pId);
          if (onShowPopup) onShowPopup(txt, e);
          else scrollToAndHighlight(pId);
        }}
      >
        {displayText}
      </span>
    );
  }

  // navigate（デフォルト）
  return (
    <a
      key={key}
      href={`#${pId}`}
      style={REF_LINK_STYLE}
      onClick={(e) => {
        e.preventDefault();
        scrollToAndHighlight(pId);
      }}
    >
      {displayText}
    </a>
  );
}

function processMatch(
  match: RegExpExecArray,
  props: LinkifyProps,
  wrapText: (s: string) => (string | React.ReactElement)[],
): (string | React.ReactElement)[] {
  const {
    currentLawId,
    currentArticleNum,
    currentParagraphNum,
    refClickBehavior = "navigate",
    onShowPopup,
  } = props;
  const k = match.index;

  // パターン1: 法令名+条+項 [1][2][3]
  if (match[1] && match[2] && match[3]) {
    const lawName = match[1];
    const articleRef = match[2];
    const paraRef = match[3];
    const targetLawId = LAW_REF_MAP[lawName];
    const artNum = articleRefToNum(articleRef);
    const paraNum = paragraphRefToNum(paraRef);
    if (targetLawId && artNum) {
      return [
        <a
          key={`${k}-lap`}
          href={`/law/${encodeURIComponent(targetLawId)}/article/${encodeURIComponent(artNum)}${paraNum ? `#p-${paraNum}` : ""}`}
          style={REF_LINK_STYLE}
        >
          {lawName}
          {articleRef}
          {paraRef}
        </a>,
      ];
    }
    return wrapText(match[0]);
  }

  // パターン2: 法令名+条 [4][5]
  if (match[4] && match[5]) {
    const lawName = match[4];
    const articleRef = match[5];
    const targetLawId = LAW_REF_MAP[lawName];
    const artNum = articleRefToNum(articleRef);
    if (targetLawId && artNum) {
      return [
        <a
          key={`${k}-la`}
          href={`/law/${encodeURIComponent(targetLawId)}/article/${encodeURIComponent(artNum)}`}
          style={REF_LINK_STYLE}
        >
          {lawName}
          {articleRef}
        </a>,
      ];
    }
    if (targetLawId) {
      return [
        <a key={`${k}-l`} href={`/law/${encodeURIComponent(targetLawId)}`} style={REF_LINK_STYLE}>
          {lawName}
        </a>,
        ...wrapText(articleRef),
      ];
    }
    return wrapText(match[0]);
  }

  // パターン3: 条+項 [6][7]（同一法令内）
  if (match[6] && match[7]) {
    const articleRef = match[6];
    const paraRef = match[7];
    const artNum = articleRefToNum(articleRef);
    const paraNum = paragraphRefToNum(paraRef);
    if (currentLawId && artNum) {
      // 同じ条文内なら項スクロール、別の条ならページ遷移
      if (currentArticleNum && artNum === currentArticleNum && paraNum) {
        return [
          paragraphRefElement(
            `${k}-sp`,
            `${articleRef}${paraRef}`,
            paraNum,
            refClickBehavior,
            onShowPopup,
          ),
        ];
      }
      return [
        <a
          key={`${k}-ap`}
          href={`/law/${encodeURIComponent(currentLawId)}/article/${encodeURIComponent(artNum)}${paraNum ? `#p-${paraNum}` : ""}`}
          style={REF_LINK_STYLE}
        >
          {articleRef}
          {paraRef}
        </a>,
      ];
    }
    return wrapText(match[0]);
  }

  // パターン4: 条のみ [8]（同一法令内）
  if (match[8]) {
    const articleRef = match[8];
    const artNum = articleRefToNum(articleRef);
    if (currentLawId && artNum) {
      return [
        <a
          key={`${k}-a`}
          href={`/law/${encodeURIComponent(currentLawId)}/article/${encodeURIComponent(artNum)}`}
          style={REF_LINK_STYLE}
        >
          {articleRef}
        </a>,
      ];
    }
    return wrapText(articleRef);
  }

  // パターン5: 法令名のみ [9]
  if (match[9]) {
    const lawName = match[9];
    const targetLawId = LAW_REF_MAP[lawName];
    if (targetLawId && targetLawId !== currentLawId) {
      return [
        <a key={`${k}-lo`} href={`/law/${encodeURIComponent(targetLawId)}`} style={REF_LINK_STYLE}>
          {lawName}
        </a>,
      ];
    }
    return wrapText(lawName);
  }

  // パターン6: 相対条文 [10] + 任意項 [11]（前条/次条/同条）
  if (match[10]) {
    const relRef = match[10] as "前条" | "次条" | "同条";
    const paraRef = match[11] || null; // 第○項（任意）
    if (currentLawId && currentArticleNum) {
      const resolvedArt = resolveRelativeArticle(relRef, currentArticleNum);
      if (resolvedArt) {
        const paraNum = paraRef ? paragraphRefToNum(paraRef) : null;
        // 同条+項 → 同一条文内の項スクロール
        if (relRef === "同条" && paraNum) {
          return [
            paragraphRefElement(
              `${k}-rp`,
              `${relRef}${paraRef}`,
              paraNum,
              refClickBehavior,
              onShowPopup,
            ),
          ];
        }
        return [
          <a
            key={`${k}-ra`}
            href={`/law/${encodeURIComponent(currentLawId)}/article/${encodeURIComponent(resolvedArt)}${paraNum ? `#p-${paraNum}` : ""}`}
            style={REF_LINK_STYLE}
          >
            {relRef}
            {paraRef || ""}
          </a>,
        ];
      }
    }
    return wrapText(match[0]);
  }

  // パターン7: 相対項 [12]（前項/同項/次項）
  if (match[12]) {
    const relRef = match[12] as "前項" | "同項" | "次項";
    if (currentParagraphNum) {
      const resolvedPara = resolveRelativeParagraph(relRef, currentParagraphNum);
      if (resolvedPara) {
        return [
          paragraphRefElement(`${k}-rl`, relRef, resolvedPara, refClickBehavior, onShowPopup),
        ];
      }
    }
    return wrapText(relRef);
  }

  return wrapText(match[0]);
}

function LinkifyLawRefs({
  text,
  currentLawId,
  currentArticleNum,
  currentParagraphNum,
  refClickBehavior,
  onShowPopup,
}: LinkifyProps) {
  const parts: (string | React.ReactElement)[] = [];
  const regex = getUnifiedRefRegex();
  regex.lastIndex = 0;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const wrapText = (s: string) => [s] as (string | React.ReactElement)[];

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      ...processMatch(
        match,
        {
          text,
          currentLawId,
          currentArticleNum,
          currentParagraphNum,
          refClickBehavior,
          onShowPopup,
        },
        wrapText,
      ),
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

// ── 法令名 + 条文参照リンク化 + ハイライト ──
function LinkifyLawRefsWithHighlight({
  text,
  currentLawId,
  currentArticleNum,
  currentParagraphNum,
  refClickBehavior,
  onShowPopup,
  highlightText,
}: LinkifyProps & { highlightText: string }) {
  const parts: (string | React.ReactElement)[] = [];
  const regex = getUnifiedRefRegex();
  regex.lastIndex = 0;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const wrapText = (s: string) => highlightSegments(s, highlightText);

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...highlightSegments(text.slice(lastIndex, match.index), highlightText));
    }
    parts.push(
      ...processMatch(
        match,
        {
          text,
          currentLawId,
          currentArticleNum,
          currentParagraphNum,
          refClickBehavior,
          onShowPopup,
        },
        wrapText,
      ),
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(...highlightSegments(text.slice(lastIndex), highlightText));
  }

  return <>{parts}</>;
}

// SideBySideView は src/components/diff/SideBySideView.tsx に共有コンポーネントとして抽出済み
