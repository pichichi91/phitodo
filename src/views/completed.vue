<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Completed</h1>
      <p>Recently finished tasks.</p>
    </header>
    <main class="view-main">
      <TaskList :items="completedTasks" :empty-message="'No completed tasks yet.'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import TaskList from "@/components/tasks/task-list.vue";

const taskStore = useTaskStore();

const completedTasks = computed(() =>
  taskStore.allTasks
    .filter((t) => t.status === "completed")
    .sort((a, b) => (a.completedAt && b.completedAt && a.completedAt > b.completedAt ? -1 : 1))
);
</script>

<style scoped>
.view-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 16px 0;
}

.view-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.view-header p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.view-main {
  margin-top: 12px;
}
</style>
