"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

/* ── 型 ── */
interface CalendarEvent {
  id: string;
  type: "promulgation" | "enforcement" | "task" | "phase_deadline";
  date: string;
  time?: string;
  title: string;
  subtitle?: string;
  link?: string;
  color: string;
  done?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  promulgation: "公布",
  enforcement: "施行",
  task: "タスク",
  phase_deadline: "フェーズ期限",
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/* ── ヘルパー ── */
function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ── ページエクスポート（Suspense必須） ── */
export default function CalendarPageWrapper() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            backgroundColor: "var(--color-bg)",
            minHeight: "100%",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}>
            読み込み中...
          </p>
        </div>
      }
    >
      <CalendarPage />
    </Suspense>
  );
}

/* ── メインコンポーネント ── */
function CalendarPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams?.get("project_id") ?? null;
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>("");

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s && !projectId) setLoading(false);
  }, [projectId]);

  // プロジェクト名取得
  useEffect(() => {
    if (!projectId) {
      setProjectTitle("");
      return;
    }
    fetch(`/api/projects?id=${projectId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.title) setProjectTitle(d.title);
      })
      .catch(() => {});
  }, [projectId]);

  const fetchEvents = useCallback(
    async (y: number, m: number, memberId?: string, projId?: string) => {
      const from = `${y}-${String(m + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      const to = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const query = projId
        ? `project_id=${projId}&from=${from}&to=${to}`
        : `member_id=${memberId}&from=${from}&to=${to}`;
      try {
        const res = await fetch(`/api/calendar/events?${query}`);
        if (res.ok) {
          const json = await res.json();
          setEvents(json.events ?? []);
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetchEvents(year, month, undefined, projectId);
    } else if (session?.memberId) {
      setLoading(true);
      fetchEvents(year, month, session.memberId);
    }
  }, [session, year, month, projectId, fetchEvents]);

  function prevMonth() {
    setSelectedDate(null);
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else setMonth(month - 1);
  }

  function nextMonth() {
    setSelectedDate(null);
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else setMonth(month + 1);
  }

  function goToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDate(toYMD(now));
  }

  // 日付→イベントマップ
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  for (const ev of events) {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  }

  const today = toYMD(new Date());
  const cells = getMonthGrid(year, month);
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  // ── 未ログイン（個人モードのみ） ──
  if (!loading && !session && !projectId) {
    return (
      <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%", padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>&rsaquo;</span>
            <span>カレンダー</span>
          </nav>
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "3rem 2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.1rem",
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
                fontWeight: 700,
              }}
            >
              ログインが必要です
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginBottom: "1.5rem",
                lineHeight: 1.7,
              }}
            >
              カレンダーを表示するにはログインしてください。
            </p>
            <Link
              href={`/login?return=${encodeURIComponent("/calendar")}`}
              style={{
                display: "inline-block",
                padding: "0.6rem 1.5rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ログインする
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダー */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>&rsaquo;</span>
            {projectId ? (
              <>
                <Link
                  href={`/projects/${projectId}`}
                  style={{ color: "var(--color-accent)", textDecoration: "none" }}
                >
                  {projectTitle || "プロジェクト"}
                </Link>
                <span>&rsaquo;</span>
                <span>チームカレンダー</span>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  style={{ color: "var(--color-accent)", textDecoration: "none" }}
                >
                  マイページ
                </Link>
                <span>&rsaquo;</span>
                <span>カレンダー</span>
              </>
            )}
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
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {projectId ? "チームカレンダー" : "カレンダー"}
            </h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
        {/* 凡例 */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
          }}
        >
          {[
            { color: "#0369A1", label: "公布" },
            { color: "#DC2626", label: "施行" },
            { color: "#7C3AED", label: "タスク" },
            { color: "#D97706", label: "フェーズ期限" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: color,
                  display: "inline-block",
                }}
              />
              <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* 月ナビ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <button onClick={prevMonth} style={navBtnStyle}>
            ◀ 前月
          </button>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              minWidth: "120px",
              textAlign: "center",
            }}
          >
            {year}年{month + 1}月
          </span>
          <button
            onClick={goToday}
            style={{
              ...navBtnStyle,
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              border: "none",
            }}
          >
            今日
          </button>
          <button onClick={nextMonth} style={navBtnStyle}>
            次月 ▶
          </button>
        </div>

        {/* カレンダーグリッド */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* 曜日ヘッダー */}
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              style={{
                padding: "0.5rem 0.25rem",
                textAlign: "center",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: i === 0 ? "#DC2626" : i === 6 ? "#0369A1" : "var(--color-text-secondary)",
                backgroundColor: "var(--color-bg)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {w}
            </div>
          ))}

          {/* 日セル */}
          {cells.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  style={{
                    borderTop: idx >= 7 ? "1px solid var(--color-border)" : "none",
                    minHeight: "70px",
                  }}
                />
              );
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate[dateStr] ?? [];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const dow = idx % 7;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                style={{
                  minHeight: "70px",
                  padding: "0.3rem",
                  border: "none",
                  borderTop: idx >= 7 ? "1px solid var(--color-border)" : "none",
                  backgroundColor: isSelected ? "var(--color-accent)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  verticalAlign: "top",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  transition: "background-color 0.1s",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.78rem",
                    fontWeight: isToday ? 800 : 400,
                    color: isSelected
                      ? "#fff"
                      : isToday
                        ? "var(--color-accent)"
                        : dow === 0
                          ? "#DC2626"
                          : dow === 6
                            ? "#0369A1"
                            : "var(--color-text-primary)",
                    width: "24px",
                    height: "24px",
                    lineHeight: "24px",
                    textAlign: "center",
                    borderRadius: "50%",
                    backgroundColor: isToday && !isSelected ? "rgba(3,105,161,0.1)" : "transparent",
                  }}
                >
                  {day}
                </span>
                {/* イベントドット */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", paddingLeft: "2px" }}>
                  {dayEvents.slice(0, 4).map((ev) => (
                    <span
                      key={ev.id}
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: isSelected ? "rgba(255,255,255,0.8)" : ev.color,
                        display: "inline-block",
                      }}
                    />
                  ))}
                  {dayEvents.length > 4 && (
                    <span
                      style={{
                        fontSize: "0.55rem",
                        color: isSelected ? "#fff" : "var(--color-text-secondary)",
                        lineHeight: "6px",
                      }}
                    >
                      +{dayEvents.length - 4}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ローディング */}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
              }}
            >
              読み込み中...
            </p>
          </div>
        )}

        {/* 選択日のイベント詳細 */}
        {selectedDate && (
          <div style={{ marginTop: "1.5rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              {selectedDate.replace(/-/g, "/")} のイベント ({selectedEvents.length}件)
            </h2>

            {selectedEvents.length === 0 ? (
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    margin: 0,
                  }}
                >
                  この日のイベントはありません
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
                {selectedEvents.map((ev, idx) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: "0.75rem 1rem",
                      borderTop: idx > 0 ? "1px solid var(--color-border)" : "none",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                    }}
                  >
                    {/* カラーバー */}
                    <div
                      style={{
                        width: "4px",
                        height: "2.5rem",
                        backgroundColor: ev.color,
                        borderRadius: "2px",
                        flexShrink: 0,
                        marginTop: "0.1rem",
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* 種別バッジ */}
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: ev.color,
                            backgroundColor: `${ev.color}15`,
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {TYPE_LABELS[ev.type] ?? ev.type}
                        </span>
                        {ev.time && (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.75rem",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {ev.time}
                          </span>
                        )}
                        {ev.done !== undefined && (
                          <span
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.65rem",
                              color: ev.done ? "#059669" : "#D97706",
                              fontWeight: 600,
                            }}
                          >
                            {ev.done ? "完了" : "未完了"}
                          </span>
                        )}
                      </div>
                      {/* タイトル */}
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                          marginTop: "0.2rem",
                          textDecoration: ev.done ? "line-through" : "none",
                          opacity: ev.done ? 0.6 : 1,
                        }}
                      >
                        {ev.link ? (
                          <Link href={ev.link} style={{ color: "inherit", textDecoration: "none" }}>
                            {ev.title}
                          </Link>
                        ) : (
                          ev.title
                        )}
                      </div>
                      {/* サブタイトル */}
                      {ev.subtitle && (
                        <div
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.78rem",
                            color: "var(--color-text-secondary)",
                            marginTop: "0.15rem",
                          }}
                        >
                          {ev.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* iCal 購読URL */}
        {session && (
          <div
            style={{
              marginTop: "2rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1rem 1.25rem",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              外部カレンダーに登録
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.5rem",
                lineHeight: 1.6,
              }}
            >
              {projectId
                ? "以下のURLをGoogle Calendar、Outlook等に追加すると、プロジェクトのタスクやフェーズ期限が自動同期されます。"
                : "以下のURLをGoogle Calendar、Outlook等に追加すると、法令の公布・施行やタスク期限が自動同期されます。"}
            </p>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                readOnly
                value={(() => {
                  const origin =
                    typeof window !== "undefined" ? window.location.origin : "https://lexcard.jp";
                  const base = `${origin}/api/calendar/ical?member_id=${session.memberId}&token=${session.token}`;
                  return projectId ? `${base}&project_id=${projectId}` : base;
                })()}
                style={{
                  flex: 1,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  padding: "0.4rem 0.6rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-secondary)",
                }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => {
                  const base = `${window.location.origin}/api/calendar/ical?member_id=${session.memberId}&token=${session.token}`;
                  const url = projectId ? `${base}&project_id=${projectId}` : base;
                  navigator.clipboard.writeText(url).then(() => alert("URLをコピーしました"));
                }}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  padding: "0.4rem 0.8rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                コピー
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── スタイル定数 ── */
const navBtnStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.8rem",
  padding: "0.4rem 0.8rem",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text-primary)",
  cursor: "pointer",
};
