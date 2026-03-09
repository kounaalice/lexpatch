/**
 * Resend API を使ったメール送信ユーティリティ
 * 環境変数 RESEND_API_KEY が未設定の場合はスキップ（ログのみ）
 */

import { logger } from "./logger";

/** CF Workers ではリクエスト時に env が注入されるため、関数内で都度取得する */
function getEnv() {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
    FROM_EMAIL: process.env.MAIL_FROM ?? "LexCard <noreply@lexcard.jp>",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "kou551sei@gmail.com",
  };
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(opts: SendMailOptions): Promise<boolean> {
  const { RESEND_API_KEY, FROM_EMAIL } = getEnv();
  if (!RESEND_API_KEY) {
    logger.info("[mail] RESEND_API_KEY 未設定 — メール送信スキップ", {
      to: opts.to,
      subject: opts.subject,
    });
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error("[mail] Resend API error", { status: res.status, error: err });
      return false;
    }
    return true;
  } catch (e) {
    logger.error("[mail] 送信失敗", { error: String(e) });
    return false;
  }
}

/** 管理者への問い合わせ通知 */
export function notifyAdminContact(contact: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}) {
  const { ADMIN_EMAIL } = getEnv();
  return sendMail({
    to: ADMIN_EMAIL,
    subject: `[LexCard] 新しいお問い合わせ: ${contact.subject || "（件名なし）"}`,
    html: `
      <h2 style="color:#1E3A5F">新しいお問い合わせが届きました</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <tr><td style="padding:6px 12px;font-weight:bold;color:#4B6A8A">お名前</td><td style="padding:6px 12px">${escHtml(contact.name)}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;color:#4B6A8A">メール</td><td style="padding:6px 12px"><a href="mailto:${escHtml(contact.email)}">${escHtml(contact.email)}</a></td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;color:#4B6A8A">件名</td><td style="padding:6px 12px">${escHtml(contact.subject ?? "")}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#F0F9FF;border-radius:8px;font-family:sans-serif;font-size:14px;line-height:1.8;white-space:pre-wrap">${escHtml(contact.message)}</div>
      <p style="margin-top:24px;font-size:12px;color:#94a3b8">このメールは LexCard のお問い合わせフォームから自動送信されています。</p>
    `,
  });
}

/** 問い合わせ者への自動返信 */
export function autoReplyContact(contact: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}) {
  return sendMail({
    to: contact.email,
    subject: `[LexCard] お問い合わせを受け付けました`,
    html: `
      <div style="font-family:sans-serif;font-size:14px;line-height:1.8;color:#1E3A5F">
        <h2 style="color:#0369A1">お問い合わせありがとうございます</h2>
        <p>${escHtml(contact.name)} 様</p>
        <p>以下の内容でお問い合わせを受け付けました。<br>内容を確認の上、順次ご返答いたします。</p>
        <div style="margin:16px 0;padding:16px;background:#F0F9FF;border:1px solid #BAE6FD;border-radius:8px">
          <p style="margin:0 0 8px;font-weight:bold;color:#4B6A8A">件名: ${escHtml(contact.subject ?? "（件名なし）")}</p>
          <p style="margin:0;white-space:pre-wrap">${escHtml(contact.message)}</p>
        </div>
        <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0">
        <p style="font-size:12px;color:#94a3b8">
          このメールは LexCard（<a href="https://lexcard.jp" style="color:#0369A1">lexcard.jp</a>）から自動送信されています。<br>
          心当たりがない場合はこのメールを無視してください。
        </p>
      </div>
    `,
  });
}

/** レート制限: 同一パスへの通知は10分に1回まで */
const errorNotifyHistory = new Map<string, number>();
const ERROR_NOTIFY_INTERVAL = 10 * 60 * 1000; // 10分

