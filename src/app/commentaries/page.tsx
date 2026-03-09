import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { getLawTitle } from "@/lib/egov/client";
import Link from "next/link";
import { CommentaryList } from "./CommentaryList";

export const metadata: Metadata = {
  title: "逐条解説",
  description: "法令の各条文に対する逐条解説の一覧。出典付きの解説を投稿・閲覧できます。",
};

interface CommentaryRow {
  id: string;
  law_id: string;
  article_title: string;
  content: string;
  author_name: string | null;
  sources: Array<{ tier: string; label: string; url: string }>;
  created_at: string;
  updated_at: string;
}

export default async function CommentariesPage() {
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

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from("commentaries")
    .select("id, law_id, article_title, content, author_name, sources, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(300);

  const commentaries: CommentaryRow[] = error ? [] : (data ?? []);

  // law_id でグループ化
  const lawMap = new Map<string, CommentaryRow[]>();
  for (const c of commentaries) {
    if (!lawMap.has(c.law_id)) lawMap.set(c.law_id, []);
    lawMap.get(c.law_id)!.push(c);
  }

  // 法令名を取得
  const lawTitleMap = new Map<string, string>();
  for (const lawId of lawMap.keys()) {
    try {
      const title = await getLawTitle(lawId);
      if (title) lawTitleMap.set(lawId, title);
    } catch {
      /* ignore */
    }
  }

  // 件数降順
  const groups = Array.from(lawMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([law_id, items]) => ({
      law_id,
      law_title: lawTitleMap.get(law_id) ?? null,
      commentaries: items,
    }));

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
            <span>逐条解説</span>
          </nav>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.75rem",
              color: "var(--color-text-primary)",
              marginBottom: "0.25rem",
            }}
          >
            逐条解説
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              margin: 0,
            }}
          >
            有志による条文の解説・注釈
          </p>
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <CommentaryList groups={groups} total={commentaries.length} />
      </div>
    </div>
  );
}
