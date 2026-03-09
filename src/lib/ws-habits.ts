/**
 * 習慣トラッカー — localStorage管理
 * C-XIII-3: 日次習慣の記録とストリーク追跡
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface Habit {
  id: string;
  title: string;
  color: string;
  frequency: "daily" | "weekdays" | "weekly";
  completedDates: string[]; // YYYY-MM-DD
  createdAt: string;
}

const STORAGE_KEY = "lp_ws_habits";

const DEFAULT_COLORS = ["#0369A1", "#059669", "#D97706", "#DC2626", "#7C3AED", "#DB2777"];

function load(): Habit[] {
  return wsLoad<Habit[]>(STORAGE_KEY, []);
}
function save(habits: Habit[]) {
  wsSave(STORAGE_KEY, habits);
}

export function getAllHabits(): Habit[] {
  return load().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getHabit(id: string): Habit | undefined {
  return load().find((h) => h.id === id);
}

export function addHabit(data: {
  title: string;
  color: string;
  frequency: Habit["frequency"];
}): Habit {
  const habits = load();
  const habit: Habit = {
    ...data,
    id: uuid(),
    completedDates: [],
    createdAt: new Date().toISOString(),
  };
  habits.push(habit);
  save(habits);
  return habit;
}

export function deleteHabit(id: string) {
  save(load().filter((h) => h.id !== id));
}

export function toggleDate(habitId: string, date: string): boolean {
  const habits = load();
  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return false;
  const idx = habit.completedDates.indexOf(date);
  if (idx >= 0) {
    habit.completedDates.splice(idx, 1);
    save(habits);
    return false;
  } else {
    habit.completedDates.push(date);
    save(habits);
    return true;
  }
}

export function isCompleted(habit: Habit, date: string): boolean {
  return habit.completedDates.includes(date);
}

export function getStreak(habit: Habit): number {
  const today = new Date();
  let streak = 0;
  const d = new Date(today);
  while (true) {
    const ds = d.toISOString().slice(0, 10);
    if (habit.completedDates.includes(ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getCompletionRate(habit: Habit, days: number = 30): number {
  const today = new Date();
  let completed = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (habit.completedDates.includes(ds)) completed++;
  }
  return Math.round((completed / days) * 100);
}

export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export { DEFAULT_COLORS };
