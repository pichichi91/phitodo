<template>
  <div class="search-modal" v-if="isOpen" @click.self="close">
    <div class="search-content">
      <header class="search-header">
        <div class="search-input-wrapper">
          <input
            ref="searchInput"
            v-model="localQuery"
            type="text"
            class="search-input"
            placeholder="Search tasks, projects, tags..."
            @keydown.escape="close"
          />
        </div>
        <button class="close-button" type="button" @click="close">✕</button>
      </header>

      <div class="search-results">
        <div v-if="!hasResults" class="empty-state">
          <p>No results found for "{{ localQuery }}"</p>
        </div>

        <div v-else class="results-container">
          <section v-if="matchedTasks.length > 0" class="result-section">
            <h2 class="section-title">Tasks</h2>
            <ul class="result-list">
              <li
                v-for="task in matchedTasks"
                :key="task.id"
                class="result-item task-item"
                @click="navigateToTask(task)"
              >
                <div class="item-content">
                  <div class="item-title">{{ task.title }}</div>
                  <div v-if="task.notes" class="item-subtitle">{{ task.notes }}</div>
                  <div class="item-meta">
                    <span v-if="task.projectId" class="meta-badge">Project</span>
                    <span v-if="task.dueDate" class="meta-badge">Due {{ task.dueDate }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <section v-if="matchedProjects.length > 0" class="result-section">
            <h2 class="section-title">Projects</h2>
            <ul class="result-list">
              <li
                v-for="project in matchedProjects"
                :key="project.id"
                class="result-item project-item"
                @click="navigateToProject(project)"
              >
                <div class="item-content">
                  <div class="item-title">{{ project.name }}</div>
                  <div v-if="project.description" class="item-subtitle">{{ project.description }}</div>
                </div>
              </li>
            </ul>
          </section>

          <section v-if="matchedTags.length > 0" class="result-section">
            <h2 class="section-title">Tags</h2>
            <ul class="result-list">
              <li
                v-for="tag in matchedTags"
                :key="tag.id"
                class="result-item tag-item"
                @click="navigateToTag(tag)"
              >
                <div class="item-content">
                  <div class="item-title">{{ tag.name }}</div>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";
import { useTagStore } from "@/stores/tagStore";
import { useUIStore } from "@/stores/uiStore";
import type { Task, Project, Tag } from "@/domain/models";

const router = useRouter();
const taskStore = useTaskStore();
const projectStore = useProjectStore();
const tagStore = useTagStore();
const ui = useUIStore();

const searchInput = ref<HTMLInputElement | null>(null);
const localQuery = computed({
  get: () => ui.searchQuery,
  set: (value: string) => ui.setSearchQuery(value)
});

const isOpen = computed(() => {
  const query = localQuery.value.trim();
  return query.length > 0;
});

const queryLower = computed(() => localQuery.value.trim().toLowerCase());

const matchedTasks = computed(() => {
  if (!queryLower.value) return [];
  return taskStore.allTasks.filter((task) => {
    const title = task.title.toLowerCase();
    const notes = task.notes?.toLowerCase() ?? "";
    return title.includes(queryLower.value) || notes.includes(queryLower.value);
  });
});

const matchedProjects = computed(() => {
  if (!queryLower.value) return [];
  return projectStore.allProjects.filter((project) => {
    const name = project.name.toLowerCase();
    const description = project.description?.toLowerCase() ?? "";
    return name.includes(queryLower.value) || description.includes(queryLower.value);
  });
});

const matchedTags = computed(() => {
  if (!queryLower.value) return [];
  return tagStore.allTags.filter((tag) => {
    return tag.name.toLowerCase().includes(queryLower.value);
  });
});

const hasResults = computed(() => {
  return matchedTasks.value.length > 0 || matchedProjects.value.length > 0 || matchedTags.value.length > 0;
});

const close = () => {
  ui.setSearchQuery("");
};

const navigateToTask = (task: Task) => {
  if (task.projectId) {
    router.push(`/projects/${task.projectId}`);
  } else {
    router.push("/inbox");
  }
  close();
};

const navigateToProject = (project: Project) => {
  router.push(`/projects/${project.id}`);
  close();
};

const navigateToTag = (tag: Tag) => {
  router.push(`/tags/${tag.id}`);
  close();
};

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});
</script>

<style scoped>
.search-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.search-content {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  max-width: 800px;
  width: 100%;
  margin: 10vh auto 0;
  padding: 20px;
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 1));
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.search-header {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input-wrapper {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 16px;
  line-height: 1.5;
  outline: none;
  height: 48px;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: rgba(59, 130, 246, 0.9);
}

.search-input::placeholder {
  color: #6b7280;
}

.close-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.15s ease;
  flex-shrink: 0;
  box-sizing: border-box;
}

.close-button:hover {
  background: rgba(148, 163, 184, 0.18);
  color: #e5e7eb;
}

.search-results {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-size: 14px;
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7280;
  margin: 0;
  padding: 0 4px;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(55, 65, 81, 0.5);
  background: rgba(15, 23, 42, 0.6);
  cursor: pointer;
  transition: all 0.15s ease;
}

.result-item:hover {
  background: rgba(31, 41, 55, 0.9);
  border-color: rgba(148, 163, 184, 0.4);
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #e5e7eb;
}

.item-subtitle {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.meta-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(55, 65, 81, 0.6);
  color: #9ca3af;
}
</style>
