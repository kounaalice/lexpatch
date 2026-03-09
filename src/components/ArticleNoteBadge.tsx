"use client";

import { useEffect, useState } from "react";
import { getArticleAnnotationCount, hasArticleMemo } from "@/lib/notes";

/**
 * 条文カードに表示するメモ・注釈バッジ（クライアントコンポーネント）
 * localStorage を読み取って注釈数とメモ有無を表示
 */
export function ArticleNoteBadge({ lawId, articleTitle }: { lawId: string; articleTitle: string }) {
  const [annotCount, setAnnotCount] = useState(0);
  const [hasMemo, setHasMemo] = useState(false);

  useEffect(() => {
    setAnnotCount(getArticleAnnotationCount(lawId, articleTitle));
    setHasMemo(hasArticleMemo(lawId, articleTitle));
  }, [lawId, articleTitle]);

  if (!hasMemo && annotCount === 0) return null;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
      {hasMemo && (
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.6rem",
            fontWeight: 700,
            padding: "0.05rem 0.3rem",
            borderRadius: "3px",
            backgroundColor: "#DEF7EC",
            color: "#03543F",
            whiteSpace: "nowrap",
            border: "1px solid #A7F3D0",
          }}
          title="メモあり"
        >
          memo
        </span>
      )}
      {annotCount > 0 && (
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.6rem",
            fontWeight: 700,
            padding: "0.05rem 0.3rem",
            borderRadius: "3px",
            backgroundColor: "#FEF3C7",
            color: "#92400E",
            whiteSpace: "nowrap",
            border: "1px solid #FDE68A",
          }}
          title={`注釈 ${annotCount} 件`}
        >
          {annotCount}
        </span>
      )}
    </span>
  );
}
