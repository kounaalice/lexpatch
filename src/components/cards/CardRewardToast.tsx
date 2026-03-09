"use client";

import { useEffect, useState } from "react";
import { RARITY_STARS, RARITY_LABEL, RARITY_COLOR, type GachaResult } from "@/lib/cards";

interface CardRewardToastProps {
  result: GachaResult;
  source?: string;
  onDone: () => void;
}

export default function CardRewardToast({ result, source, onDone }: CardRewardToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 表示アニメーション
    requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDone]);

  const colors = RARITY_COLOR[result.rarity];
  const [, articleNum] = result.cardId.split(":");
  const isSSR = result.rarity === "SSR";
  const isSR = result.rarity === "SR";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "20px"})`,
        opacity: visible ? 1 : 0,
        transition: "all 0.3s ease",
        zIndex: 10000,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.6rem 1rem",
          backgroundColor: "var(--color-surface)",
          border: `2px solid ${colors.border}`,
          borderRadius: "10px",
          boxShadow: `${colors.glow}, 0 4px 12px rgba(0,0,0,0.15)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* SSR ホロ背景 */}
        {isSSR && (
          <div
            className="gaming-card-shimmer"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          />
        )}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>{"\uD83C\uDCCF"}</span>
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {result.isNew
                ? "\u65B0\u3057\u3044\u30AB\u30FC\u30C9\u3092\u7372\u5F97\uFF01"
                : "\u30AB\u30FC\u30C9\u3092\u7372\u5F97\uFF01"}
              {source && <span style={{ marginLeft: "0.3rem", opacity: 0.7 }}>({source})</span>}
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: isSSR ? "#F59E0B" : isSR ? "#A78BFA" : "var(--color-text-primary)",
              }}
            >
              {RARITY_STARS[result.rarity]} {RARITY_LABEL[result.rarity]} {"\u7B2C"}
              {articleNum}
              {"\u6761"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
