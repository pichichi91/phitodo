import { computed, onMounted, ref } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import { useGitHubStore } from "@/stores/githubStore";
import { useTogglStore } from "@/stores/togglStore";
import { groupEntriesByProject, formatDuration } from "@/utils/standup-report";
import { toLocalYYYYMMDD, getWeekStartEnd, getDaysInRange, formatDayLabel } from "@/utils/date-format";

const MAX_GITHUB_ITEMS = 5;
const REFERENCE_HOURS = 8;

export function useInboxView() {
  const taskStore = useTaskStore();
  const github = useGitHubStore();
  const toggl = useTogglStore();

  const showStandupModal = ref(false);
  const inboxTasks = computed(() => taskStore.inboxTasks);

  const assignedPreview = computed(() =>
    github.filteredAssignedIssues.slice(0, MAX_GITHUB_ITEMS)
  );
  const reviewRequestedPreview = computed(() =>
    github.filteredReviewRequestedPRs.slice(0, MAX_GITHUB_ITEMS)
  );

  const todayLocal = computed(() => toLocalYYYYMMDD(new Date()));
  const weekBounds = computed(() => getWeekStartEnd());
  const weekDays = computed(() =>
    getDaysInRange(weekBounds.value.start, weekBounds.value.end)
  );

  const completedTodayCount = computed(() =>
    taskStore.allTasks.filter((t) => {
      if (t.status !== "completed") return false;
      const ts = t.completedAt ?? t.updatedAt;
      return ts && toLocalYYYYMMDD(new Date(ts)) === todayLocal.value;
    }).length
  );

  const completedThisWeekByDay = computed(() => {
    const { start, end } = weekBounds.value;
    const completed = taskStore.allTasks.filter((t) => {
      if (t.status !== "completed") return false;
      const ts = t.completedAt ?? t.updatedAt;
      if (!ts) return false;
      const date = toLocalYYYYMMDD(new Date(ts));
      return date >= start && date <= end;
    });
    return weekDays.value.map((date) => ({
      date,
      label: formatDayLabel(date),
      count: completed.filter(
        (t) => toLocalYYYYMMDD(new Date((t.completedAt ?? t.updatedAt)!)) === date
      ).length
    }));
  });

  const togglThisWeekSeconds = computed(() => {
    const { start, end } = weekBounds.value;
    return toggl.timeEntries
      .filter((e) => {
        const date = toLocalYYYYMMDD(new Date(e.start));
        return e.duration >= 0 && date >= start && date <= end;
      })
      .reduce((s, e) => s + e.duration, 0);
  });

  const todayFormatted = computed(() =>
    formatDuration(toggl.todayTotalSeconds)
  );

  const todayBarWidth = computed(() => {
    const seconds = toggl.todayTotalSeconds;
    if (seconds <= 0) return "0%";
    const maxSeconds = REFERENCE_HOURS * 3600;
    const pct = Math.min(100, (seconds / maxSeconds) * 100);
    return `${pct}%`;
  });

  const todayProjectSummary = computed(() => {
    const todayEntries = toggl.timeEntries.filter(
      (e) =>
        toLocalYYYYMMDD(new Date(e.start)) === todayLocal.value &&
        e.duration >= 0
    );
    const groups = groupEntriesByProject(todayEntries);
    return groups.map((g) => ({
      projectName: g.projectName,
      totalSeconds: g.totalSeconds
    }));
  });

  function fetchTogglToday() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    toggl.fetchTimeEntries(toLocalYYYYMMDD(yesterday), toLocalYYYYMMDD(tomorrow));
  }

  onMounted(() => {
    if (github.token) github.fetchAll();
    if (toggl.token) fetchTogglToday();
  });

  return {
    taskStore,
    github,
    toggl,
    showStandupModal,
    inboxTasks,
    assignedPreview,
    reviewRequestedPreview,
    maxGitHubItems: MAX_GITHUB_ITEMS,
    completedTodayCount,
    completedThisWeekByDay,
    weekBounds,
    togglThisWeekSeconds,
    todayFormatted,
    todayBarWidth,
    todayProjectSummary,
    fetchTogglToday,
    formatDuration
  };
}
