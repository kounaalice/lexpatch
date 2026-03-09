"use client";

import type { SideBySideRow } from "@/lib/patch/types";

// ASCII 数字 → 全角数字変換
function toFullWidth(s: string): string {
  return s.replace(/[0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
}

export function SideBySideView({
  rows,
  leftHeader = "現行",
  rightHeader = "改正案",
}: {
  rows: SideBySideRow[];
  leftHeader?: string;
  rightHeader?: string;
}) {
  return (
    <div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "var(--font-mono)",
          fontSize: "0.78rem",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "var(--color-bg)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <th
              style={{
                padding: "0.3rem 0.5rem",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                textAlign: "left",
                width: "50%",
              }}
            >
              {leftHeader}
            </th>
            <th
              style={{
                padding: "0.3rem 0.5rem",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                textAlign: "left",
                width: "50%",
                borderLeft: "1px solid var(--color-border)",
              }}
            >
              {rightHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            // 第１項は非表示（半角 "1" / 全角 "１" どちらも対応）
            const isFirst = (n: string | null | undefined) => !n || n === "1" || n === "１";
            const leftNum = row.left?.num && !isFirst(row.left.num) ? row.left.num : null;
            const rightNum = row.right?.num && !isFirst(row.right.num) ? row.right.num : null;
            return (
              <tr key={i}>
                <td
                  style={{
                    padding: "0.2rem 0.5rem",
                    backgroundColor: row.op === "del" ? "var(--color-del-bg)" : "transparent",
                    color: row.op === "del" ? "var(--color-del-fg)" : "var(--color-text-primary)",
                    lineHeight: 1.7,
                    verticalAlign: "top",
                  }}
                >
                  {row.left ? (
                    <>
                      {leftNum && (
                        <span style={{ marginRight: "0.3rem", opacity: 0.6 }}>
                          {toFullWidth(leftNum)}
                        </span>
                      )}
                      {row.left.text}
                    </>
                  ) : (
                    <span style={{ color: "var(--color-border)" }}>—</span>
                  )}
                </td>
                <td
                  style={{
                    padding: "0.2rem 0.5rem",
                    backgroundColor:
                      row.op === "add" || row.op === "del" ? "var(--color-add-bg)" : "transparent",
                    color:
                      row.op === "add" || row.op === "del"
                        ? "var(--color-add-fg)"
                        : "var(--color-text-primary)",
                    lineHeight: 1.7,
                    verticalAlign: "top",
                    borderLeft: "1px solid var(--color-border)",
                  }}
                >
                  {row.right ? (
                    <>
                      {rightNum && (
                        <span style={{ marginRight: "0.3rem", opacity: 0.6 }}>
                          {toFullWidth(rightNum)}
                        </span>
                      )}
                      {row.right.text}
                    </>
                  ) : (
                    <span style={{ color: "var(--color-border)" }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
