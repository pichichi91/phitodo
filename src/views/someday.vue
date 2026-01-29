<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Someday</h1>
      <p>Ideas and tasks you might want to do later.</p>
    </header>
    <main class="view-main">
      <TaskList
        :items="somedayTasks"
        :empty-message="'No someday tasks yet.'"
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

const somedayTasks = computed(() =>
  taskStore.allTasks.filter((t) => t.status === "scheduled" && !t.dueDate)
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
