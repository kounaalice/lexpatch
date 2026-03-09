"use client";

import { use } from "react";
import Link from "next/link";
import { W100Breadcrumb } from "@/components/w100/W100Breadcrumb";
import { getFieldByCode, getFieldGroup, W100_ASPECTS, getTTGroupByCode } from "@/lib/w100-data";
import { getTopicName } from "@/lib/w100-topics";

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

  if (!field || !group) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-[var(--text-secondary)]">分野 CC{ccCode} が見つかりません</p>
      </main>
    );
  }

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
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
              コード: W{ccCode}.{ttCode}.AA.UU
            </p>
          </div>
        </div>
      </div>

      {/* 4次元座標展開 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* AA 観点マトリクス */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <h2 className="font-bold text-sm text-[var(--text-primary)] mb-3">
            AA 観点 (Academic Aspect)
          </h2>
          <div className="space-y-2">
            {W100_ASPECTS.map((aspect) => (
              <div
                key={aspect.code}
                className="flex items-center gap-3 p-2 rounded hover:bg-[var(--bg)] transition-colors"
              >
                <span
                  className="w-8 h-8 flex items-center justify-center rounded font-bold text-sm"
                  style={{ color: group.color, backgroundColor: group.bg }}
                >
                  {aspect.code}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {aspect.label}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] ml-2">
                    {aspect.description}
                  </span>
                </div>
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  W{ccCode}.{ttCode}.{aspect.code}x
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* UU 細分スロット */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
          <h2 className="font-bold text-sm text-[var(--text-primary)] mb-3">
            UU 細分 (Unique Unit)
          </h2>
          <div className="space-y-3">
            <div className="p-3 rounded border-l-4 border-blue-500 bg-blue-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-sm text-blue-700">UU00</span>
                  <span className="text-xs text-blue-600 ml-2">基礎固定</span>
                </div>
                <span className="text-xs font-mono text-blue-500">
                  W{ccCode}.{ttCode}.x0.00
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                そのテーマ（TT×AA）における基礎定義・最小限の概念を収容する固定スロット
              </p>
            </div>
            <div className="p-3 rounded border-l-4 border-green-500 bg-green-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-sm text-green-700">UU01-98</span>
                  <span className="text-xs text-green-600 ml-2">現役領域</span>
                </div>
                <span className="text-xs font-mono text-green-500">利用頻度順</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                最新の知識・事例・制度・技術を自由に登録する可動領域。年次更新可能。
              </p>
            </div>
            <div className="p-3 rounded border-l-4 border-gray-400 bg-gray-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-sm text-gray-600">UU99</span>
                  <span className="text-xs text-gray-500 ml-2">退避・博物館</span>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  W{ccCode}.{ttCode}.x0.99
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                歴史的概念、廃止制度、研究的価値のみ残る概念を安全に保管するアーカイブ。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 完全コード例 */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 mb-6">
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
