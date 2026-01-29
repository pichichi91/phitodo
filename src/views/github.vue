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
            <section class="column" :class="{ 'column--minified': !searchReviewPRs.length }">
              <header class="column-header">Review requested</header>
              <div class="column-body">
                <ul v-if="searchReviewPRs.length" class="issue-list">
                  <li v-for="item in searchReviewPRs" :key="item.id" class="issue-row">
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
            <section class="column" :class="{ 'column--minified': !searchMyOpenPRs.length }">
              <header class="column-header">My open PRs</header>
              <div class="column-body">
                <ul v-if="searchMyOpenPRs.length" class="issue-list">
                  <li v-for="item in searchMyOpenPRs" :key="item.id" class="issue-row">
                    <a :href="item.html_url" target="_blank" rel="noopener noreferrer" class="issue-link">
                      <span class="issue-repo">{{ item.repository?.full_name ?? "Unknown" }}</span>
                      <span class="issue-num">#{{ item.number }}</span>
                      <span class="issue-title">{{ item.title }}</span>
                    </a>
                  </li>
                </ul>
                <div v-else class="empty">No open PRs by you.</div>
              </div>
            </section>
            <section class="column">
              <header class="column-header">Assigned to you</header>
              <div class="column-body">
                <ul v-if="searchAssignedIssues.length" class="issue-list">
                  <li v-for="item in searchAssignedIssues" :key="item.id" class="issue-row">
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
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import type { GitHubIssueItem } from "@/domain/services/github-service";
import { useGitHubStore } from "@/stores/githubStore";

const github = useGitHubStore();
const searchQuery = ref("");

function matchesSearch(item: GitHubIssueItem, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  const title = (item.title ?? "").toLowerCase();
  const repo = (item.repository?.full_name ?? "").toLowerCase();
  const num = String(item.number);
  return (
    title.includes(lower) ||
    repo.includes(lower) ||
    num.includes(lower) ||
    (`#${num}`).includes(lower)
  );
}

const searchAssignedIssues = computed(() => {
  const q = searchQuery.value;
  const list = github.filteredAssignedIssues;
  if (!q) return list;
  return list.filter((item) => matchesSearch(item, q));
});

const searchReviewPRs = computed(() => {
  const q = searchQuery.value;
  const list = github.filteredReviewRequestedPRs;
  if (!q) return list;
  return list.filter((item) => matchesSearch(item, q));
});

const searchMyOpenPRs = computed(() => {
  const q = searchQuery.value;
  const list = github.filteredMyOpenPRs;
  if (!q) return list;
  return list.filter((item) => matchesSearch(item, q));
});

onMounted(() => {
  if (github.token) github.fetchAll();
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

.columns-row .column {
  min-width: 0;
}

.columns-row .column.column--minified {
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
