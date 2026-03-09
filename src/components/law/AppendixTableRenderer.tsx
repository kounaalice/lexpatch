import type { AppendixTable } from "@/lib/egov/types";

/**
 * 別表(AppendixTable) を HTML テーブルで描画
 */
export function AppendixTableRenderer({ table }: { table: AppendixTable }) {
  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "0.95rem",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "0.3rem",
          color: "var(--color-text-primary)",
        }}
      >
        {table.title}
      </h3>
      {table.relatedArticle && (
        <p
          style={{
            textAlign: "center",
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
            marginBottom: "0.5rem",
          }}
        >
          {table.relatedArticle}
        </p>
      )}
      {table.rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.82rem",
              lineHeight: 1.6,
              border: "1px solid var(--color-border)",
            }}
          >
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.columns.map((col, ci) => (
                    <td
                      key={ci}
                      colSpan={col.colspan}
                      rowSpan={col.rowspan}
                      style={{
                        border: "1px solid var(--color-border)",
                        padding: "0.4rem 0.6rem",
                        verticalAlign: "top",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {col.text}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
