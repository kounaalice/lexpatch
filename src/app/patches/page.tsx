import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLawTitle } from "@/lib/egov/client";
import Link from "next/link";
import { PatchesFilter } from "./PatchesFilter";

export const metadata: Metadata = {
  title: "改正提案",
  description: "LexCardに投稿された法令改正案の一覧。条文ごとの改正提案を閲覧・比較できます。",
};

interface PatchRow {
  id: string;
  title: string;
  status: string;
  target_articles: string[] | null;
  law_id: string | null;
  law_title: string | null;
  created_at: string;
  sources?: Array<{ id: string; tier: string; label: string; url: string | null }>;
}

export default async function PatchesPage() {
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
  const { data, error } = await supabase
    .from("patches")
    .select(
      "id, title, status, target_articles, law_id, law_title, created_at, sources(id, tier, label, url)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const patches: PatchRow[] = error ? [] : (data ?? []);

  // law_id でグループ化（null は「その他」）
  const lawMap = new Map<string | null, PatchRow[]>();
  for (const p of patches) {
    const key = p.law_id ?? null;
    if (!lawMap.has(key)) lawMap.set(key, []);
    lawMap.get(key)!.push(p);
  }

  // law_title がない law_id について e-Gov API から取得
  const lawTitleMap = new Map<string, string>();
  const idsToFetch = Array.from(lawMap.keys()).filter((id): id is string => {
    if (!id) return false;
    const patchesInGroup = lawMap.get(id)!;
    // グループ内のいずれかに law_title があればそれを使う
    const existing = patchesInGroup.find((p) => p.law_title);
    if (existing?.law_title) {
      lawTitleMap.set(id, existing.law_title);
      return false;
    }
    return true;
  });

  // キャッシュ済みデータを優先して逐次フェッチ（e-Gov レート制限対応）
  for (const lawId of idsToFetch) {
    try {
      const title = await getLawTitle(lawId);
      if (title) lawTitleMap.set(lawId, title);
    } catch {
      // フェッチ失敗時は law_id をそのまま表示
    }
  }

  // law_id あり → 件数降順、null は末尾
  const groups = [
    ...Array.from(lawMap.entries())
      .filter(([k]) => k !== null)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([law_id, ps]) => ({
        law_id,
        law_title: law_id ? (lawTitleMap.get(law_id) ?? null) : null,
        patches: ps,
      })),
    ...(lawMap.has(null) ? [{ law_id: null, law_title: null, patches: lawMap.get(null)! }] : []),
  ];

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダー */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>›</span>
            <span>改正提案</span>
          </nav>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.75rem",
              color: "var(--color-text-primary)",
              marginBottom: "0.25rem",
            }}
          >
            改正提案
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              margin: 0,
            }}
          >
            改正案が提出されている条文の一覧　全 {patches.length} 件
          </p>
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        {patches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                color: "var(--color-text-secondary)",
                marginBottom: "1.5rem",
              }}
            >
              まだ改正案がありません
            </p>
            <Link
              href="/"
              style={{
                padding: "0.6rem 1.5rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              法令を検索して改正案を作る →
            </Link>
          </div>
        ) : (
          <PatchesFilter groups={groups} />
        )}
      </div>
    </div>
  );
}
