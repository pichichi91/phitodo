<template>
  <div class="app-shell">
    <CustomTitleBar v-if="isTauri" class="custom-titlebar" />
    <div class="app-body">
      <AppSidebar class="sidebar" />
      <div class="main">
        <AppToolbar class="toolbar" />
        <div class="content">
          <RouterView />
        </div>
      </div>
    </div>
    <TaskCreateModal v-if="ui.isTaskModalOpen" />
    <TaskDetailPanel v-if="ui.viewingTaskId" />
    <ProjectCreateModal v-if="ui.isProjectModalOpen" />
    <SearchModal />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { RouterView } from "vue-router";
import AppSidebar from "./app-sidebar.vue";
import AppToolbar from "./app-toolbar.vue";
import CustomTitleBar from "./custom-title-bar.vue";
import TaskCreateModal from "@/components/tasks/task-create-modal.vue";
import TaskDetailPanel from "@/components/tasks/task-detail-panel.vue";
import ProjectCreateModal from "@/components/projects/project-create-modal.vue";
import SearchModal from "@/components/common/search-modal.vue";
import { useUIStore } from "@/stores/uiStore";

const router = useRouter();
const ui = useUIStore();
const isTauri = computed(
  () => typeof window !== "undefined" && !!(window as Window & { __TAURI__?: unknown }).__TAURI__
);

const NAV_ROUTES: Record<string, string> = {
  "1": "/inbox",
  "2": "/today",
  "3": "/upcoming",
  "4": "/anytime",
  "5": "/completed",
  "6": "/review",
  "7": "/github",
  "8": "/toggl",
  "9": "/settings"
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = (target as HTMLElement).tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return (target as HTMLElement).contentEditable === "true";
}

function isSearchShortcutKey(key: string): boolean {
  const k = key.toLowerCase();
  return k === "k" || k === "/";
}

function isModifierActive(modifier: string, event: KeyboardEvent): boolean {
  const tauri = typeof window !== "undefined" && !!(window as Window & { __TAURI__?: unknown }).__TAURI__;
  switch (modifier) {
    case "alt":
      return event.altKey;
    case "ctrl":
      return event.ctrlKey;
    case "ctrlAlt":
      return event.ctrlKey && event.altKey;
    case "meta":
      return tauri && event.metaKey;
    default:
      return false;
  }
}

function handleShortcuts(event: KeyboardEvent): void {
  const target = event.target;
  const key = event.key.toLowerCase();

  if (isEditableTarget(target) && !isSearchShortcutKey(key)) {
    return;
  }

  if (!isModifierActive(ui.shortcutModifier, event)) {
    return;
  }

  if (isSearchShortcutKey(key)) {
    event.preventDefault();
    ui.focusSearch();
    return;
  }

  if (key === "n") {
    event.preventDefault();
    if (event.shiftKey) {
      ui.openProjectModal();
    } else {
      ui.openTaskModal();
    }
    return;
  }

  const route = NAV_ROUTES[key];
  if (route) {
    event.preventDefault();
    event.stopPropagation();
    router.push(route);
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleShortcuts, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleShortcuts, true);
});
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  color: #e5e7eb;
  background: radial-gradient(circle at top left, #1d283a, #020617);
  border-radius: 12px;
  overflow: hidden;
}

.custom-titlebar {
  flex-shrink: 0;
}

.app-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid rgba(148, 163, 184, 0.3);
  backdrop-filter: blur(24px);
}

.main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.toolbar {
  flex-shrink: 0;
}

.content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
