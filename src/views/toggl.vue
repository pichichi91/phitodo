<template>
  <div class="view-root">
    <header class="view-header">
      <div class="view-header-text">
        <h1>Toggl</h1>
        <p>Time entries from Toggl Track.</p>
      </div>
      <div v-if="toggl.token" class="header-actions">
        <select v-model="rangeKey" class="range-select" aria-label="Date range">
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="last7">Last 7 days</option>
          <option value="custom">Custom</option>
        </select>
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
          <section class="column">
            <header class="column-header">Time entries</header>
            <div class="column-body">
              <template v-if="groupedByProject.length">
                <div
                  v-for="projectGroup in groupedByProject"
                  :key="projectGroup.projectName"
                  class="project-group"
                >
                  <header class="project-group-header">
                    <span class="project-group-name">{{ projectGroup.projectName }}</span>
                    <span class="project-group-total">{{ formatDuration(projectGroup.totalSeconds) }}</span>
                  </header>
                  <div
                    v-for="titleGroup in projectGroup.titleGroups"
                    :key="titleGroup.title"
                    class="entry-group"
                  >
                    <header class="entry-group-header">
                      <span class="entry-group-title">{{ titleGroup.title }}</span>
                      <span class="entry-group-total">{{ formatDuration(titleGroup.totalSeconds) }}</span>
                    </header>
                    <ul class="entry-list">
                      <li v-for="entry in titleGroup.entries" :key="entry.id" class="entry-row">
                        <span class="entry-meta">
                          {{ formatStart(entry.start) }} · {{ formatDuration(entry.duration) }}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>
              <div v-else class="empty">No time entries in this range.</div>
            </div>
          </section>
        </template>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import StandupReportModal from "@/components/common/standup-report-modal.vue";
import type { TogglTimeEntry } from "@/domain/services/toggl-service";
import { useTogglStore } from "@/stores/togglStore";
import { toLocalYYYYMMDD } from "@/utils/date-format";

const toggl = useTogglStore();

const rangeKey = ref<"today" | "week" | "last7" | "custom">("last7");

function defaultCustomRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return { start: toLocalYYYYMMDD(start), end: toLocalYYYYMMDD(end) };
}

const customStart = ref(defaultCustomRange().start);
const customEnd = ref(defaultCustomRange().end);

const showStandupModal = ref(false);

type SavedRange = {
  rangeKey: "today" | "week" | "last7" | "custom";
  customStart?: string;
  customEnd?: string;
};
const savedRangeWhenStandupOpened = ref<SavedRange | null>(null);

interface EntryGroup {
  title: string;
  entries: TogglTimeEntry[];
  totalSeconds: number;
}

interface ProjectGroup {
  projectName: string;
  totalSeconds: number;
  titleGroups: EntryGroup[];
}

const groupedByProject = computed<ProjectGroup[]>(() => {
  let entries = toggl.timeEntries;
  if (rangeKey.value === "today") {
    const todayLocal = toLocalYYYYMMDD(new Date());
    entries = entries.filter(
      (e) => toLocalYYYYMMDD(new Date(e.start)) === todayLocal
    );
  }
  if (!entries.length) return [];
  const byProject = new Map<string, TogglTimeEntry[]>();
  for (const e of entries) {
    const projectName = e.project_name?.trim() || "No project";
    let list = byProject.get(projectName);
    if (!list) {
      list = [];
      byProject.set(projectName, list);
    }
    list.push(e);
  }
  const projectGroups: ProjectGroup[] = [];
  byProject.forEach((projectEntries, projectName) => {
    const byTitle = new Map<string, TogglTimeEntry[]>();
    for (const e of projectEntries) {
      const title = e.description?.trim() || "No description";
      let list = byTitle.get(title);
      if (!list) {
        list = [];
        byTitle.set(title, list);
      }
      list.push(e);
    }
    const titleGroups: EntryGroup[] = [];
    byTitle.forEach((list, title) => {
      const totalSeconds = list
        .filter((e) => e.duration >= 0)
        .reduce((sum, e) => sum + e.duration, 0);
      list.sort((a, b) => (b.start < a.start ? -1 : 1));
      titleGroups.push({ title, entries: list, totalSeconds });
    });
    titleGroups.sort((a, b) => {
      const aLatest = a.entries[0]?.start ?? "";
      const bLatest = b.entries[0]?.start ?? "";
      return bLatest.localeCompare(aLatest);
    });
    const totalSeconds = projectEntries
      .filter((e) => e.duration >= 0)
      .reduce((sum, e) => sum + e.duration, 0);
    projectGroups.push({ projectName, totalSeconds, titleGroups });
  });
  projectGroups.sort((a, b) => {
    const aLatest =
      a.titleGroups[0]?.entries[0]?.start ?? "";
    const bLatest =
      b.titleGroups[0]?.entries[0]?.start ?? "";
    return bLatest.localeCompare(aLatest);
  });
  return projectGroups;
});

