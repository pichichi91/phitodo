import type { TogglTimeEntry } from "@/domain/services/toggl-service";
import { toLocalYYYYMMDD } from "@/utils/date-format";

export interface EntryGroup {
  title: string;
  entries: TogglTimeEntry[];
  totalSeconds: number;
}

export interface ProjectGroup {
  projectName: string;
  totalSeconds: number;
  titleGroups: EntryGroup[];
}

export function formatDuration(seconds: number): string {
  if (seconds < 0) return "Running…";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return "0m";
}

export function formatSinceDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${weekday} (${day} ${month} ${year})`;
}

export function groupEntriesByProject(entries: TogglTimeEntry[]): ProjectGroup[] {
  if (!entries.length) return [];
  const byProject = new Map<string, TogglTimeEntry[]>();
  for (const e of entries) {
    const projectName = e.project_name?.trim() || "No project";
    let list = byProject.get(projectName);
    if (!list) {
      list = [];
      byProject.set(projectName, list);
    }
    list.push(e);
  }
  const projectGroups: ProjectGroup[] = [];
  byProject.forEach((projectEntries, projectName) => {
    const byTitle = new Map<string, TogglTimeEntry[]>();
    for (const e of projectEntries) {
      const title = e.description?.trim() || "No description";
      let list = byTitle.get(title);
      if (!list) {
        list = [];
        byTitle.set(title, list);
      }
      list.push(e);
    }
    const titleGroups: EntryGroup[] = [];
    byTitle.forEach((list, title) => {
      const totalSeconds = list
        .filter((ent) => ent.duration >= 0)
        .reduce((sum, ent) => sum + ent.duration, 0);
      list.sort((a, b) => (b.start < a.start ? -1 : 1));
      titleGroups.push({ title, entries: list, totalSeconds });
    });
    titleGroups.sort((a, b) => {
      const aLatest = a.entries[0]?.start ?? "";
      const bLatest = b.entries[0]?.start ?? "";
      return bLatest.localeCompare(aLatest);
    });
    const totalSeconds = projectEntries
      .filter((e) => e.duration >= 0)
      .reduce((sum, e) => sum + e.duration, 0);
    projectGroups.push({ projectName, totalSeconds, titleGroups });
  });
  projectGroups.sort((a, b) => {
    const aLatest = a.titleGroups[0]?.entries[0]?.start ?? "";
    const bLatest = b.titleGroups[0]?.entries[0]?.start ?? "";
    return bLatest.localeCompare(aLatest);
  });
  return projectGroups;
}

export function buildStandupMarkdownForRange(
  startStr: string,
  endStr: string,
  projectGroups: ProjectGroup[],
  options: { days: number } = { days: 1 }
): string {
  const lines: string[] = [];
  const totalSeconds = projectGroups.reduce((sum, p) => sum + p.totalSeconds, 0);

  // Since ... and project/title list
  lines.push(`Since ${formatSinceDate(startStr)}:`);
  for (const project of projectGroups) {
    lines.push(`* ${project.projectName}`);
    for (const titleGroup of project.titleGroups) {
      lines.push(`    * ${titleGroup.title}`);
    }
  }
  lines.push("");
  lines.push("Problems or bottlenecks: ");
  lines.push("*");
  lines.push("Next: ");
  lines.push("*");

  // Week summary when period is 7+ days
  if (options.days >= 7 && totalSeconds > 0) {
    lines.push("");
    lines.push(`Week summary: ${formatDuration(totalSeconds)} total (~${formatDuration(Math.round(totalSeconds / options.days))}/day average)`);
  }

  return lines.join("\n").trimEnd();
}

export function getStandupDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return {
    start: toLocalYYYYMMDD(start),
    end: toLocalYYYYMMDD(end)
  };
}
