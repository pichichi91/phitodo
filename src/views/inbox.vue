<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Inbox</h1>
      <p>Quick capture for everything on your mind.</p>
    </header>
    <main class="view-main">
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
                        <a :href="item.html_url" target="_blank" rel="noopener noreferrer" class="github-link">
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
                        <a :href="item.html_url" target="_blank" rel="noopener noreferrer" class="github-link">
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
        <div v-if="toggl.loading" class="toggl-block">
          <header class="column-header">Toggl today</header>
          <div class="column-body">
            <p class="toggl-skeleton">Loading…</p>
          </div>
        </div>
        <div v-else-if="toggl.error" class="toggl-block toggl-error-block">
          <header class="column-header">Toggl today</header>
          <div class="column-body">
            <p class="toggl-error">{{ toggl.error }}</p>
            <p class="toggl-error-actions">
              <RouterLink to="/settings">Settings</RouterLink>
              <button type="button" class="link-button" @click="fetchTogglToday">Try again</button>
            </p>
          </div>
        </div>
        <div v-else class="toggl-block">
          <header class="column-header">Toggl today</header>
          <div class="column-body toggl-block-body">
            <p class="toggl-total">Today: {{ todayFormatted }}</p>
            <ul v-if="todayProjectSummary.length" class="toggl-summary-list">
              <li v-for="p in todayProjectSummary" :key="p.projectName" class="toggl-summary-item">
                <span class="toggl-summary-project">{{ p.projectName }}</span>
                <span class="toggl-summary-hours">{{ formatTogglDuration(p.totalSeconds) }}</span>
              </li>
            </ul>
            <div class="toggl-block-actions">
              <button
                type="button"
                class="toggl-btn-standup"
                @click="showStandupModal = true"
              >
                Standup report
              </button>
              <RouterLink to="/toggl" class="toggl-view-all">View all</RouterLink>
            </div>
          </div>
        </div>
      </section>
      <StandupReportModal v-if="showStandupModal" @close="showStandupModal = false" />
      <div class="content-grid">
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
        <section class="column column-secondary">
          <header class="column-header">Hint</header>
          <div class="column-body hint">
            Inbox is the landing zone. Capture first, organize later into projects and tags.
          </div>
        </section>
      </div>
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
import { toLocalYYYYMMDD } from "@/utils/date-format";

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

const todayProjectSummary = computed(() => {
  const todayLocal = toLocalYYYYMMDD(new Date());
  const todayEntries = toggl.timeEntries.filter(
    (e) => toLocalYYYYMMDD(new Date(e.start)) === todayLocal && e.duration >= 0
  );
  const groups = groupEntriesByProject(todayEntries);
  return groups.map((g) => ({ projectName: g.projectName, totalSeconds: g.totalSeconds }));
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
  padding-bottom: 24px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.github-section {
  flex: 0 0 auto;
}

.toggl-section {
  flex: 0 0 auto;
}

.toggl-block {
  border-radius: 14px;
  border: 1px solid rgba(55, 65, 81, 0.85);
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.98));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toggl-block-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 11px 12px;
}

.toggl-block-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toggl-btn-standup {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: rgba(55, 65, 81, 0.5);
  color: #e5e7eb;
  border: 1px solid rgba(55, 65, 81, 0.9);
  cursor: pointer;
}

.toggl-btn-standup:hover {
  background: rgba(55, 65, 81, 0.7);
}

.toggl-total {
  margin: 0;
  font-size: 13px;
  color: #e5e7eb;
}

.toggl-summary-list {
  margin: 0;
  padding: 0 0 0 12px;
  list-style: none;
  font-size: 12px;
}

.toggl-summary-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.toggl-summary-item:last-child {
  margin-bottom: 0;
}

.toggl-summary-project {
  color: #93c5fd;
  word-break: break-word;
}

.toggl-summary-hours {
  color: #9ca3af;
  flex-shrink: 0;
}

.toggl-view-all {
  font-size: 12px;
  color: #60a5fa;
}

.toggl-skeleton {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  padding: 10px 11px 12px;
}

.toggl-error-block .toggl-error,
.toggl-error-block .toggl-error-actions {
  font-size: 12px;
  margin: 0 0 6px 0;
}

.toggl-error-block .toggl-error-actions:last-child {
  margin-bottom: 0;
}

.toggl-error-block .toggl-error {
  color: #f87171;
}

.toggl-error-actions a,
.toggl-error-actions .link-button {
  color: #60a5fa;
  margin-right: 8px;
}

.toggl-error-actions .link-button {
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

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 2fr);
  gap: 14px;
  flex: 1;
  min-height: 0;
}

.column-secondary {
  max-width: 360px;
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
