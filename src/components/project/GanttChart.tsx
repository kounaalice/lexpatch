"use client";

import { useState, useMemo } from "react";

interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
  assignee?: string;
  due?: string;
  start_date?: string;
}

interface PhaseInfo {
  name: string;
  deadline?: string;
}

interface Props {
  tasks: ProjectTask[];
  phases: PhaseInfo[];
  compact?: boolean;
  onTaskUpdate?: (tasks: ProjectTask[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────

const COLORS = [
  "#0369A1",
  "#7C3AED",
  "#D97706",
  "#059669",
  "#DC2626",
  "#DB2777",
  "#4F46E5",
  "#0891B2",
];

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function addDays(d: string, n: number): string {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}

function formatMonth(d: string): string {
  const dt = new Date(d);
  return `${dt.getFullYear()}/${dt.getMonth() + 1}`;
}

function formatDay(d: string): string {
  return new Date(d).getDate().toString();
}

type Zoom = "week" | "month" | "quarter";

function getColWidth(zoom: Zoom): number {
  return zoom === "week" ? 18 : zoom === "month" ? 5 : 2;
}

function getHeaderInterval(zoom: Zoom): number {
  return zoom === "week" ? 7 : zoom === "month" ? 30 : 90;
}

// ─── Component ────────────────────────────────────────────────

export default function GanttChart({ tasks, phases, compact, onTaskUpdate: _onTaskUpdate }: Props) {
  const [zoom, setZoom] = useState<Zoom>("month");
  const today = new Date().toISOString().slice(0, 10);

  // Compute assignee → color map
  const assigneeColors = useMemo(() => {
    const map = new Map<string, string>();
    const seen = new Set<string>();
    tasks.forEach((t) => {
      if (t.assignee) seen.add(t.assignee);
    });
    let i = 0;
    seen.forEach((name) => {
      map.set(name, COLORS[i % COLORS.length]);
      i++;
    });
    return map;
  }, [tasks]);

  // Compute timeline range
  const { rangeStart, rangeEnd, totalDays } = useMemo(() => {
    const dates: string[] = [today];
    tasks.forEach((t) => {
      if (t.due) dates.push(t.due);
      if (t.start_date) dates.push(t.start_date);
    });
    phases.forEach((p) => {
      if (p.deadline) dates.push(p.deadline);
    });

    dates.sort();
    const first = dates[0];
    const last = dates[dates.length - 1];
    const pad = 14;
    const start = addDays(first, -pad);
    const end = addDays(last, pad);
    const days = Math.max(daysBetween(start, end), 30);
    return { rangeStart: start, rangeEnd: end, totalDays: days };
  }, [tasks, phases, today]);

  const colWidth = getColWidth(compact ? "month" : zoom);
  const chartWidth = totalDays * colWidth;
  const rowHeight = 28;
  const headerHeight = 40;
  const labelWidth = compact ? 120 : 160;

  // Items to display
  const displayTasks = compact ? tasks.slice(0, 15) : tasks;
  const totalRows = displayTasks.length + (phases.some((p) => p.deadline) ? 1 : 0);
  const chartHeight = headerHeight + totalRows * rowHeight + 8;

  // Position helpers
  function xForDate(d: string): number {
    return daysBetween(rangeStart, d) * colWidth;
  }

  // Header dates
  const headerDates = useMemo(() => {
    const interval = getHeaderInterval(compact ? "month" : zoom);
    const dates: string[] = [];
    let cur = rangeStart;
    while (cur <= rangeEnd) {
      dates.push(cur);
      cur = addDays(cur, interval);
    }
    return dates;
  }, [rangeStart, rangeEnd, zoom, compact]);

  // Today line
  const todayX = xForDate(today);
  const todayInRange = todayX >= 0 && todayX <= chartWidth;

  if (tasks.length === 0 && !phases.some((p) => p.deadline)) {
    return (
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.8rem",
          color: "var(--color-text-secondary)",
          padding: "0.5rem 0",
        }}
      >
        タスクまたはフェーズ期限を追加するとガントチャートが表示されます。
      </div>
    );
  }

  return (
    <div>
      {/* Zoom controls */}
      {!compact && (
        <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.5rem" }}>
          {(["week", "month", "quarter"] as Zoom[]).map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              style={{
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
                border:
                  zoom === z ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                backgroundColor: zoom === z ? "var(--color-accent)" : "var(--color-surface)",
                color: zoom === z ? "#fff" : "var(--color-text-primary)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                cursor: "pointer",
              }}
            >
              {z === "week" ? "週" : z === "month" ? "月" : "四半期"}
            </button>
          ))}
        </div>
      )}

      {/* Chart container */}
      <div
        style={{
          display: "flex",
          border: "1px solid var(--color-border)",
          borderRadius: "6px",
          overflow: "hidden",
          backgroundColor: "var(--color-surface)",
        }}
      >
        {/* Left labels */}
        <div
          style={{
            width: labelWidth,
            minWidth: labelWidth,
            borderRight: "1px solid var(--color-border)",
            flexShrink: 0,
          }}
        >
          {/* Header spacer */}
          <div
            style={{
              height: headerHeight,
              borderBottom: "1px solid var(--color-border)",
              padding: "0 0.4rem",
              display: "flex",
              alignItems: "center",
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
            }}
          >
            {compact ? "" : "タスク"}
          </div>

