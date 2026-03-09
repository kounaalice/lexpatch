import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySessionToken } from "@/lib/crypto";
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
 * GET /api/attachments/[id] — ファイルダウンロード
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any;
    const { data: attachment, error } = await db
      .from("attachments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !attachment) {
      return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 404 });
    }

    const bucket = await getR2Bucket();
    if (!bucket) {
      return NextResponse.json({ error: "ファイルストレージが利用できません" }, { status: 503 });
    }

    const object = await bucket.get(attachment.r2_key);
    if (!object) {
      return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", attachment.content_type);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(attachment.original_name)}"`,
    );
    headers.set("Content-Length", String(attachment.size_bytes));
    headers.set("Cache-Control", "private, max-age=3600");

    return new NextResponse(object.body as ReadableStream, { headers });
  } catch (e) {
    logger.error("[attachments/[id] GET]", { error: e });
    return NextResponse.json({ error: "ダウンロードに失敗しました" }, { status: 500 });
  }
}

/**
 * DELETE /api/attachments/[id]?member_id=UUID&token=TOKEN
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const memberId = request.nextUrl.searchParams.get("member_id");
  const token = request.nextUrl.searchParams.get("token");

  if (!memberId || !token) {
    return NextResponse.json({ error: "認証情報が必要です" }, { status: 401 });
  }

  const valid = await verifySessionToken(memberId, token);
  if (!valid) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any;
    const { data: attachment, error } = await db
      .from("attachments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !attachment) {
      return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 404 });
    }

    // 権限チェック: アップロード者 or admin/moderator
    if (attachment.uploaded_by !== memberId) {
      const { data: member } = await db
        .from("member_profiles")
        .select("role")
        .eq("id", memberId)
        .single();
      if (!member || (member.role !== "admin" && member.role !== "moderator")) {
        return NextResponse.json({ error: "削除権限がありません" }, { status: 403 });
      }
    }

    // R2 から削除
    const bucket = await getR2Bucket();
    if (bucket) {
      await bucket.delete(attachment.r2_key);
    }

    // DB から削除
    await db.from("attachments").delete().eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error("[attachments/[id] DELETE]", { error: e });
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
