import type { Task, TaskPriority, TaskStatus } from "@/domain/models";

export const createEmptyTask = (title: string): Task => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    priority: "none",
    tags: [],
    status: "inbox",
    reminders: [],
    orderIndex: nowAsOrderIndex(now)
  };
};

export const updateTaskStatus = (task: Task, status: TaskStatus): Task => ({
  ...task,
  status,
  updatedAt: new Date().toISOString()
});

export const updateTaskPriority = (task: Task, priority: TaskPriority): Task => ({
  ...task,
  priority,
  updatedAt: new Date().toISOString()
});

const nowAsOrderIndex = (iso: string): number => {
  return new Date(iso).getTime();
};
