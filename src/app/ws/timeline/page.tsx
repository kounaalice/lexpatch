"use client";
import { uuid } from "@/lib/uuid";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";

interface Phase {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  progress: number; // 0-100
}

const STORAGE_KEY = "lp_ws_phases";
const PHASE_COLORS = [
  "#0369A1",
  "#7C3AED",
  "#059669",
  "#D97706",
  "#DC2626",
  "#DB2777",
  "#4F46E5",
  "#0891B2",
];

function getPhases(): Phase[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function savePhases(phases: Phase[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(phases));
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function diffDays(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
function monthLabel(d: Date) {
  return `${d.getFullYear()}/${d.getMonth() + 1}`;
}

export default function TimelinePage() {
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [_scrollOffset, _setScrollOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSession(getSession());
    setPhases(getPhases());
  }, []);

  // Timeline range: from earliest start - 7d to latest end + 30d
  const allDates = phases.flatMap((p) => [p.startDate, p.endDate]);
  const now = new Date();
  const rangeStart = allDates.length
    ? new Date(
        Math.min(...allDates.map((d) => new Date(d).getTime()), now.getTime()) - 7 * 86400000,
      )
    : addDays(now, -7);
  const rangeEnd = allDates.length
    ? new Date(
        Math.max(...allDates.map((d) => new Date(d).getTime()), now.getTime()) + 30 * 86400000,
      )
    : addDays(now, 90);
  const totalDays = diffDays(toYMD(rangeStart), toYMD(rangeEnd)) + 1;
  const dayWidth = 24; // px per day
  const totalWidth = totalDays * dayWidth;

  // Month markers
  const monthMarkers: { label: string; offset: number }[] = [];
  const d = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  while (d <= rangeEnd) {
    const offset = diffDays(toYMD(rangeStart), toYMD(d));
    if (offset >= 0) monthMarkers.push({ label: monthLabel(d), offset });
    d.setMonth(d.getMonth() + 1);
  }

  // Today marker
  const todayOffset = diffDays(toYMD(rangeStart), toYMD(now));

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newPhase: Phase = {
      id: uuid(),
      title: (fd.get("title") as string) || "無題のフェーズ",
      startDate: (fd.get("startDate") as string) || toYMD(now),
      endDate: (fd.get("endDate") as string) || toYMD(addDays(now, 30)),
      color: PHASE_COLORS[phases.length % PHASE_COLORS.length],
      progress: 0,
    };
    const updated = [...phases, newPhase];
    savePhases(updated);
    setPhases(updated);
    setShowAdd(false);
  }

  function handleDelete(id: string) {
    const updated = phases.filter((p) => p.id !== id);
    savePhases(updated);
    setPhases(updated);
  }

  function handleProgressChange(id: string, progress: number) {
    const updated = phases.map((p) => (p.id === id ? { ...p, progress } : p));
    savePhases(updated);
    setPhases(updated);
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
              display: "flex",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>&rsaquo;</span>
            <Link href="/ws" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              ワークスペース
            </Link>
            <span>&rsaquo;</span>
            <span>タイムライン</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "3px",
                height: "1.8rem",
                backgroundColor: "var(--color-accent)",
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              タイムライン
            </h1>
            {session && (
              <button
                onClick={() => setShowAdd(!showAdd)}
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  padding: "0.4rem 0.8rem",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                + フェーズ追加
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
        {/* 追加フォーム */}
        {showAdd && (
          <form
            onSubmit={handleAdd}
            style={{
              marginBottom: "1.5rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1.25rem",
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div>
              <label style={labelStyle}>タイトル</label>
              <input name="title" required style={inputStyle} placeholder="フェーズ名" />
            </div>
            <div>
              <label style={labelStyle}>開始日</label>
              <input name="startDate" type="date" defaultValue={toYMD(now)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>終了日</label>
              <input
                name="endDate"
                type="date"
                defaultValue={toYMD(addDays(now, 30))}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                padding: "0.5rem 1rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              追加
            </button>
          </form>
        )}

        {phases.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "3rem 2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                color: "var(--color-text-primary)",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              タイムラインにフェーズがありません
            </p>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              「+ フェーズ追加」から期間を追加すると、ガントバーで視覚化されます。
              <br />
              法令施行日・届出期限・プロジェクトマイルストーンなどの管理に。
            </p>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* ガントチャート */}
            <div ref={containerRef} style={{ overflowX: "auto", position: "relative" }}>
              <div style={{ minWidth: `${totalWidth + 200}px`, position: "relative" }}>
                {/* 月ヘッダー */}
                <div
                  style={{
                    display: "flex",
                    borderBottom: "1px solid var(--color-border)",
                    position: "sticky",
                    top: 0,
                    backgroundColor: "var(--color-bg)",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: "200px",
                      flexShrink: 0,
                      padding: "0.5rem 0.75rem",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    フェーズ
                  </div>
                  <div style={{ flex: 1, position: "relative", height: "32px" }}>
                    {monthMarkers.map((m) => (
                      <div
                        key={m.label}
                        style={{
                          position: "absolute",
                          left: `${m.offset * dayWidth}px`,
                          borderLeft: "1px solid var(--color-border)",
                          height: "100%",
                          paddingLeft: "4px",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.68rem",
                          color: "var(--color-text-secondary)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* フェーズ行 */}
                {phases.map((phase) => {
                  const startOffset = Math.max(0, diffDays(toYMD(rangeStart), phase.startDate));
                  const barWidth =
                    Math.max(1, diffDays(phase.startDate, phase.endDate) + 1) * dayWidth;
                  const daysLeft = diffDays(toYMD(now), phase.endDate);
                  return (
                    <div
                      key={phase.id}
                      style={{
                        display: "flex",
                        borderBottom: "1px solid var(--color-border)",
                        minHeight: "48px",
                      }}
                    >
                      {/* ラベル */}
                      <div
                        style={{
                          width: "200px",
                          flexShrink: 0,
                          padding: "0.5rem 0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              color: "var(--color-text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {phase.title}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.68rem",
                              color:
                                daysLeft < 0
                                  ? "#DC2626"
                                  : daysLeft <= 7
                                    ? "#D97706"
                                    : "var(--color-text-secondary)",
                            }}
                          >
                            {daysLeft < 0
                              ? `${-daysLeft}日超過`
                              : daysLeft === 0
                                ? "本日期限"
                                : `残${daysLeft}日`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(phase.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--color-text-secondary)",
                            fontSize: "0.75rem",
                            opacity: 0.5,
                          }}
                          title="削除"
                        >
                          ✕
                        </button>
                      </div>
                      {/* バー */}
                      <div
                        style={{
                          flex: 1,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {/* Today line */}
                        {todayOffset >= 0 && (
                          <div
                            style={{
                              position: "absolute",
                              left: `${todayOffset * dayWidth}px`,
                              width: "2px",
                              height: "100%",
                              backgroundColor: "#DC2626",
                              opacity: 0.4,
                              zIndex: 1,
                            }}
                          />
                        )}
                        <div
                          style={{
                            position: "absolute",
                            left: `${startOffset * dayWidth}px`,
                            width: `${barWidth}px`,
                            height: "24px",
                            borderRadius: "4px",
                            backgroundColor: `${phase.color}30`,
                            border: `1px solid ${phase.color}`,
                            overflow: "hidden",
                            cursor: "pointer",
                          }}
                          title={`${phase.progress}% 完了`}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${phase.progress}%`,
                              backgroundColor: `${phase.color}60`,
                              transition: "width 0.2s",
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              left: "4px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              color: phase.color,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {phase.title} ({phase.progress}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 進捗調整 */}
            <div style={{ padding: "1rem", borderTop: "1px solid var(--color-border)" }}>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                進捗調整
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {phases.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: p.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8rem",
                        color: "var(--color-text-primary)",
                        minWidth: "120px",
                      }}
                    >
                      {p.title}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={p.progress}
                      onChange={(e) => handleProgressChange(p.id, parseInt(e.target.value))}
                      style={{ flex: 1, maxWidth: "200px" }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        color: "var(--color-text-secondary)",
                        minWidth: "40px",
                      }}
                    >
                      {p.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
  marginBottom: "0.2rem",
};
const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.85rem",
  padding: "0.5rem 0.65rem",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text-primary)",
  width: "100%",
  boxSizing: "border-box" as const,
};