const rangeDates = computed(() => {
  const end = new Date();
  let startStr: string;
  let endStr: string;
  if (rangeKey.value === "custom") {
    const s = customStart.value;
    const e = customEnd.value;
    startStr = s <= e ? s : e;
    endStr = s <= e ? e : s;
  } else if (rangeKey.value === "today") {
    const yesterday = new Date(end);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(end);
    tomorrow.setDate(tomorrow.getDate() + 1);
    startStr = toLocalYYYYMMDD(yesterday);
    endStr = toLocalYYYYMMDD(tomorrow);
  } else {
    endStr = end.toISOString().slice(0, 10);
    const start = new Date(end);
    if (rangeKey.value === "week") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
    } else {
      start.setDate(start.getDate() - 7);
    }
    startStr = start.toISOString().slice(0, 10);
  }
  return { start: startStr, end: endStr };
});

function refresh() {
  toggl.fetchTimeEntries(rangeDates.value.start, rangeDates.value.end);
}

function groupEntriesByProject(entries: TogglTimeEntry[]): ProjectGroup[] {
  if (!entries.length) return [];
  const byProject = new Map<string, TogglTimeEntry[]>();
  for (const e of entries) {
    const projectName = e.project_name?.trim() || "No project";
    let list = byProject.get(projectName);
    if (!list) {
      list = [];
      byProject.set(projectName, list);
    }
    list.push(e);
  }
  const projectGroups: ProjectGroup[] = [];
  byProject.forEach((projectEntries, projectName) => {
    const byTitle = new Map<string, TogglTimeEntry[]>();
    for (const e of projectEntries) {
      const title = e.description?.trim() || "No description";
      let list = byTitle.get(title);
      if (!list) {
        list = [];
        byTitle.set(title, list);
      }
      list.push(e);
    }
    const titleGroups: EntryGroup[] = [];
    byTitle.forEach((list, title) => {
      const totalSeconds = list
        .filter((ent) => ent.duration >= 0)
        .reduce((sum, ent) => sum + ent.duration, 0);
      list.sort((a, b) => (b.start < a.start ? -1 : 1));
      titleGroups.push({ title, entries: list, totalSeconds });
    });
    titleGroups.sort((a, b) => {
      const aLatest = a.entries[0]?.start ?? "";
      const bLatest = b.entries[0]?.start ?? "";
      return bLatest.localeCompare(aLatest);
    });
    const totalSeconds = projectEntries
      .filter((e) => e.duration >= 0)
      .reduce((sum, e) => sum + e.duration, 0);
    projectGroups.push({ projectName, totalSeconds, titleGroups });
  });
  projectGroups.sort((a, b) => {
    const aLatest = a.titleGroups[0]?.entries[0]?.start ?? "";
    const bLatest = b.titleGroups[0]?.entries[0]?.start ?? "";
    return bLatest.localeCompare(aLatest);
  });
  return projectGroups;
}

async function openStandupModal() {
  savedRangeWhenStandupOpened.value = {
    rangeKey: rangeKey.value,
    customStart: customStart.value,
    customEnd: customEnd.value
  };
  showStandupModal.value = true;
}

function closeStandupModal() {
  showStandupModal.value = false;
  const saved = savedRangeWhenStandupOpened.value;
  savedRangeWhenStandupOpened.value = null;
  if (saved && toggl.token) {
    rangeKey.value = saved.rangeKey;
    if (saved.customStart) customStart.value = saved.customStart;
    if (saved.customEnd) customEnd.value = saved.customEnd;
    refresh();
  }
}

watch(
  () =>
    rangeKey.value === "custom"
      ? [customStart.value, customEnd.value]
      : [rangeDates.value.start, rangeDates.value.end],
  () => {
    if (toggl.token) refresh();
  },
  { immediate: false }
);

watch(rangeKey, () => {
  if (rangeKey.value === "custom" && toggl.token) refresh();
});

function formatDuration(seconds: number): string {
  if (seconds < 0) return "Running…";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return "0m";
}

function formatStart(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const dateStr = d.toISOString().slice(0, 10);
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false
  });
  if (dateStr === todayStr) return timeStr;
  const shortDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${shortDate} ${timeStr}`;
}

onMounted(() => {
  if (toggl.token) refresh();
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

.range-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
  cursor: pointer;
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

.entry-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.entry-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13px;
}

.entry-row:last-child {
  margin-bottom: 0;
}

.entry-desc {
  color: #e5e7eb;
  word-break: break-word;
}

.entry-project {
  color: #9ca3af;
  font-size: 12px;
}

.entry-meta {
  color: #6b7280;
  font-size: 12px;
  margin-left: auto;
}

.project-group {
  margin-bottom: 24px;
}

.project-group:last-child {
  margin-bottom: 0;
}

.project-group-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(55, 65, 81, 0.8);
}

.project-group-name {
  font-size: 15px;
  font-weight: 600;
  color: #93c5fd;
  word-break: break-word;
}

.project-group-total {
  font-size: 13px;
  color: #9ca3af;
  flex-shrink: 0;
}

.project-group .entry-group {
  margin-bottom: 14px;
}

.project-group .entry-group:last-child {
  margin-bottom: 0;
}

.entry-group {
  margin-bottom: 18px;
}

.entry-group:last-child {
  margin-bottom: 0;
}

.entry-group-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(55, 65, 81, 0.6);
}

.entry-group-title {
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
  word-break: break-word;
}

.entry-group-total {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.entry-group .entry-list {
  margin: 0;
  padding-left: 0;
}

.entry-group .entry-row {
  padding-left: 0;
}

.empty {
  font-size: 12px;
  color: #6b7280;
}
</style>
