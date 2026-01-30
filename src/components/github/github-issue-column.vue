<template>
  <section class="column" :class="{ 'column--minified': !items.length }">
    <header class="column-header">{{ title }}</header>
    <div class="column-body">
      <ul v-if="items.length" class="issue-list">
        <li v-for="item in items" :key="item.id" class="issue-row">
          <a :href="getSafeHref(item.html_url) ?? '#'" target="_blank" rel="noopener noreferrer" class="issue-link">
            <span class="issue-repo">{{ item.repository?.full_name ?? "Unknown" }}</span>
            <span class="issue-num">#{{ item.number }}</span>
            <span class="issue-title">{{ item.title }}</span>
          </a>
        </li>
      </ul>
      <div v-else class="empty">{{ emptyMessage }}</div>
      <RouterLink
        v-if="viewAllLink && items.length > 0"
        :to="viewAllLink.to"
        class="github-view-all"
      >
        View all<template v-if="viewAllLink.count != null && viewAllLink.count > 0"> ({{ viewAllLink.count }})</template>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { GitHubIssueItem } from "@/domain/services/github-service";
import { getSafeHref } from "@/utils/safe-url";

defineProps<{
  title: string;
  items: GitHubIssueItem[];
  emptyMessage: string;
  viewAllLink?: { to: string; count?: number };
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
  min-width: 0;
}

.column--minified {
  flex: 0 0 auto;
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

.github-view-all {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #60a5fa;
}
</style>
