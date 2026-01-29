<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Upcoming</h1>
      <p>Everything scheduled beyond today.</p>
    </header>
    <main class="view-main">
      <TaskList
        :items="upcomingTasks"
        :empty-message="'No upcoming tasks yet.'"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import TaskList from "@/components/tasks/task-list.vue";

const taskStore = useTaskStore();

const today = new Date().toISOString();

const upcomingTasks = computed(() =>
  taskStore.allTasks
    .filter((t) => t.dueDate && t.dueDate > today && t.status !== "completed")
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
);
</script>

<style scoped>
.view-root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
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
  padding-bottom: 24px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
