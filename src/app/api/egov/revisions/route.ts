import { NextRequest, NextResponse } from "next/server";
import { getLawRevisions } from "@/lib/egov/client";

export const revalidate = 86400; // 24h ISR

export async function GET(request: NextRequest) {
  const lawId = request.nextUrl.searchParams.get("law_id")?.trim();
  if (!lawId) {
    return NextResponse.json({ error: "law_id が必要です" }, { status: 400 });
  }

  try {
    const revisions = await getLawRevisions(lawId);
    return NextResponse.json({ revisions });
  } catch {
    return NextResponse.json({ revisions: [] });
  }
}
