import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";
import { ALLOWED_TYPES, MAX_FILE_SIZE, generateR2Key, isAllowedType } from "@/lib/attachments";
import { logger } from "@/lib/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getR2Bucket(): Promise<any> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (ctx.env as any).FILES_BUCKET ?? null;
  } catch {
    return null;
  }
}

/**
 * GET /api/attachments?context_type=community&context_id=UUID
 */
export async function GET(request: NextRequest) {
  const contextType = request.nextUrl.searchParams.get("context_type");
  const contextId = request.nextUrl.searchParams.get("context_id");

  if (!contextType || !contextId) {
    return NextResponse.json(
      { error: "context_type and context_id are required" },
      { status: 400 },
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any;
    const { data, error } = await db
      .from("attachments")
      .select("id, filename, original_name, content_type, size_bytes, uploaded_by_name, created_at")
      .eq("context_type", contextType)
      .eq("context_id", contextId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ attachments: data ?? [] });
  } catch (e) {
    logger.error("[attachments GET]", { error: e });
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

/**
 * POST /api/attachments — FormData upload
 * Fields: file, context_type, context_id, member_id, token
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const contextType = formData.get("context_type") as string;
    const contextId = formData.get("context_id") as string;
    const memberId = formData.get("member_id") as string;
    const token = formData.get("token") as string;
    const memberName = formData.get("member_name") as string;

    if (!file || !contextType || !contextId || !memberId || !token) {
      return NextResponse.json(
        { error: "file, context_type, context_id, member_id, token are required" },
        { status: 400 },
      );
    }

    // 認証
    const valid = await verifySessionToken(memberId, token);
    if (!valid) {
      return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
    }

    // ファイル検証
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `ファイルサイズは${MAX_FILE_SIZE / 1024 / 1024}MB以下にしてください` },
        { status: 400 },
      );
    }

    if (!isAllowedType(file.type, file.name)) {
      const allowed = Object.values(ALLOWED_TYPES).join(", ");
      return NextResponse.json({ error: `許可されたファイル形式: ${allowed}` }, { status: 400 });
    }

    // メンバーシップ確認
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any;

    if (contextType === "community") {
      const { data: membership } = await db
        .from("community_members")
        .select("id")
        .eq("community_id", contextId)
        .eq("member_id", memberId)
        .maybeSingle();
      if (!membership) {
        return NextResponse.json(
          { error: "コミュニティのメンバーではありません" },
          { status: 403 },
        );
      }
    } else if (contextType === "project") {
      const { data: member } = await db
        .from("member_profiles")
        .select("name, org")
        .eq("id", memberId)
        .single();
      if (!member) {
        return NextResponse.json({ error: "メンバーが見つかりません" }, { status: 404 });
      }
      const { data: project } = await db
        .from("projects")
        .select("members")
        .eq("id", contextId)
        .single();
      if (!project) {
        return NextResponse.json({ error: "プロジェクトが見つかりません" }, { status: 404 });
      }

      const isMember = (project.members ?? []).some(
        (m: { name: string; org: string }) => m.name === member.name && m.org === member.org,
      );
      if (!isMember) {
        return NextResponse.json(
          { error: "プロジェクトのメンバーではありません" },
          { status: 403 },
        );
      }
    } else {
      return NextResponse.json({ error: "Invalid context_type" }, { status: 400 });
    }

    // R2 アップロード
    const r2Key = generateR2Key(contextType, contextId, file.name);
    const bucket = await getR2Bucket();

    if (!bucket) {
      return NextResponse.json({ error: "ファイルストレージが利用できません" }, { status: 503 });
    }

    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(r2Key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
      },
    });

    // DB 保存
    const { data: attachment, error: dbError } = await db
      .from("attachments")
      .insert({
        context_type: contextType,
        context_id: contextId,
        filename: file.name.replace(/[^a-zA-Z0-9._\u3000-\u9FFF\uF900-\uFAFF-]/g, "_"),
        original_name: file.name,
        content_type: file.type,
        size_bytes: file.size,
        r2_key: r2Key,
        uploaded_by: memberId,
        uploaded_by_name: memberName || null,
      })
      .select("id, filename, original_name, content_type, size_bytes, uploaded_by_name, created_at")
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (e) {
    logger.error("[attachments POST]", { error: e });
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}
