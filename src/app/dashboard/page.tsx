"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession, type Session } from "@/lib/session";
import { getHistory, type BrowsingHistoryEntry } from "@/lib/history";
import { getFollows, type FollowEntry } from "@/lib/follows";
import { getBookmarks, type Bookmark } from "@/lib/bookmarks";
import { getAllNotes, getNoteCounts, type NoteEntry, type NoteCounts } from "@/lib/notes";
import OnboardingBanner from "@/components/OnboardingBanner";
import AgencyLinksSection from "@/components/AgencyLinks";
import { mergeSituationProfile } from "@/lib/situations";
import { loadSettings } from "@/lib/settings";
import { getGamingStats, type GamingStats } from "@/lib/gaming";
import { getCollectionStats, type CollectionStats } from "@/lib/cards";

import QuickStatsWidget from "@/components/dashboard/QuickStatsWidget";
import TasksWidget from "@/components/dashboard/TasksWidget";
import UpcomingLawsWidget from "@/components/dashboard/UpcomingLawsWidget";
import GamingWidget from "@/components/dashboard/GamingWidget";
import BookmarksWidget from "@/components/dashboard/BookmarksWidget";
import FollowsWidget from "@/components/dashboard/FollowsWidget";
import HistoryWidget from "@/components/dashboard/HistoryWidget";
import NotesWidget from "@/components/dashboard/NotesWidget";
import WidgetToggle from "@/components/dashboard/WidgetToggle";
import AiAssistantWidget from "@/components/dashboard/AiAssistantWidget";
import { W100Widget } from "@/components/dashboard/W100Widget";
import { type WidgetId, loadWidgetVisibility } from "@/components/dashboard/types";

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [follows, setFollows] = useState<FollowEntry[]>([]);
  const [history, setHistory] = useState<BrowsingHistoryEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [noteCounts, setNoteCounts] = useState<NoteCounts>({ memos: 0, annotations: 0, total: 0 });
  const [upcomingLaws, setUpcomingLaws] = useState<
    {
      id: string;
      type: string;
      date: string;
      title: string;
      subtitle?: string;
      link?: string;
      color: string;
    }[]
  >([]);
  const [situationCompleted, setSituationCompleted] = useState(true);
  const [situationIds, setSituationIds] = useState<string[]>([]);
  const [gamingStats, setGamingStats] = useState<GamingStats | null>(null);
  const [cardStats, setCardStats] = useState<CollectionStats | null>(null);
  const [gamingEnabled, setGamingEnabled] = useState(false);
  const [vis, setVis] = useState<Record<WidgetId, boolean>>(loadWidgetVisibility);

  useEffect(() => {
    const s = getSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(s);
    setLoading(false);
    if (s) {
      setFollows(getFollows());
      setHistory(getHistory().slice(0, 10));
      setBookmarks(getBookmarks());
      setNotes(getAllNotes());
      setNoteCounts(getNoteCounts());
      const isGaming = loadSettings().gamingMode;
      setGamingEnabled(isGaming);
      if (isGaming) {
        setGamingStats(getGamingStats());
        setCardStats(getCollectionStats());
      }
      // 施行予定取得
      const now = new Date();
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const future = new Date(now);
      future.setMonth(future.getMonth() + 3);
      const to = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;
      fetch(`/api/calendar/events?member_id=${s.memberId}&from=${from}&to=${to}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.events) {
            const laws = d.events
              .filter(
                (e: { type: string }) => e.type === "enforcement" || e.type === "promulgation",
              )
              .slice(0, 3);
            setUpcomingLaws(laws);
          }
        })
        .catch(() => {});
      // 状況プロフィール取得
      fetch(
        `/api/members?name=${encodeURIComponent(s.name)}&org=${encodeURIComponent(s.org || "")}`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.profile?.situation_profile) {
            const sp = mergeSituationProfile(d.profile.situation_profile);
            setSituationCompleted(!!sp.completed_at);
            setSituationIds(sp.situations);
          } else {
            setSituationCompleted(false);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Loading
  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans)",
          color: "var(--color-text-secondary)",
          padding: "4rem 1rem",
        }}
      >
        読み込み中...
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg)",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "2.5rem 2rem",
            textAlign: "center",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "0.75rem",
            }}
          >
            ログインが必要です
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1.5rem",
              lineHeight: 1.7,
            }}
          >
            マイページを表示するにはログインしてください。
          </p>
          <Link
            href="/login?return=/dashboard"
            style={{
              display: "inline-block",
              padding: "0.7rem 1.5rem",
              backgroundColor: "var(--color-accent)",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

  // Stats
  const followedLaws = follows.filter((f) => f.type === "law");
  const followedProjects = follows.filter((f) => f.type === "project");
  const uniqueLawIds = new Set(history.map((h) => h.lawId));
  const profileSlug = encodeURIComponent(session.name + "___" + (session.org || ""));

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1.5rem 1.5rem 3rem" }}>
        {/* Breadcrumb */}
        <nav
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
            トップ
          </Link>
          <span style={{ margin: "0 0.4rem" }}>{" \u203A "}</span>
          <span>マイページ</span>
        </nav>

        {/* Header + Widget Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "2rem",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "0.35rem",
              }}
            >
              こんにちは、{session.name}さん
            </h1>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}
            >
              {session.org && (
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {session.org}
                </span>
              )}
              <Link
                href={`/members/${profileSlug}`}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                }}
              >
                プロフィールを見る
              </Link>
              <Link
                href="/dashboard/chat"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                }}
              >
                チャット
              </Link>
              <Link
                href="/dashboard/notes"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                }}
              >
                マイノート
              </Link>
            </div>
          </div>
          <WidgetToggle
            visibility={vis}
            onChange={setVis}
            gamingEnabled={gamingEnabled}
            hasAgencies={situationIds.length > 0}
          />
        </div>

        {/* Onboarding */}
        <OnboardingBanner situationCompleted={situationCompleted} />

        {/* Widgets */}
        {vis.stats && (
          <QuickStatsWidget
            followedLaws={followedLaws.length}
            followedProjects={followedProjects.length}
            viewedLaws={uniqueLawIds.size}
            bookmarks={bookmarks.length}
            memos={noteCounts.memos}
            annotations={noteCounts.annotations}
          />
        )}

        {vis.ai && <AiAssistantWidget />}

        {vis.gaming && gamingStats && <GamingWidget stats={gamingStats} cardStats={cardStats} />}

        {vis.tasks && <TasksWidget memberId={session.memberId} memberName={session.name} />}

        {vis.upcoming && <UpcomingLawsWidget events={upcomingLaws} />}

        {vis.agencies && situationIds.length > 0 && (
          <section style={{ marginBottom: "2.5rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "3px",
                  height: "1rem",
                  backgroundColor: "var(--color-accent)",
                  borderRadius: "2px",
                }}
              />
              関連する行政機関
            </h2>
            <AgencyLinksSection situationIds={situationIds} />
          </section>
        )}

        {vis.bookmarks && <BookmarksWidget bookmarks={bookmarks} />}

        {vis.follows && <FollowsWidget follows={follows} />}

        {vis.history && <HistoryWidget history={history} />}

        {vis.notes && <NotesWidget notes={notes} noteCounts={noteCounts} />}

        {vis.w100 && <W100Widget />}
      </div>
    </div>
  );
}
