<template>
  <article
    class="item-root"
    @click="handleClick"
    @dblclick="handleDblClick"
  >
    <div class="item-main">
      <span
        class="checkbox"
        :class="{ 'checkbox-checked': task.status === 'completed' }"
        aria-hidden="true"
      />
      <div class="item-text">
        <div class="title">
          {{ task.title }}
        </div>
        <div class="meta">
          <span v-if="task.dueDate" class="pill pill-date">
            {{ dueDateLabel }}
          </span>
          <span v-if="task.priority !== 'none'" class="pill pill-priority">
            {{ task.priority }}
          </span>
          <span v-if="task.kind && task.kind !== 'task'" class="pill pill-kind">
            {{ task.kind }}
          </span>
          <span v-if="task.size" class="pill pill-size">
            {{ task.size }}
          </span>
          <span v-if="task.assignee" class="pill pill-assignee">
            {{ task.assignee }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "@/domain/models";
import { useUIStore } from "@/stores/uiStore";
import { useTaskStore } from "@/stores/taskStore";
import { formatDueDateLabel } from "@/utils/date-format";

const props = defineProps<{
  task: Task;
}>();

const ui = useUIStore();
const tasks = useTaskStore();

const dueDateLabel = computed(() =>
  props.task.dueDate ? formatDueDateLabel(props.task.dueDate) : ""
);

let clickTimeout: ReturnType<typeof setTimeout> | null = null;

const handleClick = () => {
  clearTimeout(clickTimeout ?? undefined);
  clickTimeout = setTimeout(() => {
    clickTimeout = null;
    ui.openTaskDetail(props.task.id);
  }, 250);
};

const handleDblClick = () => {
  clearTimeout(clickTimeout ?? undefined);
  clickTimeout = null;
  tasks.toggleCompleted(props.task.id);
};
</script>

<style scoped>
.item-root {
  padding: 6px 6px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
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
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  margin-top: 3px;
  border: 1.5px solid rgba(148, 163, 184, 0.8);
  border-radius: 3px;
  background: transparent;
  transition: background-color 0.15s, border-color 0.15s;
  position: relative;
}

.checkbox-checked {
  background: rgba(59, 130, 246, 0.8);
  border-color: rgba(59, 130, 246, 0.9);
}

.checkbox-checked::after {
  content: "";
  position: absolute;
  left: 3.5px;
  top: 1px;
  width: 3px;
  height: 6px;
  border: solid white;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
}

.item-text {
  flex: 1;
  padding-top: 2px;
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

.pill-kind {
  color: #a78bfa;
  border-color: rgba(167, 139, 250, 0.6);
}

.pill-size {
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.6);
}

.pill-assignee {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.6);
}
</style>
