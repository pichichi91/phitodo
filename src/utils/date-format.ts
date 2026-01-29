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
