import { describe, it, expect } from "vitest";
import { REASON_LABELS, STATUS_LABELS, STATUS_COLORS, buildOkotowariEmail } from "./okotowari";
import type { OkotowariReason } from "./okotowari";

describe("REASON_LABELS", () => {
  it("全7種の理由ラベルを定義している", () => {
    expect(Object.keys(REASON_LABELS)).toHaveLength(7);
    expect(REASON_LABELS.phone).toBe("営業電話");
    expect(REASON_LABELS.visit).toBe("訪問販売");
    expect(REASON_LABELS.other).toBe("その他");
  });
});

describe("STATUS_LABELS", () => {
  it("全4種のステータスラベルを定義している", () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(4);
    expect(STATUS_LABELS.draft).toBe("下書き");
    expect(STATUS_LABELS.sent).toBe("送信済み");
    expect(STATUS_LABELS.resolicited).toBe("再勧誘あり");
    expect(STATUS_LABELS.resolved).toBe("解決済み");
  });
});

describe("STATUS_COLORS", () => {
  it("全4種のステータスカラーを定義している", () => {
    expect(Object.keys(STATUS_COLORS)).toHaveLength(4);
    expect(STATUS_COLORS.draft).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(STATUS_COLORS.resolicited).toBe("#DC2626");
  });
});

describe("buildOkotowariEmail", () => {
  const baseParams = {
    userName: "田中太郎",
    userOrg: "テスト株式会社",
    companyName: "営業会社",
    reason: "phone" as OkotowariReason,
    date: "2025-01-15",
  };

  it("件名にユーザー名と組織名を含む", () => {
    const { subject } = buildOkotowariEmail(baseParams);
    expect(subject).toContain("営業お断り通知");
    expect(subject).toContain("田中太郎");
    expect(subject).toContain("テスト株式会社");
  });

  it("HTMLに宛先会社名を含む", () => {
    const { html } = buildOkotowariEmail(baseParams);
    expect(html).toContain("営業会社 御中");
  });

  it("HTMLに日付を含む", () => {
    const { html } = buildOkotowariEmail(baseParams);
    expect(html).toContain("2025-01-15");
  });

  it("HTMLに対象行為ラベルを含む", () => {
    const { html } = buildOkotowariEmail(baseParams);
    expect(html).toContain("営業電話");
  });

  it("HTMLに根拠法令を含む", () => {
    const { html } = buildOkotowariEmail(baseParams);
    expect(html).toContain("特定商取引に関する法律");
    expect(html).toContain("個人情報の保護に関する法律");
  });

  it("reasonDetailが指定された場合は詳細行を含む", () => {
    const { html } = buildOkotowariEmail({
      ...baseParams,
      reasonDetail: "毎週月曜に電話がある",
    });
    expect(html).toContain("詳細");
    expect(html).toContain("毎週月曜に電話がある");
  });

  it("reasonDetailが未指定の場合は詳細行を含まない", () => {
    const { html } = buildOkotowariEmail(baseParams);
    expect(html).not.toContain("詳細</td>");
  });

  it("HTMLインジェクションをエスケープする", () => {
    const { html } = buildOkotowariEmail({
      ...baseParams,
      companyName: '<script>alert("xss")</script>',
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("全理由タイプでエラーなくメールを生成できる", () => {
    const reasons: OkotowariReason[] = [
      "phone",
      "visit",
      "email_spam",
      "dm",
      "fax",
      "sns",
      "other",
    ];
    for (const reason of reasons) {
      const { subject, html } = buildOkotowariEmail({ ...baseParams, reason });
      expect(subject).toBeTruthy();
      expect(html).toContain("<!DOCTYPE html>");
    }
  });
});
