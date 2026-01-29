import type { Task, Project } from "@/domain/models";

export interface ReviewSummary {
  overdueTasks: Task[];
  staleProjects: Project[];
}

export const buildReviewSummary = (tasks: Task[], projects: Project[], staleDays = 7): ReviewSummary => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - staleDays * 24 * 60 * 60 * 1000).toISOString();

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < now.toISOString() && t.status !== "completed" && !t.deleted
  );

  const staleProjects = projects.filter(
    (p) => !p.deleted && p.updatedAt < cutoff
  );

  return { overdueTasks, staleProjects };
};
