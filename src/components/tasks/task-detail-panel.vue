<template>
  <div v-if="ui.viewingTaskId" class="panel-overlay" @click.self="onClose">
    <Transition name="panel">
      <aside v-if="task" class="panel" role="dialog" aria-label="Task details">
        <header class="panel-header">
          <h2 class="panel-title">{{ task.title }}</h2>
          <div class="panel-actions">
            <button type="button" class="btn btn-edit" @click="onEdit">Edit</button>
            <button type="button" class="btn btn-close" aria-label="Close" @click="onClose">×</button>
          </div>
        </header>
        <div class="panel-body">
          <dl class="detail-list">
            <template v-if="task.kind && task.kind !== 'task'">
              <dt>Kind</dt>
              <dd>{{ task.kind }}</dd>
            </template>
            <template v-if="task.size">
              <dt>Size</dt>
              <dd>{{ task.size }}</dd>
            </template>
            <template v-if="task.priority !== 'none'">
              <dt>Priority</dt>
              <dd>{{ task.priority }}</dd>
            </template>
            <template v-if="task.assignee">
              <dt>Assignee</dt>
              <dd>{{ task.assignee }}</dd>
            </template>
            <template v-if="task.dueDate">
              <dt>Due date</dt>
              <dd>{{ dueDateLabel }}</dd>
            </template>
            <template v-if="taskTags.length">
              <dt>Tags</dt>
              <dd>
                <span v-for="tag in taskTags" :key="tag.id" class="tag-pill">{{ tag.name }}</span>
              </dd>
            </template>
            <template v-if="task.contextUrl">
              <dt>Context</dt>
              <dd>
                <a :href="task.contextUrl" target="_blank" rel="noopener noreferrer" class="context-link">
                  {{ task.contextUrl }}
                </a>
              </dd>
            </template>
          </dl>
          <section v-if="task.notes" class="description-section">
            <h3 class="description-heading">Description</h3>
            <div class="description-body" v-html="sanitizedNotes" />
          </section>
          <section v-if="metadataEntries.length" class="metadata-section">
            <h3 class="metadata-heading">Metadata</h3>
            <dl class="metadata-list">
              <template v-for="[key, value] in metadataEntries" :key="key">
                <dt>{{ key }}</dt>
                <dd>{{ value }}</dd>
              </template>
            </dl>
          </section>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "@/domain/models";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import { useTagStore } from "@/stores/tagStore";
import { formatDueDateLabel } from "@/utils/date-format";
import { sanitizeHtml } from "@/utils/sanitize-html";

const taskStore = useTaskStore();
const ui = useUIStore();
const tagStore = useTagStore();

const task = computed((): Task | undefined => {
  const id = ui.viewingTaskId;
  if (!id) return undefined;
  return taskStore.allTasks.find((t) => t.id === id);
});

const dueDateLabel = computed(() =>
  task.value?.dueDate ? formatDueDateLabel(task.value.dueDate) : ""
);

const taskTags = computed(() => {
  if (!task.value?.tags?.length) return [];
  return task.value.tags
    .map((id) => tagStore.allTags.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => t != null);
});

const sanitizedNotes = computed(() =>
  task.value?.notes ? sanitizeHtml(task.value.notes) : ""
);

const metadataEntries = computed(() => {
  const meta = task.value?.metadata;
  if (!meta || typeof meta !== "object") return [];
  return Object.entries(meta);
});

function onClose() {
  ui.closeTaskDetail();
}

function onEdit() {
  const taskId = task.value?.id;
  if (!taskId) return;
  ui.closeTaskDetail();
  ui.startTaskEdit(taskId);
}
</script>

<style scoped>
.panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;
}

.panel {
  width: 100%;
  max-width: 420px;
  height: 100%;
  background: rgba(15, 23, 42, 0.98);
  border-left: 1px solid rgba(55, 65, 81, 0.9);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
}

.panel-header {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(55, 65, 81, 0.5);
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #e5e7eb;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  background: transparent;
  color: #e5e7eb;
}

.btn-edit {
  border-color: rgba(99, 102, 241, 0.6);
  color: #a5b4fc;
}

.btn-edit:hover {
  background: rgba(79, 70, 229, 0.2);
}

.btn-close {
  font-size: 20px;
  line-height: 1;
  padding: 2px 8px;
  color: #9ca3af;
}

.btn-close:hover {
  color: #e5e7eb;
  background: rgba(55, 65, 81, 0.5);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.detail-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 16px;
  font-size: 13px;
  margin: 0 0 20px;
}

.detail-list dt {
  color: #9ca3af;
  font-weight: 500;
}

.detail-list dd {
  margin: 0;
  color: #e5e7eb;
}

.tag-pill {
  display: inline-block;
  margin-right: 6px;
  margin-bottom: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  font-size: 11px;
  color: #94a3b8;
}

.context-link {
  color: #93c5fd;
  text-decoration: underline;
  word-break: break-all;
}

.context-link:hover {
  color: #bfdbfe;
}

.description-section,
.metadata-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(55, 65, 81, 0.5);
}

.description-heading,
.metadata-heading {
  margin: 0 0 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
}

.description-body {
  font-size: 13px;
  line-height: 1.6;
  color: #e5e7eb;
}

.description-body :deep(p) {
  margin: 0 0 8px;
}

.description-body :deep(p:last-child) {
  margin-bottom: 0;
}

.description-body :deep(ul),
.description-body :deep(ol) {
  margin: 0 0 8px;
  padding-left: 1.5em;
}

.description-body :deep(a) {
  color: #93c5fd;
  text-decoration: underline;
}

.metadata-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  font-size: 12px;
  margin: 0;
}

.metadata-list dt {
  color: #9ca3af;
}

.metadata-list dd {
  margin: 0;
  color: #e5e7eb;
  word-break: break-word;
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.2s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}

.panel-enter-active .panel,
.panel-leave-active .panel {
  transition: transform 0.2s ease;
}

.panel-enter-from .panel,
.panel-leave-to .panel {
  transform: translateX(100%);
}
</style>
