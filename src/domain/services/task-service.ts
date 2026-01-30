import type { Task, TaskPriority, TaskStatus } from "@/domain/models";

export const createEmptyTask = (title: string): Task => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    priority: "none",
    kind: "task",
    tags: [],
    status: "inbox",
    reminders: [],
    orderIndex: nowAsOrderIndex(now)
  };
};

export const updateTaskStatus = (task: Task, status: TaskStatus): Task => {
  const now = new Date().toISOString();
  return {
    ...task,
    status,
    updatedAt: now,
    completedAt: status === "completed" ? now : undefined
  };
};

export const updateTaskPriority = (task: Task, priority: TaskPriority): Task => ({
  ...task,
  priority,
  updatedAt: new Date().toISOString()
});

const nowAsOrderIndex = (iso: string): number => {
  return new Date(iso).getTime();
};
