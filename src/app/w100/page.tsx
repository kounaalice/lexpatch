"use client";

import { useState } from "react";
import Link from "next/link";
import { W100Grid } from "@/components/w100/W100Grid";
import { W100_FIELDS, W100_FIELD_GROUPS, getFieldGroup } from "@/lib/w100-data";
import { shortCode } from "@/lib/w100-types";

type ViewMode = "grid" | "list" | "search";

export default function W100Hub() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFields = searchQuery
    ? W100_FIELDS.filter(
        (f) =>
          f.name.includes(searchQuery) ||
          f.code.includes(searchQuery) ||
          shortCode(f.code).toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : W100_FIELDS;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">W100 知識分類法</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          100分野 × 100主題 × 10観点 × 100細分 — 4次元座標で知識を体系化
        </p>
      </div>

      {/* コントロールバー */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* 検索 */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="分野・コード・キーワードで検索…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) setViewMode("search");
              else setViewMode("grid");
            }}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setViewMode("grid");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ×
            </button>
          )}
        </div>

        {/* ビューモード切替 */}
        <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1">
          {(["grid", "list"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setViewMode(m);
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === m && !searchQuery
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {m === "grid" ? "グリッド" : "リスト"}
            </button>
          ))}
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "分野（CC）", value: "100" },
          { label: "主題（TT）", value: "×100" },
          { label: "観点（AA）", value: "×10" },
          { label: "細分（UU）", value: "×100" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-center"
          >
            <div className="text-xl font-black text-[var(--accent)]">{s.value}</div>
            <div className="text-xs text-[var(--text-secondary)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* コード構造説明 */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 mb-6">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">W100 コード構造</h2>
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <span className="font-mono font-bold text-[var(--accent)]">W</span>
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-mono font-bold">CC</span>
          <span className="text-[var(--text-secondary)]">.</span>
          <span className="px-2 py-1 rounded bg-green-50 text-green-700 font-mono font-bold">
            TT
          </span>
          <span className="text-[var(--text-secondary)]">.</span>
          <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 font-mono font-bold">
            AA
          </span>
          <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 font-mono font-bold">
            UU
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          例: <code className="font-mono">W27.40.04.15</code> = 公共政策(CC27) × 設計・方法論(TT40)
          × 設計(AA4) × AIガバナンス設計(UU15)
        </p>
      </div>

      {/* メインコンテンツ */}
      {viewMode === "grid" && <W100Grid mode="cc" />}

      {viewMode === "list" && (
        <div className="space-y-4">
          {W100_FIELD_GROUPS.map((group) => {
            const fields = W100_FIELDS.filter((f) => f.groupId === group.id);
            return (
              <div key={group.id}>
                <h3
                  className="text-sm font-bold px-3 py-1.5 rounded-t"
                  style={{ color: group.color, backgroundColor: group.bg }}
                >
                  {group.range} {group.label}
                </h3>
                <div className="border border-t-0 border-[var(--border)] rounded-b divide-y divide-[var(--border)]">
                  {fields.map((field) => (
                    <Link
                      key={field.code}
                      href={`/w100/${field.code}`}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--surface)] transition-colors"
                    >
                      <span
                        className="font-mono font-bold text-lg w-8"
                        style={{ color: group.color }}
                      >
                        {field.code}
                      </span>
                      <span className="text-sm text-[var(--text-primary)]">{field.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "search" && (
        <div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {filteredFields.length} 件の分野がマッチ
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFields.map((field) => {
              const group = getFieldGroup(field.groupId);
              return (
                <Link
                  key={field.code}
                  href={`/w100/${field.code}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-md transition-all"
                  style={{
                    borderColor: (group?.color ?? "#999") + "30",
                    backgroundColor: group?.bg,
                  }}
                >
                  <span className="font-mono font-bold text-2xl" style={{ color: group?.color }}>
                    {field.code}
                  </span>
                  <div>
                    <span className="block text-sm font-bold" style={{ color: group?.color }}>
                      {field.name}
                    </span>
                    <span className="block text-xs text-[var(--text-secondary)]">
                      {group?.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* AI検索リンク */}
      <div className="mt-8 text-center">
        <Link
          href="/w100/search"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--accent)] to-blue-600 text-white font-bold text-sm hover:shadow-lg transition-all"
        >
          AI で分類を探索する
        </Link>
      </div>
    </main>
  );
}
