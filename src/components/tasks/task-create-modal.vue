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
        <CustomSelect
          v-model="selectedProjectId"
          :options="projectOptions"
          aria-label="Choose project"
        />
      </label>
      <label class="field">
        <span class="label">Due date</span>
        <div class="date-picker-wrap" ref="datePickerWrapRef">
          <input
            :value="dueDateDisplay"
            type="text"
            readonly
            placeholder="Pick a date"
            class="date-picker-input"
            @click="showCalendar = true"
          />
          <button
            type="button"
            class="date-picker-icon"
            aria-label="Open calendar"
            @click="showCalendar = !showCalendar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
          <Transition name="calendar">
            <div v-if="showCalendar" class="calendar-popover" @click.stop>
              <div class="calendar-header">
                <button type="button" class="calendar-nav" @click="prevMonth" aria-label="Previous month">‹</button>
                <button
                  type="button"
                  class="calendar-month-title calendar-month-title--clickable"
                  @click="showYearPicker = true"
                  aria-label="Choose year"
                >
                  {{ calendarMonthLabel }}
                </button>
                <button type="button" class="calendar-nav" @click="nextMonth" aria-label="Next month">›</button>
              </div>
              <Transition name="calendar-panel" mode="out-in">
                <div v-if="showYearPicker" key="year" class="calendar-year-picker">
                  <div class="calendar-year-nav">
                    <button type="button" class="calendar-nav" @click="yearRangeStart -= 12" aria-label="Earlier years">‹‹</button>
                    <span class="calendar-year-range">{{ yearRangeStart }} – {{ yearRangeStart + 11 }}</span>
                    <button type="button" class="calendar-nav" @click="yearRangeStart += 12" aria-label="Later years">››</button>
                  </div>
                  <div class="calendar-year-grid">
                    <button
                      v-for="y in yearOptions"
                      :key="y"
                      type="button"
                      class="calendar-year-cell"
                      :class="{
                        'calendar-year-cell--current': y === currentYear,
                        'calendar-year-cell--selected': calendarMonth.getFullYear() === y
                      }"
                      @click="pickYear(y)"
                    >
                      {{ y }}
                    </button>
                  </div>
                  <button type="button" class="calendar-back" @click="showYearPicker = false">Back to calendar</button>
                </div>
                <div v-else key="month" class="calendar-month-view">
                  <div class="calendar-weekdays">
                    <span v-for="d in weekdays" :key="d" class="calendar-weekday">{{ d }}</span>
                  </div>
                  <div class="calendar-grid">
                    <button
                      v-for="cell in calendarCells"
                      :key="cell.key"
                      type="button"
                      class="calendar-cell"
                      :class="{
                        'calendar-cell--other': !cell.isCurrentMonth,
                        'calendar-cell--selected': cell.isSelected,
                        'calendar-cell--today': cell.isToday && !cell.isSelected
                      }"
                      :disabled="!cell.date"
                      @click="cell.date && pickDate(cell.date)"
                    >
                      {{ cell.label }}
                    </button>
                  </div>
                </div>
              </Transition>
              <button type="button" class="calendar-clear" @click="clearDate">Clear date</button>
            </div>
          </Transition>
        </div>
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppModal from "@/components/common/app-modal.vue";
import CustomSelect from "@/components/common/custom-select.vue";
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
const dueDate = ref("");
const titleEl = ref<HTMLInputElement | null>(null);
const selectedProjectId = ref<string>("");
const showCalendar = ref(false);
const showYearPicker = ref(false);
const datePickerWrapRef = ref<HTMLElement | null>(null);
const calendarMonth = ref(new Date());
const yearRangeStart = ref(new Date().getFullYear() - 6);

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const currentYear = new Date().getFullYear();

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const todayStr = toLocalDateString(new Date());

