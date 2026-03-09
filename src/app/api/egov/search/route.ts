import { NextRequest, NextResponse } from "next/server";
import { searchLaws, advancedSearchLaws } from "@/lib/egov/client";

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.trim() || "";
  const lawType = sp.get("law_type")?.trim() || "";
  const promFrom = sp.get("promulgation_from")?.trim() || "";
  const promTo = sp.get("promulgation_to")?.trim() || "";
  const offset = parseInt(sp.get("offset") || "0", 10);
  const limit = parseInt(sp.get("limit") || "20", 10);

  // 何も指定されていない場合はエラー
  if (!q) {
    return NextResponse.json({ error: "クエリが空です" }, { status: 400 });
  }

  try {
    // 高度検索パラメータがある場合は advancedSearchLaws を使用
    // ※ e-Gov API の keyword パラメータは無視されるため law_title 検索のみ
    if (lawType || promFrom || promTo) {
      const data = await advancedSearchLaws({
        lawTitle: q,
        lawType: lawType || undefined,
        promulgationFrom: promFrom || undefined,
        promulgationTo: promTo || undefined,
        limit,
        offset: offset || undefined,
      });
      return NextResponse.json(data, { headers: cacheHeaders });
    }

    // 法令名検索
    const data = await searchLaws(q, limit, offset);
    return NextResponse.json(data, { headers: cacheHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
