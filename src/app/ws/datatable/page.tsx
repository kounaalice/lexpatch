"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getAllTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  addColumn,
  removeColumn,
  addRow,
  removeRow,
  setCellValue,
  columnSum,
  columnAvg,
  columnCount,
  exportCsv,
  importCsv,
  type DataTable,
  type ColumnDef,
} from "@/lib/ws-datatable";

export default function DataTablePage() {
  const [tables, setTables] = useState<DataTable[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [table, setTable] = useState<DataTable | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [showAddCol, setShowAddCol] = useState(false);
  const [colForm, setColForm] = useState({ label: "", type: "text" as ColumnDef["type"] });
  const [showSummary, setShowSummary] = useState(false);
  const [showAggPanel, setShowAggPanel] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const fileRef = useRef<HTMLInputElement>(null);

  function refresh() {
    const all = getAllTables();
    setTables(all);
    if (activeId) setTable(getTable(activeId) || null);
  }

  useEffect(() => {
    refresh(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeId) setTable(getTable(activeId) || null); // eslint-disable-line react-hooks/set-state-in-effect
  }, [activeId]);

  function handleCreate() {
    const t = createTable(newTitle || "新しいテーブル");
    setNewTitle("");
    setActiveId(t.id);
    refresh();
  }

  function handleCellChange(rowIdx: number, colId: string, val: string) {
    if (!activeId) return;
    setCellValue(activeId, rowIdx, colId, val);
    setTable(getTable(activeId) || null);
  }

  function handleAddCol() {
    if (!activeId || !colForm.label.trim()) return;
    addColumn(activeId, colForm.label, colForm.type);
    setColForm({ label: "", type: "text" });
    setShowAddCol(false);
    setTable(getTable(activeId) || null);
  }

  function handleExportCsv() {
    if (!table) return;
    const csv = exportCsv(table);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${table.title}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const t = importCsv(ev.target?.result as string);
        setActiveId(t.id);
        refresh();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : String(err));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // List view
  if (!activeId) {
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
          &gt; データテーブル
        </nav>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem" }}>
          データテーブル
        </h1>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="テーブル名"
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
            }}
          />
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
            新規作成
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            CSV取込
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleImportCsv}
            style={{ display: "none" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {tables.map((t) => (
            <div
              key={t.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "0.8rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                cursor: "pointer",
              }}
              onClick={() => setActiveId(t.id)}
            >
              <span style={{ fontWeight: 600, flex: 1 }}>{t.title}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {t.columns.length}列 × {t.rows.length}行
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {new Date(t.updatedAt).toLocaleDateString("ja-JP")}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTable(t.id);
                  refresh();
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                }}
              >
                ×
              </button>
            </div>
          ))}
          {tables.length === 0 && (
            <p
              style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}
            >
              テーブルがありません
            </p>
          )}
        </div>
      </div>
    );
  }

  // Table editor
  if (!table) return null;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
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
        &gt;{" "}
        <span
          style={{ cursor: "pointer", color: "var(--color-accent)" }}
          onClick={() => setActiveId(null)}
        >
          データテーブル
        </span>{" "}
        &gt; {table.title}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={table.title}
          onChange={(e) => {
            updateTable(table.id, { title: e.target.value });
            setTable({ ...table, title: e.target.value });
          }}
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            border: "none",
            background: "none",
            color: "var(--color-text-primary)",
            flex: 1,
          }}
        />
        <button
          onClick={() => setShowAddCol(!showAddCol)}
          style={{
            padding: "0.3rem 0.7rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          +列
        </button>
        <button
          onClick={() => {
            addRow(table.id);
            setTable(getTable(table.id)!);
          }}
          style={{
            padding: "0.3rem 0.7rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          +行
        </button>
        <button
          onClick={() => setShowSummary(!showSummary)}
          style={{
            padding: "0.3rem 0.7rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            backgroundColor: showSummary ? "var(--color-accent)" : "var(--color-surface)",
            color: showSummary ? "#fff" : "var(--color-text-primary)",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          集計
        </button>
        <button
          onClick={() => setShowAggPanel(!showAggPanel)}
          style={{
            padding: "0.3rem 0.7rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            backgroundColor: showAggPanel ? "var(--color-accent)" : "var(--color-surface)",
            color: showAggPanel ? "#fff" : "var(--color-text-primary)",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          集計パネル
        </button>
        <button
          onClick={() => setShowChart(!showChart)}
          style={{
            padding: "0.3rem 0.7rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            backgroundColor: showChart ? "var(--color-accent)" : "var(--color-surface)",
            color: showChart ? "#fff" : "var(--color-text-primary)",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          チャート
        </button>
        <button
          onClick={handleExportCsv}
          style={{
            padding: "0.3rem 0.7rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          CSV出力
        </button>
        <button
          onClick={() => setActiveId(null)}
          style={{
            padding: "0.3rem 0.7rem",
            borderRadius: 6,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          一覧へ
        </button>
      </div>

      {showAddCol && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
          <input
            value={colForm.label}
            onChange={(e) => setColForm({ ...colForm, label: e.target.value })}
            placeholder="列名"
            style={{ padding: "0.3rem", borderRadius: 4, border: "1px solid var(--color-border)" }}
          />
          <select
            value={colForm.type}
            onChange={(e) => setColForm({ ...colForm, type: e.target.value as ColumnDef["type"] })}
            style={{ padding: "0.3rem", borderRadius: 4, border: "1px solid var(--color-border)" }}
          >
            <option value="text">テキスト</option>
            <option value="number">数値</option>
            <option value="date">日付</option>
          </select>
          <button
            onClick={handleAddCol}
            style={{
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "0.3rem 0.7rem",
              cursor: "pointer",
            }}
          >
            追加
          </button>
        </div>
      )}

      {/* Table Grid */}
      <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid var(--color-border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--color-surface)" }}>
              <th
                style={{
                  padding: "0.5rem 0.3rem",
                  borderBottom: "2px solid var(--color-border)",
                  width: 32,
                  textAlign: "center",
                }}
              >
                #
              </th>
              {table.columns.map((col) => (
                <th
                  key={col.id}
                  style={{
                    padding: "0.5rem",
                    borderBottom: "2px solid var(--color-border)",
                    textAlign: "left",
                    minWidth: 120,
                  }}
                >
                  <span>{col.label}</span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--color-text-secondary)",
                      marginLeft: 4,
                    }}
                  >
                    ({col.type === "number" ? "数" : col.type === "date" ? "日" : "文"})
                  </span>
                  {table.columns.length > 1 && (
                    <button
                      onClick={() => {
                        removeColumn(table.id, col.id);
                        setTable(getTable(table.id)!);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.7rem",
                        marginLeft: 4,
                      }}
                    >
                      ×
                    </button>
                  )}
                </th>
              ))}
              <th style={{ width: 32, borderBottom: "2px solid var(--color-border)" }}></th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td
                  style={{
                    padding: "0.3rem",
                    textAlign: "center",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.75rem",
                  }}
                >
                  {ri + 1}
                </td>
                {table.columns.map((col) => (
                  <td key={col.id} style={{ padding: "0.2rem" }}>
                    <input
                      type={
                        col.type === "number" ? "number" : col.type === "date" ? "date" : "text"
                      }
                      value={row[col.id] || ""}
                      onChange={(e) => handleCellChange(ri, col.id, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.3rem",
                        border: "1px solid transparent",
                        borderRadius: 3,
                        background: "none",
                        color: "var(--color-text-primary)",
                        fontSize: "0.85rem",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--color-accent)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "transparent";
                      }}
                    />
                  </td>
                ))}
                <td style={{ textAlign: "center" }}>
                  {table.rows.length > 1 && (
                    <button
                      onClick={() => {
                        removeRow(table.id, ri);
                        setTable(getTable(table.id)!);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.75rem",
                      }}
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {showSummary && (
            <tfoot>
              <tr
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderTop: "2px solid var(--color-border)",
                }}
              >
                <td
                  style={{
                    padding: "0.4rem 0.3rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  計
                </td>
                {table.columns.map((col) => {
                  const count = columnCount(table, col.id);
                  if (col.type === "number") {
                    const nums = table.rows
                      .map((r) => parseFloat(r[col.id]))
                      .filter((n) => !isNaN(n));
                    const min = nums.length > 0 ? Math.min(...nums) : 0;
                    const max = nums.length > 0 ? Math.max(...nums) : 0;
                    return (
                      <td
                        key={col.id}
                        style={{ padding: "0.4rem 0.5rem", fontSize: "0.75rem", lineHeight: 1.6 }}
                      >
                        SUM: {columnSum(table, col.id).toLocaleString()}
                        <br />
                        AVG: {columnAvg(table, col.id).toFixed(1)}
                        <br />
                        MIN: {min.toLocaleString()}
                        <br />
                        MAX: {max.toLocaleString()}
                        <br />
                        COUNT: {count}
                      </td>
                    );
                  }
                  // text / date
                  const uniqueVals = new Set(
                    table.rows.map((r) => r[col.id]?.trim()).filter(Boolean),
                  );
                  return (
                    <td
                      key={col.id}
                      style={{
                        padding: "0.4rem 0.5rem",
                        fontSize: "0.75rem",
                        lineHeight: 1.6,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      COUNT: {count}
                      <br />
                      UNIQUE: {uniqueVals.size}
                    </td>
                  );
                })}
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Chart Panel */}
      {showChart &&
        (() => {
          const numCol = table.columns.find((c) => c.type === "number");
          const labelCol = table.columns.find((c) => c.type === "text") || table.columns[0];
          if (!numCol)
            return (
              <div
                style={{
                  marginTop: "1rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "1rem",
                }}
              >
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                  チャートを表示するには数値列が必要です
                </p>
              </div>
            );
          const labels = table.rows.map((r) => r[labelCol.id] || "");
          const values = table.rows.map((r) => parseFloat(r[numCol.id]) || 0);
          const maxVal = Math.max(...values, 1);
          const total = values.reduce((a, b) => a + b, 0);
          const W = 500,
            H = 300,
            PAD = 50;
          const chartW = W - PAD * 2,
            chartH = H - PAD * 2;
          const COLORS = [
            "#0369A1",
            "#059669",
            "#D97706",
            "#DC2626",
            "#7C3AED",
            "#DB2777",
            "#0891B2",
            "#65A30D",
            "#EA580C",
            "#4F46E5",
          ];

          return (
            <div
              style={{
                marginTop: "1rem",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0, flex: 1 }}>
                  チャート: {numCol.label}
                </h3>
                {(["bar", "line", "pie"] as const).map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setChartType(ct)}
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: 4,
                      border: "1px solid var(--color-border)",
                      backgroundColor:
                        chartType === ct ? "var(--color-accent)" : "var(--color-surface)",
                      color: chartType === ct ? "#fff" : "var(--color-text-primary)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    {ct === "bar" ? "棒グラフ" : ct === "line" ? "折れ線" : "円グラフ"}
                  </button>
                ))}
                <button
                  onClick={() => setShowChart(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.85rem",
                  }}
                >
                  閉じる
                </button>
              </div>
              <div style={{ padding: "1rem", display: "flex", justifyContent: "center" }}>
                {chartType === "bar" && (
                  <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, maxHeight: H }}>
                    {/* Y axis grid */}
                    {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                      <g key={f}>
                        <line
                          x1={PAD}
                          y1={PAD + chartH * (1 - f)}
                          x2={W - PAD}
                          y2={PAD + chartH * (1 - f)}
                          stroke="var(--color-border)"
                          strokeWidth="0.5"
                        />
                        <text
                          x={PAD - 5}
                          y={PAD + chartH * (1 - f) + 4}
                          textAnchor="end"
                          fontSize="9"
                          fill="var(--color-text-secondary)"
                        >
                          {Math.round(maxVal * f)}
                        </text>
                      </g>
                    ))}
                    {/* Bars */}
                    {values.map((v, i) => {
                      const bw = Math.max(chartW / values.length - 4, 8);
                      const x =
                        PAD + (chartW / values.length) * i + (chartW / values.length - bw) / 2;
                      const barH = (v / maxVal) * chartH;
                      return (
                        <g key={i}>
                          <rect
                            x={x}
                            y={PAD + chartH - barH}
                            width={bw}
                            height={barH}
                            fill={COLORS[i % COLORS.length]}
                            rx="2"
                          />
                          <text
                            x={x + bw / 2}
                            y={H - 5}
                            textAnchor="middle"
                            fontSize="8"
                            fill="var(--color-text-secondary)"
                          >
                            {(labels[i] || "").slice(0, 6)}
                          </text>
                          <text
                            x={x + bw / 2}
                            y={PAD + chartH - barH - 4}
                            textAnchor="middle"
                            fontSize="8"
                            fill="var(--color-text-primary)"
                          >
                            {v}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
                {chartType === "line" && (
                  <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, maxHeight: H }}>
                    {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                      <g key={f}>
                        <line
                          x1={PAD}
                          y1={PAD + chartH * (1 - f)}
                          x2={W - PAD}
                          y2={PAD + chartH * (1 - f)}
                          stroke="var(--color-border)"
                          strokeWidth="0.5"
                        />
                        <text
                          x={PAD - 5}
                          y={PAD + chartH * (1 - f) + 4}
                          textAnchor="end"
                          fontSize="9"
                          fill="var(--color-text-secondary)"
                        >
                          {Math.round(maxVal * f)}
                        </text>
                      </g>
                    ))}
                    {values.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="2"
                        points={values
                          .map((v, i) => {
                            const x = PAD + (chartW / (values.length - 1)) * i;
                            const y = PAD + chartH - (v / maxVal) * chartH;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                    )}
                    {values.map((v, i) => {
                      const x =
                        values.length > 1
                          ? PAD + (chartW / (values.length - 1)) * i
                          : PAD + chartW / 2;
                      const y = PAD + chartH - (v / maxVal) * chartH;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="4" fill="var(--color-accent)" />
                          <text
                            x={x}
                            y={y - 8}
                            textAnchor="middle"
                            fontSize="8"
                            fill="var(--color-text-primary)"
                          >
                            {v}
                          </text>
                          <text
                            x={x}
                            y={H - 5}
                            textAnchor="middle"
                            fontSize="8"
                            fill="var(--color-text-secondary)"
                          >
                            {(labels[i] || "").slice(0, 6)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
                {chartType === "pie" &&
                  (() => {
                    const cx = W / 2,
                      cy = H / 2,
                      r = Math.min(chartW, chartH) / 2 - 10;
                    let cumAngle = -Math.PI / 2;
                    return (
                      <svg
                        viewBox={`0 0 ${W} ${H}`}
                        width="100%"
                        style={{ maxWidth: W, maxHeight: H }}
                      >
                        {values.map((v, i) => {
                          if (total === 0) return null;
                          const angle = (v / total) * Math.PI * 2;
                          const startX = cx + r * Math.cos(cumAngle);
                          const startY = cy + r * Math.sin(cumAngle);
                          cumAngle += angle;
                          const endX = cx + r * Math.cos(cumAngle);
                          const endY = cy + r * Math.sin(cumAngle);
                          const largeArc = angle > Math.PI ? 1 : 0;
                          const midAngle = cumAngle - angle / 2;
                          const labelR = r + 15;
                          const lx = cx + labelR * Math.cos(midAngle);
                          const ly = cy + labelR * Math.sin(midAngle);
                          return (
                            <g key={i}>
                              <path
                                d={`M ${cx} ${cy} L ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} Z`}
                                fill={COLORS[i % COLORS.length]}
                                stroke="#fff"
                                strokeWidth="1"
                              />
                              <text
                                x={lx}
                                y={ly}
                                textAnchor="middle"
                                fontSize="8"
                                fill="var(--color-text-primary)"
                              >
                                {(labels[i] || "").slice(0, 4)} {Math.round((v / total) * 100)}%
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
              </div>
            </div>
          );
        })()}

      {/* Aggregation Panel */}
      {showAggPanel && (
        <div
          style={{
            marginTop: "1rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>集計パネル</h3>
            <button
              onClick={() => setShowAggPanel(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              閉じる
            </button>
          </div>
          <div
            style={{
              padding: "1rem",
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(table.columns.length, 3)}, 1fr)`,
              gap: "1rem",
            }}
          >
            {table.columns.map((col) => {
              const count = columnCount(table, col.id);
              if (col.type === "number") {
                const nums = table.rows.map((r) => parseFloat(r[col.id])).filter((n) => !isNaN(n));
                const sum = columnSum(table, col.id);
                const avg = columnAvg(table, col.id);
                const min = nums.length > 0 ? Math.min(...nums) : 0;
                const max = nums.length > 0 ? Math.max(...nums) : 0;
                // Value distribution: split into 5 buckets
                const range = max - min || 1;
                const bucketCount = 5;
                const buckets = Array(bucketCount).fill(0);
                for (const n of nums) {
                  const idx = Math.min(
                    Math.floor(((n - min) / range) * bucketCount),
                    bucketCount - 1,
                  );
                  buckets[idx]++;
                }
                const maxBucket = Math.max(...buckets, 1);
                return (
                  <div
                    key={col.id}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: 6,
                      padding: "0.75rem",
                    }}
                  >
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                      {col.label}{" "}
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 400,
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        (数値)
                      </span>
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.25rem 0.75rem",
                        fontSize: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span>
                        SUM: <b>{sum.toLocaleString()}</b>
                      </span>
                      <span>
                        AVG: <b>{avg.toFixed(1)}</b>
                      </span>
                      <span>
                        MIN: <b>{min.toLocaleString()}</b>
                      </span>
                      <span>
                        MAX: <b>{max.toLocaleString()}</b>
                      </span>
                      <span>
                        COUNT: <b>{count}</b>
                      </span>
                    </div>
                    {/* Mini bar chart - value distribution */}
                    {nums.length > 0 && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.65rem",
                            color: "var(--color-text-secondary)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          分布
                        </p>
                        <div
                          style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 32 }}
                        >
                          {buckets.map((b, i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  backgroundColor: "var(--color-accent)",
                                  borderRadius: "2px 2px 0 0",
                                  height: `${(b / maxBucket) * 28}px`,
                                  minHeight: b > 0 ? 3 : 0,
                                  opacity: b > 0 ? 1 : 0.2,
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.6rem",
                            color: "var(--color-text-secondary)",
                            marginTop: 2,
                          }}
                        >
                          <span>{min}</span>
                          <span>{max}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              // text / date columns
              const uniqueVals = new Set(table.rows.map((r) => r[col.id]?.trim()).filter(Boolean));
              // Top values for text columns
              const valueCounts: Record<string, number> = {};
              for (const r of table.rows) {
                const v = r[col.id]?.trim();
                if (v) valueCounts[v] = (valueCounts[v] || 0) + 1;
              }
              const topValues = Object.entries(valueCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
              const maxValCount = topValues.length > 0 ? topValues[0][1] : 1;
              return (
                <div
                  key={col.id}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    padding: "0.75rem",
                  }}
                >
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    {col.label}{" "}
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 400,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      ({col.type === "date" ? "日付" : "テキスト"})
                    </span>
                  </p>
                  <div style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                    <span>
                      COUNT: <b>{count}</b>
                    </span>
                    <span style={{ marginLeft: "0.75rem" }}>
                      UNIQUE: <b>{uniqueVals.size}</b>
                    </span>
                  </div>
                  {/* Top values with inline bars */}
                  {topValues.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontSize: "0.65rem",
                          color: "var(--color-text-secondary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        上位値
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {topValues.map(([val, cnt]) => (
                          <div
                            key={val}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: "0.7rem",
                            }}
                          >
                            <span
                              style={{
                                minWidth: 60,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={val}
                            >
                              {val}
                            </span>
                            <div
                              style={{
                                flex: 1,
                                backgroundColor: "var(--color-border)",
                                borderRadius: 2,
                                height: 10,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${(cnt / maxValCount) * 100}%`,
                                  height: "100%",
                                  backgroundColor: "var(--color-accent)",
                                  borderRadius: 2,
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: "0.65rem",
                                color: "var(--color-text-secondary)",
                                minWidth: 16,
                                textAlign: "right",
                              }}
                            >
                              {cnt}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
