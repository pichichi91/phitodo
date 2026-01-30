/**
 * Returns the date in the user's local timezone as YYYY-MM-DD.
 */
export function toLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns a short label for a date (YYYY-MM-DD): e.g. "Mon 01/26".
 */
export function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
  const monthDay = d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
  return `${dayName} ${monthDay}`;
}

/**
 * Returns all YYYY-MM-DD dates from start (inclusive) to end (inclusive).
 */
export function getDaysInRange(startStr: string, endStr: string): string[] {
  const out: string[] = [];
  const start = new Date(startStr + "T12:00:00");
  const end = new Date(endStr + "T12:00:00");
  const cur = new Date(start);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const day = String(cur.getDate()).padStart(2, "0");
    out.push(`${y}-${m}-${day}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/**
 * Returns current week (Mon–Sun) bounds as YYYY-MM-DD.
 */
export function getWeekStartEnd(referenceDate: Date = new Date()): { start: string; end: string } {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d);
  start.setDate(diff);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return {
    start: toLocalYYYYMMDD(start),
    end: toLocalYYYYMMDD(end)
  };
}

/**
 * Returns duration as HH:MM:SS for display in charts (e.g. 327:49:24).
 */
export function formatDurationHMS(seconds: number): string {
  if (seconds < 0) return "0:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Returns duration as short human-readable string (e.g. "2h 30m", "45m").
 */
export function formatDurationShort(seconds: number): string {
  if (seconds < 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return "0m";
}

/**
 * Returns a short, human-friendly label for a task due date (YYYY-MM-DD or ISO string).
 */
export function formatDueDateLabel(dueDate: string): string {
  const datePart = dueDate.slice(0, 10);
  const date = new Date(datePart + "T12:00:00");
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (datePart === todayStr) return "Due today";
  if (datePart === yesterdayStr) return "Due yesterday";
  if (datePart < todayStr) return "Overdue";
  return "Due " + date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
