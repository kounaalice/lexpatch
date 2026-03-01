import { NextRequest, NextResponse } from "next/server";
import { searchLaws } from "@/lib/egov/client";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "クエリが空です" }, { status: 400 });

  try {
    const data = await searchLaws(q);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
