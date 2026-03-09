/**
 * iCal (RFC 5545) ヘルパー — 外部ライブラリ不要
 */

export function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** YYYYMMDD (終日イベント用) */
export function formatICalDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/** YYYYMMDDTHHmmss (時刻指定イベント用) */
export function formatICalDateTime(dateStr: string, time?: string): string {
  const d = dateStr.replace(/-/g, "");
  if (time) {
    const t = time.replace(/:/g, "") + "00";
    return `${d}T${t}`;
  }
  return `${d}T090000`; // デフォルト9:00
}

export interface VEventInput {
  uid: string;
  summary: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (省略で終日イベント)
  url?: string;
  categories?: string[];
}

export function buildVEvent(ev: VEventInput): string {
  const lines: string[] = [
    "BEGIN:VEVENT",
    `UID:${ev.uid}`,
    `DTSTAMP:${nowUTC()}`,
    `SUMMARY:${escapeICalText(ev.summary)}`,
  ];

  if (ev.time) {
    // 時刻あり → DTSTART;TZID=Asia/Tokyo
    lines.push(`DTSTART;TZID=Asia/Tokyo:${formatICalDateTime(ev.date, ev.time)}`);
    // 1時間後に終了
    const [h, m] = ev.time.split(":").map(Number);
    const endH = String(h + 1).padStart(2, "0");
    const endM = String(m).padStart(2, "0");
    lines.push(`DTEND;TZID=Asia/Tokyo:${formatICalDateTime(ev.date, `${endH}:${endM}`)}`);
  } else {
    // 終日イベント
    lines.push(`DTSTART;VALUE=DATE:${formatICalDate(ev.date)}`);
    // 翌日
    const next = new Date(ev.date + "T00:00:00");
    next.setDate(next.getDate() + 1);
    const nextStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
    lines.push(`DTEND;VALUE=DATE:${formatICalDate(nextStr)}`);
  }

  if (ev.description) lines.push(`DESCRIPTION:${escapeICalText(ev.description)}`);
  if (ev.url) lines.push(`URL:${ev.url}`);
  if (ev.categories?.length) lines.push(`CATEGORIES:${ev.categories.join(",")}`);

  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

export function buildVCalendar(vevents: string[], calendarName?: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LexCard//Calendar//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName ?? "LexCard カレンダー"}`,
    "X-WR-TIMEZONE:Asia/Tokyo",
    // VTIMEZONE for Asia/Tokyo
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Tokyo",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0900",
    "TZOFFSETTO:+0900",
    "TZNAME:JST",
    "END:STANDARD",
    "END:VTIMEZONE",
    ...vevents,
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function nowUTC(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${day}T${h}${min}${s}Z`;
}
