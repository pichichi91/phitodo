<template>
  <div class="view-root">
    <header class="view-header">
      <h1>{{ tagName }}</h1>
      <p v-if="tag">Tasks with this tag.</p>
      <p v-else>This tag does not exist yet.</p>
    </header>
    <main class="view-main">
      <TaskList
        :items="tagTasks"
        :empty-message="'No tasks with this tag yet.'"
        :hide-completed="true"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useTaskStore } from "@/stores/taskStore";
import { useTagStore } from "@/stores/tagStore";
import TaskList from "@/components/tasks/task-list.vue";

const route = useRoute();
const taskStore = useTaskStore();
const tagStore = useTagStore();

const tagId = computed(() => String(route.params.tagId));

const tag = computed(() =>
  tagStore.allTags.find((t) => t.id === tagId.value)
);

const tagName = computed(() => tag.value?.name ?? "Tag");

const tagTasks = computed(() =>
  taskStore.allTasks.filter((t) => t.tags.includes(tagId.value))
);
</script>

<style scoped>
.view-root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 12px 16px 0;
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
  padding-bottom: 24px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