/** 管理者へのエラー通知 */
export async function notifyAdminError(info: {
  path: string;
  error: string;
  userAgent?: string;
}): Promise<boolean> {
  const now = Date.now();
  const lastSent = errorNotifyHistory.get(info.path);
  if (lastSent && now - lastSent < ERROR_NOTIFY_INTERVAL) {
    logger.info("[mail] エラー通知レート制限（同一パス10分以内）", { path: info.path });
    return false;
  }

  const { ADMIN_EMAIL } = getEnv();
  const time = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  const ok = await sendMail({
    to: ADMIN_EMAIL,
    subject: `[LexCard] ページエラー: ${info.path}`,
    html: `
      <h2 style="color:#DC2626">ページエラーが発生しました</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        <tr><td style="padding:6px 12px;font-weight:bold;color:#4B6A8A">パス</td><td style="padding:6px 12px"><code>${escHtml(info.path)}</code></td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;color:#4B6A8A">エラー</td><td style="padding:6px 12px">${escHtml(info.error)}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;color:#4B6A8A">UA</td><td style="padding:6px 12px;font-size:12px;color:#94a3b8">${escHtml(info.userAgent ?? "不明")}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;color:#4B6A8A">発生時刻</td><td style="padding:6px 12px">${time}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#94a3b8">このメールは LexCard のエラー監視から自動送信されています。</p>
    `,
  });

  if (ok) {
    errorNotifyHistory.set(info.path, now);
    // 古いエントリを掃除（100件超えたら）
    if (errorNotifyHistory.size > 100) {
      for (const [key, ts] of errorNotifyHistory) {
        if (now - ts > ERROR_NOTIFY_INTERVAL) errorNotifyHistory.delete(key);
      }
    }
  }
  return ok;
}

export function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── パスワードリセットメール ────────────────────────────────

export function sendPasswordResetEmail(params: {
  to: string;
  memberName: string;
  resetUrl: string;
}) {
  return sendMail({
    to: params.to,
    subject: "[LexCard] パスワードリセット",
    html: `${emailHeader("LexCard パスワードリセット")}
      <p>${escHtml(params.memberName)} 様</p>
      <p>パスワードリセットのリクエストを受け付けました。以下のボタンからパスワードを再設定してください。</p>
      <p style="color:#4B6A8A;font-size:13px">このリンクは1時間有効です。</p>
      ${emailCta(params.resetUrl, "パスワードを再設定する")}
      <p style="font-size:13px;color:#4B6A8A">このメールに心当たりがない場合は無視してください。パスワードは変更されません。</p>
    ${emailFooter()}`,
  });
}

// ─── メールアドレス認証メール ────────────────────────────────

export function sendEmailVerificationEmail(params: {
  to: string;
  memberName: string;
  verifyUrl: string;
}) {
  return sendMail({
    to: params.to,
    subject: "[LexCard] メールアドレスの確認",
    html: `${emailHeader("LexCard メールアドレス確認")}
      <p>${escHtml(params.memberName)} 様</p>
      <p>LexCard へのご登録ありがとうございます。以下のボタンをクリックして、メールアドレスを確認してください。</p>
      <p style="color:#4B6A8A;font-size:13px">このリンクは24時間有効です。</p>
      ${emailCta(params.verifyUrl, "メールアドレスを確認する")}
      <p style="font-size:13px;color:#4B6A8A">このメールに心当たりがない場合は無視してください。</p>
    ${emailFooter()}`,
  });
}

// ─── 共通テンプレートパーツ ──────────────────────────────────

function emailHeader(title: string): string {
  return `<div style="font-family:'BIZ UDPGothic','Hiragino Sans',sans-serif;font-size:14px;line-height:1.8;color:#1E3A5F;max-width:600px;margin:0 auto">
  <div style="background:#0C2340;padding:16px 24px;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;font-size:16px;margin:0">${escHtml(title)}</h1>
  </div>
  <div style="padding:24px;background:#FFFFFF;border:1px solid #BAE6FD;border-top:none;border-radius:0 0 8px 8px">`;
}

