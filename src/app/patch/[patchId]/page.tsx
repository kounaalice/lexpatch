import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PatchActions } from "./PatchActions";
import { DirectEditDiffView } from "./DirectEditDiffView";
import { LintPanel } from "./LintPanel";

const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  下書き: { fg: "#475569", bg: "#F1F5F9" },
  提案中: { fg: "#D97706", bg: "#FFFBEB" },
  採択済: { fg: "#059669", bg: "#ECFDF5" },
};

export default async function PatchDetailPage({
  params,
}: {
  params: Promise<{ patchId: string }>;
}) {
  const { patchId } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ color: "var(--color-del-fg)" }}>Supabase が未設定です。</p>
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          ← トップに戻る
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: patch, error } = await (supabase as any)
    .from("patches")
    .select("*, sources(*)")
    .eq("id", patchId)
    .single();

  if (error || !patch) notFound();

  const statusColor = STATUS_COLORS[patch.status] ?? STATUS_COLORS["下書き"];

  // plain_text から行をパースして色付き表示
  const patchLines = (patch.plain_text as string).split("\n").map((line: string) => {
    if (line.startsWith("+")) return { op: "add", text: line };
    if (line.startsWith("-")) return { op: "del", text: line };
    return { op: "ctx", text: line };
  });

  const addCount = patchLines.filter((l) => l.op === "add").length;
  const delCount = patchLines.filter((l) => l.op === "del").length;

  const sources = (patch.sources ?? []) as Array<{
    id: string;
    tier: string;
    label: string;
    url: string | null;
    excerpt: string | null;
  }>;

  const TIER_COLORS: Record<string, { fg: string; bg: string }> = {
    一次: { fg: "var(--color-accent)", bg: "var(--color-add-bg)" },
    準一次: { fg: "#1B4B8A", bg: "#EBF2FD" },
    二次: { fg: "var(--color-warn-fg)", bg: "var(--color-warn-bg)" },
    三次: { fg: "var(--color-text-secondary)", bg: "var(--color-bg)" },
  };

  const createdAt = new Date(patch.created_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダ */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          padding: "1.25rem 1.25rem 0.25rem",
        }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>›</span>
            {patch.law_id && (
              <>
                <Link
                  href={`/law/${encodeURIComponent(patch.law_id)}`}
                  style={{ color: "var(--color-accent)", textDecoration: "none" }}
                >
                  法令
                </Link>
                <span>›</span>
              </>
            )}
            <span>改正案</span>
          </nav>

          {/* 法律名（あれば） */}
          {patch.law_title && (
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                margin: "0 0 0.1rem",
              }}
            >
              {patch.law_title}
            </p>
          )}

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.4rem",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            {patch.title}
          </h1>
        </div>
      </div>

      {/* メインコンテンツ（白背景、全幅） */}
      <div style={{ backgroundColor: "var(--color-surface)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1.25rem 2rem" }}>
          {/* アクションボタン行（条文ページと同じスタイル） */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginBottom: "0.3rem",
            }}
          >
            {patch.law_id && patch.target_articles?.[0] && (
              <Link
                href={`/law/${encodeURIComponent(patch.law_id)}/article/${encodeURIComponent(patch.target_articles[0])}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  lineHeight: 1,
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  border: "1px solid var(--color-accent)",
                  borderRadius: "4px",
                  padding: "0.1rem 0.5rem",
                  opacity: 0.85,
                }}
              >
                条文を見る →
              </Link>
            )}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                padding: "0.15rem 0.6rem",
                borderRadius: "4px",
                backgroundColor: statusColor.bg,
                color: statusColor.fg,
                fontWeight: 600,
              }}
            >
              {patch.status}
            </span>
            {addCount > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--color-add-fg)",
                  backgroundColor: "var(--color-add-bg)",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "3px",
                }}
              >
                +{addCount}
              </span>
            )}
            {delCount > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--color-del-fg)",
                  backgroundColor: "var(--color-del-bg)",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "3px",
                }}
              >
                -{delCount}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {createdAt}
            </span>
          </div>

          {/* 対象条文バッジ */}
          {patch.target_articles?.length > 0 && (
            <div
              style={{ marginBottom: "0.5rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}
            >
              {(patch.target_articles as string[]).map((a) => (
                <span
                  key={a}
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.82rem",
                    padding: "0.15rem 0.6rem",
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          {/* 改正理由 */}
          {patch.description && (
            <div
              style={{
                marginBottom: "0.75rem",
                padding: "0.75rem 1rem",
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  color: "var(--color-text-primary)",
                  lineHeight: 1.75,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {patch.description}
              </p>
            </div>
          )}

          {/* パッチ本文: 直接編集パッチは新旧対照表、レガシーは+/-記法 */}
          {patch.structured?.mode === "direct" &&
          patch.structured?.original &&
          patch.structured?.edited ? (
            <DirectEditDiffView
              original={patch.structured.original as string}
              edited={patch.structured.edited as string}
            />
          ) : (
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                overflow: "hidden",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  backgroundColor: "#0C2340",
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.72rem",
                  color: "rgba(186,230,253,0.6)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {patch.target_articles?.[0] ?? "patch"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.82rem",
                  lineHeight: 1.8,
                  backgroundColor: "var(--color-bg)",
                }}
              >
                {patchLines.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "0.05rem 0.75rem",
                      backgroundColor:
                        l.op === "add"
                          ? "var(--color-add-bg)"
                          : l.op === "del"
                            ? "var(--color-del-bg)"
                            : "transparent",
                      color:
                        l.op === "add"
                          ? "var(--color-add-fg)"
                          : l.op === "del"
                            ? "var(--color-del-fg)"
                            : "var(--color-text-primary)",
                    }}
                  >
                    {l.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 帯（区切り線 — 条文ページのタブバー位置に相当） */}
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              borderBottom: "1px solid var(--color-border)",
              padding: "0.2rem 0",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {patch.law_id && patch.target_articles?.[0] && (
              <Link
                href={`/law/${encodeURIComponent(patch.law_id)}/article/${encodeURIComponent(patch.target_articles[0])}`}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.75rem",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  padding: "0.25rem 0.4rem",
                }}
              >
                この条文でパッチを編集 →
              </Link>
            )}
          </div>

          {/* 編集・削除（アコーディオン形式 — 条文ページと統一） */}
          <PatchActions
            patchId={patchId}
            initialTitle={patch.title}
            initialDescription={patch.description ?? ""}
            initialPatchText={patch.plain_text as string}
            initialStatus={patch.status}
            initialStructured={patch.structured}
            articleTitle={patch.target_articles?.[0] ?? ""}
          />

          {/* Lint チェック */}
          <LintPanel patchId={patchId} />

          {/* 根拠資料 */}
          {sources.length > 0 && (
            <div style={{ marginTop: "0.75rem" }}>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  margin: "0 0 0.5rem",
                }}
              >
                根拠資料
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {sources.map((src) => {
                  const tc = TIER_COLORS[src.tier] ?? TIER_COLORS["三次"];
                  return (
                    <div
                      key={src.id}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "flex-start",
                        padding: "0.6rem 0.85rem",
                        backgroundColor: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor: tc.bg,
                          color: tc.fg,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {src.tier}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.85rem",
                            color: "var(--color-text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {src.url ? (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--color-accent)", textDecoration: "none" }}
                            >
                              {src.label} ↗
                            </a>
                          ) : (
                            src.label
                          )}
                        </div>
                        {src.excerpt && (
                          <div
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.78rem",
                              color: "var(--color-text-secondary)",
                              marginTop: "0.2rem",
                            }}
                          >
                            {src.excerpt}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "1rem",
              marginTop: "1rem",
            }}
          >
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-accent)",
                textDecoration: "none",
              }}
            >
              ← 法令検索に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
