<template>
  <aside class="sidebar-root">
    <div class="sidebar-header">
      <div class="app-mark">φ</div>
      <div class="app-meta">
        <div class="app-name">phitodo</div>
        <div class="app-subtitle">Personal tasks</div>
      </div>
    </div>

    <nav class="sidebar-section">
      <div class="section-title">Today</div>
      <RouterLink to="/inbox" class="nav-item" active-class="nav-item-active">
        <span>Inbox</span>
        <span class="nav-kbd">{{ shortcutHint(1) }}</span>
      </RouterLink>
      <RouterLink to="/today" class="nav-item" active-class="nav-item-active">
        <span>Today</span>
        <span class="nav-kbd">{{ shortcutHint(2) }}</span>
      </RouterLink>
      <RouterLink to="/upcoming" class="nav-item" active-class="nav-item-active">
        <span>Upcoming</span>
        <span class="nav-kbd">{{ shortcutHint(3) }}</span>
      </RouterLink>
      <RouterLink to="/anytime" class="nav-item" active-class="nav-item-active">
        <span>Anytime</span>
        <span class="nav-kbd">{{ shortcutHint(4) }}</span>
      </RouterLink>
      <RouterLink to="/someday" class="nav-item" active-class="nav-item-active">
        <span>Someday</span>
        <span class="nav-kbd">{{ shortcutHint(5) }}</span>
      </RouterLink>
      <RouterLink to="/completed" class="nav-item" active-class="nav-item-active">
        <span>Completed</span>
        <span class="nav-kbd">{{ shortcutHint(6) }}</span>
      </RouterLink>
    </nav>

    <nav class="sidebar-section">
      <div class="section-title projects-header">
        <span>Projects</span>
        <button class="add-project" type="button" @click="openProjectModal">＋</button>
      </div>
      <div v-if="projects.length === 0" class="nav-placeholder">
        Your projects will appear here.
      </div>
      <div v-else class="projects-list">
        <RouterLink
          v-for="project in projects"
          :key="project.id"
          :to="`/projects/${project.id}`"
          class="nav-item project-link"
          active-class="nav-item-active"
        >
          <span>{{ project.name }}</span>
        </RouterLink>
      </div>
    </nav>

    <nav class="sidebar-section sidebar-footer">
      <RouterLink to="/review" class="nav-item" active-class="nav-item-active">
        <span>Review</span>
        <span class="nav-kbd">{{ shortcutHint(7) }}</span>
      </RouterLink>
      <RouterLink to="/github" class="nav-item" active-class="nav-item-active">
        <span>GitHub</span>
        <span class="nav-kbd">{{ shortcutHint(8) }}</span>
      </RouterLink>
      <RouterLink to="/settings" class="nav-item" active-class="nav-item-active">
        <span>Settings</span>
        <span class="nav-kbd">{{ shortcutHint(9) }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";

const projectStore = useProjectStore();
const ui = useUIStore();

const modifierLabel = computed(() => {
  switch (ui.shortcutModifier) {
    case "alt":
      return "Alt";
    case "ctrl":
      return "Ctrl";
    case "ctrlAlt":
      return "Ctrl+Alt";
    case "meta":
      return "⌘";
    default:
      return "Alt";
  }
});

function shortcutHint(num: number): string {
  return `${modifierLabel.value}+${num}`;
}

const projects = computed(() =>
  [...projectStore.allProjects].sort((a, b) => a.orderIndex - b.orderIndex)
);

const openProjectModal = () => {
  ui.openProjectModal();
};
</script>

<style scoped>
.sidebar-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  padding: 14px 12px;
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.98));
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 6px 6px 12px;
}

.app-mark {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 0%, #38bdf8, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: white;
}

.app-meta {
  margin-left: 10px;
}

.app-name {
  font-size: 14px;
  font-weight: 600;
}

.app-subtitle {
  font-size: 11px;
  color: #9ca3af;
}

.sidebar-section {
  margin-top: 8px;
}

.sidebar-footer {
  margin-top: auto;
}

.section-title {
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
  padding: 6px 8px;
}

.projects-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  margin: 1px 0;
  border-radius: 8px;
  color: #e5e7eb;
  text-decoration: none;
  font-size: 13px;
  transition: background-color 0.15s ease;
}

.nav-item:hover {
  background: rgba(148, 163, 184, 0.18);
}

.nav-item span:first-child {
  display: block;
}

.nav-kbd {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  font-size: 10px;
  color: #9ca3af;
}

.project-link {
  display: block;
}

.nav-item-active {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.24), rgba(56, 189, 248, 0.2));
  color: #e5e7eb;
}

.nav-placeholder {
  font-size: 11px;
  color: #6b7280;
  padding: 4px 8px 0;
}
.projects-list {
  margin-top: 2px;
}

.add-project {
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  font-size: 13px;
}
</style>
