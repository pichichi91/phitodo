import { defineStore } from "pinia";
import type { Project } from "@/domain/models";

interface ProjectState {
  projects: Record<string, Project>;
}

export const useProjectStore = defineStore("projects", {
  state: (): ProjectState => ({
    projects: {}
  }),
  getters: {
    allProjects(state): Project[] {
      return Object.values(state.projects).filter((p) => !p.deleted);
    }
  },
  actions: {
    upsertMany(projects: Project[]) {
      for (const project of projects) {
        this.projects[project.id] = project;
      }
    },
    deleteProject(id: string) {
      const existing = this.projects[id];
      if (!existing) return;
      this.projects[id] = { ...existing, deleted: true };
    }
  }
});
