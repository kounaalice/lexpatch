"use client";

import Link from "next/link";

interface LawEvent {
  id: string;
  type: string;
  date: string;
  title: string;
  subtitle?: string;
  link?: string;
  color: string;
}

interface Props {
  events: LawEvent[];
}

export default function UpcomingLawsWidget({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <section style={{ marginBottom: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <SectionHeading label="施行・公布予定" />
        <Link
          href="/dashboard/schedule"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--color-accent)",
            textDecoration: "none",
          }}
        >
          もっと見る →
        </Link>
      </div>
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {events.map((ev, i) => (
          <div
            key={ev.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.65rem 1rem",
              borderBottom: i < events.length - 1 ? "1px solid var(--color-border)" : "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
                minWidth: "5.5rem",
                flexShrink: 0,
              }}
            >
              {ev.date.replace(/-/g, "/")}
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.68rem",
                fontWeight: 700,
                color: ev.color,
                backgroundColor: `${ev.color}15`,
                padding: "0.1rem 0.4rem",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {ev.type === "enforcement" ? "施行" : "公布"}
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-primary)",
                fontWeight: 600,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {ev.link ? (
                <Link
                  href={ev.link}
                  style={{ color: "var(--color-accent)", textDecoration: "none" }}
                >
                  {ev.title}
                </Link>
              ) : (
                ev.title
              )}
            </span>
            {ev.subtitle && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-secondary)",
                  flexShrink: 0,
                }}
              >
                {ev.subtitle}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.95rem",
        fontWeight: 700,
        color: "var(--color-text-primary)",
        marginBottom: 0,
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
      {label}
    </h2>
  );
}
