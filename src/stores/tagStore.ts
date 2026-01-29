import { defineStore } from "pinia";
import type { Tag } from "@/domain/models";

interface TagState {
  tags: Record<string, Tag>;
}

export const useTagStore = defineStore("tags", {
  state: (): TagState => ({
    tags: {}
  }),
  getters: {
    allTags(state): Tag[] {
      return Object.values(state.tags).filter((t) => !t.deleted);
    }
  },
  actions: {
    upsertMany(tags: Tag[]) {
      for (const tag of tags) {
        this.tags[tag.id] = tag;
      }
    }
  }
});
