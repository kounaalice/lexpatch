"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getAnnotation, setAnnotation, removeAnnotation } from "@/lib/annotations";

interface InlineAnnotationProps {
  lawId: string;
  articleTitle: string;
  lineIndex: number;
  lineText: string;
  lawTitle?: string;
}

export function InlineAnnotation({
  lawId,
  articleTitle,
  lineIndex,
  lineText: _lineText,
  lawTitle,
}: InlineAnnotationProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [hasAnnotation, setHasAnnotation] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load annotation on mount
  useEffect(() => {
    const existing = getAnnotation(lawId, articleTitle, lineIndex);
    if (existing) {
      setText(existing.text);
      setHasAnnotation(true);
    } else {
      setText("");
      setHasAnnotation(false);
    }
  }, [lawId, articleTitle, lineIndex]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  // Focus textarea when opening
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  const showSaved = useCallback(() => {
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1500);
  }, []);

  function handleSave() {
    const trimmed = text.trim();
    if (trimmed === "") return;
    setAnnotation(lawId, articleTitle, lineIndex, trimmed, lawTitle);
    setHasAnnotation(true);
    showSaved();
  }

  function handleDelete() {
    removeAnnotation(lawId, articleTitle, lineIndex);
    setText("");
    setHasAnnotation(false);
    setOpen(false);
  }

  function handleToggle() {
    setOpen((v) => !v);
  }

  return (
    <span
      data-print-hide
      style={{
        display: "inline",
        position: "relative",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Annotation toggle icon */}
      <button
        onClick={handleToggle}
        title={hasAnnotation ? "注釈を表示・編集" : "この行に注釈を追加"}
        aria-label={
          hasAnnotation ? `注釈あり: 行 ${lineIndex + 1}` : `注釈を追加: 行 ${lineIndex + 1}`
        }
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1.2em",
          height: "1.2em",
          marginLeft: "0.25em",
          padding: 0,
          border: "none",
          borderRadius: "2px",
          background: "none",
          cursor: "pointer",
          fontSize: "0.75em",
          lineHeight: 1,
          opacity: hasAnnotation ? 1 : 0.35,
          color: hasAnnotation ? "var(--color-accent)" : "var(--color-text-secondary)",
          transition: "opacity 0.15s, color 0.15s",
          verticalAlign: "middle",
          position: "relative",
          top: "-0.05em",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          if (!hasAnnotation) {
            e.currentTarget.style.opacity = "0.35";
          }
        }}
      >
        {/* Simple comment icon using SVG for crispness */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block" }}
        >
          <path d="M2 3h12v8H5l-3 3V3z" />
          {hasAnnotation && (
            <>
              <line x1="5" y1="6" x2="11" y2="6" />
              <line x1="5" y1="8.5" x2="9" y2="8.5" />
            </>
          )}
        </svg>
      </button>

      {/* Inline annotation form */}
      {open && (
        <div
          style={{
            display: "block",
            marginTop: "0.35rem",
            marginBottom: "0.35rem",
            padding: "0.5rem 0.6rem",
            backgroundColor: "var(--color-warn-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            fontFamily: "var(--font-sans)",
          }}
        >
          {/* Header row */}
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
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                letterSpacing: "0.02em",
              }}
            >
              注釈
            </span>
            {saved && (
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--color-add-fg)",
                  fontWeight: 600,
                }}
              >
                保存済み
              </span>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="この行に関する注釈を入力..."
            rows={3}
            style={{
              width: "100%",
              padding: "0.45rem 0.55rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              lineHeight: 1.6,
              color: "var(--color-text-primary)",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "3px",
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.15s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--color-accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
            }}
          />

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "0.35rem",
            }}
          >
            <button
              onClick={handleSave}
              disabled={text.trim() === ""}
              style={{
                padding: "0.25rem 0.65rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--color-surface)",
                backgroundColor:
                  text.trim() === "" ? "var(--color-text-secondary)" : "var(--color-accent)",
                border: "none",
                borderRadius: "3px",
                cursor: text.trim() === "" ? "not-allowed" : "pointer",
                opacity: text.trim() === "" ? 0.5 : 1,
                transition: "opacity 0.15s, background-color 0.15s",
              }}
            >
              保存
            </button>

            {hasAnnotation && (
              <button
                onClick={handleDelete}
                style={{
                  padding: "0.25rem 0.65rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--color-del-fg)",
                  backgroundColor: "transparent",
                  border: "1px solid var(--color-del-fg)",
                  borderRadius: "3px",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
              >
                削除
              </button>
            )}

            <button
              onClick={() => setOpen(false)}
              style={{
                padding: "0.25rem 0.65rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                backgroundColor: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "3px",
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
