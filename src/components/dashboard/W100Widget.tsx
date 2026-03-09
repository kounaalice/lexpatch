"use client";

import Link from "next/link";
import { W100_FIELD_GROUPS } from "@/lib/w100-data";

export function W100Widget() {
  // 10グループのカラーサンプルを表示
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-[var(--text-primary)]">W100 知識分類法</h3>
        <Link href="/w100" className="text-xs text-[var(--accent)] hover:underline">
          全分野を見る →
        </Link>
      </div>

      {/* ミニグリッド: 10グループ */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {W100_FIELD_GROUPS.map((group) => (
          <Link
            key={group.id}
            href="/w100"
            className="block p-1.5 rounded text-center transition-colors hover:shadow"
            style={{ backgroundColor: group.bg }}
            title={`${group.range} ${group.label}`}
          >
            <span className="block text-xs font-bold" style={{ color: group.color }}>
              {group.range.split("-")[0]}
            </span>
            <span className="block text-[9px] leading-tight" style={{ color: group.color }}>
              {group.label.length > 4 ? group.label.slice(0, 4) + "…" : group.label}
            </span>
          </Link>
        ))}
      </div>

      {/* クイックアクション */}
      <div className="flex gap-2">
        <Link
          href="/w100/search"
          className="flex-1 text-center px-2 py-1.5 rounded text-xs font-medium bg-[var(--accent)] text-white hover:shadow transition-all"
        >
          AI で分類
        </Link>
        <Link
          href="/w100"
          className="flex-1 text-center px-2 py-1.5 rounded text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        >
          分野一覧
        </Link>
      </div>
    </div>
  );
}
