import Link from "next/link";
import { getCategoryBySlug, LAW_CATEGORIES } from "@/lib/categories";
import { searchLaws } from "@/lib/egov/client";
import type { LawSearchResult } from "@/lib/egov/types";

export async function generateStaticParams() {
  return LAW_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>カテゴリが見つかりません。</p>
        <Link href="/" style={{ color: "var(--color-accent)" }}>← トップへ</Link>
      </div>
    );
  }

  let laws: LawSearchResult[] = [];
  let errorMessage = "";
  try {
    const result = await searchLaws(category.searchKeyword, 40);
    laws = result.laws;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "取得エラー";
  }

  const { group } = category;

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダ */}
      <div style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "1.25rem 2rem",
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {/* パンくず */}
          <nav style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}>
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>トップ</Link>
            <span>›</span>
            <span style={{
              padding: "0.1rem 0.5rem",
              backgroundColor: group.bg,
              color: group.color,
              borderRadius: "3px",
              fontSize: "0.75rem",
            }}>
              {group.label}
            </span>
            <span>›</span>
            <span>{category.label}</span>
          </nav>

          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.6rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.25rem",
          }}>
            {category.label}
          </h1>
          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
          }}>
            「{category.searchKeyword}」に関連する法令 — {laws.length} 件表示
          </p>
        </div>
      </div>

      {/* 同グループの他カテゴリ */}
      <div style={{
        backgroundColor: group.bg,
        borderBottom: `1px solid ${group.color}33`,
        padding: "0.6rem 2rem",
      }}>
        <div style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.4rem",
          alignItems: "center",
        }}>
          <span style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            color: group.color,
            fontWeight: 700,
            marginRight: "0.25rem",
          }}>
            {group.label}:
          </span>
          {LAW_CATEGORIES.filter((c) => c.group.id === group.id).map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              style={{
                padding: "0.2rem 0.6rem",
                borderRadius: "12px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                textDecoration: "none",
                backgroundColor: c.slug === slug ? group.color : "transparent",
                color: c.slug === slug ? "#fff" : group.color,
                border: `1px solid ${group.color}66`,
              }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 法令一覧 */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem 2rem" }}>
        {errorMessage && (
          <div style={{
            padding: "0.75rem 1rem",
            backgroundColor: "var(--color-del-bg)",
            color: "var(--color-del-fg)",
            borderRadius: "6px",
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}>
            {errorMessage}
          </div>
        )}

        {laws.length === 0 && !errorMessage && (
          <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>
            該当する法令が見つかりませんでした。
          </p>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "0.5rem",
        }}>
          {laws.map((law) => (
            <Link
              key={law.law_id}
              href={`/law/${encodeURIComponent(law.law_id)}`}
              style={{
                display: "block",
                padding: "0.875rem 1rem",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                textDecoration: "none",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.2rem",
              }}>
                {law.law_title || "（タイトルなし）"}
              </div>
              <div style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
                display: "flex",
                justifyContent: "space-between",
              }}>
                <span>{law.law_num}</span>
                <span style={{
                  padding: "0.05rem 0.4rem",
                  backgroundColor: group.bg,
                  color: group.color,
                  borderRadius: "3px",
                  fontSize: "0.72rem",
                }}>
                  {law.law_type === "Act" ? "法律" :
                   law.law_type === "CabinetOrder" ? "政令" :
                   law.law_type === "MinisterialOrdinance" ? "省令" : law.law_type}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
