import { NextResponse } from "next/server";
import { getRecentlyEnforcedLaws } from "@/lib/egov/client";

export async function GET() {
  try {
    const data = await getRecentlyEnforcedLaws(365, 12);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    // e-Gov ダウン時: 空配列で返しホームページを壊さない（5分後リトライ）
    return NextResponse.json(
      { laws: [], total_count: 0 },
      { headers: { "Cache-Control": "public, s-maxage=300" } },
    );
  }
}