const dueDateDisplay = computed(() => {
  if (!dueDate.value) return "";
  const d = new Date(dueDate.value + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
});

const calendarMonthLabel = computed(() =>
  calendarMonth.value.toLocaleDateString("en-US", { month: "long", year: "numeric" })
);

const yearOptions = computed(() => {
  const start = yearRangeStart.value;
  return Array.from({ length: 12 }, (_, i) => start + i);
});

const calendarCells = computed(() => {
  const year = calendarMonth.value.getFullYear();
  const month = calendarMonth.value.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { key: string; date: string | null; label: string; isCurrentMonth: boolean; isSelected: boolean; isToday: boolean }[] = [];
  const prevMonthDays = startDay;
  const prevMonth = new Date(year, month, 0);
  const prevDaysInMonth = prevMonth.getDate();
  for (let i = 0; i < prevMonthDays; i++) {
    const d = new Date(year, month - 1, prevDaysInMonth - prevMonthDays + 1 + i);
    cells.push({
      key: `prev-${i}`,
      date: toLocalDateString(d),
      label: String(d.getDate()),
      isCurrentMonth: false,
      isSelected: dueDate.value === toLocalDateString(d),
      isToday: toLocalDateString(d) === todayStr
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = toLocalDateString(new Date(year, month, day));
    cells.push({
      key: `curr-${day}`,
      date: dateStr,
      label: String(day),
      isCurrentMonth: true,
      isSelected: dueDate.value === dateStr,
      isToday: dateStr === todayStr
    });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({
      key: `next-${i}`,
      date: toLocalDateString(d),
      label: String(d.getDate()),
      isCurrentMonth: false,
      isSelected: dueDate.value === toLocalDateString(d),
      isToday: toLocalDateString(d) === todayStr
    });
  }
  return cells;
});

function prevMonth() {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() - 1);
}

function nextMonth() {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + 1);
}

function pickYear(year: number) {
  calendarMonth.value = new Date(year, calendarMonth.value.getMonth(), 1);
  showYearPicker.value = false;
}

function pickDate(dateStr: string) {
  dueDate.value = dateStr;
  showCalendar.value = false;
}

function clearDate() {
  dueDate.value = "";
  showCalendar.value = false;
}

function handleClickOutside(e: MouseEvent) {
  if (!showCalendar.value || !datePickerWrapRef.value) return;
  const el = datePickerWrapRef.value;
  if (el.contains(e.target as Node)) return;
  showCalendar.value = false;
}

const editingId = computed(() => ui.editingTaskId);
const editingTask = computed(() =>
  editingId.value ? taskStore.allTasks.find((t) => t.id === editingId.value) : undefined
);
const isEditing = computed(() => Boolean(editingId.value && editingTask.value));

const projects = computed(() => projectStore.allProjects);

const projectOptions = computed(() => [
  { value: "", label: "Inbox (no project)" },
  ...projects.value.map((p) => ({ value: p.id, label: p.name }))
]);

const reset = () => {
  title.value = "";
  notes.value = "";
  dueDate.value = "";
  selectedProjectId.value = "";
  showCalendar.value = false;
  showYearPicker.value = false;
};

const loadTaskData = () => {
  if (editingTask.value) {
    title.value = editingTask.value.title;
    notes.value = editingTask.value.notes || "";
    dueDate.value = editingTask.value.dueDate?.slice(0, 10) ?? "";
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
      dueDate: dueDate.value.trim() ? dueDate.value.trim() : undefined,
      projectId: selectedProjectId.value || undefined,
      updatedAt: new Date().toISOString()
    };
    taskStore.upsertMany([updated]);
  } else {
    const task = createEmptyTask(title.value.trim());
    task.notes = notes.value.trim() || undefined;
    task.dueDate = dueDate.value.trim() || undefined;
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

watch(showCalendar, (open) => {
  if (open) {
    if (dueDate.value) {
      const d = new Date(dueDate.value + "T12:00:00");
      calendarMonth.value = new Date(d.getFullYear(), d.getMonth(), 1);
    } else {
      calendarMonth.value = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }
    const y = calendarMonth.value.getFullYear();
    yearRangeStart.value = Math.max(2000, y - 6);
    showYearPicker.value = false;
    nextTick(() => document.addEventListener("click", handleClickOutside));
  } else {
    document.removeEventListener("click", handleClickOutside);
    showYearPicker.value = false;
  }
});

// Watch for changes in editing state to load task data
watch(editingId, () => {
  loadTaskData();
  nextTick(() => {
    titleEl.value?.focus();
  });
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
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
  background: linear-gradient(to right, #4f46e5, #6366f1);
  color: white;
}

.btn.danger {
  border-color: rgba(248, 113, 113, 0.8);
  color: #f87171;
}

/* Date picker */
.date-picker-wrap {
  position: relative;
  display: flex;
  align-items: stretch;
}

.date-picker-input {
  flex: 1;
  padding-right: 40px;
  cursor: pointer;
}

.date-picker-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 6px;
}

.date-picker-icon:hover {
  color: #e5e7eb;
}

.date-picker-icon svg {
  display: block;
}

.calendar-popover {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  z-index: 10;
  min-width: 260px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.calendar-nav {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: #e5e7eb;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
}

.calendar-nav:hover {
  background: rgba(55, 65, 81, 0.6);
}

.calendar-month-title {
  font-size: 13px;
  font-weight: 600;
  color: #e5e7eb;
}

.calendar-month-title--clickable {
  padding: 4px 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.calendar-month-title--clickable:hover {
  background: rgba(55, 65, 81, 0.6);
}

.calendar-year-picker {
  margin-bottom: 4px;
}

.calendar-year-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.calendar-year-range {
  font-size: 11px;
  color: #9ca3af;
  letter-spacing: 0.02em;
}

.calendar-year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.calendar-year-cell {
  padding: 8px;
  border: none;
  background: transparent;
  color: #e5e7eb;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
}

.calendar-year-cell:hover {
  background: rgba(55, 65, 81, 0.6);
}

.calendar-year-cell--current {
  font-weight: 600;
  color: #38bdf8;
}

.calendar-year-cell--selected {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
}

.calendar-year-cell--current.calendar-year-cell--selected {
  color: white;
}

.calendar-back {
  width: 100%;
  padding: 6px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: transparent;
  color: #9ca3af;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
}

.calendar-back:hover {
  background: rgba(55, 65, 81, 0.5);
  color: #e5e7eb;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 6px;
  font-size: 10px;
  color: #6b7280;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #e5e7eb;
  font-size: 12px;
  cursor: pointer;
  border-radius: 8px;
}

.calendar-cell:disabled {
  cursor: default;
}

.calendar-cell:not(:disabled):hover {
  background: rgba(55, 65, 81, 0.6);
}

.calendar-cell--other {
  color: #6b7280;
}

.calendar-cell--selected {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
}

.calendar-cell--today {
  font-weight: 600;
  color: #38bdf8;
}

.calendar-cell--today.calendar-cell--selected {
  color: white;
}

.calendar-clear {
  margin-top: 10px;
  width: 100%;
  padding: 6px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: transparent;
  color: #9ca3af;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
}

.calendar-clear:hover {
  background: rgba(55, 65, 81, 0.5);
  color: #e5e7eb;
}

.calendar-enter-active,
.calendar-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.calendar-enter-from,
.calendar-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.calendar-panel-enter-active,
.calendar-panel-leave-active {
  transition: opacity 0.12s ease;
}

.calendar-panel-enter-from,
.calendar-panel-leave-to {
  opacity: 0;
}
</style>
