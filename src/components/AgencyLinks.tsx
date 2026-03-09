"use client";

import { getAgencyLinks, type AgencyLink } from "@/lib/situations";

interface Props {
  situationIds: string[];
}

export default function AgencyLinksSection({ situationIds }: Props) {
  const agencies = getAgencyLinks(situationIds);

  if (agencies.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {agencies.map((a: AgencyLink) => (
        <a
          key={a.url}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.6rem 0.75rem",
            borderRadius: "6px",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            color: "var(--color-text-primary)",
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{a.name}</div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--color-text-secondary)",
                marginTop: "0.15rem",
              }}
            >
              {a.description}
            </div>
          </div>
          <span style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem", flexShrink: 0 }}>
            ↗
          </span>
        </a>
      ))}
    </div>
  );
}
