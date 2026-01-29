<template>
  <div class="view-root">
    <header class="view-header">
      <div class="view-header-text">
        <h1>GitHub</h1>
        <p>Assigned issues and PRs awaiting your review.</p>
      </div>
      <button
        v-if="github.token"
        type="button"
        class="btn-refresh"
        :class="{ 'btn-refresh--loading': github.loading }"
        :disabled="github.loading"
        @click="github.fetchAll()"
      >
        <span v-if="github.loading" class="btn-refresh-text">Loading…</span>
        <span v-else class="btn-refresh-text">Refresh</span>
      </button>
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
            <section class="column" :class="{ 'column--minified': !github.filteredReviewRequestedPRs.length }">
              <header class="column-header">Review requested</header>
              <div class="column-body">
                <ul v-if="github.filteredReviewRequestedPRs.length" class="issue-list">
                  <li v-for="item in github.filteredReviewRequestedPRs" :key="item.id" class="issue-row">
                    <a :href="item.html_url" target="_blank" rel="noopener noreferrer" class="issue-link">
                      <span class="issue-repo">{{ item.repository?.full_name ?? "Unknown" }}</span>
                      <span class="issue-num">#{{ item.number }}</span>
                      <span class="issue-title">{{ item.title }}</span>
                    </a>
                  </li>
                </ul>
                <div v-else class="empty">No PRs awaiting review.</div>
              </div>
            </section>
            <section class="column">
              <header class="column-header">Assigned to you</header>
              <div class="column-body">
                <ul v-if="github.filteredAssignedIssues.length" class="issue-list">
                  <li v-for="item in github.filteredAssignedIssues" :key="item.id" class="issue-row">
                    <a :href="item.html_url" target="_blank" rel="noopener noreferrer" class="issue-link">
                      <span class="issue-repo">{{ item.repository?.full_name ?? "Unknown" }}</span>
                      <span class="issue-num">#{{ item.number }}</span>
                      <span class="issue-title">{{ item.title }}</span>
                    </a>
                  </li>
                </ul>
                <div v-else class="empty">No assigned issues.</div>
              </div>
            </section>
          </div>
        </template>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useGitHubStore } from "@/stores/githubStore";

const github = useGitHubStore();

onMounted(() => {
  if (github.token) github.fetchAll();
});
</script>

<style scoped>
.view-root {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.view-main {
  margin-top: 12px;
}

.columns-row {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.columns-row .column:first-child,
.columns-row .column:last-child {
  min-width: 0;
}

.columns-row .column:first-child.column--minified {
  flex: 0 0 auto;
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

.column--minified .column-body {
  padding: 6px 11px 8px;
}

.column--minified .empty {
  font-size: 11px;
  padding: 0;
}

.issue-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.issue-row {
  margin-bottom: 8px;
}

.issue-row:last-child {
  margin-bottom: 0;
}

.issue-link {
  display: block;
  font-size: 13px;
  color: #e5e7eb;
  text-decoration: none;
}

.issue-link:hover {
  color: #60a5fa;
}

.issue-repo {
  color: #9ca3af;
  font-size: 11px;
  margin-right: 6px;
}

.issue-num {
  color: #6b7280;
  margin-right: 6px;
}

.issue-title {
  word-break: break-word;
}

.empty {
  font-size: 12px;
  color: #6b7280;
}
</style>
