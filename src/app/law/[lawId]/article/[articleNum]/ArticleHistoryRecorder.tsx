"use client";

import { useEffect } from "react";
import { addToHistory } from "@/lib/history";

export function ArticleHistoryRecorder({
  lawId,
  lawTitle,
  articleNum,
  articleTitle,
}: {
  lawId: string;
  lawTitle: string;
  articleNum: string;
  articleTitle: string;
}) {
  useEffect(() => {
    addToHistory({ lawId, lawTitle, articleNum, articleTitle });
  }, [lawId, lawTitle, articleNum, articleTitle]);

  return null;
}
