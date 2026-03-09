"use client";

import { ACTIVITY_EMOJI, type GamingStats, type ActivityLogEntry } from "@/lib/gaming";
import { type CollectionStats } from "@/lib/cards";

interface Props {
  stats: GamingStats;
  cardStats: CollectionStats | null;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function GamingWidget({ stats, cardStats }: Props) {
  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          padding: "1rem 1.2rem",
        }}
      >
        <div
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            marginBottom: "0.8rem",
          }}
        >
          {"\uD83C\uDFAE"} ゲーミング統計
        </div>

        <div
          style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--color-accent)",
              whiteSpace: "nowrap",
            }}
          >
            Lv.{stats.level} {stats.title}
          </span>
          <div
            style={{
              flex: 1,
              height: "8px",
              backgroundColor: "rgba(0,0,0,0.08)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${stats.progress}%`,
                background: "linear-gradient(90deg, var(--color-accent), #A78BFA, #F472B6)",
                borderRadius: "4px",
                transition: "width 0.3s",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "var(--color-text-secondary)",
            }}
          >
            {Math.round(stats.progress)}%
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            marginBottom: "0.8rem",
          }}
        >
          <span>閲覧XP: {stats.readingXp.toLocaleString()}</span>
          <span>
            {"\u26A1"} 活動ポイント: {stats.activityPoints.toLocaleString()}
          </span>
        </div>

        {cardStats && cardStats.unique > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.8rem",
              padding: "0.4rem 0.6rem",
              backgroundColor: "rgba(245,158,11,0.05)",
              borderRadius: "6px",
              border: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <span style={{ fontWeight: 600 }}>
              {"\uD83C\uDCCF"} カード: {cardStats.unique}種 ({cardStats.total}枚)
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>
              SSR:{cardStats.byRarity.SSR} SR:{cardStats.byRarity.SR} R:{cardStats.byRarity.R} N:
              {cardStats.byRarity.N}
            </span>
            <a
              href="/cards"
              style={{
                marginLeft: "auto",
                fontSize: "0.68rem",
                color: "var(--color-accent)",
                textDecoration: "underline",
              }}
            >
              図鑑
            </a>
          </div>
        )}

        {stats.todayLog.length > 0 && (
          <>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                marginBottom: "0.4rem",
              }}
            >
              {"\uD83D\uDCC5"} 今日の活動
            </div>
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                fontSize: "0.7rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {stats.todayLog.slice(0, 15).map((entry: ActivityLogEntry, i: number) => (
                <div
                  key={`${entry.at}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.2rem 0",
                    borderBottom:
                      i < stats.todayLog.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                  }}
                >
                  <span
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", opacity: 0.6 }}
                  >
                    {formatTime(entry.at)}
                  </span>
                  <span>{ACTIVITY_EMOJI[entry.type]}</span>
                  <span style={{ flex: 1 }}>{entry.label}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-accent)",
                      fontWeight: 600,
                    }}
                  >
                    +{entry.points}pt
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
