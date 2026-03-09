/**
 * データテーブル — localStorage管理
 * C-V-1: 軽量表計算 + C-V-3: CSV取込・出力
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface DataTable {
  id: string;
  title: string;
  columns: ColumnDef[];
  rows: Record<string, string>[];
  createdAt: string;
  updatedAt: string;
}

export interface ColumnDef {
  id: string;
  label: string;
  type: "text" | "number" | "date";
  width?: number;
}

const STORAGE_KEY = "lp_ws_datatables";

function load(): DataTable[] {
  return wsLoad<DataTable[]>(STORAGE_KEY, []);
}
function save(tables: DataTable[]) {
  wsSave(STORAGE_KEY, tables);
}

export function getAllTables(): DataTable[] {
  return load().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getTable(id: string): DataTable | undefined {
  return load().find((t) => t.id === id);
}

export function createTable(title: string, columns?: ColumnDef[]): DataTable {
  const tables = load();
  const now = new Date().toISOString();
  const table: DataTable = {
    id: uuid(),
    title,
    columns: columns || [
      { id: "col_1", label: "列A", type: "text" },
      { id: "col_2", label: "列B", type: "text" },
      { id: "col_3", label: "列C", type: "text" },
    ],
    rows: [{}],
    createdAt: now,
    updatedAt: now,
  };
  tables.push(table);
  save(tables);
  return table;
}

export function updateTable(id: string, updates: Partial<DataTable>) {
  const tables = load();
  const idx = tables.findIndex((t) => t.id === id);
  if (idx >= 0) {
    tables[idx] = { ...tables[idx], ...updates, updatedAt: new Date().toISOString() };
    save(tables);
  }
}

export function deleteTable(id: string) {
  save(load().filter((t) => t.id !== id));
}

/** 列追加 */
export function addColumn(tableId: string, label: string, type: ColumnDef["type"] = "text") {
  const table = getTable(tableId);
  if (!table) return;
  const col: ColumnDef = { id: `col_${Date.now()}`, label, type };
  updateTable(tableId, { columns: [...table.columns, col] });
}

/** 列削除 */
export function removeColumn(tableId: string, colId: string) {
  const table = getTable(tableId);
  if (!table) return;
  const columns = table.columns.filter((c) => c.id !== colId);
  const rows = table.rows.map((r) => {
    const nr = { ...r };
    delete nr[colId];
    return nr;
  });
  updateTable(tableId, { columns, rows });
}

/** 行追加 */
export function addRow(tableId: string) {
  const table = getTable(tableId);
  if (!table) return;
  updateTable(tableId, { rows: [...table.rows, {}] });
}

/** 行削除 */
export function removeRow(tableId: string, rowIndex: number) {
  const table = getTable(tableId);
  if (!table) return;
  const rows = [...table.rows];
  rows.splice(rowIndex, 1);
  updateTable(tableId, { rows });
}

/** セル値更新 */
export function setCellValue(tableId: string, rowIndex: number, colId: string, value: string) {
  const table = getTable(tableId);
  if (!table) return;
  const rows = [...table.rows];
  rows[rowIndex] = { ...rows[rowIndex], [colId]: value };
  updateTable(tableId, { rows });
}

// ── 集計関数 ──

export function columnSum(table: DataTable, colId: string): number {
  return table.rows.reduce((sum, r) => sum + (parseFloat(r[colId]) || 0), 0);
}

export function columnAvg(table: DataTable, colId: string): number {
  const nums = table.rows.map((r) => parseFloat(r[colId])).filter((n) => !isNaN(n));
  return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

export function columnCount(table: DataTable, colId: string): number {
  return table.rows.filter((r) => r[colId]?.trim()).length;
}

// ── CSV ──

/** CSV出力（UTF-8 BOM付き、Excel対応） */
export function exportCsv(table: DataTable): string {
  const bom = "\uFEFF";
  const header = table.columns.map((c) => escapeCsvField(c.label)).join(",");
  const rows = table.rows.map((r) =>
    table.columns.map((c) => escapeCsvField(r[c.id] || "")).join(","),
  );
  return bom + [header, ...rows].join("\n");
}

function escapeCsvField(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/** CSV取込 */
export function importCsv(csvText: string, tableId?: string): DataTable {
  const text = csvText.replace(/^\uFEFF/, ""); // BOM除去
  const lines = parseCsvLines(text);
  if (lines.length === 0) throw new Error("CSVが空です");

  const headerRow = lines[0];
  const columns: ColumnDef[] = headerRow.map((label, i) => ({
    id: `col_${i + 1}`,
    label: label.trim() || `列${i + 1}`,
    type: "text" as const,
  }));

  const rows: Record<string, string>[] = lines.slice(1).map((line) => {
    const row: Record<string, string> = {};
    columns.forEach((col, i) => {
      row[col.id] = line[i] || "";
    });
    return row;
  });

  // 数値列自動検出
  for (const col of columns) {
    const vals = rows.map((r) => r[col.id]).filter((v) => v.trim());
    if (vals.length > 0 && vals.every((v) => !isNaN(parseFloat(v)))) {
      col.type = "number";
    }
  }

  if (tableId) {
    updateTable(tableId, { columns, rows });
    return getTable(tableId)!;
  }

  const now = new Date().toISOString();
  const table: DataTable = {
    id: uuid(),
    title: "インポートデータ",
    columns,
    rows,
    createdAt: now,
    updatedAt: now,
  };
  const tables = load();
  tables.push(table);
  save(tables);
  return table;
}

/** CSV行パーサー（引用符対応） */
function parseCsvLines(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        if (ch === "\r") i++;
        row.push(field);
        field = "";
        if (row.some((f) => f.trim())) result.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }
  row.push(field);
  if (row.some((f) => f.trim())) result.push(row);
  return result;
}
