<template>
  <div class="view-root">
    <header class="view-header">
      <div class="view-header-text">
        <h1>Toggl</h1>
        <p>Time entries from Toggl Track.</p>
      </div>
      <div v-if="toggl.token" class="header-actions">
        <div class="range-select-wrap">
          <CustomSelect
            v-model="rangeKey"
            :options="rangeOptions"
            aria-label="Date range"
          />
        </div>
        <template v-if="rangeKey === 'custom'">
          <label class="date-label">
            <span class="date-label-text">From</span>
            <input v-model="customStart" type="date" class="date-input" aria-label="Start date" />
          </label>
          <label class="date-label">
            <span class="date-label-text">To</span>
            <input v-model="customEnd" type="date" class="date-input" aria-label="End date" />
          </label>
        </template>
        <button
          type="button"
          class="btn-refresh"
          :class="{ 'btn-refresh--loading': toggl.loading }"
          :disabled="toggl.loading"
          @click="refresh"
        >
          <span v-if="toggl.loading" class="btn-refresh-text">Loading…</span>
          <span v-else class="btn-refresh-text">Refresh</span>
        </button>
        <button
          type="button"
          class="btn-standup"
          :disabled="!groupedByProject.length"
          @click="openStandupModal"
        >
          Standup report
        </button>
      </div>
    </header>

    <StandupReportModal v-if="showStandupModal" @close="closeStandupModal" />
    <main class="view-main">
      <template v-if="!toggl.token">
        <p class="connect-hint">
          <RouterLink to="/settings">Connect Toggl in Settings</RouterLink>
        </p>
      </template>
      <template v-else>
        <div v-if="toggl.loading" class="loading">Loading…</div>
        <p v-else-if="toggl.error" class="error">
          {{ toggl.error }}
          <RouterLink to="/settings">Check Settings</RouterLink>
        </p>
        <template v-else>
          <div class="stats-grid">
            <DurationByDayChart :data="durationByDay" />
            <ProjectDistributionChart :data="projectDistribution" />
          </div>
          <TogglGroupedEntryList :grouped-by-project="groupedByProject" />
        </template>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useTogglView, rangeOptions } from "@/composables/useTogglView";
import StandupReportModal from "@/components/common/standup-report-modal.vue";
import DurationByDayChart from "@/components/charts/duration-by-day-chart.vue";
import ProjectDistributionChart from "@/components/charts/project-distribution-chart.vue";
import CustomSelect from "@/components/common/custom-select.vue";
import TogglGroupedEntryList from "@/components/toggl/toggl-grouped-entry-list.vue";

const {
  toggl,
  rangeKey,
  customStart,
  customEnd,
  showStandupModal,
  groupedByProject,
  durationByDay,
  projectDistribution,
  refresh,
  openStandupModal,
  closeStandupModal
} = useTogglView();
</script>

<style scoped>
.view-root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 16px 0;
}

.view-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.view-header-text h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.view-header-text p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-select-wrap {
  min-width: 140px;
  width: 160px;
}

.date-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-label-text {
  font-size: 12px;
  color: #9ca3af;
}

.date-input {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
}

.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.7;
}

.view-main {
  flex: 1;
  min-height: 0;
  margin-top: 12px;
  padding-bottom: 24px;
  overflow-y: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.connect-hint {
  font-size: 13px;
  color: #9ca3af;
}

.connect-hint a {
  color: #60a5fa;
}

.btn-refresh {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  background: rgba(59, 130, 246, 0.2);
  color: #e5e7eb;
  border: 1px solid rgba(59, 130, 246, 0.4);
  cursor: pointer;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
}

.btn-refresh:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-standup {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  background: rgba(55, 65, 81, 0.5);
  color: #e5e7eb;
  border: 1px solid rgba(55, 65, 81, 0.9);
  cursor: pointer;
}

.btn-standup:hover:not(:disabled) {
  background: rgba(55, 65, 81, 0.7);
}

.btn-standup:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-refresh--loading .btn-refresh-text {
  opacity: 0.9;
}

.loading {
  font-size: 13px;
  color: #9ca3af;
}

.error {
  font-size: 13px;
  color: #f87171;
}

.error a {
  color: #60a5fa;
  margin-left: 6px;
}
</style>
