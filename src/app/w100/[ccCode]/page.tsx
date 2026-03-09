"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { W100Breadcrumb } from "@/components/w100/W100Breadcrumb";
import { W100Grid } from "@/components/w100/W100Grid";
import {
  getFieldByCode,
  getFieldGroup,
  W100_ASPECTS,
  W100_TT_GROUPS,
  getFieldDescription,
} from "@/lib/w100-data";
import { W100_CC_TOPICS } from "@/lib/w100-topics";
import { W100_USE_CASES } from "@/lib/w100-usecases";

export default function W100FieldPage({ params }: { params: Promise<{ ccCode: string }> }) {
  const { ccCode } = use(params);
  const field = getFieldByCode(ccCode);
  const group = field ? getFieldGroup(field.groupId) : null;
  const [activeTab, setActiveTab] = useState<"tt" | "aa" | "uc" | "info">("tt");

  const topics = useMemo(() => {
    const arr = W100_CC_TOPICS[ccCode];
    if (!arr) return [];
    return arr.map((name, i) => ({
      code: String(i).padStart(2, "0"),
      name: name || `TT${String(i).padStart(2, "0")}`,
    }));
  }, [ccCode]);

  const useCases = W100_USE_CASES[ccCode] ?? [];
  const description = getFieldDescription(ccCode);

  if (!field || !group) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-[var(--text-secondary)]">分野 CC{ccCode} が見つかりません</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <W100Breadcrumb ccCode={ccCode} />

      {/* ヘッダー */}
      <div
        className="rounded-lg p-6 mb-6"
        style={{ backgroundColor: group.bg, borderLeft: `4px solid ${group.color}` }}
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl font-black" style={{ color: group.color }}>
            {field.code}
          </span>
          <div>
            <h1 className="text-xl font-bold" style={{ color: group.color }}>
              {field.name}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {group.range} {group.label}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
              コード: W{ccCode} (CC.TT.AA.UU)
            </p>
            {description && (
              <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* タブ切替 */}
      <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1 mb-6">
        {(
          [
            { key: "tt", label: "主題 (TT)" },
            { key: "aa", label: "観点 (AA)" },
            { key: "uc", label: `活用例 (${useCases.length})` },
            { key: "info", label: "概要" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TT グリッド */}
      {activeTab === "tt" && (
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            TT: 主題一覧 (Teaching Topic)
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            CC{ccCode} {field.name} の100主題。各主題をクリックで詳細を表示。
          </p>
          <W100Grid mode="tt" ccCode={ccCode} topics={topics} />
        </div>
      )}

      {/* AA 観点 */}
      {activeTab === "aa" && (
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            AA: 観点 (Academic Aspect)
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            どの視点・段階で知識を捉えるかを示す10区分。レンズ×フェーズの二軸。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {W100_ASPECTS.map((aspect) => (
              <div
                key={aspect.code}
                className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
              >
                <span
                  className="text-2xl font-black w-8 text-center"
                  style={{ color: group.color }}
                >
                  {aspect.code}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">{aspect.label}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{aspect.description}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
                    例: W{ccCode}.00.{aspect.code}0
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ユースケース */}
      {activeTab === "uc" && (
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">活用例 (Use Cases)</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            CC{ccCode} {field.name} の知識が必要になる具体的な問いと、対応するW100座標。
          </p>
          {useCases.length > 0 ? (
            <div className="space-y-3">
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
                >
                  <span
                    className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shrink-0"
                    style={{ color: group.color, backgroundColor: group.bg }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">{uc.question}</p>
                    <p className="text-xs font-mono text-[var(--accent)] mt-1">W{uc.coordinate}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">
              この分野のユースケースデータはありません。
            </p>
          )}
        </div>
      )}

      {/* 概要 */}
      {activeTab === "info" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">概要</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {description || `${field.name}は${group.label}に属する分野です。`}
            </p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="font-bold text-sm text-[var(--text-primary)] mb-2">TT グループ構成</h3>
            <div className="space-y-1">
              {W100_TT_GROUPS.map((ttg) => (
                <div key={ttg.range} className="flex gap-2 text-sm">
                  <span className="font-mono text-[var(--accent)] w-12">{ttg.range}</span>
                  <span className="text-[var(--text-secondary)]">{ttg.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="font-bold text-sm text-[var(--text-primary)] mb-2">隣接分野</h3>
            <div className="flex flex-wrap gap-2">
              {[
                parseInt(ccCode) > 0 ? String(parseInt(ccCode) - 1).padStart(2, "0") : null,
                parseInt(ccCode) < 99 ? String(parseInt(ccCode) + 1).padStart(2, "0") : null,
              ]
                .filter(Boolean)
                .map((adjCode) => {
                  const adjField = getFieldByCode(adjCode!);
                  return adjField ? (
                    <Link
                      key={adjCode}
                      href={`/w100/${adjCode}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm hover:shadow transition-all"
                    >
                      <span className="font-mono font-bold" style={{ color: group.color }}>
                        {adjCode}
                      </span>
                      <span className="text-[var(--text-secondary)]">{adjField.name}</span>
                    </Link>
                  ) : null;
                })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
