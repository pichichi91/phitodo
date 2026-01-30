<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Inbox</h1>
      <p>Quick capture for everything on your mind.</p>
    </header>
    <main class="view-main">
      <InboxStatsRow
        :completed-today-count="completedTodayCount"
        :completed-this-week-by-day="completedThisWeekByDay"
      />
      <section class="github-section">
        <template v-if="!github.token">
          <p class="github-connect">
            <RouterLink to="/settings">Connect GitHub in Settings</RouterLink>
          </p>
        </template>
        <template v-else>
          <InboxGitHubBlock
            :assigned-preview="assignedPreview"
            :review-requested-preview="reviewRequestedPreview"
            :assigned-total-count="github.filteredAssignedIssues.length"
            :review-requested-total-count="github.filteredReviewRequestedPRs.length"
            :loading="github.loading"
            :error="github.error"
            :max-items="maxGitHubItems"
            @retry="github.fetchAll()"
          />
        </template>
      </section>
      <InboxTogglBlock
        v-if="toggl.token"
        :this-week-seconds="togglThisWeekSeconds"
        :this-week-project-summary="thisWeekProjectSummary"
        :today-formatted="todayFormatted"
        :today-bar-width="todayBarWidth"
        :today-project-summary="todayProjectSummary"
        :loading="toggl.loading"
        :error="toggl.error"
        @retry="fetchTogglForInbox"
        @open-standup="showStandupModal = true"
      />
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
import { RouterLink } from "vue-router";
import { useInboxView } from "@/composables/useInboxView";
import StandupReportModal from "@/components/common/standup-report-modal.vue";
import TaskList from "@/components/tasks/task-list.vue";
import InboxStatsRow from "@/components/inbox/inbox-stats-row.vue";
import InboxGitHubBlock from "@/components/inbox/inbox-github-block.vue";
import InboxTogglBlock from "@/components/inbox/inbox-toggl-block.vue";

const {
  github,
  toggl,
  showStandupModal,
  inboxTasks,
  assignedPreview,
  reviewRequestedPreview,
  maxGitHubItems,
  completedTodayCount,
  completedThisWeekByDay,
  togglThisWeekSeconds,
  thisWeekProjectSummary,
  todayFormatted,
  todayBarWidth,
  todayProjectSummary,
  fetchTogglForInbox
} = useInboxView();
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

.github-section {
  flex: 0 0 auto;
}

.github-connect {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.github-connect a {
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
</style>
