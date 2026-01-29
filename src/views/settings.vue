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
          <label>
            Theme
            <select v-model="theme">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
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
import { useUIStore } from "@/stores/uiStore";

const ui = useUIStore();

const theme = computed({
  get: () => ui.theme,
  set: (value) => ui.setTheme(value)
});
</script>

<style scoped>
.view-root {
  display: flex;
  flex-direction: column;
  height: 100%;
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

select {
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
}
</style>
