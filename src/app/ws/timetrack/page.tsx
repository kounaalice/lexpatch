"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllEntries,
  getEntriesToday,
  getEntriesByDateRange,
  addEntry,
  updateEntry,
  deleteEntry,
  calcWorkMinutes,
  formatMinutes,
  summarize,
  CATEGORIES,
  type TimeEntry,
} from "@/lib/ws-timetrack";

export default function TimeTrackPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
  const [view, setView] = useState<"today" | "history" | "report">("today");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    date: "",
    clockIn: "",
    clockOut: "",
    breakMinutes: 0,
    memo: "",
    category: CATEGORIES[0],
  });

  // Report state
  const nowDate = new Date();
  const defaultFrom = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-01`;
  const defaultTo = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0).getDate()).padStart(2, "0")}`;
  const [reportFrom, setReportFrom] = useState(defaultFrom);
  const [reportTo, setReportTo] = useState(defaultTo);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setEntries(getAllEntries());
    setTodayEntries(getEntriesToday());
  }

  function handleClockIn() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    addEntry({
      date,
      clockIn: time,
      clockOut: null,
      breakMinutes: 0,
      memo: "",
      category: CATEGORIES[0],
    });
    refresh();
  }

  function handleClockOut(id: string) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    updateEntry(id, { clockOut: time });
    refresh();
  }

  function handleAdd() {
    if (!form.date || !form.clockIn) return;
    addEntry({ ...form, clockOut: form.clockOut || null, breakMinutes: form.breakMinutes || 0 });
    setForm({
      date: "",
      clockIn: "",
      clockOut: "",
      breakMinutes: 0,
      memo: "",
      category: CATEGORIES[0],
    });
    setShowAdd(false);
    refresh();
  }

  const activeEntry = todayEntries.find((e) => !e.clockOut);
  const todaySummary = summarize(todayEntries);

  // Monthly summary
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;
  const monthEntries = entries.filter((e) => e.date >= monthStart && e.date <= monthEnd);
  const monthSummary = summarize(monthEntries);

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
        &gt; 作業時間
      </nav>

      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem" }}>作業時間打刻</h1>

      {/* Clock In/Out */}
      <section
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "1.5rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        {activeEntry ? (
          <>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              出勤中: {activeEntry.clockIn}〜
            </p>
            <button
              onClick={() => handleClockOut(activeEntry.id)}
              style={{
                backgroundColor: "#DC2626",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.8rem 2rem",
                fontSize: "1.1rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              退勤
            </button>
          </>
        ) : (
          <button
            onClick={handleClockIn}
            style={{
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.8rem 2rem",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            出勤
          </button>
        )}
      </section>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>本日</p>
          <p style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            {formatMinutes(todaySummary.totalMinutes)}
          </p>
        </div>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
            今月（{monthSummary.workDays}日）
          </p>
          <p style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            {formatMinutes(monthSummary.totalMinutes)}
          </p>
          <p style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
            平均 {formatMinutes(monthSummary.avgMinutes)}/日
          </p>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["today", "history", "report"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: view === v ? "var(--color-accent)" : "var(--color-surface)",
              color: view === v ? "#fff" : "var(--color-text-primary)",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {v === "today" ? "本日" : v === "history" ? "履歴" : "レポート"}
          </button>
        ))}
        {view !== "report" && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              marginLeft: "auto",
              padding: "0.4rem 1rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            + 手動追加
          </button>
        )}
      </div>

      {/* Manual Add */}
      {showAdd && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <label style={{ fontSize: "0.75rem" }}>
              日付
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-border)",
                }}
              />
            </label>
            <label style={{ fontSize: "0.75rem" }}>
              出勤
              <input
                type="time"
                value={form.clockIn}
                onChange={(e) => setForm({ ...form, clockIn: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-border)",
                }}
              />
            </label>
            <label style={{ fontSize: "0.75rem" }}>
              退勤
              <input
                type="time"
                value={form.clockOut}
                onChange={(e) => setForm({ ...form, clockOut: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-border)",
                }}
              />
            </label>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 2fr",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <label style={{ fontSize: "0.75rem" }}>
              休憩(分)
              <input
                type="number"
                value={form.breakMinutes}
                onChange={(e) => setForm({ ...form, breakMinutes: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-border)",
                }}
              />
            </label>
            <label style={{ fontSize: "0.75rem" }}>
              区分
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-border)",
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: "0.75rem" }}>
              メモ
              <input
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.3rem",
                  borderRadius: 4,
                  border: "1px solid var(--color-border)",
                }}
              />
            </label>
          </div>
          <button
            onClick={handleAdd}
            style={{
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.4rem 1rem",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            追加
          </button>
        </div>
      )}

      {/* Report View */}
      {view === "report" &&
        (() => {
          const reportEntries = getEntriesByDateRange(reportFrom, reportTo);
          const reportSummary = summarize(reportEntries);

          // Category breakdown
          const categoryMinutes: Record<string, number> = {};
          for (const e of reportEntries) {
            const m = calcWorkMinutes(e);
            if (m !== null) {
              categoryMinutes[e.category] = (categoryMinutes[e.category] || 0) + m;
            }
          }
          const maxCategoryMinutes = Math.max(...Object.values(categoryMinutes), 1);

          // Daily breakdown (group by date, aggregate)
          const dailyMap = new Map<string, { entries: TimeEntry[]; totalMinutes: number }>();
          for (const e of reportEntries) {
            if (!dailyMap.has(e.date)) dailyMap.set(e.date, { entries: [], totalMinutes: 0 });
            const day = dailyMap.get(e.date)!;
            day.entries.push(e);
            const m = calcWorkMinutes(e);
            if (m !== null) day.totalMinutes += m;
          }
          const _dailyEntries = Array.from(dailyMap.entries()).sort((a, b) =>
            a[0].localeCompare(b[0]),
          );

          // CSV export
          function handleReportCsv() {
            const bom = "\uFEFF";
            const header = "日付,出勤,退勤,休憩(分),勤務時間(分),区分,メモ";
            const rows = reportEntries.map((e) => {
              const m = calcWorkMinutes(e);
              return [
                e.date,
                e.clockIn,
                e.clockOut || "",
                String(e.breakMinutes),
                m !== null ? String(m) : "",
                e.category,
                e.memo,
              ]
                .map((v) => (v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v))
                .join(",");
            });
            const csv = bom + [header, ...rows].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `勤怠レポート_${reportFrom}_${reportTo}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
          }

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Date Range Selector */}
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <label
                  style={{
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  開始
                  <input
                    type="date"
                    value={reportFrom}
                    onChange={(e) => setReportFrom(e.target.value)}
                    style={{
                      padding: "0.3rem",
                      borderRadius: 4,
                      border: "1px solid var(--color-border)",
                      fontSize: "0.85rem",
                    }}
                  />
                </label>
                <span style={{ color: "var(--color-text-secondary)" }}>〜</span>
                <label
                  style={{
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  終了
                  <input
                    type="date"
                    value={reportTo}
                    onChange={(e) => setReportTo(e.target.value)}
                    style={{
                      padding: "0.3rem",
                      borderRadius: 4,
                      border: "1px solid var(--color-border)",
                      fontSize: "0.85rem",
                    }}
                  />
                </label>
                <button
                  onClick={handleReportCsv}
                  style={{
                    marginLeft: "auto",
                    padding: "0.4rem 1rem",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  CSV出力
                </button>
              </div>

              {/* Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <div
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    padding: "1rem",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    合計時間
                  </p>
                  <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                    {formatMinutes(reportSummary.totalMinutes)}
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    padding: "1rem",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    勤務日数
                  </p>
                  <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>{reportSummary.workDays}日</p>
                </div>
                <div
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    padding: "1rem",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    日平均
                  </p>
                  <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                    {formatMinutes(reportSummary.avgMinutes)}
                  </p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "1rem",
                }}
              >
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                  区分別内訳
                </h3>
                {Object.keys(categoryMinutes).length === 0 ? (
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                    データなし
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {Object.entries(categoryMinutes)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, mins]) => (
                        <div
                          key={cat}
                          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                        >
                          <span style={{ fontSize: "0.8rem", minWidth: 80, textAlign: "right" }}>
                            {cat}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              backgroundColor: "var(--color-border)",
                              borderRadius: 4,
                              height: 20,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${(mins / maxCategoryMinutes) * 100}%`,
                                height: "100%",
                                backgroundColor: "var(--color-accent)",
                                borderRadius: 4,
                                transition: "width 0.3s",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "0.8rem", fontWeight: 600, minWidth: 80 }}>
                            {formatMinutes(mins)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* 単価計算 */}
              {(() => {
                let hourlyRates: Record<string, number> = {};
                try {
                  hourlyRates = JSON.parse(localStorage.getItem("lp_ws_hourly_rates") || "{}");
                } catch {}
                const hasRates = Object.keys(hourlyRates).length > 0;
                const rateEntries = Object.entries(categoryMinutes)
                  .map(([cat, mins]) => {
                    const hours = mins / 60;
                    const rate = hourlyRates[cat] || 0;
                    return { cat, mins, hours, rate, amount: hours * rate };
                  })
                  .filter((e) => e.rate > 0);
                const totalEarnings = rateEntries.reduce((sum, e) => sum + e.amount, 0);

                return (
                  <div
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      padding: "1rem",
                    }}
                  >
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                      単価計算
                    </h3>
                    {!hasRates ? (
                      <div style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
                        <p>単価が未設定です。</p>
                        <Link
                          href="/ws/expenses"
                          style={{ color: "var(--color-accent)", fontSize: "0.82rem" }}
                        >
                          経費管理ページで単価を設定 &rarr;
                        </Link>
                      </div>
                    ) : rateEntries.length === 0 ? (
                      <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
                        該当する区分の単価設定がありません
                      </p>
                    ) : (
                      <>
                        <div style={{ overflowX: "auto" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              fontSize: "0.8rem",
                            }}
                          >
                            <thead>
                              <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                                <th style={{ padding: "0.4rem 0.5rem", textAlign: "left" }}>
                                  区分
                                </th>
                                <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>
                                  時間
                                </th>
                                <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>
                                  単価(円/h)
                                </th>
                                <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>
                                  金額
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rateEntries.map((e) => (
                                <tr
                                  key={e.cat}
                                  style={{ borderBottom: "1px solid var(--color-border)" }}
                                >
                                  <td style={{ padding: "0.4rem 0.5rem" }}>{e.cat}</td>
                                  <td style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>
                                    {e.hours.toFixed(1)}h
                                  </td>
                                  <td style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>
                                    &yen;{e.rate.toLocaleString()}
                                  </td>
                                  <td
                                    style={{
                                      padding: "0.4rem 0.5rem",
                                      textAlign: "right",
                                      fontWeight: 600,
                                    }}
                                  >
                                    &yen;{Math.round(e.amount).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr
                                style={{
                                  borderTop: "2px solid var(--color-border)",
                                  fontWeight: 700,
                                }}
                              >
                                <td colSpan={3} style={{ padding: "0.5rem", textAlign: "right" }}>
                                  合計
                                </td>
                                <td style={{ padding: "0.5rem", textAlign: "right" }}>
                                  &yen;{Math.round(totalEarnings).toLocaleString()}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Daily Breakdown Table */}
              <div
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, padding: "1rem 1rem 0.5rem" }}>
                  日別明細
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                        <th style={{ padding: "0.5rem", textAlign: "left" }}>日付</th>
                        <th style={{ padding: "0.5rem", textAlign: "left" }}>出勤</th>
                        <th style={{ padding: "0.5rem", textAlign: "left" }}>退勤</th>
                        <th style={{ padding: "0.5rem", textAlign: "right" }}>休憩</th>
                        <th style={{ padding: "0.5rem", textAlign: "right" }}>勤務時間</th>
                        <th style={{ padding: "0.5rem", textAlign: "left" }}>区分</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportEntries.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              padding: "2rem",
                              textAlign: "center",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            期間内の記録がありません
                          </td>
                        </tr>
                      ) : (
                        reportEntries
                          .sort(
                            (a, b) =>
                              a.date.localeCompare(b.date) || a.clockIn.localeCompare(b.clockIn),
                          )
                          .map((e) => {
                            const m = calcWorkMinutes(e);
                            return (
                              <tr
                                key={e.id}
                                style={{ borderBottom: "1px solid var(--color-border)" }}
                              >
                                <td style={{ padding: "0.4rem 0.5rem" }}>{e.date}</td>
                                <td style={{ padding: "0.4rem 0.5rem" }}>{e.clockIn}</td>
                                <td style={{ padding: "0.4rem 0.5rem" }}>{e.clockOut || "---"}</td>
                                <td style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>
                                  {e.breakMinutes}分
                                </td>
                                <td
                                  style={{
                                    padding: "0.4rem 0.5rem",
                                    textAlign: "right",
                                    fontWeight: 600,
                                  }}
                                >
                                  {m !== null ? formatMinutes(m) : "勤務中"}
                                </td>
                                <td style={{ padding: "0.4rem 0.5rem" }}>{e.category}</td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                    {reportEntries.length > 0 && (
                      <tfoot>
                        <tr style={{ borderTop: "2px solid var(--color-border)", fontWeight: 700 }}>
                          <td colSpan={4} style={{ padding: "0.5rem", textAlign: "right" }}>
                            合計
                          </td>
                          <td style={{ padding: "0.5rem", textAlign: "right" }}>
                            {formatMinutes(reportSummary.totalMinutes)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Entry List */}
      {view !== "report" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {(view === "today" ? todayEntries : entries).map((e) => {
            const mins = calcWorkMinutes(e);
            return (
              <div
                key={e.id}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "0.8rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <span
                  style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", minWidth: 80 }}
                >
                  {e.date}
                </span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, minWidth: 110 }}>
                  {e.clockIn} 〜 {e.clockOut || "..."}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                    minWidth: 60,
                  }}
                >
                  {e.category}
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {mins !== null ? formatMinutes(mins) : "勤務中"}
                </span>
                {e.memo && (
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", flex: 1 }}
                  >
                    {e.memo}
                  </span>
                )}
                {!e.clockOut && (
                  <button
                    onClick={() => handleClockOut(e.id)}
                    style={{
                      backgroundColor: "#DC2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "0.2rem 0.6rem",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    退勤
                  </button>
                )}
                <button
                  onClick={() => {
                    deleteEntry(e.id);
                    refresh();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.8rem",
                  }}
                >
                  ×
                </button>
              </div>
            );
          })}
          {(view === "today" ? todayEntries : entries).length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: "var(--color-text-secondary)",
                padding: "2rem",
                fontSize: "0.9rem",
              }}
            >
              記録がありません
            </p>
          )}
        </div>
      )}
    </div>
  );
}
