/**
 * 目標・OKR管理 — localStorage管理
 * C-XIII-2: 目標設定とキーリザルト追跡
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  period: string; // e.g. "2026-Q1"
  status: "active" | "completed" | "cancelled";
  keyResults: KeyResult[];
  createdAt: string;
}

const STORAGE_KEY = "lp_ws_goals";

function load(): Goal[] {
  return wsLoad<Goal[]>(STORAGE_KEY, []);
}
function save(goals: Goal[]) {
  wsSave(STORAGE_KEY, goals);
}

export function getAllGoals(): Goal[] {
  return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getGoal(id: string): Goal | undefined {
  return load().find((g) => g.id === id);
}

export function addGoal(data: { title: string; description: string; period: string }): Goal {
  const goals = load();
  const goal: Goal = {
    ...data,
    id: uuid(),
    status: "active",
    keyResults: [],
    createdAt: new Date().toISOString(),
  };
  goals.push(goal);
  save(goals);
  return goal;
}

export function updateGoal(id: string, updates: Partial<Goal>) {
  const goals = load();
  const idx = goals.findIndex((g) => g.id === id);
  if (idx >= 0) {
    goals[idx] = { ...goals[idx], ...updates };
    save(goals);
  }
}

export function deleteGoal(id: string) {
  save(load().filter((g) => g.id !== id));
}

export function addKeyResult(
  goalId: string,
  data: { title: string; target: number; unit: string },
): KeyResult {
  const goals = load();
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) throw new Error("Goal not found");
  const kr: KeyResult = { ...data, id: uuid(), current: 0 };
  goal.keyResults.push(kr);
  save(goals);
  return kr;
}

export function updateKeyResult(goalId: string, krId: string, current: number) {
  const goals = load();
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;
  const kr = goal.keyResults.find((k) => k.id === krId);
  if (kr) {
    kr.current = current;
    save(goals);
  }
}

export function deleteKeyResult(goalId: string, krId: string) {
  const goals = load();
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;
  goal.keyResults = goal.keyResults.filter((k) => k.id !== krId);
  save(goals);
}

export function calcGoalProgress(goal: Goal): number {
  if (goal.keyResults.length === 0) return 0;
  const sum = goal.keyResults.reduce((acc, kr) => {
    const pct = kr.target > 0 ? Math.min(100, (kr.current / kr.target) * 100) : 0;
    return acc + pct;
  }, 0);
  return Math.round(sum / goal.keyResults.length);
}

export function getQuarters(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const quarters: string[] = [];
  for (let y = year - 1; y <= year + 1; y++) {
    for (let q = 1; q <= 4; q++) quarters.push(`${y}-Q${q}`);
  }
  return quarters;
}
