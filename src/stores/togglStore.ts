import { defineStore } from "pinia";
import type { TogglTimeEntry } from "@/domain/services/toggl-service";
import { fetchTimeEntries } from "@/domain/services/toggl-service";
import { toLocalYYYYMMDD } from "@/utils/date-format";

const STORAGE_KEY = "phitodo_toggl_token";
const INBOX_HIDDEN_STORAGE_KEY = "phitodo_toggl_inbox_hidden";

function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function loadInboxHiddenProjects(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INBOX_HIDDEN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((p): p is string => typeof p === "string")
      : [];
  } catch {
    return [];
  }
}

function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface TogglState {
  token: string | null;
  inboxHiddenProjectNames: string[];
  timeEntries: TogglTimeEntry[];
  loading: boolean;
  error: string | null;
}

export const useTogglStore = defineStore("toggl", {
  state: (): TogglState => ({
    token: loadToken(),
    inboxHiddenProjectNames: loadInboxHiddenProjects(),
    timeEntries: [],
    loading: false,
    error: null
  }),
  getters: {
    todayTotalSeconds(state): number {
      const todayLocal = toLocalYYYYMMDD(new Date());
      return state.timeEntries
        .filter(
          (e) =>
            toLocalYYYYMMDD(new Date(e.start)) === todayLocal && e.duration >= 0
        )
        .reduce((sum, e) => sum + e.duration, 0);
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
    setInboxHiddenProjectNames(names: string[]) {
      this.inboxHiddenProjectNames = names;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          INBOX_HIDDEN_STORAGE_KEY,
          JSON.stringify(names)
        );
      }
    },
    async fetchTimeEntries(
      start?: string,
      end?: string,
      options?: { silent?: boolean }
    ) {
      if (!this.token) {
        this.error = "Configure token in Settings.";
        return;
      }
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const startStr = start ?? toYYYYMMDD(startDate);
      const endStr = end ?? toYYYYMMDD(endDate);

      const silent = options?.silent === true;
      if (!silent) {
        this.loading = true;
        this.error = null;
      }
      const timeoutMs = 15000;
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
      try {
        const entries = await fetchTimeEntries(
          this.token!,
          startStr,
          endStr,
          controller.signal
        );
        window.clearTimeout(timeoutId);
        if (silent) {
          const byId = new Map(this.timeEntries.map((e) => [e.id, e]));
          for (const e of entries) byId.set(e.id, e);
          this.timeEntries = [...byId.values()];
        } else {
          this.timeEntries = entries;
        }
      } catch (e) {
        window.clearTimeout(timeoutId);
        if (!silent) {
          if (e instanceof Error) {
            this.error = e.name === "AbortError" ? "Request timed out. Try again." : e.message;
          } else {
            this.error = "Request failed.";
          }
        }
        throw e;
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    }
  }
});
