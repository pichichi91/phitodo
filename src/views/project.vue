<template>
  <div class="view-root">
    <header class="view-header">
      <div class="header-content">
        <div>
          <h1>{{ projectName }}</h1>
          <p v-if="project">Project overview</p>
          <p v-else>This project does not exist yet.</p>
        </div>
        <div v-if="project" class="header-actions">
          <div class="menu-container" v-click-outside="closeMenu">
            <button
              type="button"
              class="menu-button"
              @click="toggleMenu"
              aria-label="Project options"
            >
              <span class="menu-icon">⋯</span>
            </button>
            <div v-if="isMenuOpen" class="menu-dropdown">
              <button type="button" class="menu-item" @click="handleEdit">
                Edit
              </button>
              <button type="button" class="menu-item menu-item-danger" @click="handleDelete">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    <main class="view-main">
      <TaskList
        :items="projectTasks"
        :empty-message="'No tasks in this project yet.'"
        :hide-completed="true"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTaskStore } from "@/stores/taskStore";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import TaskList from "@/components/tasks/task-list.vue";

const route = useRoute();
const router = useRouter();
const taskStore = useTaskStore();
const projectStore = useProjectStore();
const ui = useUIStore();

const isMenuOpen = ref(false);

const projectId = computed(() => String(route.params.projectId));

const project = computed(() =>
  projectStore.allProjects.find((p) => p.id === projectId.value)
);

const projectName = computed(() => project.value?.name ?? "Project");

const projectTasks = computed(() =>
  taskStore.allTasks.filter((t) => t.projectId === projectId.value)
);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleEdit = () => {
  if (projectId.value) {
    ui.startProjectEdit(projectId.value);
  }
  closeMenu();
};

const handleDelete = () => {
  if (projectId.value && project.value) {
    projectStore.deleteProject(projectId.value);
    router.push("/inbox");
  }
  closeMenu();
};

// Click outside directive
const vClickOutside = {
  mounted(el: HTMLElement & { clickOutsideEvent?: (event: MouseEvent) => void }, binding: { value: () => void }) {
    el.clickOutsideEvent = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el: HTMLElement & { clickOutsideEvent?: (event: MouseEvent) => void }) {
    if (el.clickOutsideEvent) {
      document.removeEventListener("click", el.clickOutsideEvent);
    }
  }
};

// Close menu on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEscape);
});
</script>

<style scoped>
.view-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 16px 0;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.view-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.view-header p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.header-actions {
  display: flex;
  align-items: center;
  position: relative;
}

.menu-container {
  position: relative;
}

.menu-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: transparent;
  color: #e5e7eb;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.menu-button:hover {
  background: rgba(148, 163, 184, 0.18);
  border-color: rgba(148, 163, 184, 0.4);
}

.menu-icon {
  font-size: 18px;
  line-height: 1;
  letter-spacing: -2px;
  display: inline-block;
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 140px;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(55, 65, 81, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 4px;
  z-index: 1000;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  border: none;
  background: transparent;
  color: #e5e7eb;
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.menu-item:hover {
  background: rgba(148, 163, 184, 0.18);
}

.menu-item-danger {
  color: #f87171;
}

.menu-item-danger:hover {
  background: rgba(248, 113, 113, 0.15);
}

.view-main {
  margin-top: 12px;
}
</style>