function emailFooter(): string {
  return `<hr style="border:none;border-top:1px solid #BAE6FD;margin:24px 0">
    <p style="font-size:12px;color:#4B6A8A">
      このメールは LexCard（<a href="https://lexcard.jp" style="color:#0369A1">lexcard.jp</a>）から自動送信されています。<br>
      メール通知を停止するには、<a href="https://lexcard.jp/notifications" style="color:#0369A1">プロフィール設定</a>で通知をオフにしてください。
    </p>
  </div></div>`;
}

function emailCta(href: string, label: string): string {
  return `<p><a href="${escHtml(href)}" style="display:inline-block;padding:10px 24px;background:#0369A1;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">${escHtml(label)}</a></p>`;
}

function emailContent(title: string, body: string): string {
  return `<div style="margin:16px 0;padding:16px;background:#EFF8FF;border:1px solid #BAE6FD;border-radius:8px">
    <h2 style="margin:0 0 8px;font-size:15px;color:#0369A1">${escHtml(title)}</h2>
    <p style="margin:0;white-space:pre-wrap">${escHtml(body)}</p>
  </div>`;
}

// ─── プロジェクトお知らせメール ──────────────────────────────

export function sendNotificationEmail(params: {
  to: string;
  memberName: string;
  notificationTitle: string;
  notificationContent: string;
  projectTitle: string;
  projectId: string;
}) {
  return sendMail({
    to: params.to,
    subject: `[LexCard] ${params.projectTitle}: ${params.notificationTitle}`,
    html: `${emailHeader("LexCard お知らせ")}
      <p>${escHtml(params.memberName)} 様</p>
      <p>プロジェクト「<strong>${escHtml(params.projectTitle)}</strong>」に新しいお知らせが投稿されました。</p>
      ${emailContent(params.notificationTitle, params.notificationContent)}
      ${emailCta("https://lexcard.jp/notifications", "お知らせを確認する")}
    ${emailFooter()}`,
  });
}

// ─── タスクアラートメール ────────────────────────────────────

