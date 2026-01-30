<template>
  <AppModal @close="emit('close')">
    <template #title>Standup report</template>
    <div class="standup-modal-body">
      <p v-if="standupError" class="standup-error">{{ standupError }}</p>
      <div class="standup-range-row">
        <label class="standup-range-label">
          <span class="standup-range-text">Last</span>
          <input
            v-model.number="standupDays"
            type="number"
            min="1"
            max="31"
            class="standup-days-input"
            aria-label="Number of days"
          />
          <span class="standup-range-text">day(s)</span>
        </label>
        <span class="standup-range-hint">Default: 1 day. Increase to include more history.</span>
      </div>
      <div class="standup-report-row">
        <p class="standup-modal-hint">Edit if needed, then copy.</p>
        <button type="button" class="btn btn-copy" @click="copyToClipboard">
          {{ standupCopied ? "Copied!" : "Copy" }}
        </button>
      </div>
      <div class="standup-textarea-wrap">
        <textarea
          v-model="standupMarkdown"
          class="standup-textarea"
          rows="10"
          spellcheck="false"
          aria-label="Standup report markdown"
        />
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-standup-close" @click="emit('close')">
        Close
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import AppModal from "@/components/common/app-modal.vue";
import { fetchTimeEntries as fetchTimeEntriesApi } from "@/domain/services/toggl-service";
import { useTogglStore } from "@/stores/togglStore";
import { toLocalYYYYMMDD } from "@/utils/date-format";
import {
  buildStandupMarkdownForRange,
  getStandupDateRange,
  groupEntriesByProject
} from "@/utils/standup-report";

const emit = defineEmits<{ close: [] }>();

const toggl = useTogglStore();

const standupDays = ref(1);
const standupMarkdown = ref("");
const standupCopied = ref(false);
const standupError = ref<string | null>(null);
/** Entries fetched only for the modal; never written to the store so inbox "Toggl today" stays intact. */
const standupEntries = ref<Awaited<ReturnType<typeof fetchTimeEntriesApi>>>([]);

function rebuildStandupMarkdown() {
  const raw = Number(standupDays.value);
  const days = Number.isFinite(raw) ? Math.max(1, Math.min(31, raw)) : 1;
  if (days !== standupDays.value) standupDays.value = days;
  const { start, end } = getStandupDateRange(days);
  const entriesInRange = standupEntries.value.filter((e) => {
    const entryDate = toLocalYYYYMMDD(new Date(e.start));
    return entryDate >= start && entryDate <= end;
  });
  const groups = groupEntriesByProject(entriesInRange);
  standupMarkdown.value = buildStandupMarkdownForRange(start, end, groups, { days });
}

async function openAndPrepare() {
  standupDays.value = 1;
  standupCopied.value = false;
  standupError.value = null;
  standupEntries.value = [];
  const token = toggl.token;
  if (!token) {
    standupError.value = "Configure token in Settings.";
    return;
  }
  const { start, end } = getStandupDateRange(14);
  try {
    const entries = await fetchTimeEntriesApi(token, start, end);
    standupEntries.value = entries;
    rebuildStandupMarkdown();
  } catch (e) {
    standupError.value =
      e instanceof Error ? e.message : "Request failed.";
  }
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(standupMarkdown.value);
    standupCopied.value = true;
    setTimeout(() => {
      standupCopied.value = false;
    }, 2000);
  } catch {
    // clipboard not available (e.g. non-HTTPS)
  }
}

onMounted(() => {
  openAndPrepare();
});

watch(standupDays, () => {
  rebuildStandupMarkdown();
});
</script>

<style scoped>
.standup-modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  max-height: 70vh;
  overflow: hidden;
}

.standup-error {
  margin: 0;
  font-size: 12px;
  color: #f87171;
}

.standup-report-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
}

.standup-textarea-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
}

.standup-range-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(55, 65, 81, 0.35);
  border: 1px solid rgba(55, 65, 81, 0.6);
}

.standup-range-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #e5e7eb;
}

.standup-range-text {
  flex-shrink: 0;
}

.standup-days-input {
  width: 4ch;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
  text-align: center;
}

.standup-days-input:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

.standup-range-hint {
  margin: 0;
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.35;
}

.standup-modal-hint {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.btn-copy {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: rgba(59, 130, 246, 0.3);
  color: #e5e7eb;
  border: 1px solid rgba(59, 130, 246, 0.5);
  cursor: pointer;
  flex-shrink: 0;
}

.btn-copy:hover {
  background: rgba(59, 130, 246, 0.4);
}

.standup-textarea {
  width: 100%;
  min-height: 0;
  height: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
  font-family: ui-monospace, monospace;
  line-height: 1.45;
  resize: none;
  display: block;
  box-sizing: border-box;
}

.standup-textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
}

.btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-standup-close {
  background: transparent;
  color: #9ca3af;
  border-color: rgba(55, 65, 81, 0.9);
}

.btn-standup-close:hover {
  color: #e5e7eb;
}

:deep(.modal) {
  width: 560px;
}
</style>
