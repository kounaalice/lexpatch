"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadSettings } from "@/lib/settings";
import { getGamingStats } from "@/lib/gaming";
import { isLoggedIn } from "@/lib/session";

interface StatItem {
  label: string;
  value: string;
  desc: string;
}

export default function HomepageStats() {
  const [stats, setStats] = useState<StatItem[]>([
    { label: "法令数", value: "9,000+", desc: "e-Gov法令検索APIで取得可能な法令" },
    { label: "改正提案", value: "...", desc: "ユーザー投稿の改正案" },
    { label: "逐条解説", value: "...", desc: "条文ごとの解説・注釈" },
    { label: "プロジェクト", value: "...", desc: "法令改正プロジェクト" },
  ]);
  const [gamingMode, setGamingMode] = useState(false);
  const [gaming, setGaming] = useState<ReturnType<typeof getGamingStats> | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchArrayCount(url: string): Promise<number | null> {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (Array.isArray(data)) return data.length;
        return null;
      } catch {
        return null;
      }
    }

    async function fetchJsonCount(url: string): Promise<number | null> {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        return data.count ?? null;
      } catch {
        return null;
      }
    }

    async function loadStats() {
      const [patchCount, projectCount, commentaryCount] = await Promise.all([
        fetchArrayCount("/api/patch"),
        fetchArrayCount("/api/projects"),
        fetchJsonCount("/api/commentary?count=true"),
      ]);

      setStats([
        { label: "法令数", value: "9,000+", desc: "e-Gov法令検索APIで取得可能な法令" },
        {
          label: "改正提案",
          value: patchCount !== null ? patchCount.toLocaleString() : "\u2014",
          desc: "ユーザー投稿の改正案",
        },
        {
          label: "逐条解説",
          value: commentaryCount !== null ? commentaryCount.toLocaleString() : "\u2014",
          desc: "条文ごとの解説・注釈",
        },
        {
          label: "プロジェクト",
          value: projectCount !== null ? projectCount.toLocaleString() : "\u2014",
          desc: "法令改正プロジェクト",
        },
      ]);
    }

    loadStats();

    // Gaming stats
    const settings = loadSettings();
    setGamingMode(settings.gamingMode);
    if (settings.gamingMode) {
      setGaming(getGamingStats());
    }
    setLoggedIn(isLoggedIn());
  }, []);

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "1rem 1.5rem",
      }}
    >
      <div
        className="homepage-stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.75rem",
        }}
      >
        {stats.map((item) => (
          <div
            key={item.label}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem 0.75rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--color-accent)",
                fontFamily: "var(--font-sans)",
                lineHeight: 1.2,
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans)",
                marginTop: "0.3rem",
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans)",
                marginTop: "0.15rem",
                opacity: 0.7,
              }}
            >
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Gaming gauge */}
      {gamingMode && gaming && (
        <div
          style={{
            marginTop: "0.75rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "0.85rem 1.2rem",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <span style={{ fontSize: "0.85rem" }}>{"\uD83D\uDCCA"}</span>
            <span
              style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-text-primary)" }}
            >
              あなたの閲覧レベル
            </span>
          </div>

          {/* Level + progress bar */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--color-accent)",
                whiteSpace: "nowrap",
              }}
            >
              Lv.{gaming.level} {gaming.title}
            </span>
            <div
              style={{
                flex: 1,
                height: "6px",
                backgroundColor: "rgba(0,0,0,0.08)",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${gaming.progress}%`,
                  background: "linear-gradient(90deg, var(--color-accent), #A78BFA, #F472B6)",
                  borderRadius: "3px",
                  transition: "width 0.3s",
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--color-text-secondary)",
                whiteSpace: "nowrap",
              }}
            >
              {Math.round(gaming.progress)}%
            </span>
          </div>

          {/* XP + Activity points */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.7rem",
              color: "var(--color-text-secondary)",
            }}
          >
            <span>
              閲覧XP: {gaming.readingXp.toLocaleString()}
              {gaming.activityPoints > 0 && (
                <span style={{ marginLeft: "0.8rem" }}>
                  {"\u26A1"} 活動ポイント: {gaming.activityPoints.toLocaleString()}
                </span>
              )}
            </span>
            {loggedIn ? (
              <Link
                href="/dashboard"
                style={{
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  fontSize: "0.68rem",
                }}
              >
                ダッシュボードで詳細 {"\u2192"}
              </Link>
            ) : (
              <Link
                href="/login"
                style={{
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  fontSize: "0.68rem",
                  opacity: 0.8,
                }}
              >
                ログインすると記録が保存されます {"\u2192"}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Responsive: 2x2 on mobile */}
      <style>{`
        @media (max-width: 600px) {
          .homepage-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
