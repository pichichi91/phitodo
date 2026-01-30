<template>
  <header class="toolbar-root">
    <div class="left">
      <button class="pill" type="button" @click="openTaskModal">
        <span class="dot" />
        <span class="pill-label">Add task</span>
        <span class="pill-kbd">{{ addTaskShortcutHint }}</span>
      </button>
    </div>
    <div class="center">
      <div class="search-wrapper">
        <input
          ref="searchInputRef"
          v-model="query"
          type="search"
          class="search"
          placeholder="Search tasks, projects, tags"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useUIStore } from "@/stores/uiStore";

const searchInputRef = ref<HTMLInputElement | null>(null);
const ui = useUIStore();

const query = computed({
  get: () => ui.searchQuery,
  set: (value: string) => ui.setSearchQuery(value)
});

const addTaskShortcutHint = computed(() => {
  const mod =
    ui.shortcutModifier === "alt"
      ? "Alt"
      : ui.shortcutModifier === "ctrl"
        ? "Ctrl"
        : ui.shortcutModifier === "ctrlAlt"
          ? "Ctrl+Alt"
          : "⌘";
  return `${mod}+N`;
});

const openTaskModal = () => {
  ui.openTaskModal();
};

watch(
  () => ui.requestSearchFocus,
  (value) => {
    if (value === 0) return;
    nextTick(() => {
      searchInputRef.value?.focus();
      ui.clearSearchFocusRequest();
    });
  }
);
</script>

<style scoped>
.toolbar-root {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  gap: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  background: transparent;
  backdrop-filter: blur(12px);
}

.left,
.center {
  display: flex;
  align-items: center;
}

.left {
  flex: 0 0 auto;
}

.center {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: flex-start;
}

.search-wrapper {
  width: 100%;
  max-width: 800px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.6);
  background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), rgba(37, 99, 235, 0.12));
  color: #e5e7eb;
  font-size: 12px;
  cursor: pointer;
}

.pill:hover {
  border-color: rgba(59, 130, 246, 0.9);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #4ade80;
}

.pill-label {
  font-weight: 500;
}

.pill-kbd {
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  font-size: 10px;
  color: #9ca3af;
}

.search {
  width: 100%;
  box-sizing: border-box;
  border-radius: 999px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  padding: 6px 11px;
  font-size: 13px;
  background: radial-gradient(circle at top, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.98));
  color: #e5e7eb;
}

.search::placeholder {
  color: #6b7280;
}

.search:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.9);
}
</style>
