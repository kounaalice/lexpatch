"use client";

import type { Article } from "@/lib/egov/types";

export function ArticleJump({ articles, lawId: _lawId }: { articles: Article[]; lawId: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <label
        htmlFor="article-jump"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.8rem",
          color: "var(--color-text-secondary)",
          whiteSpace: "nowrap",
        }}
      >
        条文ジャンプ
      </label>
      <select
        id="article-jump"
        defaultValue=""
        onChange={(e) => {
          if (!e.target.value) return;
          const el = document.getElementById(`preview-article-${e.target.value}`);
          const container = document.getElementById("law-fulltext-container");
          if (el && container) {
            // コンテナ内でスクロール（上端を少し余白付きで表示）
            const scrollTarget = el.offsetTop - container.offsetTop - 12;
            container.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
          }
          // 選択をリセットして再選択可能に
          e.target.value = "";
        }}
        style={{
          flex: "1",
          maxWidth: "320px",
          padding: "0.35rem 0.5rem",
          border: "1px solid var(--color-border)",
          borderRadius: "6px",
          fontFamily: "var(--font-sans)",
          fontSize: "0.82rem",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text-primary)",
        }}
      >
        <option value="">-- 条文を選択 --</option>
        {articles.map((a) => (
          <option key={a.num} value={a.num}>
            {a.title || `第${a.num}条`}
            {a.caption ? ` ${a.caption}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
