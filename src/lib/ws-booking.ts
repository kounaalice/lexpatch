/**
 * 予約枠管理 — localStorage管理
 * C-II-8: 予約枠管理
 */

import { wsLoad, wsSave } from "./ws-storage";
import { uuid } from "./uuid";

export interface Slot {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  reservations: Reservation[];
  createdAt: string;
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  note: string;
  createdAt: string;
}

const STORAGE_KEY = "lp_ws_booking";

function load(): Slot[] {
  return wsLoad<Slot[]>(STORAGE_KEY, []);
}
function save(slots: Slot[]) {
  wsSave(STORAGE_KEY, slots);
}

export function getAllSlots(): Slot[] {
  return load().sort(
    (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
  );
}

export function getSlot(id: string): Slot | undefined {
  return load().find((s) => s.id === id);
}

export function addSlot(slot: Omit<Slot, "id" | "reservations" | "createdAt">): Slot {
  const all = load();
  const s: Slot = { ...slot, id: uuid(), reservations: [], createdAt: new Date().toISOString() };
  all.push(s);
  save(all);
  return s;
}

export function deleteSlot(id: string) {
  save(load().filter((s) => s.id !== id));
}

export function addReservation(
  slotId: string,
  res: { name: string; email: string; note: string },
): boolean {
  const all = load();
  const idx = all.findIndex((s) => s.id === slotId);
  if (idx < 0) return false;
  if (all[idx].reservations.length >= all[idx].capacity) return false;
  all[idx].reservations.push({ ...res, id: uuid(), createdAt: new Date().toISOString() });
  save(all);
  return true;
}

export function cancelReservation(slotId: string, resId: string) {
  const all = load();
  const idx = all.findIndex((s) => s.id === slotId);
  if (idx >= 0) {
    all[idx].reservations = all[idx].reservations.filter((r) => r.id !== resId);
    save(all);
  }
}

export function remaining(slot: Slot): number {
  return slot.capacity - slot.reservations.length;
}
