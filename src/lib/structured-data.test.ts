import { describe, it, expect } from "vitest";
import {
  organizationJsonLd,
  websiteJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  legislationJsonLd,
  softwareApplicationJsonLd,
} from "./structured-data";

describe("organizationJsonLd", () => {
  it("正しい型と必須フィールドを含む", () => {
    const ld = organizationJsonLd();
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Organization");
    expect(ld.name).toContain("HIME Systems");
    expect(ld.url).toBe("https://tapitapitrip.jp");
    expect(ld.logo).toMatch(/^https:\/\/lexcard\.jp\//);
  });
});

describe("websiteJsonLd", () => {
  it("SearchActionを含む", () => {
    const ld = websiteJsonLd();
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.potentialAction["@type"]).toBe("SearchAction");
    expect(ld.potentialAction.target.urlTemplate).toContain("{search_term_string}");
    expect(ld.potentialAction["query-input"]).toBe("required name=search_term_string");
  });

  it("サイト名と言語を含む", () => {
    const ld = websiteJsonLd();
    expect(ld.name).toBe("LexCard");
    expect(ld.inLanguage).toBe("ja");
  });
});

describe("breadcrumbJsonLd", () => {
  it("パンくずリストを正しく構築する", () => {
    const ld = breadcrumbJsonLd([
      { name: "ホーム", href: "/" },
      { name: "民法", href: "/law/129AC0000000089" },
    ]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement).toHaveLength(2);
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[0].name).toBe("ホーム");
    expect(ld.itemListElement[0].item).toBe("https://lexcard.jp/");
    expect(ld.itemListElement[1].position).toBe(2);
    expect(ld.itemListElement[1].item).toBe("https://lexcard.jp/law/129AC0000000089");
  });

  it("絶対URLはそのまま使用する", () => {
    const ld = breadcrumbJsonLd([{ name: "外部", href: "https://example.com" }]);
    expect(ld.itemListElement[0].item).toBe("https://example.com");
  });

  it("空配列でも動作する", () => {
    const ld = breadcrumbJsonLd([]);
    expect(ld.itemListElement).toHaveLength(0);
  });
});

describe("faqPageJsonLd", () => {
  it("FAQ項目をQuestion/Answer形式に変換する", () => {
    const ld = faqPageJsonLd([
      { question: "LexCardとは？", answer: "無料の法令アクセス基盤です。" },
      { question: "登録は必要？", answer: "不要です。" },
    ]);
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(2);
    expect(ld.mainEntity[0]["@type"]).toBe("Question");
    expect(ld.mainEntity[0].name).toBe("LexCardとは？");
    expect(ld.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("無料の法令アクセス基盤です。");
  });
});

describe("legislationJsonLd", () => {
  it("法令ページの構造化データを生成する", () => {
    const ld = legislationJsonLd({
      lawId: "129AC0000000089",
      title: "民法",
      lawNum: "明治29年法律第89号",
      articleCount: 1050,
    });
    expect(ld["@type"]).toBe("Legislation");
    expect(ld.name).toBe("民法");
    expect(ld.alternateName).toBe("明治29年法律第89号");
    expect(ld.legislationIdentifier).toBe("129AC0000000089");
    expect(ld.url).toBe("https://lexcard.jp/law/129AC0000000089");
    expect(ld.description).toBe("全1050条");
  });

  it("lawNum省略時はalternateNameを含まない", () => {
    const ld = legislationJsonLd({ lawId: "test", title: "テスト法" });
    expect(ld).not.toHaveProperty("alternateName");
  });

  it("articleCount省略時はdescriptionを含まない", () => {
    const ld = legislationJsonLd({ lawId: "test", title: "テスト法" });
    expect(ld).not.toHaveProperty("description");
  });
});

describe("softwareApplicationJsonLd", () => {
  it("無料のSoftwareApplicationを生成する", () => {
    const ld = softwareApplicationJsonLd();
    expect(ld["@type"]).toBe("SoftwareApplication");
    expect(ld.offers.price).toBe("0");
    expect(ld.offers.priceCurrency).toBe("JPY");
    expect(ld.applicationCategory).toBe("LegalService");
  });
});
