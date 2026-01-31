import { ref, watch } from "vue";
import { useTogglStore } from "@/stores/togglStore";

export function useTogglSettings() {
  const toggl = useTogglStore();

  const tokenInput = ref(toggl.token ?? "");
  watch(
    () => toggl.token,
    (t) => {
      tokenInput.value = t ?? "";
    }
  );

  const hiddenProjectsInput = ref(toggl.inboxHiddenProjectNames.join("\n"));
  watch(
    () => toggl.inboxHiddenProjectNames,
    (names) => {
      hiddenProjectsInput.value = names.join("\n");
    },
    { deep: true }
  );

  function saveToken() {
    const value = tokenInput.value.trim() || null;
    toggl.setToken(value);
  }

  function clearToken() {
    tokenInput.value = "";
    toggl.clearToken();
  }

  function saveHiddenProjects() {
    const lines = hiddenProjectsInput.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    toggl.setInboxHiddenProjectNames(lines);
  }

  return {
    toggl,
    tokenInput,
    hiddenProjectsInput,
    saveToken,
    clearToken,
    saveHiddenProjects
  };
}
