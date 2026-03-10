/**
 * JSON-LD 構造化データ生成ユーティリティ
 *
 * Google Rich Results / Schema.org 準拠の構造化データを生成する。
 * 各ページコンポーネントで import して <script type="application/ld+json"> に注入する。
 */

const SITE_URL = "https://lexcard.jp";
const SITE_NAME = "LexCard";
const ORG_NAME = "HIME Systems（こうな姫株式会社）";
const ORG_URL = "https://tapitapitrip.jp";

// ─── Organization ──────────────────────────────────────
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    alternateName: ["HIME Systems", "こうな姫株式会社"],
    url: ORG_URL,
    logo: `${SITE_URL}/icon-512.png`,
    sameAs: ["https://github.com/kounaalice"],
    foundingDate: "2024",
    areaServed: "JP",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: `${SITE_URL}/contact`,
      availableLanguage: ["Japanese", "English"],
    },
  };
}

// ─── WebSite + SearchAction ────────────────────────────
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "法令アクセス支援システム",
    url: SITE_URL,
    publisher: { "@type": "Organization", name: ORG_NAME },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "ja",
  };
}

// ─── BreadcrumbList ────────────────────────────────────
export interface BreadcrumbItem {
  name: string;
  href: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`,
    })),
  };
}

// ─── FAQPage ───────────────────────────────────────────
export interface FAQItem {
  question: string;
  answer: string;
}

export function faqPageJsonLd(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ─── Legislation (法令ページ用) ────────────────────────
export function legislationJsonLd(params: {
  lawId: string;
  title: string;
  lawNum?: string;
  articleCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: params.title,
    ...(params.lawNum ? { alternateName: params.lawNum } : {}),
    legislationIdentifier: params.lawId,
    inLanguage: "ja",
    url: `${SITE_URL}/law/${params.lawId}`,
    publisher: { "@type": "Organization", name: ORG_NAME },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(params.articleCount ? { description: `全${params.articleCount}条` } : {}),
  };
}

// ─── SoftwareApplication ───────────────────────────────
export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    alternateName: "法令アクセス支援システム",
    applicationCategory: "LegalService",
    operatingSystem: "Web",
    url: SITE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    publisher: { "@type": "Organization", name: ORG_NAME },
  };
}
