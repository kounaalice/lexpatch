import { LAW_REF_MAP } from "@/lib/lawrefs";
import Link from "next/link";

/**
 * 法令が参照している他の法令を一覧表示するコンポーネント（サーバーコンポーネント）
 */
export function ReferencesSection({
  fullText,
  currentLawId,
}: {
  fullText: string;
  currentLawId: string;
}) {
  // 全文テキストから参照法令を抽出
  const refs = new Map<string, { name: string; lawId: string; count: number }>();

  for (const [name, lawId] of Object.entries(LAW_REF_MAP)) {
    if (lawId === currentLawId) continue; // 自法令を除外
    // 完全一致ではなくテキスト内に含まれるかチェック
    const regex = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const matches = fullText.match(regex);
    if (matches && matches.length > 0) {
      // 重複 lawId は統合（短縮名と正式名が同じ法令IDの場合）
      const existing = refs.get(lawId);
      if (existing) {
        existing.count += matches.length;
        // より長い名前を優先
        if (name.length > existing.name.length) {
          existing.name = name;
        }
      } else {
        refs.set(lawId, { name, lawId, count: matches.length });
      }
    }
  }

  if (refs.size === 0) return null;

  // 参照回数の多い順にソート
  const sorted = Array.from(refs.values()).sort((a, b) => b.count - a.count);

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "1rem 2rem",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.88rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "3px",
              height: "0.9rem",
              backgroundColor: "var(--color-accent)",
              borderRadius: "2px",
            }}
          />
          参照法令 ({sorted.length})
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
          }}
        >
          {sorted.map((ref) => (
            <Link
              key={ref.lawId}
              href={`/law/${encodeURIComponent(ref.lawId)}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.3rem 0.6rem",
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-primary)",
                transition: "border-color 0.15s",
              }}
            >
              {ref.name}
              <span
                style={{
                  fontSize: "0.62rem",
                  color: "var(--color-text-secondary)",
                  backgroundColor: "var(--color-surface)",
                  padding: "0.05rem 0.3rem",
                  borderRadius: "3px",
                  border: "1px solid var(--color-border)",
                }}
              >
                {ref.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
