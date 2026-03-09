"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Props {
  situationCompleted: boolean;
}

export default function OnboardingBanner({ situationCompleted }: Props) {
  const [dismissed, setDismissed] = useState(true); // hidden by default until check

  useEffect(() => {
    if (situationCompleted) return;
    const d = localStorage.getItem("lp_onboarding_dismissed");
    setDismissed(!!d);
  }, [situationCompleted]);

  if (situationCompleted || dismissed) return null;

  return (
    <div
      style={{
        backgroundColor: "#EBF5FF",
        border: "1px solid var(--color-accent)",
        borderRadius: "10px",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            marginBottom: "0.3rem",
          }}
        >
          あなたに合った法令を見つけましょう
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          生活状況・業種・職種を設定すると、関連する法令を自動フォローできます。
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <Link
          href="/onboarding"
          style={{
            padding: "0.45rem 1rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            fontWeight: 600,
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          設定する →
        </Link>
        <button
          onClick={() => {
            localStorage.setItem("lp_onboarding_dismissed", "1");
            setDismissed(true);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            color: "var(--color-text-secondary)",
            padding: "0.25rem",
            lineHeight: 1,
          }}
          aria-label="閉じる"
        >
          ×
        </button>
      </div>
    </div>
  );
}
