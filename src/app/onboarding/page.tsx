"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSession, type Session } from "@/lib/session";
import OnboardingWizard from "./OnboardingWizard";

export default function OnboardingPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%", padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)" }}>
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%", padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-secondary)",
              marginBottom: "1rem",
            }}
          >
            オンボーディングにはログインが必要です。
          </p>
          <Link
            href="/login?return=/onboarding"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-accent)",
              textDecoration: "none",
            }}
          >
            ログイン →
          </Link>
        </div>
      </div>
    );
  }

  return <OnboardingWizard session={session} />;
}
