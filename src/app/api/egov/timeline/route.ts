import { NextRequest, NextResponse } from "next/server";
import { getLawRevisions } from "@/lib/egov/client";

interface TimelineEntry {
  date: string;
  description: string;
  law_num?: string;
  enforcement_date?: string;
}

const FALLBACK_ENTRIES: TimelineEntry[] = [{ date: "制定時", description: "法律制定" }];

function fmtDate(d: string): string {
  const m = d.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return d;
  return `${m[1]}年${parseInt(m[2])}月${parseInt(m[3])}日`;
}

export const revalidate = 86400; // 24h ISR

export async function GET(request: NextRequest) {
  const lawId = request.nextUrl.searchParams.get("law_id")?.trim();
  if (!lawId) {
    return NextResponse.json({ error: "law_id が必要です" }, { status: 400 });
  }

  try {
    // v2 law_revisions エンドポイントで改正履歴取得
    const revisions = await getLawRevisions(lawId);

    if (revisions.length > 0) {
      const entries: TimelineEntry[] = revisions.map((rev) => {
        const date = rev.amendment_promulgate_date
          ? fmtDate(rev.amendment_promulgate_date)
          : fmtDate(rev.amendment_enforcement_date);
        const enfDate = fmtDate(rev.amendment_enforcement_date);
        const desc = rev.amendment_law_title ?? "改正";
        return {
          date,
          description: desc,
          enforcement_date: enfDate,
        };
      });

      return NextResponse.json({ entries });
    }

    // 改正履歴なし（制定法のまま）
    return NextResponse.json({ entries: FALLBACK_ENTRIES });
  } catch {
    return NextResponse.json({ entries: FALLBACK_ENTRIES });
  }
}
