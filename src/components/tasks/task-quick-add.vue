<template>
  <form class="quick-add" @submit.prevent="onSubmit">
    <input
      v-model="title"
      type="text"
      class="quick-input"
      placeholder="Type a task and hit Enter"
    />
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import { createEmptyTask } from "@/domain/services/task-service";

const title = ref("");
const taskStore = useTaskStore();

const onSubmit = () => {
  if (!title.value.trim()) return;
  const task = createEmptyTask(title.value.trim());
  taskStore.upsertMany([task]);
  title.value = "";
};
</script>

<style scoped>
.quick-add {
  margin-bottom: 8px;
}

.quick-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
}

.quick-input::placeholder {
  color: #6b7280;
}

.quick-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.9);
}
</style>
