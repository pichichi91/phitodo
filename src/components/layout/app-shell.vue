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
    <ProjectCreateModal v-if="ui.isProjectModalOpen" />
    <SearchModal />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterView } from "vue-router";
import AppSidebar from "./app-sidebar.vue";
import AppToolbar from "./app-toolbar.vue";
import CustomTitleBar from "./custom-title-bar.vue";
import TaskCreateModal from "@/components/tasks/task-create-modal.vue";
import ProjectCreateModal from "@/components/projects/project-create-modal.vue";
import SearchModal from "@/components/common/search-modal.vue";
import { useUIStore } from "@/stores/uiStore";

const ui = useUIStore();
const isTauri = computed(() => typeof window !== "undefined" && !!(window as any).__TAURI__);
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
  overflow: hidden;
}
</style>
