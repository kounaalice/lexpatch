"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSession } from "@/lib/session";
import { getAllEvents } from "@/lib/ws-events";
import { getAllDocuments } from "@/lib/ws-documents";
import { getAllTables } from "@/lib/ws-datatable";
import { getAllEntries } from "@/lib/ws-timetrack";
import { getAllContacts } from "@/lib/ws-contacts";
import { getAllArticles } from "@/lib/ws-knowledge";
import { getTicketStats } from "@/lib/ws-tickets";
import { getAllContracts } from "@/lib/ws-contracts";
import { getAllPolls } from "@/lib/ws-scheduling";
import { getAllSlots } from "@/lib/ws-booking";
import { getAllExpenses } from "@/lib/ws-expenses";
import { getAllFeeds } from "@/lib/ws-rss";
import { getAllCourses } from "@/lib/ws-learning";
import { getAllGoals } from "@/lib/ws-goals";
import { getAllHabits } from "@/lib/ws-habits";
import { getAllSignatures } from "@/lib/ws-signatures";

const TOOLS = [
  {
    href: "/ws/calendar",
    icon: "📅",
    label: "カレンダー",
    desc: "予定・タスク・施行日を一元管理。リマインダー通知対応",
  },
  {
    href: "/ws/timeline",
    icon: "📊",
    label: "タイムライン",
    desc: "フェーズ・期限のガントバー表示",
  },
  {
    href: "/ws/scheduling",
    icon: "🗓",
    label: "日程調整",
    desc: "候補日を提示してメンバーの都合を集約",
  },
  {
    href: "/ws/booking",
    icon: "📆",
    label: "予約枠",
    desc: "面談・会議室などの予約枠を公開・管理",
  },
  {
    href: "/ws/docs",
    icon: "📄",
    label: "文書作成",
    desc: "テンプレートから文書を作成。版管理対応",
  },
  { href: "/ws/ledger", icon: "📑", label: "文書台帳", desc: "保存文書の一覧・検索・管理" },
  {
    href: "/ws/forms",
    icon: "📋",
    label: "フォーム",
    desc: "申請・アンケートの作成・公開・承認連携",
  },
  {
    href: "/ws/approvals",
    icon: "✅",
    label: "承認",
    desc: "多段階承認フロー・代理承認・履歴ログ",
  },
  {
    href: "/ws/datatable",
    icon: "📊",
    label: "データテーブル",
    desc: "軽量表計算・チャート表示・CSV取込/出力",
  },
  {
    href: "/ws/timetrack",
    icon: "⏱",
    label: "作業時間",
    desc: "出退勤打刻・勤務レポート・単価計算",
  },
  {
    href: "/ws/expenses",
    icon: "💰",
    label: "経費・請求",
    desc: "経費記録・時間単価設定・請求書作成",
  },
  { href: "/ws/bulletin", icon: "📌", label: "掲示板", desc: "お知らせ・連絡事項の掲示" },
  {
    href: "/ws/circular",
    icon: "📨",
    label: "回覧・確認",
    desc: "メンバーへの回覧と確認状況の管理",
  },
  {
    href: "/ws/contacts",
    icon: "📇",
    label: "連絡先台帳",
    desc: "取引先・担当者の管理・案件紐付け",
  },
  { href: "/ws/knowledge", icon: "📚", label: "ナレッジ", desc: "社内ナレッジベース・FAQ管理" },
  {
    href: "/ws/tickets",
    icon: "🎫",
    label: "チケット",
    desc: "課題・要望の管理・テンプレ回答対応",
  },
  {
    href: "/ws/contracts",
    icon: "📝",
    label: "契約台帳",
    desc: "契約の期限管理・自動更新アラート",
  },
  { href: "/ws/regulations", icon: "📖", label: "社内規程", desc: "社内規程の版管理・差分表示" },
  {
    href: "/ws/certifications",
    icon: "🏅",
    label: "資格・期限",
    desc: "資格・免許の期限管理とアラート",
  },
  {
    href: "/ws/rss",
    icon: "📡",
    label: "RSS・情報収集",
    desc: "官報・法令フィードの収集・既読管理",
  },
  { href: "/ws/slides", icon: "🎞", label: "スライド", desc: "Markdownスライド作成・プレゼン表示" },
  {
    href: "/ws/learning",
    icon: "🎓",
    label: "学習コース",
    desc: "スライド教材・クイズの作成と受講管理",
  },
  {
    href: "/ws/goals",
    icon: "🎯",
    label: "目標・OKR",
    desc: "目標設定・KR進捗管理・四半期レビュー",
  },
  {
    href: "/ws/habits",
    icon: "✅",
    label: "習慣トラッカー",
    desc: "日々の習慣記録・連続日数・達成率",
  },
  {
    href: "/ws/signatures",
    icon: "✍️",
    label: "電子署名",
    desc: "テキスト・手書き署名の作成・管理",
  },
  {
    href: "/ws/webhooks",
    icon: "🔗",
    label: "Webhook",
    desc: "外部連携用Webhook URLの設定・テスト",
  },
  { href: "/ws/bookmarks", icon: "🔖", label: "ブックマーク", desc: "業務リンクの整理・共有" },
  { href: "/stats", icon: "📈", label: "利用統計", desc: "法令閲覧・ブックマーク・活動の統計" },
  { href: "/ws/guide", icon: "❓", label: "ガイド", desc: "LexCardの使い方・ヘルプ" },
];

