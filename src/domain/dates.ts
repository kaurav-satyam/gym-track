/**
 * Local-calendar date helpers. All boundaries use the device's local time
 * zone, and weeks run Sunday to Saturday.
 */

export interface DateBounds {
  start: Date;
  end: Date;
}

/** 00:00:00.000 to 23:59:59.999 of the given local day. */
export function getDayBounds(date = new Date()): DateBounds {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  return { start, end: endOfDay(date) };
}

/** Sunday 00:00 of the week containing `date`. */
export function startOfWeek(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return start;
}

export function endOfDay(date: Date) {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return end;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

/** Every calendar day from `start` to `end`, inclusive, at local midnight. */
export function eachDay(start: Date, end: Date) {
  const days: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (cursor.getTime() <= last.getTime()) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

/** Stable "YYYY-MM-DD" key in local time. */
export function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatShortDate(date: Date) {
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function formatMonth(date: Date) {
  return date.toLocaleDateString([], { month: "long", year: "numeric" });
}
