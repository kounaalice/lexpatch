// Server Component — バージョン履歴の折りたたみ表示

interface CanonVersion {
  id: string;
  version: string;
  released_at: string;
}

function fmtVersionDate(d: string): string {
  const m = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return d;
  return `${m[1]}年${parseInt(m[2])}月${parseInt(m[3])}日`;
}

export function CanonVersionHistory({ versions }: { versions: CanonVersion[] }) {
  if (versions.length === 0) return null;

  return (
    <details style={{ marginTop: "0.75rem" }}>
      <summary
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.78rem",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        バージョン履歴 ({versions.length})
      </summary>
      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        {versions.map((v, i) => (
          <div
            key={v.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.35rem 0.75rem",
              backgroundColor: i === 0 ? "rgba(2,132,199,0.06)" : "transparent",
              borderRadius: "4px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
            }}
          >
            {i === 0 && (
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  border: "1px solid var(--color-accent)",
                  borderRadius: "3px",
                  padding: "0 0.3rem",
                  whiteSpace: "nowrap",
                }}
              >
                最新
              </span>
            )}
            <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
              {fmtVersionDate(v.version)}
            </span>
            <span style={{ color: "var(--color-text-secondary)", fontSize: "0.72rem" }}>
              取得：{new Date(v.released_at).toLocaleDateString("ja-JP")}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}