export function sendTaskAlertEmail(params: {
  to: string;
  memberName: string;
  taskTitle: string;
  action: "assigned" | "completed" | "due_soon" | "overdue";
  projectTitle: string;
  projectId: string;
  dueDate?: string;
}) {
  const actionText =
    params.action === "assigned"
      ? "タスクが割り当てられました"
      : params.action === "completed"
        ? "タスクが完了しました"
        : params.action === "overdue"
          ? "タスクが期限を超過しています"
          : "タスクの期限が近づいています";

  const dueInfo = params.dueDate ? `\n期限: ${params.dueDate}` : "";

  return sendMail({
    to: params.to,
    subject: `[LexCard] ${params.projectTitle}: ${actionText}`,
    html: `${emailHeader("LexCard タスクアラート")}
      <p>${escHtml(params.memberName)} 様</p>
      <p>プロジェクト「<strong>${escHtml(params.projectTitle)}</strong>」で${escHtml(actionText)}。</p>
      ${emailContent(params.taskTitle, actionText + dueInfo)}
      ${emailCta(`https://lexcard.jp/projects/${params.projectId}`, "プロジェクトを開く")}
    ${emailFooter()}`,
  });
}

// ─── 新メッセージメール ──────────────────────────────────────

export function sendMessageAlertEmail(params: {
  to: string;
  memberName: string;
  authorName: string;
  messagePreview: string;
  contextTitle: string;
  contextUrl: string;
  contextType: "project" | "community";
}) {
  const ctxLabel = params.contextType === "project" ? "プロジェクト" : "コミュニティ";
  const preview =
    params.messagePreview.length > 200
      ? params.messagePreview.slice(0, 200) + "..."
      : params.messagePreview;

  return sendMail({
    to: params.to,
    subject: `[LexCard] ${params.contextTitle}: ${params.authorName}さんからの新しいメッセージ`,
    html: `${emailHeader("LexCard メッセージ通知")}
      <p>${escHtml(params.memberName)} 様</p>
      <p>${ctxLabel}「<strong>${escHtml(params.contextTitle)}</strong>」で${escHtml(params.authorName)}さんが新しいメッセージを投稿しました。</p>
      ${emailContent(`${params.authorName}さんのメッセージ`, preview)}
      ${emailCta(params.contextUrl, "メッセージを確認する")}
    ${emailFooter()}`,
  });
}

// ─── 法令公布・施行アラートメール ────────────────────────────

export interface LawAlertItem {
  lawTitle: string;
  lawNumber: string;
  lawId?: string;
  date: string; // 公布日 or 施行日
  summary?: string;
}

/** 法令テーブルHTML生成（共通） */
function buildLawTable(laws: LawAlertItem[], dateColumnLabel: string): string {
  const lawRows = laws
    .map((law) => {
      const link = law.lawId
        ? `<a href="https://lexcard.jp/law/${escHtml(law.lawId)}" style="color:#0369A1;font-weight:600">${escHtml(law.lawTitle)}</a>`
        : `<strong>${escHtml(law.lawTitle)}</strong>`;
      const summary = law.summary
        ? `<br><span style="font-size:13px;color:#4B6A8A">${escHtml(law.summary)}</span>`
        : "";
      return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #BAE6FD">${link}${summary}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #BAE6FD;white-space:nowrap;color:#4B6A8A">${escHtml(law.lawNumber)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #BAE6FD;white-space:nowrap">${escHtml(law.date)}</td>
    </tr>`;
    })
    .join("");

  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
    <thead><tr style="background:#EFF8FF">
      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #0369A1;color:#0369A1">法令名</th>
      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #0369A1;color:#0369A1">法令番号</th>
      <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #0369A1;color:#0369A1">${escHtml(dateColumnLabel)}</th>
    </tr></thead>
    <tbody>${lawRows}</tbody>
  </table>`;
}

export function sendLawAlertEmail(params: {
  to: string;
  memberName: string;
  alertType: "promulgation" | "enforcement";
  laws: LawAlertItem[];
  scopeLabel: string;
}) {
  const typeLabel = params.alertType === "promulgation" ? "公布" : "施行";
  return sendMail({
    to: params.to,
    subject: `[LexCard] ${params.laws.length}件の法令が${typeLabel}されました`,
    html: `${emailHeader(`LexCard 法令${typeLabel}アラート`)}
      <p>${escHtml(params.memberName)} 様</p>
      <p>対象範囲「<strong>${escHtml(params.scopeLabel)}</strong>」に含まれる <strong>${params.laws.length}件</strong> の法令が${typeLabel}されました。</p>
      ${buildLawTable(params.laws, `${typeLabel}日`)}
      ${emailCta("https://lexcard.jp", "LexCard で確認する")}
    ${emailFooter()}`,
  });
}

// ─── 週次ダイジェストメール ──────────────────────────────────

export function sendLawDigestEmail(params: {
  to: string;
  memberName: string;
  alertType: "promulgation" | "enforcement";
  laws: LawAlertItem[];
  scopeLabel: string;
  periodLabel: string; // "2/27 〜 3/6"
}) {
  const typeLabel = params.alertType === "promulgation" ? "公布" : "施行";
  return sendMail({
    to: params.to,
    subject: `[LexCard] 週間${typeLabel}ダイジェスト: ${params.laws.length}件`,
    html: `${emailHeader(`LexCard 週間${typeLabel}ダイジェスト`)}
      <p>${escHtml(params.memberName)} 様</p>
      <p style="color:#4B6A8A;font-size:13px">期間: ${escHtml(params.periodLabel)}</p>
      <p>対象範囲「<strong>${escHtml(params.scopeLabel)}</strong>」に含まれる <strong>${params.laws.length}件</strong> の法令が${typeLabel}されました。</p>
      ${buildLawTable(params.laws, `${typeLabel}日`)}
      ${emailCta("https://lexcard.jp", "LexCard で確認する")}
    ${emailFooter()}`,
  });
}
