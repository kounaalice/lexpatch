"use client";

import { use, useState } from "react";
import Link from "next/link";
import { W100Breadcrumb } from "@/components/w100/W100Breadcrumb";
import { getFieldByCode, getFieldGroup, W100_ASPECTS, getTTGroupByCode } from "@/lib/w100-data";
import { getTopicName } from "@/lib/w100-topics";
import { getUUEntries, type W100UUEntry } from "@/lib/w100-uu-samples";

export default function W100TopicPage({
  params,
}: {
  params: Promise<{ ccCode: string; ttCode: string }>;
}) {
  const { ccCode, ttCode } = use(params);
  const field = getFieldByCode(ccCode);
  const group = field ? getFieldGroup(field.groupId) : null;
  const ttGroup = getTTGroupByCode(ttCode);
  const topicName = getTopicName(ccCode, ttCode);

  // 展開中のAA
  const [expandedAA, setExpandedAA] = useState<string | null>(null);

  if (!field || !group) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-[var(--text-secondary)]">分野 CC{ccCode} が見つかりません</p>
      </main>
    );
  }

  // 各AAのUUエントリ数を集計
  const aaUUCounts = W100_ASPECTS.map((a) => ({
    code: a.code,
    entries: getUUEntries(ccCode, ttCode, a.code),
  }));
  const totalUU = aaUUCounts.reduce((sum, a) => sum + a.entries.length, 0);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <W100Breadcrumb ccCode={ccCode} ttCode={ttCode} topicName={topicName} />

      {/* ヘッダー */}
      <div
        className="rounded-lg p-6 mb-6"
        style={{ backgroundColor: group.bg, borderLeft: `4px solid ${group.color}` }}
      >
        <div className="flex items-start gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black" style={{ color: group.color }}>
                {ccCode}.{ttCode}
              </span>
              {ttGroup && (
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ color: group.color, backgroundColor: group.color + "15" }}
                >
                  {ttGroup.label}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] mt-1">
              {topicName || `${field.name} — TT${ttCode}`}
            </h1>
            {topicName && (
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                {field.name} &mdash; TT{ttCode}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                コード: W{ccCode}.{ttCode}.AA.UU
              </span>
              {totalUU > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: group.color + "15", color: group.color }}
                >
                  {totalUU} UU
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4次元座標展開 — AA観点 × UU細分 統合マトリクス */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg mb-6 overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
            AA 観点 × UU 細分マトリクス
            {totalUU > 0 && (
              <span className="text-xs font-normal text-[var(--text-secondary)]">
                （{totalUU}エントリ登録済み）
              </span>
            )}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            各観点(AA)をクリックすると、登録されているUU知識単位が展開されます
          </p>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {W100_ASPECTS.map((aspect) => {
            const entries = getUUEntries(ccCode, ttCode, aspect.code);
            const isExpanded = expandedAA === aspect.code;
            const hasEntries = entries.length > 0;

            return (
              <div key={aspect.code}>
                {/* AA row */}
                <button
                  onClick={() => setExpandedAA(isExpanded ? null : aspect.code)}
                  className="w-full text-left hover:bg-[var(--bg)] transition-colors"
                  style={{ padding: "0.75rem 1rem" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 flex items-center justify-center rounded font-bold text-sm shrink-0"
                      style={{ color: group.color, backgroundColor: group.bg }}
                    >
                      {aspect.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {aspect.code}-{aspect.label}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] ml-2">
                        -{aspect.code}
                        {aspect.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {hasEntries && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: group.color + "12",
                            color: group.color,
                            minWidth: "1.4rem",
                            textAlign: "center",
                          }}
                        >
                          {entries.length}
                        </span>
                      )}
                      <span className="text-xs font-mono text-[var(--text-secondary)]">
                        W{ccCode}.{ttCode}.{aspect.code}x
                      </span>
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 text-[var(--text-secondary)] transition-transform"
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                        }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* UU entries panel */}
                {isExpanded && (
                  <div
                    className="border-t border-[var(--border)]"
                    style={{
                      backgroundColor: "var(--bg)",
                      padding: "0.75rem 1rem 0.75rem 3.5rem",
                    }}
                  >
                    {hasEntries ? (
                      <UUEntryList
                        entries={entries}
                        ccCode={ccCode}
                        ttCode={ttCode}
                        aaCode={aspect.code}
                        groupColor={group.color}
                      />
                    ) : (
                      <UUPlaceholder ccCode={ccCode} ttCode={ttCode} aaCode={aspect.code} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 完全コード例 + 座標入力ナビ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <h2 className="font-bold text-sm text-[var(--text-primary)] mb-2">完全コード例</h2>
          <div className="flex flex-wrap items-center gap-1 text-sm font-mono">
            <span className="font-bold text-[var(--accent)]">W</span>
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-bold">{ccCode}</span>
            <span>.</span>
            <span className="px-2 py-1 rounded bg-green-50 text-green-700 font-bold">{ttCode}</span>
            <span>.</span>
            <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 font-bold">0</span>
            <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 font-bold">4</span>
            <span>.</span>
            <span className="px-2 py-1 rounded bg-red-50 text-red-700 font-bold">15</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            = {field.name}(CC{ccCode}) × TT{ttCode}({ttGroup?.label}) × 設計(AA4) × UU15
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <h2 className="font-bold text-sm text-[var(--text-primary)] mb-2">座標で探す</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            数字を入力するだけで知識単位に直接アクセスできます
          </p>
          <Link
            href="/w100/search"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border)] hover:shadow transition-shadow"
            style={{ color: group.color }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            W100 座標検索を開く
          </Link>
        </div>
      </div>

      {/* 横断リンク: 他のCCの同じTT */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
        <h2 className="font-bold text-sm text-[var(--text-primary)] mb-3">
          他分野の同番主題 (TT{ttCode})
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mb-3">
          TT{ttCode}「{ttGroup?.label}」は各CCで共通の概念階層。
          他分野で同じ番号の主題を比較すると分野横断の視座が得られます。
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            parseInt(ccCode) > 0 ? String(parseInt(ccCode) - 1).padStart(2, "0") : null,
            parseInt(ccCode) < 99 ? String(parseInt(ccCode) + 1).padStart(2, "0") : null,
          ]
            .filter(Boolean)
            .map((adjCC) => {
              const adjField = getFieldByCode(adjCC!);
              return adjField ? (
                <Link
                  key={adjCC}
                  href={`/w100/${adjCC}/${ttCode}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[var(--border)] text-sm hover:shadow transition-all"
                >
                  <span className="font-mono font-bold" style={{ color: group.color }}>
                    {adjCC}.{ttCode}
                  </span>
                  <span className="text-[var(--text-secondary)]">{adjField.name}</span>
                </Link>
              ) : null;
            })}
        </div>
      </div>
    </main>
  );
}

// ── UUエントリリスト ──
function UUEntryList({
  entries,
  ccCode,
  ttCode,
  aaCode,
  groupColor,
}: {
  entries: W100UUEntry[];
  ccCode: string;
  ttCode: string;
  aaCode: string;
  groupColor: string;
}) {
  return (
    <div className="space-y-1.5">
      {entries.map((entry) => {
        const coordCode = `W${ccCode}.${ttCode}.${aaCode}.${entry.code}`;
        const isFoundation = entry.code === "00";
        const isArchive = entry.code === "99";

        return (
          <div
            key={entry.code}
            className="flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--surface)]"
            style={{
              borderLeft: `3px solid ${
                isFoundation ? "#3B82F6" : isArchive ? "#9CA3AF" : groupColor + "60"
              }`,
            }}
          >
            {/* UU code badge */}
            <span
              className="text-xs font-mono font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
              style={{
                backgroundColor: isFoundation
                  ? "#DBEAFE"
                  : isArchive
                    ? "#F3F4F6"
                    : groupColor + "10",
                color: isFoundation ? "#1D4ED8" : isArchive ? "#6B7280" : groupColor,
                minWidth: "2rem",
                textAlign: "center",
              }}
            >
              {entry.code}
            </span>
            {/* names */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[var(--text-primary)] font-medium leading-snug">
                {entry.ja}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-2">
                <span className="truncate">{entry.en}</span>
                <span className="font-mono opacity-50 shrink-0">{coordCode}</span>
              </div>
            </div>
            {/* type indicator */}
            {isFoundation && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold shrink-0 mt-0.5">
                基礎
              </span>
            )}
            {isArchive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-bold shrink-0 mt-0.5">
                博物館
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── UU未登録プレースホルダー ──
function UUPlaceholder({
  ccCode,
  ttCode,
  aaCode,
}: {
  ccCode: string;
  ttCode: string;
  aaCode: string;
}) {
  return (
    <div className="text-center py-4">
      <div className="text-xs text-[var(--text-secondary)] space-y-2">
        <p className="font-mono opacity-60">
          W{ccCode}.{ttCode}.{aaCode}.00〜99
        </p>
        <div className="flex justify-center gap-3">
          <span className="inline-flex items-center gap-1 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> UU00 基礎固定
          </span>
          <span className="inline-flex items-center gap-1 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-green-400" /> UU01-98 現役
          </span>
          <span className="inline-flex items-center gap-1 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-gray-400" /> UU99 退避
          </span>
        </div>
        <p className="text-[11px] opacity-70">このAA観点のUUデータは今後登録予定です</p>
      </div>
    </div>
  );
}
