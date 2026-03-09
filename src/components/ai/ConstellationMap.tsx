"use client";

import { useMemo } from "react";
import { CATEGORY_GROUPS } from "@/lib/categories";

/* ── Types ── */

export interface MapNode {
  id: string; // lawId:articleNum
  lawId: string;
  lawTitle: string;
  articleNum: string;
  articleTitle: string;
  score: number;
  categoryGroup: string;
  chapterTitle: string;
}

interface Props {
  query: string;
  nodes: MapNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  rareThreshold?: number;
}

/* ── Color helpers ── */

const GROUP_COLORS: Record<string, { fill: string; bg: string }> = {};
for (const g of CATEGORY_GROUPS) {
  GROUP_COLORS[g.id] = { fill: g.color, bg: g.bg };
}
function getColor(group: string) {
  return GROUP_COLORS[group] ?? { fill: "#64748B", bg: "#F1F5F9" };
}

/* ── Layout constants ── */

const CX = 250;
const CY = 250;
const R_HUB = 100; // law hub ring radius
const R_ARTICLE = 190; // article node ring radius
const VIEW = 500;

/* ── Component ── */

export default function ConstellationMap({
  query,
  nodes,
  selectedId,
  onSelect,
  rareThreshold = 0,
}: Props) {
  const layout = useMemo(() => computeLayout(nodes), [nodes]);

  if (nodes.length === 0) return null;

  return (
    <div style={{ width: "100%", maxWidth: 540, margin: "0 auto" }}>
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width="100%"
        style={{ maxHeight: 480, display: "block" }}
      >
        {/* ── SVG Defs for rare glow ── */}
        <defs>
          <filter id="rareGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="rareShimmer">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* ── Edges ── */}
        {layout.articles.map((a) => {
          const hub = layout.hubs.find((h) => h.lawId === a.lawId);
          if (!hub) return null;
          return (
            <g key={`edge-${a.id}`}>
              {/* center → hub */}
              <line
                x1={CX}
                y1={CY}
                x2={hub.x}
                y2={hub.y}
                stroke={getColor(hub.categoryGroup).fill}
                strokeWidth={1.5}
                opacity={0.2}
              />
              {/* hub → article */}
              <line
                x1={hub.x}
                y1={hub.y}
                x2={a.x}
                y2={a.y}
                stroke={getColor(a.categoryGroup).fill}
                strokeWidth={1}
                opacity={Math.max(0.15, a.score * 0.8)}
              />
            </g>
          );
        })}

        {/* ── Center node (query) ── */}
        <circle cx={CX} cy={CY} r={16} fill="var(--color-accent)" opacity={0.9} />
        <text
          x={CX}
          y={CY + 28}
          textAnchor="middle"
          fontSize={10}
          fill="var(--color-text-secondary)"
          style={{ pointerEvents: "none" }}
        >
          {query.length > 12 ? query.slice(0, 12) + "..." : query}
        </text>

        {/* ── Hub nodes (laws) ── */}
        {layout.hubs.map((hub) => {
          const c = getColor(hub.categoryGroup);
          const isSelected = layout.articles.some(
            (a) => a.lawId === hub.lawId && a.id === selectedId,
          );
          return (
            <g key={`hub-${hub.lawId}`}>
              <circle
                cx={hub.x}
                cy={hub.y}
                r={hub.r}
                fill={c.bg}
                stroke={c.fill}
                strokeWidth={isSelected ? 2.5 : 1.5}
                style={{ cursor: "pointer", transition: "stroke-width 0.15s" }}
                onClick={() => {
                  const firstArticle = layout.articles.find((a) => a.lawId === hub.lawId);
                  if (firstArticle) onSelect(firstArticle.id);
                }}
              />
              <text
                x={hub.x}
                y={hub.y + 3}
                textAnchor="middle"
                fontSize={8}
                fontWeight={600}
                fill={c.fill}
                style={{ pointerEvents: "none" }}
              >
                {hub.label}
              </text>
              {/* article count badge */}
              {hub.count > 1 && (
                <>
                  <circle cx={hub.x + hub.r - 2} cy={hub.y - hub.r + 2} r={7} fill={c.fill} />
                  <text
                    x={hub.x + hub.r - 2}
                    y={hub.y - hub.r + 5}
                    textAnchor="middle"
                    fontSize={8}
                    fill="#fff"
                    style={{ pointerEvents: "none" }}
                  >
                    {hub.count}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* ── Article nodes ── */}
        {layout.articles.map((a) => {
          const c = getColor(a.categoryGroup);
          const isSel = a.id === selectedId;
          const isRare = rareThreshold > 0 && a.score > 0 && a.score <= rareThreshold;
          const r = 4 + a.score * 10;
          return (
            <g key={`art-${a.id}`}>
              {/* Rare: outer glow ring */}
              {isRare && (
                <circle
                  cx={a.x}
                  cy={a.y}
                  r={r + 8}
                  fill="url(#rareShimmer)"
                  style={{ pointerEvents: "none" }}
                >
                  <animate
                    attributeName="opacity"
                    values="0.6;1;0.6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={a.x}
                cy={a.y}
                r={isSel ? r + 3 : r}
                fill={isSel ? c.fill : isRare ? "#FFFBEB" : c.bg}
                stroke={isRare ? "#F59E0B" : c.fill}
                strokeWidth={isSel ? 2.5 : isRare ? 2 : 1}
                filter={isRare ? "url(#rareGlow)" : undefined}
                style={{ cursor: "pointer", transition: "all 0.15s" }}
                onClick={() => onSelect(isSel ? null : a.id)}
              />
              {/* Rare badge */}
              {isRare && (
                <text
                  x={a.x + r + 2}
                  y={a.y - r + 2}
                  fontSize={7}
                  fontWeight={700}
                  fill="#D97706"
                  style={{ pointerEvents: "none" }}
                >
                  ✦
                </text>
              )}
              <text
                x={a.x}
                y={a.y + r + 12}
                textAnchor="middle"
                fontSize={7}
                fill={isRare ? "#D97706" : "var(--color-text-secondary)"}
                fontWeight={isRare ? 600 : 400}
                style={{ pointerEvents: "none" }}
              >
                {a.articleNum}
              </text>
            </g>
          );
        })}

        {/* ── Legend ── */}
        {layout.legendGroups.map((lg, i) => {
          const c = getColor(lg.id);
          const y = 16 + i * 16;
          return (
            <g key={`legend-${lg.id}`}>
              <circle cx={12} cy={y} r={5} fill={c.fill} />
              <text x={22} y={y + 4} fontSize={9} fill="var(--color-text-secondary)">
                {lg.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Layout computation ── */

interface HubLayout {
  lawId: string;
  label: string;
  categoryGroup: string;
  x: number;
  y: number;
  r: number;
  count: number;
  angle: number;
}
interface ArticleLayout {
  id: string;
  lawId: string;
  categoryGroup: string;
  articleNum: string;
  score: number;
  x: number;
  y: number;
}

function computeLayout(nodes: MapNode[]) {
  // Group by lawId
  const groups = new Map<string, MapNode[]>();
  for (const n of nodes) {
    const arr = groups.get(n.lawId) ?? [];
    arr.push(n);
    groups.set(n.lawId, arr);
  }

  // Sort groups by highest score
  const sorted = [...groups.entries()].sort(
    (a, b) => Math.max(...b[1].map((n) => n.score)) - Math.max(...a[1].map((n) => n.score)),
  );

  const totalArticles = nodes.length;
  const hubs: HubLayout[] = [];
  const articles: ArticleLayout[] = [];
  let angleOffset = -Math.PI / 2; // start from top

  for (const [lawId, group] of sorted) {
    const sectorAngle = (group.length / totalArticles) * 2 * Math.PI;
    const midAngle = angleOffset + sectorAngle / 2;

    // Hub node
    const hx = CX + R_HUB * Math.cos(midAngle);
    const hy = CY + R_HUB * Math.sin(midAngle);
    const title = group[0].lawTitle;
    const label = title.length > 6 ? title.slice(0, 6) + ".." : title;

    hubs.push({
      lawId,
      label,
      categoryGroup: group[0].categoryGroup,
      x: hx,
      y: hy,
      r: Math.max(14, 10 + group.length * 3),
      count: group.length,
      angle: midAngle,
    });

    // Article nodes spread within sector
    const sortedArticles = [...group].sort((a, b) => b.score - a.score);
    const step = group.length > 1 ? sectorAngle / group.length : 0;
    const startAngle = angleOffset + (group.length > 1 ? step / 2 : sectorAngle / 2);

    for (let i = 0; i < sortedArticles.length; i++) {
      const a = sortedArticles[i];
      const aAngle = startAngle + i * step;
      const ax = CX + R_ARTICLE * Math.cos(aAngle);
      const ay = CY + R_ARTICLE * Math.sin(aAngle);

      articles.push({
        id: `${a.lawId}:${a.articleNum}`,
        lawId: a.lawId,
        categoryGroup: a.categoryGroup,
        articleNum: a.articleNum,
        score: a.score,
        x: ax,
        y: ay,
      });
    }

    angleOffset += sectorAngle;
  }

  // Legend: unique category groups present
  const seen = new Set<string>();
  const legendGroups: { id: string; label: string }[] = [];
  for (const h of hubs) {
    if (!seen.has(h.categoryGroup)) {
      seen.add(h.categoryGroup);
      const cg = CATEGORY_GROUPS.find((g) => g.id === h.categoryGroup);
      if (cg) legendGroups.push({ id: cg.id, label: cg.label });
    }
  }

  return { hubs, articles, legendGroups };
}
