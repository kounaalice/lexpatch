"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { W100_FIELD_GROUPS, W100_FIELDS, getFieldGroup } from "@/lib/w100-data";

// ── 接続タイプ ──

type ConnectionType = "adjacent" | "cross" | "application";

interface FieldConnection {
  from: string;
  to: string;
  type: ConnectionType;
  label: string;
}

// ── 分野間接続の静的データ ──

const CONNECTIONS: FieldConnection[] = [
  // 総合・百科 (00) は多分野に接続
  { from: "00", to: "02", type: "adjacent", label: "百科 → データサイエンス" },
  { from: "00", to: "10", type: "cross", label: "百科 → 哲学" },
  { from: "00", to: "20", type: "cross", label: "百科 → 社会学" },
  { from: "00", to: "40", type: "cross", label: "百科 → 数学" },
  { from: "00", to: "99", type: "cross", label: "百科 → リベラルアーツ" },

  // 人文 ↔ 社会科学
  { from: "10", to: "24", type: "cross", label: "哲学 → 法学" },
  { from: "12", to: "18", type: "adjacent", label: "歴史学 → 文化人類学" },
  { from: "13", to: "22", type: "cross", label: "言語学 → 心理学" },

  // 社会科学 内・外
  { from: "21", to: "27", type: "adjacent", label: "政治学 → 公共政策" },
  { from: "24", to: "33", type: "application", label: "法学 → ビジネス法" },
  { from: "25", to: "31", type: "application", label: "経済学 → 会計・ファイナンス" },
  { from: "24", to: "88", type: "application", label: "法学 → 保健政策" },

  // 自然科学 ↔ 工学
  { from: "42", to: "60", type: "application", label: "物理学 → 機械工学" },
  { from: "43", to: "65", type: "application", label: "化学 → 化学工学" },
  { from: "48", to: "62", type: "application", label: "材料科学 → 材料工学" },
  { from: "40", to: "50", type: "cross", label: "数学 → 計算機科学" },

  // 情報 ↔ 各分野
  { from: "50", to: "60", type: "cross", label: "計算機科学 → 機械工学" },
  { from: "55", to: "40", type: "cross", label: "AI → 数学" },
  { from: "55", to: "80", type: "application", label: "AI → 基礎医学" },
  { from: "52", to: "30", type: "application", label: "情報システム → 経営学" },

  // 医療 ↔ その他
  { from: "80", to: "44", type: "cross", label: "基礎医学 → 生物学" },
  { from: "83", to: "43", type: "cross", label: "薬学 → 化学" },
  { from: "84", to: "41", type: "application", label: "公衆衛生 → 統計学" },
  { from: "89", to: "10", type: "cross", label: "医療倫理 → 哲学" },

  // 農学 ↔ 環境
  { from: "46", to: "75", type: "cross", label: "環境科学 → 環境資源学" },
  { from: "74", to: "86", type: "adjacent", label: "食品科学 → 栄養・健康" },
  { from: "78", to: "44", type: "cross", label: "バイオテク → 生物学" },

  // サービス ↔ 各分野
  { from: "92", to: "45", type: "application", label: "防災 → 地学" },
  { from: "91", to: "80", type: "cross", label: "スポーツ → 基礎医学" },
];

// ── SVG定数 ──

const SVG_SIZE = 500;
const CENTER = SVG_SIZE / 2;
const OUTER_R = 200;
const INNER_R = 155;
const LABEL_R = 178;
const FIELD_R = 140;
const GAP_ANGLE = 1.5; // degrees gap between segments

