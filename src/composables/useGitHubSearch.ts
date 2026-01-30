import { computed, onMounted, ref } from "vue";
import type { GitHubIssueItem } from "@/domain/services/github-service";
import { useGitHubStore } from "@/stores/githubStore";

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

export function useGitHubSearch() {
  const github = useGitHubStore();
  const searchQuery = ref("");

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

  return {
    github,
    searchQuery,
    searchAssignedIssues,
    searchReviewPRs,
    searchMyOpenPRs
  };
}
