"use client";

import { RARITY_STARS, RARITY_LABEL, RARITY_COLOR, type GachaResult } from "@/lib/cards";

interface GachaModalProps {
  results: GachaResult[];
  onClose: () => void;
}

export default function GachaModal({ results, onClose }: GachaModalProps) {
  const isTen = results.length > 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "1.2rem",
          maxWidth: isTen ? "600px" : "320px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            {"\uD83C\uDFB0"}{" "}
            {isTen ? "10\u9023\u30AC\u30C1\u30E3\u7D50\u679C" : "\u30AC\u30C1\u30E3\u7D50\u679C"}
          </div>
        </div>

        {/* カード結果 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isTen ? "repeat(auto-fill, minmax(120px, 1fr))" : "1fr",
            gap: "0.6rem",
          }}
        >
          {results.map((result, i) => {
            const colors = RARITY_COLOR[result.rarity];
            const [, articleNum] = result.cardId.split(":");
            const isSSR = result.rarity === "SSR";
            const isSR = result.rarity === "SR";

            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  border: `2px solid ${colors.border}`,
                  borderRadius: "8px",
                  padding: isTen ? "0.5rem" : "0.8rem",
                  backgroundColor: colors.bg,
                  boxShadow: colors.glow,
                  textAlign: "center",
                  animation: `card-reveal 0.5s ease-out ${i * 0.1}s both`,
                  overflow: "hidden",
                }}
              >
                {/* SSR ホロ */}
                {isSSR && (
                  <div
                    className="gaming-card-shimmer"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  />
                )}

                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* レアリティ */}
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: isTen ? "0.6rem" : "0.75rem",
                      fontWeight: 700,
                      color: isSSR
                        ? "#F59E0B"
                        : isSR
                          ? "#A78BFA"
                          : result.rarity === "R"
                            ? "#38BDF8"
                            : "var(--color-text-secondary)",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {RARITY_STARS[result.rarity]} {RARITY_LABEL[result.rarity]}
                  </div>

                  {/* 条文番号 */}
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: isTen ? "0.85rem" : "1.1rem",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.15rem",
                    }}
                  >
                    {"\u7B2C"}
                    {articleNum}
                    {"\u6761"}
                  </div>

                  {/* NEW バッジ */}
                  {result.isNew && (
                    <span
                      style={{
                        display: "inline-block",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        padding: "0.05rem 0.35rem",
                        borderRadius: "3px",
                        backgroundColor: "#EF4444",
                        color: "#fff",
                        marginTop: "0.15rem",
                      }}
                    >
                      NEW!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 閉じるボタン */}
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "0.4rem 1.5rem",
              borderRadius: "6px",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            {"\u9589\u3058\u308B"}
          </button>
        </div>
      </div>
    </div>
  );
}
