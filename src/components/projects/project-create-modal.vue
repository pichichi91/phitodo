<template>
  <AppModal @close="onClose">
    <template #title>
      {{ isEditing ? "Edit project" : "New project" }}
    </template>
    <form class="form" @submit.prevent="onSubmit">
      <label class="field">
        <span class="label">Name</span>
        <input
          ref="nameEl"
          v-model="name"
          type="text"
          required
          placeholder="Project name"
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
          {{ isEditing ? "Save" : "Add project" }}
        </button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import AppModal from "@/components/common/app-modal.vue";
import { useProjectStore } from "@/stores/projectStore";
import { useUIStore } from "@/stores/uiStore";
import { createProject } from "@/domain/services/project-service";

const ui = useUIStore();
const projectStore = useProjectStore();

const name = ref("");
const nameEl = ref<HTMLInputElement | null>(null);

const editingId = computed(() => ui.editingProjectId);
const editingProject = computed(() =>
  editingId.value ? projectStore.allProjects.find((p) => p.id === editingId.value) : undefined
);
const isEditing = computed(() => Boolean(editingId.value && editingProject.value));

const reset = () => {
  name.value = "";
};

const onClose = () => {
  ui.closeProjectModal();
  reset();
};

const onSubmit = () => {
  if (!name.value.trim()) return;
  if (isEditing.value && editingProject.value) {
    const updated = {
      ...editingProject.value,
      name: name.value.trim(),
      updatedAt: new Date().toISOString()
    };
    projectStore.upsertMany([updated]);
  } else {
    const project = createProject(name.value.trim());
    projectStore.upsertMany([project]);
  }
  onClose();
};

const onDelete = () => {
  if (!editingId.value) return;
  projectStore.deleteProject(editingId.value);
  onClose();
};

onMounted(() => {
  nextTick(() => {
    if (editingProject.value) {
      name.value = editingProject.value.name;
    }
    nameEl.value?.focus();
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

input {
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
