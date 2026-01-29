import { defineStore } from "pinia";
import type { GitHubIssueItem } from "@/domain/services/github-service";
import {
  fetchAssignedIssues,
  fetchMyOpenPRs,
  fetchReviewRequestedPRs
} from "@/domain/services/github-service";

const STORAGE_KEY = "phitodo_github_token";
const REPOS_STORAGE_KEY = "phitodo_github_repos";

function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function loadAllowedRepos(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REPOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((r): r is string => typeof r === "string") : [];
  } catch {
    return [];
  }
}

interface GitHubState {
  token: string | null;
  allowedRepos: string[];
  assignedIssues: GitHubIssueItem[];
  reviewRequestedPRs: GitHubIssueItem[];
  myOpenPRs: GitHubIssueItem[];
  loading: boolean;
  error: string | null;
}

function repoMatches(item: GitHubIssueItem, allowedRepos: string[]): boolean {
  if (allowedRepos.length === 0) return true;
  const fullName = item.repository?.full_name?.toLowerCase();
  if (!fullName) return false;
  return allowedRepos.some((r) => {
    const pattern = r.trim().toLowerCase();
    if (!pattern) return false;
    if (pattern.includes("/")) {
      return fullName === pattern;
    }
    return fullName === pattern || fullName.startsWith(pattern + "/");
  });
}

export const useGitHubStore = defineStore("github", {
  state: (): GitHubState => ({
    token: loadToken(),
    allowedRepos: loadAllowedRepos(),
    assignedIssues: [],
    reviewRequestedPRs: [],
    myOpenPRs: [],
    loading: false,
    error: null
  }),
  getters: {
    filteredAssignedIssues(state): GitHubIssueItem[] {
      return state.assignedIssues.filter((item) => repoMatches(item, state.allowedRepos));
    },
    filteredReviewRequestedPRs(state): GitHubIssueItem[] {
      return state.reviewRequestedPRs.filter((item) => repoMatches(item, state.allowedRepos));
    },
    filteredMyOpenPRs(state): GitHubIssueItem[] {
      return state.myOpenPRs.filter((item) => repoMatches(item, state.allowedRepos));
    }
  },
  actions: {
    setToken(value: string | null) {
      this.token = value;
      this.error = null;
      if (typeof window !== "undefined") {
        if (value === null) window.localStorage.removeItem(STORAGE_KEY);
        else window.localStorage.setItem(STORAGE_KEY, value);
      }
    },
    clearToken() {
      this.setToken(null);
    },
    setAllowedRepos(repos: string[]) {
      this.allowedRepos = repos;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(REPOS_STORAGE_KEY, JSON.stringify(repos));
      }
    },
    async fetchAll() {
      if (!this.token) {
        this.error = "Configure token in Settings.";
        return;
      }
      this.loading = true;
      this.error = null;
      const timeoutMs = 15000;
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
      try {
        const [assigned, reviewPRs, myPRs] = await Promise.all([
          fetchAssignedIssues(this.token!, controller.signal),
          fetchReviewRequestedPRs(this.token!, controller.signal),
          fetchMyOpenPRs(this.token!, controller.signal)
        ]);
        window.clearTimeout(timeoutId);
        this.assignedIssues = assigned;
        this.reviewRequestedPRs = reviewPRs;
        this.myOpenPRs = myPRs;
      } catch (e) {
        if (e instanceof Error) {
          this.error = e.name === "AbortError" ? "Request timed out. Try again." : e.message;
        } else {
          this.error = "Request failed.";
        }
      } finally {
        window.clearTimeout(timeoutId);
        this.loading = false;
      }
    }
  }
});
