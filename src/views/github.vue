<template>
  <div class="view-root">
    <header class="view-header">
      <div class="view-header-text">
        <h1>GitHub</h1>
        <p>Assigned issues and PRs awaiting your review.</p>
      </div>
      <div v-if="github.token" class="header-actions">
        <input
          v-model.trim="searchQuery"
          type="search"
          class="search-input"
          placeholder="Search issues…"
          aria-label="Search issues and PRs"
        />
        <button
          type="button"
          class="btn-refresh"
          :class="{ 'btn-refresh--loading': github.loading }"
          :disabled="github.loading"
          @click="github.fetchAll()"
        >
          <span v-if="github.loading" class="btn-refresh-text">Loading…</span>
          <span v-else class="btn-refresh-text">Refresh</span>
        </button>
      </div>
    </header>
    <main class="view-main">
      <template v-if="!github.token">
        <p class="connect-hint">
          <RouterLink to="/settings">Connect your GitHub account in Settings</RouterLink>
        </p>
      </template>
      <template v-else>
        <div v-if="github.loading" class="loading">Loading…</div>
        <p v-else-if="github.error" class="error">
          {{ github.error }}
          <RouterLink to="/settings">Check Settings</RouterLink>
        </p>
        <template v-else>
          <div class="columns-row">
            <GitHubIssueColumn
              title="Review requested"
              :items="searchReviewPRs"
              empty-message="No PRs awaiting review."
            />
            <GitHubIssueColumn
              title="My open PRs"
              :items="searchMyOpenPRs"
              empty-message="No open PRs by you."
            />
            <GitHubIssueColumn
              title="Assigned to you"
              :items="searchAssignedIssues"
              empty-message="No assigned issues."
            />
          </div>
        </template>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useGitHubSearch } from "@/composables/useGitHubSearch";
import GitHubIssueColumn from "@/components/github/github-issue-column.vue";

const {
  github,
  searchQuery,
  searchAssignedIssues,
  searchReviewPRs,
  searchMyOpenPRs
} = useGitHubSearch();
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  min-width: 160px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
}

.search-input::placeholder {
  color: #6b7280;
}

.search-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
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

.view-main {
  margin-top: 12px;
  padding-bottom: 24px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.columns-row {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
