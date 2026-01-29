import type { Task, ViewCriteria } from "@/domain/models";

export const filterTasks = (tasks: Task[], criteria: ViewCriteria): Task[] => {
  return tasks.filter((task) => {
    if (criteria.status && !criteria.status.includes(task.status)) return false;
    if (criteria.priorities && !criteria.priorities.includes(task.priority)) return false;
    if (criteria.projectIds && task.projectId && !criteria.projectIds.includes(task.projectId)) return false;
    if (criteria.tagIds && !task.tags.some((t) => criteria.tagIds?.includes(t))) return false;
    if (criteria.dateRange) {
      if (criteria.dateRange.from && (!task.dueDate || task.dueDate < criteria.dateRange.from)) return false;
      if (criteria.dateRange.to && (!task.dueDate || task.dueDate > criteria.dateRange.to)) return false;
    }
    return true;
  });
};
