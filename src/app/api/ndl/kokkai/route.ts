import { NextRequest, NextResponse } from "next/server";

// NDL 国会会議録検索API v3
// https://kokkai.ndl.go.jp/api.html

export interface KokkaiRecord {
  speechID: string;
  date: string;
  nameOfHouse: string; // "衆議院" | "参議院" | "両院"
  nameOfMeeting: string; // 委員会名等
  issue: string; // 号数
  session: string; // 国会回次
  speaker: string;
  speechURL: string;
}

export interface KokkaiResponse {
  numberOfRecords: number;
  records: KokkaiRecord[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const keyword = searchParams.get("q") ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? "5"), 10);

  if (!keyword.trim()) {
    return NextResponse.json({ numberOfRecords: 0, records: [] });
  }

  try {
    const url = new URL("https://kokkai.ndl.go.jp/api/3.0/record");
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("maximumRecords", String(limit));
    url.searchParams.set("recordPacking", "json");

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // 1時間キャッシュ
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json({ numberOfRecords: 0, records: [] });
    }

    const data = (await res.json()) as Record<string, unknown>;

    const rawRecords = (data.records as Record<string, unknown>[] | undefined) ?? [];
    const records: KokkaiRecord[] = rawRecords.flatMap((item) => {
      // NDL APIはネストが深い場合がある
      const rd = (item.recordData ?? item) as Record<string, unknown>;
      const sr = (rd.speechRecord ?? rd) as Record<string, unknown>;
      if (!sr.speechURL) return [];
      return [
        {
          speechID: String(sr.speechID ?? ""),
          date: String(sr.date ?? ""),
          nameOfHouse: String(sr.nameOfHouse ?? ""),
          nameOfMeeting: String(sr.nameOfMeeting ?? ""),
          issue: String(sr.issue ?? ""),
          session: String(sr.session ?? ""),
          speaker: String(sr.speaker ?? ""),
          speechURL: String(sr.speechURL ?? ""),
        },
      ];
    });

    return NextResponse.json({
      numberOfRecords: Number(data.numberOfRecords ?? records.length),
      records,
    } satisfies KokkaiResponse);
  } catch {
    return NextResponse.json({ numberOfRecords: 0, records: [] });
  }
}
