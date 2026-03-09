import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * GET /api/dashboard/messages?member_id=xxx&name=xxx&org=xxx
 * ユーザーが所属するプロジェクト・コミュニティの最新メッセージを集約して返す
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 503 });
  }

  const sp = request.nextUrl.searchParams;
  const memberId = sp.get("member_id");
  const name = sp.get("name");
  const org = sp.get("org") ?? "";

  if (!memberId || !name) {
    return NextResponse.json({ error: "member_id, name が必要です" }, { status: 400 });
  }

  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = admin as any;

  // 1. ユーザーのプロジェクトを取得（members JSONB に name+org が含まれるもの）
  const { data: allProjects } = await sb
    .from("projects")
    .select("id, title, members")
    .order("updated_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myProjects = (allProjects || []).filter((p: any) => {
    const members = p.members || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return members.some((m: any) => m.name === name && (m.org || "") === org);
  });

  // 2. ユーザーのコミュニティを取得
  const { data: communityMemberships } = await sb
    .from("community_members")
    .select("community_id, communities(id, name)")
    .eq("member_id", memberId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myCommunities = (communityMemberships || []).map((cm: any) => ({
    id: cm.communities?.id || cm.community_id,
    name: cm.communities?.name || "",
  }));

  // 3. 各プロジェクトの最新メッセージ（最大5件ずつ、最大10プロジェクト）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projectGroups: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const proj of myProjects.slice(0, 10) as any[]) {
    const { data: msgs } = await sb
      .from("project_messages")
      .select("id, content, author_name, created_at, visibility")
      .eq("project_id", proj.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (msgs && msgs.length > 0) {
      projectGroups.push({
        id: proj.id,
        name: proj.title,
        type: "project" as const,
        messages: msgs.reverse(), // 時系列順に
      });
    }
  }

  // 4. 各コミュニティの最新メッセージ（最大5件ずつ、最大10コミュニティ）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const communityGroups: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const comm of myCommunities.slice(0, 10) as any[]) {
    const { data: msgs } = await sb
      .from("community_messages")
      .select("id, content, created_at, member_profiles(name)")
      .eq("community_id", comm.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (msgs && msgs.length > 0) {
      communityGroups.push({
        id: comm.id,
        name: comm.name,
        type: "community" as const,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: msgs.reverse().map((m: any) => ({
          id: m.id,
          content: m.content,
          author_name: m.member_profiles?.name ?? "不明",
          created_at: m.created_at,
        })),
      });
    }
  }

  return NextResponse.json({
    projects: projectGroups,
    communities: communityGroups,
  });
}
