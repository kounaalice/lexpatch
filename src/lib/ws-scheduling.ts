/**
 * 日程調整 — localStorage管理
 * C-II-7: 日程調整ポール
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface Poll {
  id: string;
  title: string;
  description: string;
  status: "open" | "decided" | "cancelled";
  candidates: Candidate[];
  decidedIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  date: string;
  time: string;
  votes: Vote[];
}

export interface Vote {
  voter: string;
  answer: "ok" | "maybe" | "ng";
}

const STORAGE_KEY = "lp_ws_scheduling";

function load(): Poll[] {
  return wsLoad<Poll[]>(STORAGE_KEY, []);
}
function save(polls: Poll[]) {
  wsSave(STORAGE_KEY, polls);
}

export function getAllPolls(): Poll[] {
  return load().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getPoll(id: string): Poll | undefined {
  return load().find((p) => p.id === id);
}

export function addPoll(poll: {
  title: string;
  description: string;
  candidates: { date: string; time: string }[];
}): Poll {
  const all = load();
  const now = new Date().toISOString();
  const p: Poll = {
    id: uuid(),
    title: poll.title,
    description: poll.description,
    status: "open",
    candidates: poll.candidates.map((c) => ({ ...c, votes: [] })),
    decidedIndex: null,
    createdAt: now,
    updatedAt: now,
  };
  all.push(p);
  save(all);
  return p;
}

export function votePoll(pollId: string, voter: string, answers: ("ok" | "maybe" | "ng")[]) {
  const all = load();
  const idx = all.findIndex((p) => p.id === pollId);
  if (idx < 0) return;
  for (let i = 0; i < all[idx].candidates.length; i++) {
    const vs = all[idx].candidates[i].votes;
    const vi = vs.findIndex((v) => v.voter === voter);
    if (vi >= 0) vs[vi].answer = answers[i] ?? "ng";
    else vs.push({ voter, answer: answers[i] ?? "ng" });
  }
  all[idx].updatedAt = new Date().toISOString();
  save(all);
}

export function decidePoll(pollId: string, candidateIndex: number) {
  const all = load();
  const idx = all.findIndex((p) => p.id === pollId);
  if (idx >= 0) {
    all[idx].status = "decided";
    all[idx].decidedIndex = candidateIndex;
    all[idx].updatedAt = new Date().toISOString();
    save(all);
  }
}

export function cancelPoll(pollId: string) {
  const all = load();
  const idx = all.findIndex((p) => p.id === pollId);
  if (idx >= 0) {
    all[idx].status = "cancelled";
    all[idx].updatedAt = new Date().toISOString();
    save(all);
  }
}

export function deletePoll(id: string) {
  save(load().filter((p) => p.id !== id));
}

export const STATUS_LABELS: Record<string, string> = {
  open: "募集中",
  decided: "確定",
  cancelled: "中止",
};
export const STATUS_COLORS: Record<string, string> = {
  open: "#0369A1",
  decided: "#059669",
  cancelled: "#6B7280",
};
export const ANSWER_LABELS: Record<string, string> = { ok: "OK", maybe: "?", ng: "NG" };
export const ANSWER_COLORS: Record<string, string> = {
  ok: "#059669",
  maybe: "#D97706",
  ng: "#DC2626",
};
