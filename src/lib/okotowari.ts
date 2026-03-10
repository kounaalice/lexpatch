/**
 * 営業お断り代行サービス — 型定義・定数・メールテンプレート
 */

export type OkotowariReason = "phone" | "visit" | "email_spam" | "dm" | "fax" | "sns" | "other";
export type OkotowariStatus = "draft" | "sent" | "resolicited" | "resolved";

export interface OkotowariRequest {
  id: string;
  member_id: string;
  company_name: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  reason: OkotowariReason;
  reason_detail?: string;
  status: OkotowariStatus;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  report_count?: number;
}

export interface OkotowariReport {
  id: string;
  request_id: string;
  member_id: string;
  report_date: string;
  contact_method: OkotowariReason;
  description: string;
  evidence_note?: string;
  created_at: string;
}

export const REASON_LABELS: Record<OkotowariReason, string> = {
  phone: "営業電話",
  visit: "訪問販売",
  email_spam: "メール勧誘",
  dm: "DM・ダイレクトメール",
  fax: "FAX広告",
  sns: "SNS勧誘",
  other: "その他",
};

export const STATUS_LABELS: Record<OkotowariStatus, string> = {
  draft: "下書き",
  sent: "送信済み",
  resolicited: "再勧誘あり",
  resolved: "解決済み",
};

export const STATUS_COLORS: Record<OkotowariStatus, string> = {
  draft: "#6B7280",
  sent: "#0369A1",
  resolicited: "#DC2626",
  resolved: "#16A34A",
};

/** お断りメールHTML生成 */
export function buildOkotowariEmail(params: {
  userName: string;
  userOrg: string;
  companyName: string;
  reason: OkotowariReason;
  reasonDetail?: string;
  date: string;
}): { subject: string; html: string } {
  const reasonLabel = REASON_LABELS[params.reason];
  const subject = `【営業お断り通知】${params.userName}（${params.userOrg}）からの勧誘停止のお願い`;

  const detail = params.reasonDetail
    ? `<tr><td style="padding:4px 12px;color:#666;">詳細</td><td style="padding:4px 12px;">${escapeHtml(params.reasonDetail)}</td></tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8"></head>
<body style="font-family:'BIZ UDPGothic',sans-serif;color:#1a1a1a;line-height:1.8;max-width:600px;margin:0 auto;padding:24px;">
<p>${escapeHtml(params.companyName)} 御中</p>
<p>拝啓　時下ますますご清栄のこととお慶び申し上げます。</p>
<p>${escapeHtml(params.userName)}（${escapeHtml(params.userOrg)}）より、以下のとおり勧誘行為の停止を通知いたします。</p>

<table style="border-collapse:collapse;margin:16px 0;width:100%;">
<tr><td style="padding:4px 12px;color:#666;">通知日</td><td style="padding:4px 12px;">${params.date}</td></tr>
<tr><td style="padding:4px 12px;color:#666;">対象行為</td><td style="padding:4px 12px;">${reasonLabel}</td></tr>
${detail}
</table>

<p>本通知は、以下の法令に基づく正当な権利行使です。</p>

<div style="background:#f5f5f5;padding:16px;border-radius:6px;margin:16px 0;">
<p style="margin:0 0 8px;font-weight:bold;">【根拠法令】</p>
<ul style="margin:0;padding-left:20px;">
<li>特定商取引に関する法律 第3条の2（契約を締結しない旨の意思の表示）</li>
<li>同法 第17条（契約を締結しない旨の意思を表示した者に対する勧誘の禁止）</li>
<li>個人情報の保護に関する法律 第35条（利用停止等の請求）</li>
</ul>
</div>

<p>本通知到達後も勧誘を継続された場合、関係行政機関（消費者庁・経済産業省等）への申告を含む法的措置を検討する場合がございます。</p>

<p>敬具</p>

<p style="margin-top:24px;">
${escapeHtml(params.userName)}<br>
${escapeHtml(params.userOrg)}
</p>

<hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">
<p style="font-size:12px;color:#888;">
本通知は LexCard 営業お断り代行サービスを通じて送信されています。<br>
本通知は法的助言を構成するものではありません。
</p>
</body></html>`;

  return { subject, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