export default function WorkspaceHub() {
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [stats, setStats] = useState({
    events: 0,
    docs: 0,
    tables: 0,
    timeEntries: 0,
    contacts: 0,
    articles: 0,
    tickets: 0,
    contracts: 0,
    polls: 0,
    slots: 0,
    expenses: 0,
    feeds: 0,
    courses: 0,
    goals: 0,
    habits: 0,
    signatures: 0,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(getSession());
    const ticketStats = getTicketStats();
    setStats({
      events: getAllEvents().length,
      docs: getAllDocuments().length,
      tables: getAllTables().length,
      timeEntries: getAllEntries().length,
      contacts: getAllContacts().length,
      articles: getAllArticles().length,
      tickets: ticketStats.open + ticketStats.inProgress,
      contracts: getAllContracts().length,
      polls: getAllPolls().length,
      slots: getAllSlots().length,
      expenses: getAllExpenses().length,
      feeds: getAllFeeds().length,
      courses: getAllCourses().length,
      goals: getAllGoals().length,
      habits: getAllHabits().length,
      signatures: getAllSignatures().length,
    });
  }, []);

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダー */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
              display: "flex",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>&rsaquo;</span>
            <span>ワークスペース</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "3px",
                height: "1.8rem",
                backgroundColor: "var(--color-accent)",
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              ワークスペース
            </h1>
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.4rem",
              lineHeight: 1.6,
            }}
          >
            カレンダー・文書作成・フォーム・承認フローなど、業務を支援するツール群
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
        {/* ツールグリッド */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={session ? tool.href : `/login?return=${encodeURIComponent(tool.href)}`}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "1rem 1.25rem",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                textDecoration: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span
                style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0, marginTop: "0.1rem" }}
              >
                {tool.icon}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {tool.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    color: "var(--color-text-secondary)",
                    marginTop: "0.2rem",
                    lineHeight: 1.5,
                  }}
                >
                  {tool.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* クイック統計 */}
        {session && Object.values(stats).some((v) => v > 0) && (
          <section style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  width: "3px",
                  height: "1rem",
                  backgroundColor: "var(--color-accent)",
                  borderRadius: "2px",
                  display: "inline-block",
                }}
              />
              利用状況
            </h2>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {stats.events > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.events}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    個人予定
                  </div>
                </div>
              )}
              {stats.docs > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.docs}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    作成文書
                  </div>
                </div>
              )}
              {stats.tables > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.tables}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    テーブル
                  </div>
                </div>
              )}
              {stats.timeEntries > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.timeEntries}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    勤怠記録
                  </div>
                </div>
              )}
              {stats.contacts > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.contacts}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    連絡先
                  </div>
                </div>
              )}
              {stats.tickets > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#D97706" }}>
                    {stats.tickets}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    未完了チケット
                  </div>
                </div>
              )}
              {stats.contracts > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.contracts}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    契約
                  </div>
                </div>
              )}
              {stats.polls > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.polls}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    日程調整
                  </div>
                </div>
              )}
              {stats.expenses > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.expenses}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    経費記録
                  </div>
                </div>
              )}
              {stats.goals > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.goals}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    目標
                  </div>
                </div>
              )}
              {stats.habits > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.habits}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    習慣
                  </div>
                </div>
              )}
              {stats.courses > 0 && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <div
                    style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent)" }}
                  >
                    {stats.courses}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    学習コース
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 未ログイン案内 */}
        {!session && (
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
                marginBottom: "1rem",
              }}
            >
              ログインするとワークスペースの全機能を利用できます
            </p>
            <Link
              href={`/login?return=${encodeURIComponent("/ws")}`}
              style={{
                display: "inline-block",
                padding: "0.6rem 1.5rem",
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ログインする
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
