<template>
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
                  {{ formatEntryStart(entry.start) }} · {{ formatDuration(entry.duration) }}
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

<script setup lang="ts">
import type { ProjectGroup } from "@/utils/standup-report";
import { formatDuration } from "@/utils/standup-report";
import { formatEntryStart } from "@/utils/date-format";

defineProps<{
  groupedByProject: ProjectGroup[];
}>();
</script>

<style scoped>
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
