import { NextRequest, NextResponse } from "next/server";
import { getLawData } from "@/lib/egov/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lawId: string }> }
) {
  const { lawId } = await params;
  try {
    const data = await getLawData(lawId);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
