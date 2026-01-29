import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";
import { useTagStore } from "@/stores/tagStore";
import { useUIStore } from "@/stores/uiStore";
import type { Task, Project, Tag } from "@/domain/models";

const STORAGE_KEY = "phitodo_state_v1";

interface LocalSnapshot {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  ui: {
    theme: "system" | "light" | "dark";
    lastViewRoute: string;
  };
}

export async function bootstrapPhase1Persistence() {
  if (typeof window === "undefined") return;

  const taskStore = useTaskStore();
  const projectStore = useProjectStore();
  const tagStore = useTagStore();
  const uiStore = useUIStore();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const snapshot = JSON.parse(raw) as LocalSnapshot;
      if (snapshot.tasks) taskStore.upsertMany(snapshot.tasks);
      if (snapshot.projects) projectStore.upsertMany(snapshot.projects);
      if (snapshot.tags) tagStore.upsertMany(snapshot.tags);
      if (snapshot.ui) {
        uiStore.setTheme(snapshot.ui.theme);
        uiStore.setLastViewRoute(snapshot.ui.lastViewRoute);
      }
    } catch (e) {
      // If parsing fails, ignore and start fresh.
      console.warn("Failed to parse local snapshot", e);
    }
  }

  const save = () => {
    const snapshot: LocalSnapshot = {
      tasks: taskStore.allTasks,
      projects: projectStore.allProjects,
      tags: tagStore.allTags,
      ui: {
        theme: uiStore.theme,
        lastViewRoute: uiStore.lastViewRoute
      }
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  };

  taskStore.$subscribe(save);
  projectStore.$subscribe(save);
  tagStore.$subscribe(save);
  uiStore.$subscribe(save);
}
