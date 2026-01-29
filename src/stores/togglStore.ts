import { defineStore } from "pinia";
import type { TogglTimeEntry } from "@/domain/services/toggl-service";
import { fetchTimeEntries } from "@/domain/services/toggl-service";
import { toLocalYYYYMMDD } from "@/utils/date-format";

const STORAGE_KEY = "phitodo_toggl_token";

function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface TogglState {
  token: string | null;
  timeEntries: TogglTimeEntry[];
  loading: boolean;
  error: string | null;
}

export const useTogglStore = defineStore("toggl", {
  state: (): TogglState => ({
    token: loadToken(),
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
    async fetchTimeEntries(start?: string, end?: string) {
      if (!this.token) {
        this.error = "Configure token in Settings.";
        return;
      }
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const startStr = start ?? toYYYYMMDD(startDate);
      const endStr = end ?? toYYYYMMDD(endDate);

      this.loading = true;
      this.error = null;
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
        this.timeEntries = entries;
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
