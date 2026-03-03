import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json([]);
  }

  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;
    const [projectsRes, patchesRes, commentariesRes, communitiesRes] = await Promise.all([
      db.from("projects").select("id, title, updated_at").order("updated_at", { ascending: false }).limit(5),
      db.from("patches").select("id, title, law_title, created_at").order("created_at", { ascending: false }).limit(5),
      db.from("commentaries").select("id, law_id, law_title, article_title, created_at").order("created_at", { ascending: false }).limit(5),
      db.from("communities").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
    ]);

    interface NewsItem { type: string; id: string; title: string; subtitle?: string; date: string; href: string }
    const items: NewsItem[] = [];

    for (const p of (projectsRes.data ?? [])) {
      items.push({ type: "project", id: p.id, title: p.title, date: p.updated_at, href: `/projects/${p.id}` });
    }
    for (const p of (patchesRes.data ?? [])) {
      items.push({ type: "patch", id: p.id, title: p.title, subtitle: p.law_title, date: p.created_at, href: `/patch/${p.id}` });
    }
    for (const c of (commentariesRes.data ?? [])) {
      const articleEnc = encodeURIComponent(c.article_title ?? "");
      const href = c.law_id ? `/law/${encodeURIComponent(c.law_id)}/article/${articleEnc}` : "/commentaries";
      items.push({ type: "commentary", id: c.id, title: `${c.law_title ?? ""} ${c.article_title ?? ""}`.trim(), date: c.created_at, href });
    }
    for (const c of (communitiesRes.data ?? [])) {
      items.push({ type: "community", id: c.id, title: c.name, date: c.created_at, href: `/communities/${c.id}` });
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(items.slice(0, 10), {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json([]);
  }
}
