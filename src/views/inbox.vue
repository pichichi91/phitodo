<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Inbox</h1>
      <p>Quick capture for everything on your mind.</p>
    </header>
    <main class="view-main">
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
      <section class="github-section">
        <template v-if="!github.token">
          <p class="github-connect">
            <RouterLink to="/settings">Connect GitHub in Settings</RouterLink>
          </p>
        </template>
        <template v-else>
          <div v-if="github.loading" class="github-blocks-row">
            <section class="column github-block">
              <header class="column-header">Assigned to you</header>
              <div class="column-body github-block-body">
                <div class="github-skeleton">
                  <div v-for="i in 4" :key="i" class="github-skeleton-row">
                    <span class="github-skeleton-repo" />
                    <span class="github-skeleton-title" />
                  </div>
                </div>
              </div>
            </section>
            <section class="column github-block">
              <header class="column-header">Review requested</header>
              <div class="column-body github-block-body">
                <div class="github-skeleton">
                  <div v-for="i in 4" :key="i" class="github-skeleton-row">
                    <span class="github-skeleton-repo" />
                    <span class="github-skeleton-title" />
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div v-else-if="github.error" class="github-error-block">
            <p class="github-error">{{ github.error }}</p>
            <p class="github-error-actions">
              <RouterLink to="/settings">Settings</RouterLink>
              <button type="button" class="link-button" @click="github.fetchAll()">Try again</button>
            </p>
          </div>
          <template v-else>
            <div class="github-blocks-row">
              <section class="column github-block">
                <header class="column-header">Assigned to you</header>
                <div class="column-body github-block-body">
                  <div class="github-block-list">
<ul v-if="github.filteredAssignedIssues.length" class="github-list">
                    <li v-for="item in assignedPreview" :key="item.id" class="github-row">
                        <a :href="getSafeHref(item.html_url) ?? '#'" target="_blank" rel="noopener noreferrer" class="github-link">
                          <span class="github-repo">{{ item.repository?.full_name ?? "Unknown" }}</span>
                          #{{ item.number }} {{ item.title }}
                        </a>
                      </li>
                    </ul>
                    <p v-else class="github-empty">No assigned issues.</p>
                  </div>
                  <RouterLink v-if="github.filteredAssignedIssues.length > 0" to="/github" class="github-view-all">View all<template v-if="github.filteredAssignedIssues.length > MAX_GITHUB_ITEMS"> ({{ github.filteredAssignedIssues.length }})</template></RouterLink>
                </div>
              </section>
              <section class="column github-block">
                <header class="column-header">Review requested</header>
                <div class="column-body github-block-body">
                  <div class="github-block-list">
