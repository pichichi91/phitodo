export interface GitHubIssueItem {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  repository?: { full_name: string };
  repository_url?: string;
  user?: { login: string };
  pull_request?: unknown;
}

/** Parse owner/repo from repository_url (e.g. https://api.github.com/repos/owner/repo) */
function fullNameFromRepositoryUrl(url: string | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/\/repos\/([^/]+\/[^/]+?)(?:\/|$)/);
  return match ? match[1] : null;
}

/** Parse owner/repo from html_url (e.g. https://github.com/owner/repo/pull/123) */
function fullNameFromHtmlUrl(url: string | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\/|$)/);
  return match ? `${match[1]}/${match[2]}` : null;
}

function normalizeItem(item: GitHubIssueItem): GitHubIssueItem {
  if (item.repository?.full_name) return item;
  const fullName =
    fullNameFromRepositoryUrl(item.repository_url) ?? fullNameFromHtmlUrl(item.html_url);
  if (fullName) {
    return { ...item, repository: { full_name: fullName } };
  }
  return item;
}

const GITHUB_API = "https://api.github.com";

async function fetchWithAuth(url: string, token: string, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(url, {
    signal,
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${token}`
    }
  });
  if (!res.ok) {
    const msg = res.status === 401 ? "Invalid token. Check Settings." : `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return res;
}

export async function fetchAssignedIssues(
  token: string,
  signal?: AbortSignal
): Promise<GitHubIssueItem[]> {
  const url = `${GITHUB_API}/issues?filter=assigned&state=open&per_page=100`;
  const res = await fetchWithAuth(url, token, signal);
  const data = (await res.json()) as GitHubIssueItem[];
  return data.filter((item) => !("pull_request" in item && item.pull_request));
}

export async function fetchReviewRequestedPRs(
  token: string,
  signal?: AbortSignal
): Promise<GitHubIssueItem[]> {
  const q = encodeURIComponent("review-requested:@me is:open is:pr");
  const url = `${GITHUB_API}/search/issues?q=${q}&per_page=100`;
  const res = await fetchWithAuth(url, token, signal);
  const data = (await res.json()) as { items: GitHubIssueItem[] };
  const items = data.items ?? [];
  return items.map(normalizeItem);
}
