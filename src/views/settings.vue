<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Settings</h1>
      <p>Personalize how phitodo behaves.</p>
    </header>
    <main class="view-main">
      <section class="group">
        <h2>Appearance</h2>
        <div class="row">
          <label class="settings-label">
            <span class="settings-label-text">Theme</span>
            <CustomSelect
              v-model="theme"
              :options="themeOptions"
              aria-label="Choose theme"
            />
          </label>
        </div>
      </section>
      <section class="group">
        <h2>Data</h2>
        <p class="hint">
          In the browser, your data is stored in this browser only.
          In the macOS app, your data will be stored in a local SQLite database and synced via iCloud later.
        </p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CustomSelect from "@/components/common/custom-select.vue";
import { useUIStore } from "@/stores/uiStore";

const ui = useUIStore();

const theme = computed({
  get: () => ui.theme,
  set: (value) => ui.setTheme(value)
});

const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" }
];
</script>

<style scoped>
.view-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 50%;
  padding: 12px 16px 16px;
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

.view-main {
  margin-top: 12px;
}

.group {
  margin-bottom: 16px;
}

.group h2 {
  font-size: 14px;
  margin: 0 0 6px;
}

.row {
  margin-bottom: 8px;
}

.settings-label {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.settings-label-text {
  min-width: 60px;
  font-size: 13px;
  color: #e5e7eb;
}

.settings-label .custom-select {
  min-width: 140px;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
}
</style>
