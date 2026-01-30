export interface TogglTimeEntry {
  id: number;
  description: string | null;
  duration: number;
  start: string;
  stop: string | null;
  project_id: number | null;
  project_name?: string | null;
}

/** Raw shape from API (may use project_id, pid, project_name, or nested project). */
interface RawTimeEntry {
  id: number;
  description?: string | null;
  duration: number;
  start: string;
  stop?: string | null;
  project_id?: number | null;
  pid?: number | null;
  project_name?: string | null;
  project?: { name?: string | null } | null;
}

function normalizeEntry(raw: RawTimeEntry): TogglTimeEntry {
  const projectId = raw.project_id ?? raw.pid ?? null;
  const projectName =
    raw.project_name ??
    (raw.project && typeof raw.project === "object" && "name" in raw.project
      ? (raw.project as { name?: string | null }).name
      : null);
  return {
    id: raw.id,
    description: raw.description ?? null,
    duration: raw.duration,
    start: raw.start,
    stop: raw.stop ?? null,
    project_id: projectId,
    project_name: projectName ?? null
  };
}

const TOGGL_API =
  (import.meta.env.DEV ? "/api/toggl" : "https://api.track.toggl.com") + "/api/v9";

async function fetchWithAuth(
  url: string,
  token: string,
  signal?: AbortSignal
): Promise<Response> {
  const credentials = btoa(`${token}:api_token`);
  const res = await fetch(url, {
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`
    }
  });
  if (!res.ok) {
    let msg: string;
    if (res.status === 402) {
      msg = "Request limit reached. Try again later.";
    } else if (res.status === 403) {
      msg = "Invalid token. Check Settings.";
    } else {
      msg = `Request failed: ${res.status}`;
    }
    throw new Error(msg);
  }
  return res;
}

export async function fetchTimeEntries(
  token: string,
  startDate: string,
  endDate: string,
  signal?: AbortSignal
): Promise<TogglTimeEntry[]> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    meta: "true"
  });
  const url = `${TOGGL_API}/me/time_entries?${params.toString()}`;
  const res = await fetchWithAuth(url, token, signal);
  const data = (await res.json()) as RawTimeEntry[] | { items?: RawTimeEntry[] };
  const rawItems = Array.isArray(data) ? data : data.items ?? [];
  let entries = rawItems.map(normalizeEntry);
  const missingProjectName = entries.filter((e) => e.project_id != null && !e.project_name);
  if (missingProjectName.length > 0) {
    try {
      const projectMap = await fetchProjectNames(token, signal);
      entries = entries.map((e) => {
        if (e.project_id != null && !e.project_name && projectMap.has(e.project_id)) {
          return { ...e, project_name: projectMap.get(e.project_id)! };
        }
        return e;
      });
    } catch {
      // keep entries as-is if projects fetch fails
    }
  }
  return entries;
}

interface ProjectItem {
  id: number;
  name?: string | null;
}

async function fetchProjectNames(
  token: string,
  signal?: AbortSignal
): Promise<Map<number, string>> {
  const url = `${TOGGL_API}/me/projects`;
  const res = await fetchWithAuth(url, token, signal);
  const data = (await res.json()) as { items?: ProjectItem[] } | ProjectItem[];
  const items = Array.isArray(data) ? data : data.items ?? [];
  const map = new Map<number, string>();
  for (const p of items) {
    if (p.id != null && p.name) map.set(p.id, p.name);
  }
  return map;
}
