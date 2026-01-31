import { ref, watch } from "vue";
import { useGitHubStore } from "@/stores/githubStore";

export function useGitHubSettings() {
  const github = useGitHubStore();

  const tokenInput = ref(github.token ?? "");
  watch(
    () => github.token,
    (t) => {
      tokenInput.value = t ?? "";
    }
  );

  const reposInput = ref(github.allowedRepos.join("\n"));
  watch(
    () => github.allowedRepos,
    (repos) => {
      reposInput.value = repos.join("\n");
    },
    { deep: true }
  );

  function saveToken() {
    const value = tokenInput.value.trim() || null;
    github.setToken(value);
  }

  function clearToken() {
    tokenInput.value = "";
    github.clearToken();
  }

  function saveRepos() {
    const lines = reposInput.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    github.setAllowedRepos(lines);
  }

  return {
    github,
    tokenInput,
    reposInput,
    saveToken,
    clearToken,
    saveRepos
  };
}
