<template>
  <div class="list-root">
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
import { computed, withDefaults } from "vue";
import type { Task } from "@/domain/models";
import TaskItem from "./task-item.vue";

const props = withDefaults(
  defineProps<{
    items?: Task[];
    emptyMessage?: string;
    hideCompleted?: boolean;
    query?: string;
  }>(),
  {
    items: () => [],
    emptyMessage: "No tasks yet.",
    hideCompleted: false,
    query: ""
  }
);

const filteredByCompletion = computed(() =>
  props.hideCompleted ? props.items.filter((t) => t.status !== "completed") : props.items
);

const visibleItems = computed(() => {
  const q = props.query?.trim().toLowerCase();
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
