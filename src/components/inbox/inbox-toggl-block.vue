<template>
  <section class="toggl-section">
    <div class="toggl-blocks-row">
      <div
        class="toggl-block"
        :class="{ 'toggl-block--error': error }"
      >
        <header class="column-header">Toggl this week</header>
        <div class="toggl-block__body">
          <template v-if="error">
            <p class="toggl-block__error">{{ error }}</p>
            <p class="toggl-block__actions">
              <RouterLink to="/settings">Settings</RouterLink>
              <button type="button" class="link-button" @click="$emit('retry')">Try again</button>
            </p>
          </template>
          <template v-else>
            <p class="toggl-block__total">{{ formatDuration(thisWeekSeconds) }}</p>
          </template>
        </div>
      </div>
      <div
        v-if="loading"
        class="toggl-block"
      >
        <header class="column-header">Toggl today</header>
        <div class="toggl-block__body">
          <p class="toggl-block__skeleton">Loading…</p>
        </div>
      </div>
      <div
        v-else-if="error"
        class="toggl-block toggl-block--error"
      >
        <header class="column-header">Toggl today</header>
        <div class="toggl-block__body">
          <p class="toggl-block__error">{{ error }}</p>
          <p class="toggl-block__actions">
            <RouterLink to="/settings">Settings</RouterLink>
            <button type="button" class="link-button" @click="$emit('retry')">Try again</button>
          </p>
        </div>
      </div>
      <div
        v-else
        class="toggl-block"
      >
        <header class="column-header">Toggl today</header>
        <div class="toggl-block__body">
          <p class="toggl-block__total">Today: {{ todayFormatted }}</p>
          <div class="toggl-block__bar-wrap" aria-hidden="true">
            <div
              class="toggl-block__bar"
              :style="{ width: todayBarWidth }"
            />
          </div>
          <ul v-if="todayProjectSummary.length" class="toggl-block__summary-list">
            <li v-for="p in todayProjectSummary" :key="p.projectName" class="toggl-block__summary-item">
              <span class="toggl-block__summary-project">{{ p.projectName }}</span>
              <span class="toggl-block__summary-hours">{{ formatDuration(p.totalSeconds) }}</span>
            </li>
          </ul>
          <div class="toggl-block__footer">
            <button
              type="button"
              class="toggl-block__btn"
              @click="$emit('open-standup')"
            >
              Standup report
            </button>
            <RouterLink to="/toggl" class="toggl-block__link">View all</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { formatDuration } from "@/utils/standup-report";

defineProps<{
  thisWeekSeconds: number;
  todayFormatted: string;
  todayBarWidth: string;
  todayProjectSummary: { projectName: string; totalSeconds: number }[];
  loading: boolean;
  error: string | null;
}>();

defineEmits<{
  retry: [];
  "open-standup": [];
}>();
</script>

<style scoped>
.toggl-section {
  flex: 0 0 auto;
}

.toggl-blocks-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

@media (max-width: 560px) {
  .toggl-blocks-row {
    grid-template-columns: 1fr;
  }
}

.toggl-block {
  border-radius: 14px;
  border: 1px solid rgba(55, 65, 81, 0.85);
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.98));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toggl-block__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 11px 12px;
}

.toggl-block__total {
  margin: 0;
  font-size: 13px;
  color: #e5e7eb;
}

.toggl-block__bar-wrap {
  height: 6px;
  border-radius: 3px;
  background: rgba(55, 65, 81, 0.6);
  overflow: hidden;
}

.toggl-block__bar {
  height: 100%;
  border-radius: 3px;
  background: rgba(167, 139, 250, 0.8);
  transition: width 0.2s ease;
}

.toggl-block__summary-list {
  margin: 0;
  padding: 0 0 0 12px;
  list-style: none;
  font-size: 12px;
}

.toggl-block__summary-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.toggl-block__summary-item:last-child {
  margin-bottom: 0;
}

.toggl-block__summary-project {
  color: #93c5fd;
  word-break: break-word;
}

.toggl-block__summary-hours {
  color: #9ca3af;
  flex-shrink: 0;
}

.toggl-block__footer {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toggl-block__btn {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: rgba(55, 65, 81, 0.5);
  color: #e5e7eb;
  border: 1px solid rgba(55, 65, 81, 0.9);
  cursor: pointer;
}

.toggl-block__btn:hover {
  background: rgba(55, 65, 81, 0.7);
}

.toggl-block__link {
  font-size: 12px;
  color: #60a5fa;
}

.toggl-block__skeleton {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.toggl-block--error .toggl-block__error {
  margin: 0;
  font-size: 12px;
  color: #f87171;
}

.toggl-block--error .toggl-block__actions {
  margin: 0;
  font-size: 12px;
}

.toggl-block__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.toggl-block__actions a,
.toggl-block__actions .link-button {
  color: #60a5fa;
}

.toggl-block__actions .link-button {
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.column-header {
  padding: 9px 11px;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
  border-bottom: 1px solid rgba(31, 41, 55, 0.9);
}
</style>
