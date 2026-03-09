"use client";

import React, { useState, useEffect } from "react";
import type { PrecedentSummary } from "@/lib/precedent/types";
import { TRIAL_TYPE_LABEL } from "@/lib/precedent/types";

interface Props {
  lawId: string;
  articleNum: string; // URL形式: "709", "465_2"
}

export default function PrecedentList({ lawId, articleNum }: Props) {
  const [precedents, setPrecedents] = useState<PrecedentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    fetch(
      `/api/precedents?lawId=${encodeURIComponent(lawId)}&article=${encodeURIComponent(articleNum)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        setPrecedents(data.precedents || []);
      })
      .catch(() => setPrecedents([]))
      .finally(() => setLoading(false));
  }, [lawId, articleNum]);

  if (loading) {
    return (
      <div style={{ padding: "1rem 0", color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
        判例データを読み込み中...
      </div>
    );
  }

  if (precedents.length === 0) {
    return null; // 判例なし → セクション自体を非表示
  }

  const displayed = expanded ? precedents : precedents.slice(0, 5);

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
            fontFamily: "var(--font-sans)",
          }}
        >
          関連判例（{precedents.length}件）
        </h3>
        <a
          href={`https://www.courts.go.jp/hanrei/search1/index.html`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.75rem",
            color: "var(--color-accent)",
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
          }}
        >
          裁判所判例検索 ↗
        </a>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {displayed.map((p) => (
          <PrecedentCard key={p.lawsuit_id} precedent={p} />
        ))}
      </div>

      {precedents.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: "0.5rem",
            padding: "0.4rem 0.8rem",
            fontSize: "0.8rem",
            fontFamily: "var(--font-sans)",
            color: "var(--color-accent)",
            background: "none",
            border: "1px solid var(--color-border)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {expanded ? "▲ 閉じる" : `▼ 全${precedents.length}件を表示`}
        </button>
      )}
    </section>
  );
}

// ── 個別判例カード ──
function PrecedentCard({ precedent: p }: { precedent: PrecedentSummary }) {
  const typeLabel = TRIAL_TYPE_LABEL[p.trial_type] || p.trial_type;
  const dateStr = p.date
    ? new Date(p.date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div
      style={{
        padding: "0.6rem 0.8rem",
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        backgroundColor: "var(--color-surface)",
        fontSize: "0.82rem",
        lineHeight: 1.5,
      }}
    >
      {/* ヘッダー行 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.1rem 0.4rem",
            borderRadius: "3px",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
          }}
        >
          {typeLabel}
        </span>
        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.78rem" }}>{dateStr}</span>
        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}>
          {p.court_name}
        </span>
        {p.result && (
          <span style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}>
            — {p.result}
          </span>
        )}
      </div>

      {/* 事件名 + 裁判所HPリンク */}
      <div
        style={{
          marginTop: "0.3rem",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span
            style={{ fontWeight: 600, fontSize: "0.84rem", color: "var(--color-text-primary)" }}
          >
            {p.case_name}
          </span>
          <span
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.75rem",
              marginLeft: "0.5rem",
            }}
          >
            {p.case_number}
          </span>
        </div>
        <a
          href={p.detail_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.75rem",
            color: "var(--color-accent)",
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          裁判所HPで確認 ↗
        </a>
      </div>

      {/* 判例集引用 */}
      {p.article_info && (
        <div
          style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem", marginTop: "0.2rem" }}
        >
          {p.article_info}
        </div>
      )}
    </div>
  );
}