// ── ヘルパー関数 ──

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = degToRad(angleDeg - 90); // 12時位置を0度とする
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function segmentPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startDeg: number,
  endDeg: number,
): string {
  const [ox1, oy1] = polarToXY(cx, cy, outerR, startDeg);
  const [ox2, oy2] = polarToXY(cx, cy, outerR, endDeg);
  const [ix1, iy1] = polarToXY(cx, cy, innerR, startDeg);
  const [ix2, iy2] = polarToXY(cx, cy, innerR, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${ox1} ${oy1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}`,
    "Z",
  ].join(" ");
}

/** フィールドコード → 円上の角度位置 */
function fieldAngle(code: string): number {
  const num = parseInt(code, 10);
  const groupIdx = Math.floor(num / 10);
  const fieldIdx = num % 10;
  const segmentSize = 36 - GAP_ANGLE;
  const startAngle = groupIdx * 36 + GAP_ANGLE / 2;
  return startAngle + (fieldIdx + 0.5) * (segmentSize / 10);
}

/** フィールドコード → グループID */
function codeToGroupId(code: string): string {
  const field = W100_FIELDS.find((f) => f.code === code);
  return field?.groupId ?? "general";
}

// ── 接続線のスタイル ──

const CONNECTION_STYLES: Record<
  ConnectionType,
  { stroke: string; dasharray: string; label: string }
> = {
  adjacent: { stroke: "#94A3B8", dasharray: "3 3", label: "隣接分野" },
  cross: { stroke: "#64748B", dasharray: "none", label: "分野横断" },
  application: { stroke: "#0EA5E9", dasharray: "8 4", label: "応用関係" },
};

// ── メインコンポーネント ──

export default function W100ExplorePage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // 選択グループに関連する接続をフィルタ
  const visibleConnections = useMemo(() => {
    if (!selectedGroup) return CONNECTIONS;
    return CONNECTIONS.filter((c) => {
      const fromGroup = codeToGroupId(c.from);
      const toGroup = codeToGroupId(c.to);
      return fromGroup === selectedGroup || toGroup === selectedGroup;
    });
  }, [selectedGroup]);

  // グループごとのセグメント角度
  const segments = useMemo(() => {
    return W100_FIELD_GROUPS.map((group, idx) => {
      const startAngle = idx * 36 + GAP_ANGLE / 2;
      const endAngle = (idx + 1) * 36 - GAP_ANGLE / 2;
      const midAngle = (startAngle + endAngle) / 2;
      return { group, startAngle, endAngle, midAngle };
    });
  }, []);

  const getFieldName = (code: string): string => {
    const field = W100_FIELDS.find((f) => f.code === code);
    return field ? `${code} ${field.name}` : code;
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* パンくず: W100 > 分野間接続 */}
      <nav className="flex items-center gap-1 text-sm text-[var(--text-secondary)] mb-4 flex-wrap">
        <Link href="/w100" className="hover:text-[var(--accent)] transition-colors">
          W100
        </Link>
        <span className="mx-1">/</span>
        <span className="text-[var(--text-primary)]">分野間接続</span>
      </nav>

      {/* タイトル */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">W100 分野間接続マップ</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          10グループ・100分野の相互接続を可視化
          {selectedGroup && (
            <button
              onClick={() => setSelectedGroup(null)}
              className="ml-3 text-[var(--accent)] hover:underline"
            >
              フィルタ解除
            </button>
          )}
        </p>
      </div>

      {/* SVG可視化 */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-6 overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          width="100%"
          style={{ maxHeight: "600px" }}
          className="mx-auto"
        >
          {/* 背景円 */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={OUTER_R + 8}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* 接続線 (背景に) */}
          {visibleConnections.map((conn, i) => {
            const fromAngle = fieldAngle(conn.from);
            const toAngle = fieldAngle(conn.to);
            const [x1, y1] = polarToXY(CENTER, CENTER, FIELD_R, fromAngle);
            const [x2, y2] = polarToXY(CENTER, CENTER, FIELD_R, toAngle);
            const style = CONNECTION_STYLES[conn.type];

            const isHighlighted =
              selectedGroup &&
              (codeToGroupId(conn.from) === selectedGroup ||
                codeToGroupId(conn.to) === selectedGroup);

            return (
              <line
                key={`conn-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHighlighted ? style.stroke : style.stroke}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={style.dasharray}
                opacity={selectedGroup ? (isHighlighted ? 0.8 : 0.1) : 0.35}
                style={{ transition: "opacity 0.3s" }}
              />
            );
          })}

          {/* 接続点 (フィールド位置) */}
          {CONNECTIONS.flatMap((conn) => [conn.from, conn.to])
            .filter((v, i, arr) => arr.indexOf(v) === i)
            .map((code) => {
              const angle = fieldAngle(code);
              const [x, y] = polarToXY(CENTER, CENTER, FIELD_R, angle);
              const gid = codeToGroupId(code);
              const group = getFieldGroup(gid);
              const isHighlighted = !selectedGroup || gid === selectedGroup;
              return (
                <circle
                  key={`dot-${code}`}
                  cx={x}
                  cy={y}
                  r={isHighlighted ? 4 : 2.5}
                  fill={group?.color ?? "#374151"}
                  opacity={isHighlighted ? 1 : 0.2}
                  style={{ transition: "all 0.3s" }}
                >
                  <title>{getFieldName(code)}</title>
                </circle>
              );
            })}

          {/* グループセグメント (弧) */}
          {segments.map(({ group, startAngle, endAngle, midAngle }) => {
            const isSelected = selectedGroup === group.id;
            const isDimmed = selectedGroup && !isSelected;

            return (
              <g
                key={group.id}
                onMouseEnter={() => setSelectedGroup(group.id)}
                onClick={() => setSelectedGroup((prev) => (prev === group.id ? null : group.id))}
                style={{ cursor: "pointer" }}
              >
                {/* セグメント弧 */}
                <path
                  d={segmentPath(CENTER, CENTER, OUTER_R, INNER_R, startAngle, endAngle)}
                  fill={group.bg}
                  stroke={group.color}
                  strokeWidth={isSelected ? 2.5 : 1}
                  opacity={isDimmed ? 0.3 : 1}
                  style={{ transition: "opacity 0.3s, stroke-width 0.2s" }}
                />

                {/* グループラベル */}
                {(() => {
                  const [lx, ly] = polarToXY(CENTER, CENTER, LABEL_R, midAngle);
                  const rotation = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;
                  return (
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${rotation - (midAngle > 90 && midAngle < 270 ? 180 : 0)}, ${lx}, ${ly})`}
                      fill={group.color}
                      fontSize="8"
                      fontWeight="700"
                      opacity={isDimmed ? 0.25 : 1}
                      style={{ transition: "opacity 0.3s", pointerEvents: "none" }}
                    >
                      {group.range}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* 中央テキスト */}
          <text
            x={CENTER}
            y={CENTER - 8}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-primary)"
            fontSize="14"
            fontWeight="800"
          >
            W100
          </text>
          <text
            x={CENTER}
            y={CENTER + 10}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize="8"
          >
            {selectedGroup
              ? (W100_FIELD_GROUPS.find((g) => g.id === selectedGroup)?.label ?? "")
              : `${CONNECTIONS.length} connections`}
          </text>
        </svg>
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-6 mb-6 px-2">
        {(
          Object.entries(CONNECTION_STYLES) as [
            ConnectionType,
            (typeof CONNECTION_STYLES)[ConnectionType],
          ][]
        ).map(([type, style]) => (
          <div key={type} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <svg width="32" height="12" viewBox="0 0 32 12">
              <line
                x1="0"
                y1="6"
                x2="32"
                y2="6"
                stroke={style.stroke}
                strokeWidth="2"
                strokeDasharray={style.dasharray}
              />
            </svg>
            <span>{style.label}</span>
          </div>
        ))}

        {/* グループ色凡例 */}
        <div className="ml-auto flex flex-wrap gap-2">
          {W100_FIELD_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup((prev) => (prev === g.id ? null : g.id))}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all"
              style={{
                borderColor: g.color,
                backgroundColor: selectedGroup === g.id ? g.bg : "transparent",
                color: g.color,
                opacity: selectedGroup && selectedGroup !== g.id ? 0.4 : 1,
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: g.color }}
              />
              {g.range}
            </button>
          ))}
        </div>
      </div>

      {/* 接続一覧テーブル */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            接続一覧
            <span className="ml-2 text-sm font-normal text-[var(--text-secondary)]">
              {visibleConnections.length} / {CONNECTIONS.length} 件
            </span>
          </h2>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {visibleConnections.map((conn, i) => {
            const fromGroup = getFieldGroup(codeToGroupId(conn.from));
            const toGroup = getFieldGroup(codeToGroupId(conn.to));
            const style = CONNECTION_STYLES[conn.type];

            return (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--bg)] transition-colors"
              >
                {/* From */}
                <Link
                  href={`/w100/${conn.from}`}
                  className="flex items-center gap-1.5 hover:text-[var(--accent)] transition-colors min-w-0 flex-1"
                >
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-xs font-bold shrink-0"
                    style={{
                      color: fromGroup?.color,
                      backgroundColor: fromGroup?.bg,
                    }}
                  >
                    {conn.from}
                  </span>
                  <span className="truncate text-[var(--text-primary)]">
                    {W100_FIELDS.find((f) => f.code === conn.from)?.name}
                  </span>
                </Link>

                {/* 接続タイプ矢印 */}
                <span className="shrink-0 flex items-center gap-1">
                  <svg width="24" height="10" viewBox="0 0 24 10">
                    <line
                      x1="0"
                      y1="5"
                      x2="20"
                      y2="5"
                      stroke={style.stroke}
                      strokeWidth="2"
                      strokeDasharray={style.dasharray}
                    />
                    <polygon points="20,1 24,5 20,9" fill={style.stroke} />
                  </svg>
                </span>

                {/* To */}
                <Link
                  href={`/w100/${conn.to}`}
                  className="flex items-center gap-1.5 hover:text-[var(--accent)] transition-colors min-w-0 flex-1"
                >
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-xs font-bold shrink-0"
                    style={{
                      color: toGroup?.color,
                      backgroundColor: toGroup?.bg,
                    }}
                  >
                    {conn.to}
                  </span>
                  <span className="truncate text-[var(--text-primary)]">
                    {W100_FIELDS.find((f) => f.code === conn.to)?.name}
                  </span>
                </Link>

                {/* タイプラベル */}
                <span className="shrink-0 text-xs text-[var(--text-secondary)] hidden sm:inline">
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* フッター注記 */}
      <p className="text-xs text-[var(--text-secondary)] mt-4 px-2">
        接続データは代表的な分野間関係を示すものであり、全ての学際的つながりを網羅するものではありません。
      </p>
    </main>
  );
}
