<template>
  <div class="inbox-stats-row">
    <section class="stat-card stat-card-today">
      <header class="stat-card-header">Today</header>
      <div class="stat-card-body">
        <p class="stat-value">{{ completedTodayCount }}</p>
        <p class="stat-label">task{{ completedTodayCount === 1 ? "" : "s" }} completed</p>
      </div>
    </section>
    <TasksByDayChart :data="completedThisWeekByDay" />
  </div>
</template>

<script setup lang="ts">
import TasksByDayChart from "@/components/charts/tasks-by-day-chart.vue";

defineProps<{
  completedTodayCount: number;
  completedThisWeekByDay: { date: string; label: string; count: number }[];
}>();
</script>

<style scoped>
.inbox-stats-row {
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr);
  gap: 14px;
}

@media (max-width: 560px) {
  .inbox-stats-row {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  border-radius: 14px;
  border: 1px solid rgba(55, 65, 81, 0.85);
  background: radial-gradient(
    circle at top left,
    rgba(15, 23, 42, 0.96),
    rgba(15, 23, 42, 0.98)
  );
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.stat-card-header {
  padding: 9px 11px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
  border-bottom: 1px solid rgba(31, 41, 55, 0.9);
  font-weight: 600;
}

.stat-card-body {
  padding: 12px;
}

.stat-value {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #e5e7eb;
}

.stat-label {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9ca3af;
}
</style>
