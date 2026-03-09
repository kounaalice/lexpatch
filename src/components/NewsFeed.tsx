import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

interface NewsItem {
  type: "project" | "patch" | "commentary" | "community";
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  href: string;
}

const TYPE_LABELS: Record<string, { label: string; bg: string; fg: string }> = {
  project: { label: "プロジェクト", bg: "#EBF2FD", fg: "#1B4B8A" },
  patch: { label: "改正案", bg: "#FFFBEB", fg: "#D97706" },
  commentary: { label: "逐条解説", bg: "#ECFDF5", fg: "#059669" },
  community: { label: "コミュニティ", bg: "#F5F3FF", fg: "#7C3AED" },
};

export async function NewsFeed() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const admin = createAdminClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;
    const [projectsRes, patchesRes, commentariesRes, communitiesRes] = await Promise.all([
      db
        .from("projects")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5),
      db
        .from("patches")
        .select("id, title, law_title, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      db
        .from("commentaries")
        .select("id, law_id, law_title, article_title, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      db
        .from("communities")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const items: NewsItem[] = [];

    for (const p of projectsRes.data ?? []) {
      items.push({
        type: "project",
        id: p.id,
        title: p.title,
        date: p.updated_at,
        href: `/projects/${p.id}`,
      });
    }
    for (const p of patchesRes.data ?? []) {
      items.push({
        type: "patch",
        id: p.id,
        title: p.title,
        subtitle: p.law_title,
        date: p.created_at,
        href: `/patch/${p.id}`,
      });
    }
    for (const c of commentariesRes.data ?? []) {
      const articleEnc = encodeURIComponent(c.article_title ?? "");
      const href = c.law_id
        ? `/law/${encodeURIComponent(c.law_id)}/article/${articleEnc}`
        : "/commentaries";
      items.push({
        type: "commentary",
        id: c.id,
        title: `${c.law_title ?? ""} ${c.article_title ?? ""}`.trim(),
        date: c.created_at,
        href,
      });
    }
    for (const c of communitiesRes.data ?? []) {
      items.push({
        type: "community",
        id: c.id,
        title: c.name,
        date: c.created_at,
        href: `/communities/${c.id}`,
      });
    }

    // Sort by date descending, take top 10
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recent = items.slice(0, 10);

    if (recent.length === 0) return null;

    return (
      <section style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              width: "3px",
              height: "1.2rem",
              backgroundColor: "var(--color-accent)",
              borderRadius: "2px",
            }}
          />
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            新着情報
          </h2>
        </div>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {recent.map((item, i) => {
            const typeInfo = TYPE_LABELS[item.type];
            return (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.55rem 1rem",
                  textDecoration: "none",
                  borderBottom: i < recent.length - 1 ? "1px solid var(--color-border)" : "none",
                  fontFamily: "var(--font-sans)",
                  transition: "background-color 0.1s",
                }}
                className="hover:bg-gray-50"
              >
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--color-text-secondary)",
                    whiteSpace: "nowrap",
                    minWidth: "3.2rem",
                  }}
                >
                  {new Date(item.date).toLocaleDateString("ja-JP", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    padding: "0.1rem 0.4rem",
                    borderRadius: "3px",
                    backgroundColor: typeInfo.bg,
                    color: typeInfo.fg,
                    whiteSpace: "nowrap",
                  }}
                >
                  {typeInfo.label}
                </span>
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--color-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.title}
                </span>
                {item.subtitle && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--color-text-secondary)",
                      whiteSpace: "nowrap",
                      marginLeft: "auto",
                    }}
                  >
                    {item.subtitle}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
