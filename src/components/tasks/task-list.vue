<template>
  <div class="list-root">
    <div v-if="showFilter" class="filter-wrap">
      <input
        v-model="filterText"
        type="search"
        class="filter-input"
        placeholder="Filter tasks..."
        aria-label="Filter tasks by title or notes"
      />
    </div>
    <div v-if="visibleItems.length === 0" class="empty">
      {{ emptyMessage }}
    </div>
    <ul v-else class="list">
      <li v-for="item in visibleItems" :key="item.id">
        <TaskItem :task="item" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, withDefaults } from "vue";
import type { Task } from "@/domain/models";
import TaskItem from "./task-item.vue";

const props = withDefaults(
  defineProps<{
    items?: Task[];
    emptyMessage?: string;
    hideCompleted?: boolean;
    query?: string;
    showFilter?: boolean;
  }>(),
  {
    items: () => [],
    emptyMessage: "No tasks yet.",
    hideCompleted: false,
    query: "",
    showFilter: true
  }
);

const filterText = ref("");

const filteredByCompletion = computed(() =>
  props.hideCompleted ? props.items.filter((t) => t.status !== "completed") : props.items
);

const visibleItems = computed(() => {
  const q = (props.query?.trim() || filterText.value.trim()).toLowerCase();
  if (!q) return filteredByCompletion.value;
  return filteredByCompletion.value.filter((t) => {
    const title = t.title.toLowerCase();
    const notes = t.notes?.toLowerCase() ?? "";
    return title.includes(q) || notes.includes(q);
  });
});
</script>

<style scoped>
.list-root {
  margin-top: 6px;
}

.filter-wrap {
  margin-bottom: 8px;
}

.filter-input {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  font-size: 13px;
  background: rgba(15, 23, 42, 0.6);
  color: #e5e7eb;
}

.filter-input::placeholder {
  color: #6b7280;
}

.filter-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.6);
}

.empty {
  font-size: 12px;
  color: #6b7280;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
