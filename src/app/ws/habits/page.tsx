"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllHabits,
  addHabit,
  deleteHabit,
  toggleDate,
  isCompleted,
  getStreak,
  getCompletionRate,
  getMonthDates,
  getWeekDates,
  DEFAULT_COLORS,
  type Habit,
} from "@/lib/ws-habits";

const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
const FREQ_LABELS: Record<string, string> = { daily: "毎日", weekdays: "平日", weekly: "週1" };

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    color: DEFAULT_COLORS[0],
    frequency: "daily" as Habit["frequency"],
  });
  const [view, setView] = useState<"week" | "month">("week");
  const [now] = useState(new Date());

  useEffect(() => {
    reload();
  }, []);
  function reload() {
    setHabits(getAllHabits());
  }

  const today = now.toISOString().slice(0, 10);
  const weekDates = getWeekDates();
  const monthDates = getMonthDates(now.getFullYear(), now.getMonth());
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const blankDays = (firstDayOfMonth + 6) % 7;

  function handleCreate() {
    if (!form.title.trim()) return;
    addHabit(form);
    setForm({ title: "", color: DEFAULT_COLORS[0], frequency: "daily" });
    setShowForm(false);
    reload();
  }

  function handleToggle(habitId: string, date: string) {
    toggleDate(habitId, date);
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteHabit(id);
    reload();
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
      <nav
        style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}
      >
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          Top
        </Link>{" "}
        &gt;{" "}
        <Link href="/ws" style={{ color: "var(--color-accent)" }}>
          WS
        </Link>{" "}
        &gt; 習慣トラッカー
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>習慣トラッカー</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          追加
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["week", "month"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              backgroundColor: view === v ? "var(--color-accent)" : "var(--color-surface)",
              color: view === v ? "#fff" : "var(--color-text-primary)",
            }}
          >
            {v === "week" ? "週間" : "月間"}
          </button>
        ))}
      </div>

      {showForm && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.8rem" }}>
            習慣を追加
          </h3>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="習慣名 *"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              marginBottom: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>色:</span>
            {DEFAULT_COLORS.map((c) => (
              <span
                key={c}
                onClick={() => setForm({ ...form, color: c })}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: c,
                  cursor: "pointer",
                  border:
                    form.color === c
                      ? "3px solid var(--color-text-primary)"
                      : "2px solid transparent",
                  display: "inline-block",
                }}
              />
            ))}
          </div>
          <div
            style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}
          >
            <span style={{ fontSize: "0.85rem" }}>頻度:</span>
            {(["daily", "weekdays", "weekly"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setForm({ ...form, frequency: f })}
                style={{
                  padding: "0.3rem 0.6rem",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  backgroundColor: form.frequency === f ? "var(--color-accent)" : "var(--color-bg)",
                  color: form.frequency === f ? "#fff" : "var(--color-text-primary)",
                }}
              >
                {FREQ_LABELS[f]}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleCreate}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              作成
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Habit list with stats */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}
      >
        {habits.map((h) => (
          <div
            key={h.id}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "0.8rem 1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: h.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 600, flex: 1 }}>{h.title}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {FREQ_LABELS[h.frequency]}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#D97706", fontWeight: 700 }}>
                {getStreak(h)}日連続
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {getCompletionRate(h)}%
              </span>
              <label style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  type="checkbox"
                  checked={isCompleted(h, today)}
                  onChange={() => handleToggle(h.id, today)}
                />
                <span style={{ fontSize: "0.75rem" }}>今日</span>
              </label>
              <button
                onClick={() => handleDelete(h.id)}
                style={{
                  fontSize: "0.7rem",
                  color: "#DC2626",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                削除
              </button>
            </div>
          </div>
        ))}
        {habits.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            習慣がありません
          </p>
        )}
      </div>

      {habits.length > 0 && view === "week" && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            overflow: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg)" }}>
                <th
                  style={{
                    padding: "0.5rem",
                    textAlign: "left",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  習慣
                </th>
                {weekDates.map((d, i) => (
                  <th
                    key={d}
                    style={{
                      padding: "0.5rem",
                      textAlign: "center",
                      borderBottom: "1px solid var(--color-border)",
                      backgroundColor: d === today ? "var(--color-accent)" : undefined,
                      color: d === today ? "#fff" : undefined,
                      minWidth: 40,
                    }}
                  >
                    {DAYS[i]}
                    <br />
                    <span style={{ fontSize: "0.7rem" }}>{d.slice(8)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.id}>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: h.color,
                        marginRight: 4,
                      }}
                    />
                    {h.title}
                  </td>
                  {weekDates.map((d) => (
                    <td
                      key={d}
                      style={{
                        padding: "0.5rem",
                        textAlign: "center",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted(h, d)}
                        onChange={() => handleToggle(h.id, d)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {habits.length > 0 &&
        view === "month" &&
        habits.map((h) => (
          <div key={h.id} style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <span
                style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: h.color }}
              />
              {h.title} — {now.getFullYear()}年{now.getMonth() + 1}月
            </div>
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "0.8rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 3,
                  textAlign: "center",
                }}
              >
                {DAYS.map((d) => (
                  <div
                    key={d}
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                      padding: "0.2rem",
                    }}
                  >
                    {d}
                  </div>
                ))}
                {Array.from({ length: blankDays }).map((_, i) => (
                  <div key={`b${i}`} />
                ))}
                {monthDates.map((d) => {
                  const done = isCompleted(h, d);
                  const isToday = d === today;
                  return (
                    <div
                      key={d}
                      onClick={() => handleToggle(h.id, d)}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 4,
                        fontSize: "0.7rem",
                        cursor: "pointer",
                        backgroundColor: done ? h.color : "var(--color-bg)",
                        color: done ? "#fff" : "var(--color-text-primary)",
                        border: isToday
                          ? "2px solid var(--color-text-primary)"
                          : "1px solid transparent",
                        fontWeight: isToday ? 700 : 400,
                      }}
                    >
                      {parseInt(d.slice(8))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
