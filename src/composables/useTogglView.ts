import { computed, onMounted, ref, watch } from "vue";
import { useTogglStore } from "@/stores/togglStore";
import {
  toLocalYYYYMMDD,
  formatDayLabel,
  getDaysInRange,
  formatEntryStart
} from "@/utils/date-format";
import { groupEntriesByProject, formatDuration } from "@/utils/standup-report";
import type { ProjectGroup } from "@/utils/standup-report";

export type RangeKey = "today" | "week" | "last7" | "custom";

export const rangeOptions: { value: RangeKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "last7", label: "Last 7 days" },
  { value: "custom", label: "Custom" }
];

type SavedRange = {
  rangeKey: RangeKey;
  customStart?: string;
  customEnd?: string;
};

export function useTogglView() {
  const toggl = useTogglStore();

  const rangeKey = ref<RangeKey>("week");

  function defaultCustomRange() {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    return { start: toLocalYYYYMMDD(start), end: toLocalYYYYMMDD(end) };
  }

  const customStart = ref(defaultCustomRange().start);
  const customEnd = ref(defaultCustomRange().end);

  const showStandupModal = ref(false);
  const savedRangeWhenStandupOpened = ref<SavedRange | null>(null);

  const rangeDates = computed(() => {
    const end = new Date();
    let startStr: string;
    let endStr: string;
    if (rangeKey.value === "custom") {
      const s = customStart.value;
      const e = customEnd.value;
      startStr = s <= e ? s : e;
      endStr = s <= e ? e : s;
    } else if (rangeKey.value === "today") {
      const yesterday = new Date(end);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(end);
      tomorrow.setDate(tomorrow.getDate() + 1);
      startStr = toLocalYYYYMMDD(yesterday);
      endStr = toLocalYYYYMMDD(tomorrow);
    } else {
      endStr = end.toISOString().slice(0, 10);
      const start = new Date(end);
      if (rangeKey.value === "week") {
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
      } else {
        start.setDate(start.getDate() - 7);
      }
      startStr = start.toISOString().slice(0, 10);
    }
    return { start: startStr, end: endStr };
  });

  const filteredEntries = computed(() => {
    const entries = toggl.timeEntries;
    if (rangeKey.value === "today") {
      const todayLocal = toLocalYYYYMMDD(new Date());
      return entries.filter(
        (e) => toLocalYYYYMMDD(new Date(e.start)) === todayLocal
      );
    }
    const { start, end } = rangeDates.value;
    return entries.filter((e) => {
      const date = toLocalYYYYMMDD(new Date(e.start));
      return date >= start && date <= end;
    });
  });

  const groupedByProject = computed<ProjectGroup[]>(() =>
    groupEntriesByProject(filteredEntries.value)
  );

  const durationByDay = computed(() => {
    const { start, end } = rangeDates.value;
    const days = getDaysInRange(start, end);
    const entries = toggl.timeEntries.filter((e) => e.duration >= 0);
    return days.map((date) => {
      const totalSeconds = entries
        .filter((e) => toLocalYYYYMMDD(new Date(e.start)) === date)
        .reduce((sum, e) => sum + e.duration, 0);
      return {
        date,
        label: formatDayLabel(date),
        totalSeconds
      };
    });
  });

  const projectDistribution = computed(() => {
    const groups = groupedByProject.value;
    const totalSeconds = groups.reduce((s, g) => s + g.totalSeconds, 0);
    if (totalSeconds === 0) return [];
    return groups.map((g) => ({
      projectName: g.projectName,
      totalSeconds: g.totalSeconds,
      percentage: (g.totalSeconds / totalSeconds) * 100
    }));
  });

  function refresh() {
    toggl.fetchTimeEntries(rangeDates.value.start, rangeDates.value.end);
  }

  function openStandupModal() {
    savedRangeWhenStandupOpened.value = {
      rangeKey: rangeKey.value,
      customStart: customStart.value,
      customEnd: customEnd.value
    };
    showStandupModal.value = true;
  }

  function closeStandupModal() {
    showStandupModal.value = false;
    const saved = savedRangeWhenStandupOpened.value;
    savedRangeWhenStandupOpened.value = null;
    if (saved && toggl.token) {
      rangeKey.value = saved.rangeKey;
      if (saved.customStart) customStart.value = saved.customStart;
      if (saved.customEnd) customEnd.value = saved.customEnd;
      refresh();
    }
  }

  watch(
    () =>
      rangeKey.value === "custom"
        ? [customStart.value, customEnd.value]
        : [rangeDates.value.start, rangeDates.value.end],
    () => {
      if (toggl.token) refresh();
    },
    { immediate: false }
  );

  watch(rangeKey, () => {
    if (rangeKey.value === "custom" && toggl.token) refresh();
  });

  onMounted(() => {
    if (toggl.token) refresh();
  });

  return {
    toggl,
    rangeKey,
    customStart,
    customEnd,
    rangeDates,
    groupedByProject,
    durationByDay,
    projectDistribution,
    showStandupModal,
    refresh,
    openStandupModal,
    closeStandupModal,
    formatDuration,
    formatEntryStart
  };
}
