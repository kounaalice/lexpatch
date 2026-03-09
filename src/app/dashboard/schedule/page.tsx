"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";

/* ── 型 ── */
interface CalendarEvent {
  id: string;
  type: "promulgation" | "enforcement" | "task" | "phase_deadline";
  date: string;
  title: string;
  subtitle?: string;
  link?: string;
  color: string;
}

/* ── ヘルパー ── */
function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function daysLabel(days: number): { text: string; color: string } {
  if (days < 0) return { text: `${Math.abs(days)}日前`, color: "#6B7280" };
  if (days === 0) return { text: "今日", color: "#DC2626" };
  if (days <= 7) return { text: `あと${days}日`, color: "#DC2626" };
  if (days <= 30) return { text: `あと${days}日`, color: "#D97706" };
  return { text: `あと${days}日`, color: "var(--color-text-secondary)" };
}

function monthKey(dateStr: string): string {
  const [y, m] = dateStr.split("-");
  return `${y}年${parseInt(m)}月`;
}

/* ── メインコンポーネント ── */
export default function SchedulePage() {
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s) setLoading(false);
  }, []);

  const fetchEvents = useCallback(async (memberId: string) => {
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const future = new Date(now);
    future.setMonth(future.getMonth() + 6);
    const to = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;
    try {
      const res = await fetch(`/api/calendar/events?member_id=${memberId}&from=${from}&to=${to}`);
      if (res.ok) {
        const json = await res.json();
        // 施行・公布のみフィルタ
        setEvents(
          (json.events ?? []).filter(
            (e: CalendarEvent) => e.type === "enforcement" || e.type === "promulgation",
          ),
        );
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session?.memberId) fetchEvents(session.memberId);
  }, [session, fetchEvents]);

  // 月別グループ化
  const grouped: Record<string, CalendarEvent[]> = {};
  for (const ev of events) {
    const key = monthKey(ev.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  }
  const groupEntries = Object.entries(grouped);

  // ── 未ログイン ──
  if (!loading && !session) {
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
            <span>施行スケジュール</span>
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
            <Link
              href={`/login?return=${encodeURIComponent("/dashboard/schedule")}`}
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
            <Link
              href="/dashboard"
              style={{ color: "var(--color-accent)", textDecoration: "none" }}
            >
              マイページ
            </Link>
            <span>&rsaquo;</span>
            <span>施行スケジュール</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "3px",
                height: "1.8rem",
                backgroundColor: "#DC2626",
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
              施行スケジュール
            </h1>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
              }}
            >
              今後6ヶ月
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
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

        {!loading && events.length === 0 && (
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
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              今後6ヶ月以内の施行・公布予定はありません
            </p>
          </div>
        )}

        {/* 月別タイムライン */}
        {groupEntries.map(([monthLabel, monthEvents]) => (
          <section key={monthLabel} style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "3px",
                  height: "1.2rem",
                  backgroundColor: "var(--color-accent)",
                  borderRadius: "2px",
                  flexShrink: 0,
                }}
              />
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                {monthLabel}
              </h2>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                ({monthEvents.length})
              </span>
            </div>

            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {monthEvents.map((ev, idx) => {
                const days = daysUntil(ev.date);
                const dl = daysLabel(days);
                return (
                  <div
                    key={ev.id}
                    style={{
                      padding: "0.75rem 1rem",
                      borderTop: idx > 0 ? "1px solid var(--color-border)" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* 日付 */}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.82rem",
                        color: "var(--color-text-secondary)",
                        minWidth: "5.5rem",
                        flexShrink: 0,
                      }}
                    >
                      {ev.date.replace(/-/g, "/")}
                    </span>
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
                        flexShrink: 0,
                      }}
                    >
                      {ev.type === "enforcement" ? "施行" : "公布"}
                    </span>
                    {/* 法令名 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {ev.link ? (
                        <Link
                          href={ev.link}
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.88rem",
                            color: "var(--color-accent)",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          {ev.title}
                        </Link>
                      ) : (
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.88rem",
                            color: "var(--color-text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {ev.title}
                        </span>
                      )}
                      {ev.subtitle && (
                        <span
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                            marginLeft: "0.5rem",
                          }}
                        >
                          {ev.subtitle}
                        </span>
                      )}
                    </div>
                    {/* 残り日数 */}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: dl.color,
                        flexShrink: 0,
                      }}
                    >
                      {dl.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* カレンダーへのリンク */}
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link
            href="/calendar"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-accent)",
              textDecoration: "none",
            }}
          >
            カレンダーで全イベントを見る →
          </Link>
        </div>
      </div>
    </div>
  );
}
