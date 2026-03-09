"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  lawId: string;
  lawTitle?: string;
  articleTitle: string;
  /** 埋め込みモード: 外枠・トグルなし、常にテキストエリア表示 */
  embedded?: boolean;
}

function getMemoKey(lawId: string, articleTitle: string): string {
  return `lp_memo_${lawId}_${articleTitle}`;
}

function loadMemo(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(key) ?? "";
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "string" ? parsed : (parsed.text ?? raw);
    } catch {
      return raw;
    }
  } catch {
    return "";
  }
}

function saveMemo(key: string, value: string, lawTitle?: string, articleTitle?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (value.trim() === "") {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify({ text: value, lawTitle, articleTitle }));
    }
  } catch {
    // localStorage may be full or disabled
  }
}

/**
 * Collapsible personal memo section for an article.
 * Auto-saves on blur with a brief "saved" indicator.
 */
export function ArticleMemo({ lawId, lawTitle, articleTitle, embedded }: Props) {
  const key = getMemoKey(lawId, articleTitle);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load memo on mount
  useEffect(() => {
    const stored = loadMemo(key);
    setText(stored); // eslint-disable-line react-hooks/set-state-in-effect
    // Auto-open if there is already a memo
    if (stored.trim() !== "") {
      setOpen(true);
    }
  }, [key]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const doSave = useCallback(
    (value: string) => {
      saveMemo(key, value, lawTitle, articleTitle);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 1500);
    },
    [key, lawTitle, articleTitle],
  );

  function handleBlur() {
    // Debounce save on blur (300ms)
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => doSave(text), 300);
  }

  // 埋め込みモード: 外枠なし、常にテキストエリア表示
  if (embedded) {
    return (
      <div data-print-hide style={{ fontFamily: "var(--font-sans)" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder="この条文に関するメモを自由に記入できます..."
          rows={4}
          style={{
            width: "100%",
            padding: "0.6rem 0.7rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.84rem",
            lineHeight: 1.65,
            color: "var(--color-text-primary)",
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.25rem" }}>
          {saved && (
            <span style={{ fontSize: "0.7rem", color: "var(--color-add-fg)", fontWeight: 600 }}>
              保存済み
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-print-hide
      style={{
        fontFamily: "var(--font-sans)",
        marginTop: "1rem",
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        backgroundColor: "var(--color-surface)",
        overflow: "hidden",
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "0.5rem 0.75rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          transition: "color 0.12s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--color-text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--color-text-secondary)";
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.65rem",
              transition: "transform 0.15s",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            &#9654;
          </span>
          個人メモ
          {text.trim() !== "" && !open && (
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--color-accent)",
                marginLeft: "0.2rem",
              }}
            />
          )}
        </span>
        {saved && (
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--color-add-fg)",
              fontWeight: 400,
            }}
          >
            保存済み
          </span>
        )}
      </button>

      {/* Collapsible body */}
      {open && (
        <div style={{ padding: "0 0.75rem 0.75rem" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            placeholder="この条文に関するメモを自由に記入できます..."
            rows={4}
            style={{
              width: "100%",
              padding: "0.6rem 0.7rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.84rem",
              lineHeight: 1.65,
              color: "var(--color-text-primary)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.15s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--color-accent)";
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.35rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.68rem",
                color: "var(--color-text-secondary)",
                opacity: 0.7,
              }}
            >
              フォーカスを外すと自動保存されます
            </span>
            {saved && (
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--color-add-fg)",
                  fontWeight: 600,
                }}
              >
                保存済み
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
