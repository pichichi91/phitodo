import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import type { Project } from "@/domain/models";

export function useProjectView() {
  const route = useRoute();
  const router = useRouter();
  const taskStore = useTaskStore();
  const projectStore = useProjectStore();
  const ui = useUIStore();

  const projectId = computed(() => String(route.params.projectId ?? ""));

  const project = computed<Project | undefined>(() =>
    projectStore.allProjects.find((p) => p.id === projectId.value)
  );

  const projectName = computed(() => project.value?.name ?? "Project");

  const projectTasks = computed(() =>
    taskStore.allTasks.filter((t) => t.projectId === projectId.value)
  );

  function handleEdit() {
    if (projectId.value) {
      ui.startProjectEdit(projectId.value);
    }
  }

  function handleDelete() {
    if (projectId.value && project.value) {
      projectStore.deleteProject(projectId.value);
      router.push("/inbox");
    }
  }

  return {
    projectId,
    project,
    projectName,
    projectTasks,
    handleEdit,
    handleDelete
  };
}