<ul v-if="github.filteredReviewRequestedPRs.length" class="github-list">
                    <li v-for="item in reviewRequestedPreview" :key="item.id" class="github-row">
                        <a :href="getSafeHref(item.html_url) ?? '#'" target="_blank" rel="noopener noreferrer" class="github-link">
                          <span class="github-repo">{{ item.repository?.full_name ?? "Unknown" }}</span>
                          #{{ item.number }} {{ item.title }}
                        </a>
                      </li>
                    </ul>
                    <p v-else class="github-empty">No PRs awaiting review.</p>
                  </div>
                  <RouterLink v-if="github.filteredReviewRequestedPRs.length > 0" to="/github" class="github-view-all">View all<template v-if="github.filteredReviewRequestedPRs.length > MAX_GITHUB_ITEMS"> ({{ github.filteredReviewRequestedPRs.length }})</template></RouterLink>
                </div>
              </section>
            </div>
          </template>
        </template>
      </section>
      <section v-if="toggl.token" class="toggl-section">
        <div class="toggl-blocks-row">
          <div
            class="toggl-block"
            :class="{ 'toggl-block--error': toggl.error }"
          >
            <header class="column-header">Toggl this week</header>
            <div class="toggl-block__body">
              <template v-if="toggl.error">
                <p class="toggl-block__error">{{ toggl.error }}</p>
                <p class="toggl-block__actions">
                  <RouterLink to="/settings">Settings</RouterLink>
                  <button type="button" class="link-button" @click="fetchTogglToday">Try again</button>
                </p>
              </template>
              <template v-else>
                <p class="toggl-block__total">{{ formatTogglDuration(togglThisWeekSeconds) }}</p>
              </template>
            </div>
          </div>
          <div
            v-if="toggl.loading"
            class="toggl-block"
          >
            <header class="column-header">Toggl today</header>
            <div class="toggl-block__body">
              <p class="toggl-block__skeleton">Loading…</p>
            </div>
          </div>
          <div
            v-else-if="toggl.error"
            class="toggl-block toggl-block--error"
          >
            <header class="column-header">Toggl today</header>
            <div class="toggl-block__body">
              <p class="toggl-block__error">{{ toggl.error }}</p>
              <p class="toggl-block__actions">
                <RouterLink to="/settings">Settings</RouterLink>
                <button type="button" class="link-button" @click="fetchTogglToday">Try again</button>
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
                  <span class="toggl-block__summary-hours">{{ formatTogglDuration(p.totalSeconds) }}</span>
                </li>
              </ul>
              <div class="toggl-block__footer">
                <button
                  type="button"
                  class="toggl-block__btn"
                  @click="showStandupModal = true"
                >
                  Standup report
                </button>
                <RouterLink to="/toggl" class="toggl-block__link">View all</RouterLink>
              </div>
            </div>
          </div>
        </div>
      </section>
      <StandupReportModal v-if="showStandupModal" @close="showStandupModal = false" />
      <section class="column column-primary">
        <header class="column-header">Capture</header>
        <div class="column-body">
          <TaskList
            :items="inboxTasks"
            :empty-message="'Nothing in your inbox yet.'"
            :hide-completed="true"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import StandupReportModal from "@/components/common/standup-report-modal.vue";
import TaskList from "@/components/tasks/task-list.vue";
import { useTaskStore } from "@/stores/taskStore";
import { useGitHubStore } from "@/stores/githubStore";
import { useTogglStore } from "@/stores/togglStore";
import { groupEntriesByProject } from "@/utils/standup-report";
import { toLocalYYYYMMDD, getWeekStartEnd, getDaysInRange, formatDayLabel } from "@/utils/date-format";
import { getSafeHref } from "@/utils/safe-url";
import TasksByDayChart from "@/components/charts/tasks-by-day-chart.vue";

const taskStore = useTaskStore();
const github = useGitHubStore();
const toggl = useTogglStore();

const showStandupModal = ref(false);

const inboxTasks = computed(() => taskStore.inboxTasks);

const MAX_GITHUB_ITEMS = 5;
const assignedPreview = computed(() => github.filteredAssignedIssues.slice(0, MAX_GITHUB_ITEMS));
const reviewRequestedPreview = computed(() => github.filteredReviewRequestedPRs.slice(0, MAX_GITHUB_ITEMS));

function formatTogglDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return "0m";
}

const todayFormatted = computed(() => formatTogglDuration(toggl.todayTotalSeconds));

const REFERENCE_HOURS = 8;
const todayBarWidth = computed(() => {
  const seconds = toggl.todayTotalSeconds;
  if (seconds <= 0) return "0%";
  const maxSeconds = REFERENCE_HOURS * 3600;
  const pct = Math.min(100, (seconds / maxSeconds) * 100);
  return `${pct}%`;
});

const todayProjectSummary = computed(() => {
  const todayLocal = toLocalYYYYMMDD(new Date());
  const todayEntries = toggl.timeEntries.filter(
    (e) => toLocalYYYYMMDD(new Date(e.start)) === todayLocal && e.duration >= 0
  );
  const groups = groupEntriesByProject(todayEntries);
  return groups.map((g) => ({ projectName: g.projectName, totalSeconds: g.totalSeconds }));
});

const todayLocal = computed(() => toLocalYYYYMMDD(new Date()));

