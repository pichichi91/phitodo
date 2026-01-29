<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Review</h1>
      <p>Overdue tasks and projects that haven't moved recently.</p>
    </header>
    <main class="view-main">
      <section class="column">
        <header class="column-header">Overdue tasks</header>
        <div class="column-body">
          <TaskList
            :items="summary.overdueTasks"
            :empty-message="'No overdue tasks 🎉'"
            :hide-completed="true"
          />
        </div>
      </section>
      <section class="column">
        <header class="column-header">Stale projects</header>
        <div class="column-body">
          <ul v-if="summary.staleProjects.length" class="project-list">
            <li v-for="project in summary.staleProjects" :key="project.id">
              {{ project.name }}
            </li>
          </ul>
          <div v-else class="empty">No stale projects.</div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";
import { buildReviewSummary } from "@/domain/services/review-service";
import TaskList from "@/components/tasks/task-list.vue";

const taskStore = useTaskStore();
const projectStore = useProjectStore();

const summary = computed(() =>
  buildReviewSummary(taskStore.allTasks, projectStore.allProjects)
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
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 14px;
  margin-top: 12px;
  padding-bottom: 24px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
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

.project-list {
  margin: 0;
  padding-left: 16px;
  font-size: 13px;
}

.empty {
  font-size: 12px;
  color: #6b7280;
}
</style>
