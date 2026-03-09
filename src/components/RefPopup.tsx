"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface RefPopupProps {
  /** ポップアップ表示テキスト */
  text: string;
  /** アンカー要素の位置（クリック座標） */
  anchorRect: { top: number; left: number; bottom: number };
  /** 閉じるコールバック */
  onClose: () => void;
}

/**
 * 条文参照ポップアップ — 項テキストをツールチップ風に表示
 * position: fixed で画面上に浮遊、外側クリック/Escape で閉じる
 */
export function RefPopup({ text, anchorRect, onClose }: RefPopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    // ポップアップの位置を計算
    const popupWidth = 380;
    const margin = 8;
    let left = anchorRect.left;
    let top = anchorRect.bottom + margin;

    // 右端からはみ出す場合
    if (left + popupWidth > window.innerWidth - margin) {
      left = window.innerWidth - popupWidth - margin;
    }
    if (left < margin) left = margin;

    // 下端からはみ出す場合は上に表示
    if (top + 200 > window.innerHeight) {
      top = anchorRect.top - margin - 100;
      if (top < margin) top = margin;
    }

    setPos({ top, left });
  }, [anchorRect]);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        maxWidth: "380px",
        minWidth: "200px",
        padding: "0.75rem 1rem",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        zIndex: 1000,
        fontFamily: "var(--font-sans)",
        fontSize: "0.85rem",
        lineHeight: 1.8,
        color: "var(--color-text-primary)",
        animation: "refPopupFadeIn 0.15s ease-out",
      }}
    >
      {text || "（テキストを取得できません）"}
      <style>{`
        @keyframes refPopupFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/**
 * ポップアップ管理フック
 */
export function useRefPopup() {
  const [popup, setPopup] = useState<{
    text: string;
    anchorRect: { top: number; left: number; bottom: number };
  } | null>(null);

  const showPopup = useCallback((text: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPopup({
      text,
      anchorRect: { top: rect.top, left: rect.left, bottom: rect.bottom },
    });
  }, []);

  const hidePopup = useCallback(() => {
    setPopup(null);
  }, []);

  return { popup, showPopup, hidePopup };
}