const completedTodayCount = computed(() => {
  return taskStore.allTasks.filter((t) => {
    if (t.status !== "completed") return false;
    const ts = t.completedAt ?? t.updatedAt;
    return ts && toLocalYYYYMMDD(new Date(ts)) === todayLocal.value;
  }).length;
});

const weekBounds = computed(() => getWeekStartEnd());
const weekDays = computed(() => getDaysInRange(weekBounds.value.start, weekBounds.value.end));

const completedThisWeekByDay = computed(() => {
  const { start, end } = weekBounds.value;
  const completed = taskStore.allTasks.filter((t) => {
    if (t.status !== "completed") return false;
    const ts = t.completedAt ?? t.updatedAt;
    if (!ts) return false;
    const date = toLocalYYYYMMDD(new Date(ts));
    return date >= start && date <= end;
  });
  return weekDays.value.map((date) => ({
    date,
    label: formatDayLabel(date),
    count: completed.filter(
      (t) => toLocalYYYYMMDD(new Date((t.completedAt ?? t.updatedAt)!)) === date
    ).length
  }));
});

const completedThisWeekCount = computed(() =>
  completedThisWeekByDay.value.reduce((s, d) => s + d.count, 0)
);

const togglThisWeekSeconds = computed(() => {
  const { start, end } = weekBounds.value;
  return toggl.timeEntries
    .filter((e) => {
      const date = toLocalYYYYMMDD(new Date(e.start));
      return e.duration >= 0 && date >= start && date <= end;
    })
    .reduce((s, e) => s + e.duration, 0);
});

function fetchTogglToday() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  toggl.fetchTimeEntries(toLocalYYYYMMDD(yesterday), toLocalYYYYMMDD(tomorrow));
}

onMounted(() => {
  if (github.token) github.fetchAll();
  if (toggl.token) fetchTogglToday();
});
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
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
  padding-bottom: 14px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

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

.github-section {
  flex: 0 0 auto;
}

/* Unified Toggl blocks (this week + today) */
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

.github-blocks-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

.github-block {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.github-block-body {
  display: flex;
  flex-direction: column;
  min-height: 140px;
  max-height: 140px;
}

.github-block-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.github-view-all {
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(31, 41, 55, 0.9);
  font-size: 12px;
  color: #60a5fa;
}

.column-primary {
  flex: 1;
  min-height: 0;
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

.github-connect {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.github-skeleton {
  padding: 0 2px;
}

.github-skeleton-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.github-skeleton-row:last-child {
  margin-bottom: 0;
}

.github-skeleton-repo {
  display: block;
  width: 80px;
  height: 10px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(55, 65, 81, 0.6) 0%,
    rgba(75, 85, 99, 0.5) 50%,
    rgba(55, 65, 81, 0.6) 100%
  );
  background-size: 200% 100%;
  animation: github-skeleton-shimmer 1.2s ease-in-out infinite;
}

.github-skeleton-title {
  display: block;
  width: 85%;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(55, 65, 81, 0.5) 0%,
    rgba(75, 85, 99, 0.4) 50%,
    rgba(55, 65, 81, 0.5) 100%
  );
  background-size: 200% 100%;
  animation: github-skeleton-shimmer 1.2s ease-in-out infinite;
}

@keyframes github-skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.github-connect a {
  color: #60a5fa;
}

.github-error-block {
  margin: 0;
}

.github-error-block .github-error {
  font-size: 12px;
  color: #f87171;
  margin: 0 0 6px;
}

.github-error-actions {
  font-size: 12px;
  margin: 0;
}

.github-error-actions a,
.github-error-actions .link-button {
  color: #60a5fa;
  margin-right: 8px;
}

.github-error-actions .link-button {
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.github-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.github-row {
  margin-bottom: 6px;
}

.github-row:last-child {
  margin-bottom: 0;
}

.github-link {
  font-size: 12px;
  color: #e5e7eb;
  text-decoration: none;
  display: block;
  word-break: break-word;
}

.github-link:hover {
  color: #60a5fa;
}

.github-repo {
  color: #9ca3af;
  margin-right: 4px;
}

.github-empty {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}
</style>
