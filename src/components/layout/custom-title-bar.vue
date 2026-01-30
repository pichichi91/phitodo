<template>
  <header class="titlebar">
    <div class="titlebar-controls">
      <button type="button" class="traffic-light traffic-light-close" title="Close" @click="close" />
      <button type="button" class="traffic-light traffic-light-minimize" title="Minimize" @click="minimize" />
      <button type="button" class="traffic-light traffic-light-maximize" title="Maximize" @click="toggleMaximize" />
    </div>
    <div class="titlebar-drag" data-tauri-drag-region>
      <span class="titlebar-title">phitodo</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const appWindow = ref<{ close: () => Promise<void>; minimize: () => Promise<void>; toggleMaximize: () => Promise<void> } | null>(null);

onMounted(() => {
  if (typeof window !== "undefined" && (window as any).__TAURI__) {
    const { getCurrentWindow } = (window as any).__TAURI__.window;
    appWindow.value = getCurrentWindow();
  }
});

async function close() {
  await appWindow.value?.close();
}

async function minimize() {
  await appWindow.value?.minimize();
}

async function toggleMaximize() {
  await appWindow.value?.toggleMaximize();
}
</script>

<style scoped>
.titlebar {
  display: flex;
  align-items: center;
  height: 38px;
  flex-shrink: 0;
  background: transparent;
  -webkit-app-region: no-drag;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
}

.titlebar-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  padding-right: 8px;
  flex-shrink: 0;
}

.traffic-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.15s ease, filter 0.15s ease;
}

.traffic-light:hover {
  transform: scale(1.15);
  filter: brightness(1.15);
}

.traffic-light:active {
  transform: scale(1.05);
  filter: brightness(0.9);
}

.traffic-light-close {
  background: #ff5f57;
}

.traffic-light-close:hover {
  background: #ff7f78;
}

.traffic-light-minimize {
  background: #febc2e;
}

.traffic-light-minimize:hover {
  background: #fecf5a;
}

.traffic-light-maximize {
  background: #28c840;
}

.traffic-light-maximize:hover {
  background: #5dd36a;
}

.titlebar-drag {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.titlebar-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  font-weight: 600;
  color: rgba(229, 231, 235, 0.95);
  pointer-events: none;
  user-select: none;
}
</style>
