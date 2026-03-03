import Link from "next/link";
import { getCategoryBySlug, LAW_CATEGORIES } from "@/lib/categories";
import { searchLaws } from "@/lib/egov/client";
import type { LawSearchResult } from "@/lib/egov/types";
import { MINISTRY_BY_GROUP } from "@/lib/ministries";
import { getPrefectureBySlug, PREFECTURES, REGIONS, getOfficeLabel } from "@/lib/prefectures";
import { getMunicipalitiesByPrefecture, getMunicipalitiesGrouped } from "@/lib/municipalities";
import CategoryLawList from "@/components/CategoryLawList";

// ISR: カテゴリページは24時間キャッシュ
export const revalidate = 86400;

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

  const isJorei = slug.startsWith("jorei-");
  const prefecture = isJorei ? getPrefectureBySlug(slug) : null;
  const municipalities = isJorei ? getMunicipalitiesByPrefecture(slug) : [];
  const municipalityGroups = isJorei ? getMunicipalitiesGrouped(slug) : [];
  const muniLabel = slug === "jorei-tokyo" ? "市区町村" : "市町村";

  let laws: LawSearchResult[] = [];
  let errorMessage = "";
  // 条例カテゴリの場合もe-Gov検索を試みる（関連法令表示のため）
  try {
    const result = await searchLaws(category.searchKeyword, isJorei ? 20 : 40);
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
            {isJorei && prefecture
              ? `${prefecture.name}の条例・例規集へのリンクと関連法令`
              : `「${category.searchKeyword}」に関連する法令 — ${laws.length} 件表示`
            }
          </p>
        </div>
      </div>

      {/* 所管省庁リンク */}
      {(MINISTRY_BY_GROUP[group.id] ?? []).length > 0 && (
        <div style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "0.5rem 2rem",
        }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>所管省庁:</span>
            {(MINISTRY_BY_GROUP[group.id] ?? []).map((m) => (
              <a
                key={m.name}
                href={m.lawPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "#8B7355",
                  textDecoration: "none",
                  border: "1px solid #C4A97A",
                  borderRadius: "4px",
                  padding: "0.1rem 0.5rem",
                  whiteSpace: "nowrap",
                }}
              >
                {m.name} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 都道府県・市町村の公式リンクバー */}
      {isJorei && prefecture && (
        <div style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "0.5rem 2rem",
        }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>公式サイト:</span>
            <a
              href={prefecture.topUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                color: "#7C3AED",
                textDecoration: "none",
                border: "1px solid #7C3AED66",
                borderRadius: "4px",
                padding: "0.1rem 0.5rem",
                whiteSpace: "nowrap",
                fontWeight: 600,
              }}
            >
              {prefecture.name}公式 ↗
            </a>
            {municipalities.slice(0, 8).map((m) => (
              <a
                key={m.slug}
                href={m.topUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  padding: "0.1rem 0.5rem",
                  whiteSpace: "nowrap",
                }}
              >
                {m.name} ↗
              </a>
            ))}
            {municipalities.length > 8 && (
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "var(--color-text-secondary)", opacity: 0.7 }}>
                他{municipalities.length - 8}{muniLabel} ↓
              </span>
            )}
          </div>
        </div>
      )}

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

      {/* 条例: 都道府県リンク + 他の都道府県 */}
      {isJorei && prefecture && (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem 2rem 0" }}>
          {/* 公式サイトリンク */}
          <div style={{
            padding: "1.25rem 1.5rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "0.5rem",
            }}>
              {prefecture.name}の条例・例規集
            </div>
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
              margin: "0 0 0.75rem",
              lineHeight: 1.6,
            }}>
              {prefecture.name}の公式サイトから例規集・条例データベースにアクセスできます。条例の正確な内容は各自治体の公式サイトをご確認ください。
            </p>
            <a
              href={prefecture.topUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "0.5rem 1.25rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {prefecture.name}公式サイト ↗
            </a>
          </div>

          {/* 市町村（地域区分別） */}
          {municipalityGroups.length > 0 && (
            <div style={{
              padding: "1.25rem 1.5rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              marginBottom: "1.5rem",
            }}>
              <div style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.25rem",
              }}>
                {prefecture.name}の{muniLabel}
              </div>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
                margin: "0 0 0.75rem",
                lineHeight: 1.5,
              }}>
                各{muniLabel}の公式サイトから例規集・条例にアクセスできます。
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {municipalityGroups.map(([region, munis]) => (
                  <div key={region}>
                    <div style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--color-text-secondary)",
                      marginBottom: "0.35rem",
                      paddingBottom: "0.2rem",
                      borderBottom: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}>
                      <span>{region}</span>
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        fontWeight: 400,
                        color: "var(--color-text-secondary)",
                        opacity: 0.7,
                      }}>
                        {munis.length}
                      </span>
                    </div>
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.4rem",
                    }}>
                      {munis.map((m) => (
                        <a
                          key={m.slug}
                          href={m.topUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            padding: "0.3rem 0.7rem",
                            backgroundColor: "var(--color-bg)",
                            color: m.isCapital || m.isDesignated ? "var(--color-accent)" : "var(--color-text-primary)",
                            border: `1px solid ${m.isCapital || m.isDesignated ? "var(--color-accent)" : "var(--color-border)"}`,
                            borderRadius: "6px",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.8rem",
                            fontWeight: m.isCapital || m.isDesignated ? 600 : 400,
                            textDecoration: "none",
                            transition: "border-color 0.15s",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.name}
                          {m.isCapital && (
                            <span style={{
                              fontSize: "0.6rem",
                              padding: "0 0.25rem",
                              backgroundColor: "#1B4B8A",
                              color: "#fff",
                              borderRadius: "3px",
                            }}>{getOfficeLabel(slug)}</span>
                          )}
                          {m.isDesignated && (
                            <span style={{
                              fontSize: "0.6rem",
                              padding: "0 0.25rem",
                              backgroundColor: "#7C3AED",
                              color: "#fff",
                              borderRadius: "3px",
                            }}>政令市</span>
                          )}
                          <span style={{ fontSize: "0.65rem", opacity: 0.5 }}>↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 他の都道府県 */}
          <div style={{
            padding: "1rem 1.25rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "0.75rem",
            }}>
              他の都道府県
            </div>
            {REGIONS.map((region) => {
              const prefs = PREFECTURES.filter((p) => p.region === region);
              return (
                <div key={region} style={{ marginBottom: "0.5rem" }}>
                  <span style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--color-text-secondary)",
                    marginRight: "0.5rem",
                  }}>
                    {region}:
                  </span>
                  {prefs.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/category/${p.slug}`}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        color: p.slug === slug ? "var(--color-accent)" : "var(--color-text-secondary)",
                        fontWeight: p.slug === slug ? 700 : 400,
                        textDecoration: "none",
                        marginRight: "0.5rem",
                      }}
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

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

        {laws.length > 0 && (
          <CategoryLawList laws={laws} groupBg={group.bg} groupColor={group.color} />
        )}
      </div>
    </div>
  );
}