          {/* Phase row */}
          {phases.some((p) => p.deadline) && (
            <div
              style={{
                height: rowHeight,
                borderBottom: "1px solid var(--color-border)",
                padding: "0 0.4rem",
                display: "flex",
                alignItems: "center",
                fontFamily: "var(--font-sans)",
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#D97706",
              }}
            >
              フェーズ期限
            </div>
          )}

          {/* Task labels */}
          {displayTasks.map((t) => (
            <div
              key={t.id}
              style={{
                height: rowHeight,
                borderBottom: "1px solid var(--color-border)",
                padding: "0 0.4rem",
                display: "flex",
                alignItems: "center",
                fontFamily: "var(--font-sans)",
                fontSize: "0.68rem",
                color: t.done ? "var(--color-text-secondary)" : "var(--color-text-primary)",
                textDecoration: t.done ? "line-through" : "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={t.title}
            >
              {t.title.length > (compact ? 10 : 14)
                ? t.title.slice(0, compact ? 10 : 14) + "…"
                : t.title}
            </div>
          ))}
        </div>

        {/* Scrollable chart area */}
        <div style={{ overflowX: "auto", flex: 1 }}>
          <div style={{ width: chartWidth, minWidth: "100%", position: "relative" }}>
            {/* Header row */}
            <div
              style={{
                height: headerHeight,
                borderBottom: "1px solid var(--color-border)",
                position: "relative",
              }}
            >
              {headerDates.map((d, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: xForDate(d),
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.6rem",
                    color: "var(--color-text-secondary)",
                    whiteSpace: "nowrap",
                    top: "50%",
                    transform: "translateY(-50%)",
                    paddingLeft: "2px",
                  }}
                >
                  {(compact ? true : zoom !== "week")
                    ? formatMonth(d)
                    : `${formatMonth(d)}/${formatDay(d)}`}
                </div>
              ))}

              {/* Grid lines */}
              {headerDates.map((d, i) => (
                <div
                  key={`line-${i}`}
                  style={{
                    position: "absolute",
                    left: xForDate(d),
                    top: 0,
                    bottom: 0,
                    borderLeft: "1px solid var(--color-border)",
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>

            {/* Phase row */}
            {phases.some((p) => p.deadline) && (
              <div
                style={{
                  height: rowHeight,
                  borderBottom: "1px solid var(--color-border)",
                  position: "relative",
                }}
              >
                {phases
                  .filter((p) => p.deadline)
                  .map((p) => {
                    const x = xForDate(p.deadline!);
                    return (
                      <div
                        key={p.name}
                        style={{
                          position: "absolute",
                          left: x - 6,
                          top: (rowHeight - 12) / 2,
                          width: 12,
                          height: 12,
                          backgroundColor: "#D97706",
                          transform: "rotate(45deg)",
                          borderRadius: "1px",
                        }}
                        title={`${p.name}: ${p.deadline}`}
                      />
                    );
                  })}
              </div>
            )}

            {/* Task bars */}
            {displayTasks.map((t) => {
              const endDate = t.due;
              const startDate = t.start_date || (endDate ? addDays(endDate, -7) : today);
              const effectiveEnd = endDate || addDays(startDate, 7);

              const x1 = xForDate(startDate);
              const x2 = xForDate(effectiveEnd);
              const barWidth = Math.max(x2 - x1, 4);
              const color = t.assignee ? (assigneeColors.get(t.assignee) ?? COLORS[0]) : "#94A3B8";

              return (
                <div
                  key={t.id}
                  style={{
                    height: rowHeight,
                    borderBottom: "1px solid var(--color-border)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: Math.max(x1, 0),
                      top: 6,
                      width: barWidth,
                      height: rowHeight - 12,
                      backgroundColor: color,
                      opacity: t.done ? 0.35 : 0.85,
                      borderRadius: "3px",
                      cursor: "default",
                    }}
                    title={`${t.title}${t.assignee ? ` (${t.assignee})` : ""}\n${startDate} → ${effectiveEnd}${t.done ? " ✓" : ""}`}
                  />
                </div>
              );
            })}

            {/* Today line */}
            {todayInRange && (
              <div
                style={{
                  position: "absolute",
                  left: todayX,
                  top: 0,
                  height: chartHeight,
                  borderLeft: "2px dashed #DC2626",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: 4,
                    fontSize: "0.55rem",
                    color: "#DC2626",
                    fontFamily: "var(--font-sans)",
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                  }}
                >
                  今日
                </div>
              </div>
            )}

            {/* Grid lines extending through rows */}
            {headerDates.map((d, i) => (
              <div
                key={`gridline-${i}`}
                style={{
                  position: "absolute",
                  left: xForDate(d),
                  top: headerHeight,
                  bottom: 0,
                  borderLeft: "1px solid var(--color-border)",
                  opacity: 0.3,
                  pointerEvents: "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      {!compact && assigneeColors.size > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginTop: "0.4rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            color: "var(--color-text-secondary)",
          }}
        >
          {Array.from(assigneeColors.entries()).map(([name, color]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: color,
                  borderRadius: "2px",
                  opacity: 0.85,
                }}
              />
              {name}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <div
              style={{ width: 10, height: 10, backgroundColor: "#94A3B8", borderRadius: "2px" }}
            />
            未割当
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#D97706",
                transform: "rotate(45deg) scale(0.6)",
                borderRadius: "1px",
              }}
            />
            フェーズ期限
          </div>
        </div>
      )}
    </div>
  );
}
