import { defineStore } from "pinia";

interface UIState {
  theme: "system" | "light" | "dark";
  lastViewRoute: string;
  isTaskModalOpen: boolean;
  isProjectModalOpen: boolean;
  editingTaskId: string | null;
  editingProjectId: string | null;
  searchQuery: string;
}

export const useUIStore = defineStore("ui", {
  state: (): UIState => ({
    theme: "system",
    lastViewRoute: "/inbox",
    isTaskModalOpen: false,
    isProjectModalOpen: false,
    editingTaskId: null,
    editingProjectId: null,
    searchQuery: ""
  }),
  actions: {
    setTheme(theme: UIState["theme"]) {
      this.theme = theme;
    },
    setLastViewRoute(route: string) {
      this.lastViewRoute = route;
    },
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },
    openTaskModal() {
      this.editingTaskId = null;
      this.isTaskModalOpen = true;
    },
    closeTaskModal() {
      this.isTaskModalOpen = false;
    },
    openProjectModal() {
      this.editingProjectId = null;
      this.isProjectModalOpen = true;
    },
    closeProjectModal() {
      this.isProjectModalOpen = false;
    },
    startTaskEdit(id: string) {
      this.editingTaskId = id;
      this.isTaskModalOpen = true;
    },
    stopTaskEdit() {
      this.editingTaskId = null;
      this.isTaskModalOpen = false;
    },
    startProjectEdit(id: string) {
      this.editingProjectId = id;
      this.isProjectModalOpen = true;
    },
    stopProjectEdit() {
      this.editingProjectId = null;
      this.isProjectModalOpen = false;
    }
  }
});
