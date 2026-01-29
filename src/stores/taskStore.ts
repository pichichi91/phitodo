import { defineStore } from "pinia";
import type { Task, TaskStatus } from "@/domain/models";
import { updateTaskStatus } from "@/domain/services/task-service";

interface TaskState {
  tasks: Record<string, Task>;
}

export const useTaskStore = defineStore("tasks", {
  state: (): TaskState => ({
    tasks: {}
  }),
  getters: {
    allTasks(state): Task[] {
      return Object.values(state.tasks).filter((t) => !t.deleted);
    },
    inboxTasks(): Task[] {
      return this.allTasks.filter((t) => t.status === "inbox");
    }
  },
  actions: {
    upsertMany(tasks: Task[]) {
      for (const task of tasks) {
        this.tasks[task.id] = task;
      }
    },
    setStatus(id: string, status: TaskStatus) {
      const existing = this.tasks[id];
      if (!existing) return;
      this.tasks[id] = updateTaskStatus(existing, status);
    },
    toggleCompleted(id: string) {
      const existing = this.tasks[id];
      if (!existing) return;
      const nextStatus: TaskStatus = existing.status === "completed" ? "inbox" : "completed";
      this.tasks[id] = updateTaskStatus(existing, nextStatus);
    },
    deleteTask(id: string) {
      const existing = this.tasks[id];
      if (!existing) return;
      this.tasks[id] = { ...existing, deleted: true };
    }
  }
});
