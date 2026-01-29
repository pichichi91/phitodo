<template>
  <article class="item-root">
    <label class="item-main">
      <input
        type="checkbox"
        class="checkbox"
        :checked="task.status === 'completed'"
        @change.stop="toggleCompleted"
      />
      <div class="item-text" @dblclick="editTask">
        <div class="title">
          {{ task.title }}
        </div>
        <div class="meta">
          <span v-if="task.dueDate" class="pill pill-date">
            Due {{ task.dueDate }}
          </span>
          <span v-if="task.priority !== 'none'" class="pill pill-priority">
            {{ task.priority }}
          </span>
        </div>
      </div>
    </label>
  </article>
</template>

<script setup lang="ts">
import type { Task } from "@/domain/models";
import { useUIStore } from "@/stores/uiStore";
import { useTaskStore } from "@/stores/taskStore";

const props = defineProps<{
  task: Task;
}>();

const ui = useUIStore();
const tasks = useTaskStore();

const editTask = () => {
  ui.startTaskEdit(props.task.id);
};

const toggleCompleted = () => {
  tasks.toggleCompleted(props.task.id);
};
</script>

<style scoped>
.item-root {
  padding: 6px 6px;
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.item-root:hover {
  background: rgba(31, 41, 55, 0.9);
}

.item-main {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  flex: 1;
}

.checkbox {
  margin-top: 2px;
}

.item-text {
  flex: 1;
}

.title {
  font-size: 13px;
}

.meta {
  margin-top: 2px;
  display: flex;
  gap: 4px;
  font-size: 11px;
}

.pill {
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid rgba(55, 65, 81, 0.9);
}

.pill-date {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.6);
}

.pill-priority {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.6);
}
</style>
