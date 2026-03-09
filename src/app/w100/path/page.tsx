"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { W100Breadcrumb } from "@/components/w100/W100Breadcrumb";
import { W100_FIELDS, W100_FIELD_GROUPS, getFieldByCode, getFieldGroup } from "@/lib/w100-data";
import { getSession } from "@/lib/session";

// ── Types ──

interface PathNode {
  code: string;
  name: string;
  groupId: string;
  color: string;
  bg: string;
}

// ── Adjacency & Path Finding ──

/** Group index from CC code: "24" -> 2 */
function groupIndex(code: string): number {
  return Math.floor(parseInt(code, 10) / 10);
}

/** Get a representative bridge field between two groups */
function bridgeField(fromGroupIdx: number, toGroupIdx: number): string {
  // Use the boundary field of the closer side
  // e.g., between 20-29 and 30-39, bridge through 29 or 30
  if (fromGroupIdx < toGroupIdx) {
    return String(fromGroupIdx * 10 + 9).padStart(2, "0"); // last of from-group
  }
  return String(fromGroupIdx * 10).padStart(2, "0"); // first of from-group
}

/** Find knowledge path between two CC codes */
function findPath(fromCode: string, toCode: string): PathNode[] {
  const fromField = getFieldByCode(fromCode);
  const toField = getFieldByCode(toCode);
  if (!fromField || !toField) return [];

  const fromGroup = getFieldGroup(fromField.groupId);
  const toGroup = getFieldGroup(toField.groupId);
  if (!fromGroup || !toGroup) return [];

  const makeNode = (code: string): PathNode => {
    const f = getFieldByCode(code)!;
    const g = getFieldGroup(f.groupId)!;
    return { code, name: f.name, groupId: f.groupId, color: g.color, bg: g.bg };
  };

  // Same field
  if (fromCode === toCode) {
    return [makeNode(fromCode)];
  }

  const fromIdx = groupIndex(fromCode);
  const toIdx = groupIndex(toCode);

  // Same group: direct 1-hop
  if (fromIdx === toIdx) {
    return [makeNode(fromCode), makeNode(toCode)];
  }

  // Adjacent groups (distance = 1): 2-hop through bridge
  if (Math.abs(fromIdx - toIdx) === 1) {
    const bridge = bridgeField(fromIdx, toIdx);
    const nodes = [makeNode(fromCode)];
    // Only add bridge if it differs from start/end
    if (bridge !== fromCode && bridge !== toCode) {
      nodes.push(makeNode(bridge));
    }
    nodes.push(makeNode(toCode));
    return nodes;
  }

  // Distant groups: route through "00" (universal connector)
  const nodes = [makeNode(fromCode)];

  // Add from-group representative if not already "0x"
  if (fromIdx !== 0) {
    const fromBridge = String(fromIdx * 10).padStart(2, "0");
    if (fromBridge !== fromCode) {
      nodes.push(makeNode(fromBridge));
    }
  }

  // Hub: 00 (unless from or to is already 00)
  if (fromCode !== "00" && toCode !== "00") {
    nodes.push(makeNode("00"));
  }

  // Add to-group representative if not already "0x"
  if (toIdx !== 0) {
    const toBridge = String(toIdx * 10).padStart(2, "0");
    if (toBridge !== toCode) {
      nodes.push(makeNode(toBridge));
    }
  }

  nodes.push(makeNode(toCode));
  return nodes;
}

// ── Component ──

