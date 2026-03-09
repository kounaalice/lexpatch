"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  getAllEvents,
  addEvent,
  deleteEvent,
  getDefaultColor,
  expandRecurrences,
  EVENT_COLORS,
  REMINDER_OPTIONS,
  checkReminders,
} from "@/lib/ws-events";

interface CalendarEvent {
  id: string;
  type: string;
  date: string;
  time?: string;
  title: string;
  subtitle?: string;
  link?: string;
  color: string;
  done?: boolean;
  source: "personal" | "project" | "law";
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const TYPE_LABELS: Record<string, string> = {
  promulgation: "公布",
  enforcement: "施行",
  task: "タスク",
  phase_deadline: "フェーズ",
  personal: "予定",
};

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function WsCalendarPage() {
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [_editingId, _setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSession(getSession());
    // Request notification permission + start reminder check
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    const interval = setInterval(checkReminders, 60_000);
    checkReminders();
    return () => clearInterval(interval);
  }, []);

  const loadEvents = useCallback((y: number, m: number, memberId?: string) => {
    const from = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const to = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    // 1. Personal events from localStorage
    const personal = getAllEvents();
    const personalEvents: CalendarEvent[] = [];
    for (const pe of personal) {
      const dates = expandRecurrences(pe, from, to);
      for (const date of dates) {
        personalEvents.push({
          id: `p-${pe.id}-${date}`,
          type: "personal",
          date,
          time: pe.startTime,
          title: pe.title,
          subtitle: pe.description,
          color: pe.color,
          source: "personal",
        });
      }
    }

    // 2. Project/law events from API
    if (memberId) {
      fetch(`/api/calendar/events?member_id=${memberId}&from=${from}&to=${to}`)
        .then((r) => (r.ok ? r.json() : { events: [] }))
        .then((d) => {
          const apiEvents: CalendarEvent[] = (d.events || []).map((e: CalendarEvent) => ({
            ...e,
            source:
              e.type === "promulgation" || e.type === "enforcement"
                ? ("law" as const)
                : ("project" as const),
          }));
          setEvents([...personalEvents, ...apiEvents].sort((a, b) => a.date.localeCompare(b.date)));
          setLoading(false);
        })
        .catch(() => {
          setEvents(personalEvents);
          setLoading(false);
        });
    } else {
      setEvents(personalEvents);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadEvents(year, month, session?.memberId);
  }, [year, month, session?.memberId, loadEvents]);

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
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth());
    setSelectedDate(toYMD(n));
  }

  function handleAddEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addEvent({
      title: (fd.get("title") as string) || "無題の予定",
      description: (fd.get("description") as string) || undefined,
      startDate: (fd.get("startDate") as string) || selectedDate || toYMD(new Date()),
      startTime: (fd.get("startTime") as string) || undefined,
      endDate: (fd.get("endDate") as string) || undefined,
      allDay: !fd.get("startTime"),
      color: (fd.get("color") as string) || getDefaultColor(),
      recurrence: (fd.get("recurrence") as string) || "none",
      reminder: Number(fd.get("reminder") ?? -1),
    });
    setShowAdd(false);
    formRef.current?.reset();
    loadEvents(year, month, session?.memberId);
  }

  function handleDeleteEvent(id: string) {
    // Extract real event id from composite id (p-{uuid}-{date})
    const realId = id.replace(/^p-/, "").replace(/-\d{4}-\d{2}-\d{2}$/, "");
    deleteEvent(realId);
    loadEvents(year, month, session?.memberId);
  }

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  for (const ev of events) {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  }

  const today = toYMD(new Date());
  const cells = getMonthGrid(year, month);
  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
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
            <span>カレンダー</span>
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
              カレンダー
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
            { color: "#059669", label: "個人予定" },
            { color: "#0369A1", label: "公布" },
            { color: "#DC2626", label: "施行" },
            { color: "#7C3AED", label: "タスク" },
            { color: "#D97706", label: "フェーズ" },
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

        {/* 月ナビ + 予定追加 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button onClick={prevMonth} style={navBtn}>
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
              ...navBtn,
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              border: "none",
            }}
          >
            今日
          </button>
          <button onClick={nextMonth} style={navBtn}>
            次月 ▶
          </button>
          {session && (
            <button
              onClick={() => {
                setShowAdd(!showAdd);
                if (!selectedDate) setSelectedDate(toYMD(new Date()));
              }}
              style={{
                ...navBtn,
                backgroundColor: "var(--color-add-bg)",
                color: "var(--color-add-fg)",
                border: "1px solid var(--color-add-fg)",
              }}
            >
              + 予定追加
            </button>
          )}
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
          {cells.map((day, idx) => {
            if (day === null)
              return (
                <div
                  key={`e-${idx}`}
                  style={{
                    borderTop: idx >= 7 ? "1px solid var(--color-border)" : "none",
                    minHeight: "70px",
                  }}
                />
              );
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

        {/* 予定追加フォーム */}
        {showAdd && session && (
          <form
            ref={formRef}
            onSubmit={handleAddEvent}
            style={{
              marginTop: "1.5rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "1.25rem",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
              }}
            >
              予定を追加
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <input name="title" placeholder="タイトル" required style={inputStyle} />
              </div>
              <input
                name="startDate"
                type="date"
                defaultValue={selectedDate || toYMD(new Date())}
                style={inputStyle}
              />
              <input name="startTime" type="time" placeholder="時刻（任意）" style={inputStyle} />
              <input name="endDate" type="date" placeholder="終了日（任意）" style={inputStyle} />
              <select name="recurrence" defaultValue="none" style={inputStyle}>
                <option value="none">繰り返しなし</option>
                <option value="daily">毎日</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
                <option value="yearly">毎年</option>
              </select>
              <select name="reminder" defaultValue="-1" style={inputStyle}>
                {REMINDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <div style={{ gridColumn: "1 / -1" }}>
                <input name="description" placeholder="メモ（任意）" style={inputStyle} />
              </div>
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  gap: "0.4rem",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  色:
                </span>
                {EVENT_COLORS.map((c) => (
                  <label key={c} style={{ cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="color"
                      value={c}
                      defaultChecked={c === EVENT_COLORS[0]}
                      style={{ display: "none" }}
                    />
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: c,
                        display: "inline-block",
                        border: "2px solid var(--color-border)",
                        verticalAlign: "middle",
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button
                type="submit"
                style={{
                  ...navBtn,
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                }}
              >
                追加
              </button>
              <button type="button" onClick={() => setShowAdd(false)} style={navBtn}>
                キャンセル
              </button>
            </div>
          </form>
        )}

        {/* 選択日のイベント */}
        {selectedDate && !loading && (
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
              {selectedDate.replace(/-/g, "/")} ({selectedEvents.length}件)
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
                  この日の予定はありません
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
                    {ev.source === "personal" && (
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        title="削除"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-text-secondary)",
                          fontSize: "0.85rem",
                          padding: "0.2rem",
                          opacity: 0.6,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                          e.currentTarget.style.color = "#DC2626";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "0.6";
                          e.currentTarget.style.color = "var(--color-text-secondary)";
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.8rem",
  padding: "0.4rem 0.8rem",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-text-primary)",
  cursor: "pointer",
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
  boxSizing: "border-box",
};
