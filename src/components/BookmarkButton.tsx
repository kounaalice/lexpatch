"use client";

import { useState, useEffect, useCallback } from "react";
import { isBookmarked as checkBookmarked, addBookmark, removeBookmark } from "@/lib/bookmarks";
import { isLoggedIn } from "@/lib/session";
import { useAuthPrompt } from "@/components/AuthPromptModal";

interface Props {
  lawId: string;
  lawTitle: string;
  articleNum?: string;
  articleTitle?: string;
}

export default function BookmarkButton({ lawId, lawTitle, articleNum, articleTitle }: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const { requireAuth, modal } = useAuthPrompt();

  useEffect(() => {
    setBookmarked(checkBookmarked(lawId, articleNum));
  }, [lawId, articleNum]);

  const toggle = useCallback(() => {
    // Prompt login for non-logged-in users (still works with localStorage if dismissed)
    if (!isLoggedIn()) {
      if (!requireAuth("ブックマーク")) return;
    }
    if (bookmarked) {
      removeBookmark(lawId, articleNum);
      setBookmarked(false);
    } else {
      addBookmark({ lawId, lawTitle, articleNum, articleTitle });
      setBookmarked(true);
    }
  }, [bookmarked, lawId, lawTitle, articleNum, articleTitle, requireAuth]);

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    padding: "0.1rem 0.5rem",
    fontSize: "0.75rem",
    fontFamily: "var(--font-sans)",
    lineHeight: 1,
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    border: bookmarked ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
    backgroundColor: bookmarked
      ? "color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))"
      : "transparent",
    color: bookmarked ? "var(--color-accent)" : "inherit",
    opacity: 0.85,
  };

  const starStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    lineHeight: 1,
    color: bookmarked ? "var(--color-accent)" : "inherit",
  };

  return (
    <>
      {modal}
      <button
        type="button"
        onClick={toggle}
        style={baseStyle}
        aria-label={bookmarked ? "ブックマーク解除" : "ブックマークに追加"}
        title={bookmarked ? "ブックマーク解除" : "ブックマークに追加"}
      >
        <span style={starStyle}>{bookmarked ? "★" : "☆"}</span>
        <span>{bookmarked ? "ブックマーク済み" : "ブックマーク"}</span>
      </button>
    </>
  );
}
