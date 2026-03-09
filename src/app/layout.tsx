import type { Metadata } from "next";
import "./globals.css";
import "./themes.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { GamingOverlay } from "@/components/GamingOverlay";
import { SWUpdateToast } from "@/components/layout/SWUpdateToast";
import { BottomNav } from "@/components/layout/BottomNav";
import { AiGuideButton } from "@/components/ai/AiGuideButton";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lexcard.jp"),
  title: {
    default: "LexCard — 法令アクセス支援システム",
    template: "%s | LexCard",
  },
  description:
    "HIME Systems（こうな姫株式会社）が公共目的で無償提供する法令アクセス基盤。e-Gov法令検索APIに基づく法令の閲覧・検索・改正案作成機能を、すべて無料・登録不要で提供。新旧対照表・改め文の自動生成、プロジェクト管理・逐条解説にも対応。",
  openGraph: {
    title: "LexCard — 法令アクセス支援システム",
    description:
      "公共目的で無償提供する法令アクセス基盤。法令の閲覧・検索・改正案作成を無料・登録不要で。新旧対照表・改め文の自動生成、プロジェクト管理に対応。",
    siteName: "LexCard by HIME Systems",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LexCard — 法令アクセス支援システム",
    description:
      "公共目的で無償提供する法令アクセス基盤。法令の閲覧・検索・改正案作成を無料・登録不要で。",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* Google Fonts — preconnect で TLS 接続を事前確立、CSS @import 廃止で FCP 改善 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        {/* e-Gov API への DNS 事前解決 */}
        <link rel="dns-prefetch" href="https://laws.e-gov.go.jp" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0369A1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LexCard" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        style={{
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* テーマ・ゲーミングモード即時適用（フラッシュ防止） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('lp_theme');if(t&&t!=='system')document.documentElement.setAttribute('data-theme',t);if(localStorage.getItem('lp_gamingMode')==='true')document.documentElement.setAttribute('data-gaming','true')})()`,
          }}
        />
        <a href="#main-content" className="skip-link">
          本文へスキップ
        </a>
        <Header />
        <main id="main-content" role="main" aria-label="メインコンテンツ" style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
        <BottomNav />
        <AiGuideButton />
        <OfflineIndicator />
        <GamingOverlay />
        <SWUpdateToast />
        {/* Service Worker 登録 + 更新検知 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').then(function(reg){window.__swReg=reg;reg.onupdatefound=function(){var w=reg.installing;if(!w)return;w.onstatechange=function(){if(w.state==='installed'&&navigator.serviceWorker.controller){window.dispatchEvent(new CustomEvent('lexcard:sw-update'))}}}}).catch(function(){})})}`,
          }}
        />
      </body>
    </html>
  );
}
