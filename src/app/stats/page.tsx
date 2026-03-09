"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getHistory, type BrowsingHistoryEntry } from "@/lib/history";
import { getFollows, type FollowEntry } from "@/lib/follows";
import { getBookmarks, type Bookmark } from "@/lib/bookmarks";

export default function StatsPage() {
  const [history, setHistory] = useState<BrowsingHistoryEntry[]>([]);
  const [follows, setFollows] = useState<FollowEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    setHistory(getHistory());
    setFollows(getFollows());
    setBookmarks(getBookmarks());
  }, []);

  const totalViewed = history.length;
  const totalFollows = follows.length;
  const totalBookmarks = bookmarks.length;
  const uniqueLaws = new Set(history.map((h) => h.lawId)).size;

  // Monthly viewing counts (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { label: string; key: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${d.getMonth() + 1}月`;
      const count = history.filter((h) => h.visitedAt.startsWith(key)).length;
      months.push({ label, key, count });
    }
    return months;
  }, [history]);

  const maxMonthly = Math.max(1, ...monthlyData.map((m) => m.count));

  // Top 10 most viewed laws
  const topLaws = useMemo(() => {
    const counts = new Map<string, { title: string; count: number }>();
    for (const h of history) {
      const existing = counts.get(h.lawId);
      if (existing) existing.count++;
      else counts.set(h.lawId, { title: h.lawTitle, count: 1 });
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 10);
  }, [history]);

  const maxLawCount = Math.max(1, ...topLaws.map((l) => l.count));

  // Category distribution of followed laws
  const categoryData = useMemo(() => {
    const cats = new Map<string, number>();
    for (const f of follows) {
      const cat = f.type === "law" ? "法令" : "プロジェクト";
      cats.set(cat, (cats.get(cat) || 0) + 1);
    }
    // Add bookmark categories
    for (const b of bookmarks) {
      const cat = b.articleNum ? "条文" : "法令";
      const key = `ブックマーク(${cat})`;
      cats.set(key, (cats.get(key) || 0) + 1);
    }
    return [...cats.entries()].map(([label, count]) => ({ label, count }));
  }, [follows, bookmarks]);

  const totalCat = Math.max(
    1,
    categoryData.reduce((a, c) => a + c.count, 0),
  );
  const pieColors = ["#0369A1", "#059669", "#D97706", "#DC2626", "#7C3AED", "#DB2777"];

  // Build pie segments
  const pieSegments = useMemo(() => {
    const segments: {
      label: string;
      pct: number;
      color: string;
      startAngle: number;
      endAngle: number;
    }[] = [];
    let cumAngle = 0;
    categoryData.forEach((d, i) => {
      const pct = d.count / totalCat;
      const startAngle = cumAngle;
      const endAngle = cumAngle + pct * 360;
      segments.push({
        label: d.label,
        pct,
        color: pieColors[i % pieColors.length],
        startAngle,
        endAngle,
      });
      cumAngle = endAngle;
    });
    return segments;
  }, [categoryData, totalCat]);

  function describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ): string {
    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
      <nav
        style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}
      >
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          Top
        </Link>{" "}
        &gt; 法令統計
      </nav>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        法令統計ダッシュボード
      </h1>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.8rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "閲覧数", value: totalViewed, color: "var(--color-accent)" },
          { label: "法令数", value: uniqueLaws, color: "#059669" },
          { label: "フォロー", value: totalFollows, color: "#D97706" },
          { label: "ブックマーク", value: totalBookmarks, color: "#7C3AED" },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "1.2rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          月別閲覧数 (過去6ヶ月)
        </h2>
        <svg width="100%" viewBox="0 0 400 180" style={{ display: "block" }}>
          {monthlyData.map((d, i) => {
            const barH = (d.count / maxMonthly) * 140;
            const x = i * 65 + 20;
            return (
              <g key={d.key}>
                <rect
                  x={x}
                  y={150 - barH}
                  width={40}
                  height={barH}
                  fill="var(--color-accent)"
                  rx={3}
                />
                <text
                  x={x + 20}
                  y={168}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-text-secondary)"
                >
                  {d.label}
                </text>
                {d.count > 0 && (
                  <text
                    x={x + 20}
                    y={145 - barH}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--color-text-primary)"
                  >
                    {d.count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Top 10 laws horizontal bar chart */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "1.2rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          よく閲覧する法令 Top 10
        </h2>
        {topLaws.length === 0 ? (
          <p style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: "1rem" }}>
            データがありません
          </p>
        ) : (
          <svg
            width="100%"
            viewBox={`0 0 500 ${topLaws.length * 30 + 10}`}
            style={{ display: "block" }}
          >
            {topLaws.map((law, i) => {
              const barW = (law.count / maxLawCount) * 240;
              const y = i * 30 + 5;
              return (
                <g key={i}>
                  <text
                    x={0}
                    y={y + 16}
                    fontSize="11"
                    fill="var(--color-text-primary)"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {law.title.length > 20 ? law.title.slice(0, 20) + "..." : law.title}
                  </text>
                  <rect
                    x={230}
                    y={y + 2}
                    width={barW}
                    height={18}
                    fill="var(--color-accent)"
                    rx={3}
                  />
                  <text x={235 + barW} y={y + 16} fontSize="10" fill="var(--color-text-secondary)">
                    {law.count}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Category distribution donut */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "1.2rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          フォロー・ブックマーク分布
        </h2>
        {categoryData.length === 0 ? (
          <p style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: "1rem" }}>
            データがありません
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <svg width={180} height={180} viewBox="0 0 200 200">
              {pieSegments.map((seg, i) =>
                seg.pct >= 1 ? (
                  <circle key={i} cx={100} cy={100} r={80} fill={seg.color} />
                ) : (
                  <path
                    key={i}
                    d={describeArc(100, 100, 80, seg.startAngle, seg.endAngle)}
                    fill={seg.color}
                  />
                ),
              )}
              <circle cx={100} cy={100} r={45} fill="var(--color-surface)" />
              <text
                x={100}
                y={105}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="var(--color-text-primary)"
              >
                {totalCat}
              </text>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {categoryData.map((d, i) => (
                <div
                  key={d.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: pieColors[i % pieColors.length],
                      flexShrink: 0,
                    }}
                  />
                  <span>{d.label}</span>
                  <span style={{ color: "var(--color-text-secondary)" }}>({d.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
