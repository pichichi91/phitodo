<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Anytime</h1>
      <p>Tasks without a specific due date.</p>
    </header>
    <main class="view-main">
      <TaskList
        :items="anytimeTasks"
        :empty-message="'No anytime tasks yet.'"
        :hide-completed="true"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import TaskList from "@/components/tasks/task-list.vue";

const taskStore = useTaskStore();

const anytimeTasks = computed(() =>
  taskStore.allTasks.filter((t) => !t.dueDate && t.status !== "completed")
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
