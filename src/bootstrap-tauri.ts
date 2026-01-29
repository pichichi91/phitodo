import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";
import { useTagStore } from "@/stores/tagStore";
import { useUIStore } from "@/stores/uiStore";
import { TauriRepository } from "@/repositories/tauri-repository";
import type { ChangeSet } from "@/repositories/local-repository";

let currentVersion = 0;
let wired = false;

export async function bootstrapTauriPersistence() {
  if (typeof window === "undefined") return;
  if (!(window as any).__TAURI__) return;
  if (wired) return;

  const repo = new TauriRepository();
  const taskStore = useTaskStore();
  const projectStore = useProjectStore();
  const tagStore = useTagStore();
  const uiStore = useUIStore();

  try {
    const snapshot = await repo.getStateSnapshot();
    currentVersion = snapshot.version ?? 0;
    if (snapshot.tasks) taskStore.upsertMany(snapshot.tasks);
    if (snapshot.projects) projectStore.upsertMany(snapshot.projects);
    if (snapshot.tags) tagStore.upsertMany(snapshot.tags);
    // sections/reminders can be wired later when you add their stores
  } catch (e) {
    console.warn("Failed to load Tauri snapshot", e);
  }

  const save = async () => {
    currentVersion += 1;
    const changeSet: ChangeSet = {
      tasks: taskStore.allTasks,
      projects: projectStore.allProjects,
      tags: tagStore.allTags,
      sections: [],
      reminders: [],
      newVersion: currentVersion
    };
    try {
      await repo.applyChanges(changeSet);
    } catch (e) {
      console.warn("Failed to apply Tauri change set", e);
    }
  };

  taskStore.$subscribe(save);
  projectStore.$subscribe(save);
  tagStore.$subscribe(save);
  uiStore.$subscribe(save);

  wired = true;
}