export default function W100PathPage() {
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [path, setPath] = useState<PathNode[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // AI explanation
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = () => {
    if (!fromCode || !toCode) return;
    const result = findPath(fromCode, toCode);
    setPath(result);
    setHasSearched(true);
    setAiResponse("");
  };

  const handleSwap = () => {
    const tmp = fromCode;
    setFromCode(toCode);
    setToCode(tmp);
    setPath([]);
    setHasSearched(false);
    setAiResponse("");
  };

  const handleAiExplain = async () => {
    if (!fromCode || !toCode || aiLoading) return;
    setAiLoading(true);
    setAiResponse("");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const session = getSession();
    const coordinate = `path:${fromCode}\u2192${toCode}`;

    try {
      const res = await fetch("/api/w100/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: session?.memberId,
          token: session?.token,
          coordinate,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAiResponse(`\u30A8\u30E9\u30FC: ${(err as { error?: string }).error || res.statusText}`);
        setAiLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setAiLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const token = parsed.response ?? parsed.choices?.[0]?.delta?.content ?? "";
            if (token) {
              setAiResponse((prev) => prev + token);
            }
          } catch {
            // non-JSON line, skip
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setAiResponse("\u901A\u4FE1\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F");
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Group fields for <optgroup>
  const groupedOptions = W100_FIELD_GROUPS.map((group) => ({
    group,
    fields: W100_FIELDS.filter((f) => f.groupId === group.id),
  }));

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <W100Breadcrumb />

      <h1 className="text-2xl font-black text-[var(--text-primary)] mb-2">ナレッジパス探索</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
        W100の2つの知識分野間を結ぶ「ナレッジパス」を探索します。
        異なる分野がどのように接続されるかを可視化し、学際的な知の架け橋を発見できます。
      </p>

      {/* ── From / To Selectors ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mb-6">
        {/* From */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
            出発分野 (From)
          </label>
          <select
            value={fromCode}
            onChange={(e) => {
              setFromCode(e.target.value);
              setHasSearched(false);
              setAiResponse("");
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="">-- 分野を選択 --</option>
            {groupedOptions.map(({ group, fields }) => (
              <optgroup key={group.id} label={`${group.range} ${group.label}`}>
                {fields.map((f) => (
                  <option key={f.code} value={f.code}>
                    CC{f.code} {f.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <button
          onClick={handleSwap}
          className="self-center sm:self-end sm:mb-0.5 p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          title="入れ替え"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M7 16l-4-4 4-4" />
            <path d="M17 8l4 4-4 4" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
        </button>

        {/* To */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
            到着分野 (To)
          </label>
          <select
            value={toCode}
            onChange={(e) => {
              setToCode(e.target.value);
              setHasSearched(false);
              setAiResponse("");
            }}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="">-- 分野を選択 --</option>
            {groupedOptions.map(({ group, fields }) => (
              <optgroup key={group.id} label={`${group.range} ${group.label}`}>
                {fields.map((f) => (
                  <option key={f.code} value={f.code}>
                    CC{f.code} {f.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        disabled={!fromCode || !toCode}
        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[var(--accent)] text-white font-bold text-sm disabled:opacity-50 hover:shadow-lg transition-all"
      >
        パスを探索
      </button>

      {/* ── Path Results ── */}
      {hasSearched && path.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-sm text-[var(--text-primary)] mb-4">
            ナレッジパス ({path.length - 1} ホップ)
          </h2>

          {/* Path visualization */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 sm:p-6 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {path.map((node, idx) => (
                <div key={`${node.code}-${idx}`} className="flex items-center gap-2">
                  {/* Node */}
                  <Link
                    href={`/w100/${node.code}`}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <span
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-black shadow-sm group-hover:shadow-md transition-shadow"
                      style={{
                        color: node.color,
                        backgroundColor: node.bg,
                        border: `1.5px solid ${node.color}30`,
                      }}
                    >
                      CC{node.code}
                    </span>
                    <span
                      className="text-[10px] font-medium text-center max-w-[100px] leading-tight"
                      style={{ color: node.color }}
                    >
                      {node.name}
                    </span>
                  </Link>

                  {/* Arrow between nodes */}
                  {idx < path.length - 1 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--text-secondary)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 flex-shrink-0 opacity-50"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Path description */}
          <div className="mt-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h3 className="font-bold text-xs text-[var(--text-secondary)] mb-2">パスの概要</h3>
            <div className="text-sm text-[var(--text-primary)] space-y-1">
              {path.length === 1 && (
                <p>
                  同一分野です。出発と到着が同じ CC{path[0].code} ({path[0].name}) を指しています。
                </p>
              )}
              {path.length === 2 && (
                <p>
                  同一グループ内の直接接続です。 CC{path[0].code} ({path[0].name}) から CC
                  {path[1].code} ({path[1].name}) へ、 1ホップで到達できます。
                </p>
              )}
              {path.length === 3 && (
                <p>
                  隣接グループ間の接続です。 CC{path[0].code} ({path[0].name}) から CC{path[1].code}{" "}
                  ({path[1].name}) を経由して CC{path[2].code} ({path[2].name}) へ到達します。
                </p>
              )}
              {path.length > 3 && (
                <p>
                  CC{path[0].code} ({path[0].name}) から CC{path[path.length - 1].code} (
                  {path[path.length - 1].name}) へ、
                  {path.length - 2}つの中間分野を経由して接続します。 中央のハブとなる CC00
                  (総合・百科・序論) が学際的な橋渡しを担います。
                </p>
              )}
            </div>
          </div>

          {/* AI Explanation */}
          <div className="mt-4">
            {!aiResponse && !aiLoading && (
              <button
                onClick={handleAiExplain}
                className="px-4 py-2 rounded-lg border border-[var(--accent)] text-[var(--accent)] text-sm font-bold hover:bg-[var(--accent)] hover:text-white transition-colors"
              >
                AIで解説
              </button>
            )}
            {aiLoading && !aiResponse && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  解説を生成中...
                </div>
              </div>
            )}
            {aiResponse && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
                <h3 className="font-bold text-xs text-[var(--text-secondary)] mb-2">AI 解説</h3>
                <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No results */}
      {hasSearched && path.length === 0 && (
        <div className="mt-8 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            パスが見つかりませんでした。有効なCCコードを選択してください。
          </p>
        </div>
      )}

      {/* Usage hints */}
      <div className="mt-8 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
        <h3 className="font-bold text-sm text-[var(--text-primary)] mb-2">使い方</h3>
        <div className="text-xs text-[var(--text-secondary)] space-y-1.5">
          <p>
            <strong>同一グループ内:</strong>{" "}
            同じ10区分に属する分野同士は直接接続（1ホップ）されます。
          </p>
          <p>
            <strong>隣接グループ:</strong> 番号が隣り合うグループ（例: 20-29 と
            30-39）は境界分野を経由して接続されます。
          </p>
          <p>
            <strong>遠距離接続:</strong> 離れたグループ間は
            CC00（総合・百科・序論）をハブとして経由します。
          </p>
          <p>
            <strong>AI解説:</strong>{" "}
            パス探索後「AIで解説」をクリックすると、2分野間の学術的つながりをAIが解説します。
          </p>
        </div>
      </div>
    </main>
  );
}
