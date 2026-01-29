<template>
  <AppModal @close="onClose">
    <template #title>
      {{ isEditing ? "Edit task" : "New task" }}
    </template>
    <form class="form" @submit.prevent="onSubmit">
      <label class="field">
        <span class="label">Title</span>
        <input
          ref="titleEl"
          v-model="title"
          type="text"
          required
          placeholder="What do you want to do?"
        />
      </label>
      <label class="field">
        <span class="label">Project</span>
        <select v-model="selectedProjectId">
          <option value="">Inbox (no project)</option>
          <option
            v-for="project in projects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </label>
      <label class="field">
        <span class="label">Notes</span>
        <textarea
          v-model="notes"
          rows="3"
          placeholder="Optional details"
        />
      </label>
      <div class="actions">
        <button
          v-if="isEditing"
          type="button"
          class="btn ghost danger"
          @click="onDelete"
        >
          Delete
        </button>
        <div class="spacer" />
        <button type="button" class="btn ghost" @click="onClose">Cancel</button>
        <button type="submit" class="btn primary">
          {{ isEditing ? "Save" : "Add task" }}
        </button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppModal from "@/components/common/app-modal.vue";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import { createEmptyTask } from "@/domain/services/task-service";
import { useProjectStore } from "@/stores/projectStore";

const ui = useUIStore();
const taskStore = useTaskStore();
const projectStore = useProjectStore();
const route = useRoute();

const title = ref("");
const notes = ref("");
const titleEl = ref<HTMLInputElement | null>(null);
const selectedProjectId = ref<string>("");

const editingId = computed(() => ui.editingTaskId);
const editingTask = computed(() =>
  editingId.value ? taskStore.allTasks.find((t) => t.id === editingId.value) : undefined
);
const isEditing = computed(() => Boolean(editingId.value && editingTask.value));

const projects = computed(() => projectStore.allProjects);

const reset = () => {
  title.value = "";
  notes.value = "";
  selectedProjectId.value = "";
};

const loadTaskData = () => {
  if (editingTask.value) {
    title.value = editingTask.value.title;
    notes.value = editingTask.value.notes || "";
    selectedProjectId.value = editingTask.value.projectId || "";
  } else {
    reset();
  }
};

const onClose = () => {
  ui.closeTaskModal();
  reset();
};

const onSubmit = () => {
  if (!title.value.trim()) return;
  
  if (isEditing.value && editingTask.value) {
    const updated = {
      ...editingTask.value,
      title: title.value.trim(),
      notes: notes.value.trim() || undefined,
      projectId: selectedProjectId.value || undefined,
      updatedAt: new Date().toISOString()
    };
    taskStore.upsertMany([updated]);
  } else {
    const task = createEmptyTask(title.value.trim());
    task.notes = notes.value.trim() || undefined;
    task.projectId = selectedProjectId.value || undefined;
    taskStore.upsertMany([task]);
  }
  onClose();
};

const onDelete = () => {
  if (!editingId.value) return;
  taskStore.deleteTask(editingId.value);
  onClose();
};

// Watch for changes in editing state to load task data
watch(editingId, () => {
  loadTaskData();
  nextTick(() => {
    titleEl.value?.focus();
  });
});

onMounted(() => {
  nextTick(() => {
    loadTaskData();
    // If opened while viewing a project and not editing, default to that project
    if (!isEditing.value) {
      const routeProjectId = route.params.projectId as string | undefined;
      if (routeProjectId) {
        selectedProjectId.value = routeProjectId;
      }
    }
    titleEl.value?.focus();
  });
});
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

input,
textarea {
  border-radius: 10px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
  padding: 6px 9px;
}

textarea {
  resize: vertical;
}

select {
  border-radius: 10px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
  padding: 6px 9px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.spacer {
  flex: 1;
}

.btn {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn.ghost {
  background: transparent;
  border-color: rgba(55, 65, 81, 0.9);
  color: #e5e7eb;
}

.btn.primary {
  background: linear-gradient(to right, #4f46e5, #38bdf8);
  color: white;
}

.btn.danger {
  border-color: rgba(248, 113, 113, 0.8);
  color: #f87171;
}
</style>
