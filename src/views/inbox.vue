<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Inbox</h1>
      <p>Quick capture for everything on your mind.</p>
    </header>
    <main class="view-main">
      <section class="column column-primary">
        <header class="column-header">Capture</header>
        <div class="column-body">
          <TaskQuickAdd />
          <TaskList
            :items="inboxTasks"
            :empty-message="'Nothing in your inbox yet.'"
            :hide-completed="true"
          />
        </div>
      </section>
      <section class="column column-secondary">
        <header class="column-header">Hint</header>
        <div class="column-body hint">
          Inbox is the landing zone. Capture first, organize later into projects and tags.
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import TaskQuickAdd from "@/components/tasks/task-quick-add.vue";
import TaskList from "@/components/tasks/task-list.vue";
import { useTaskStore } from "@/stores/taskStore";

const taskStore = useTaskStore();
const inboxTasks = computed(() => taskStore.inboxTasks);
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
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 2fr);
  gap: 14px;
  margin-top: 12px;
  height: 100%;
}

.column {
  border-radius: 14px;
  border: 1px solid rgba(55, 65, 81, 0.85);
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.98));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.column-header {
  padding: 9px 11px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
  border-bottom: 1px solid rgba(31, 41, 55, 0.9);
}

.column-body {
  padding: 10px 11px 12px;
  overflow: auto;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
}

.column-secondary {
  max-width: 360px;
}
</style>
