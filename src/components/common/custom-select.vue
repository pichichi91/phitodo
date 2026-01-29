<template>
  <div class="custom-select" ref="rootRef" :class="{ 'custom-select--open': open }">
    <button
      type="button"
      class="custom-select__trigger"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-label="ariaLabel"
      @click="onTriggerClick"
    >
      <span class="custom-select__value">{{ selectedLabel }}</span>
      <span class="custom-select__chevron" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 4.5 L6 7.5 L9 4.5" />
        </svg>
      </span>
    </button>
    <Transition name="dropdown">
      <ul
        v-if="open"
        class="custom-select__dropdown"
        role="listbox"
        @click.stop
      >
        <li
          v-for="opt in options"
          :key="opt.value"
          role="option"
          class="custom-select__option"
          :class="{ 'custom-select__option--selected': opt.value === modelValue }"
          :aria-selected="opt.value === modelValue"
          @mousedown.prevent
          @click.stop="select(opt.value)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, onUnmounted } from "vue";

export interface CustomSelectOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: CustomSelectOption[];
    placeholder?: string;
    ariaLabel?: string;
  }>(),
  { placeholder: "Select…", ariaLabel: "Select option" }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const ignoreNextTriggerClick = ref(false);

const selectedLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue);
  return opt ? opt.label : props.placeholder;
});

function onTriggerClick() {
  if (ignoreNextTriggerClick.value) {
    ignoreNextTriggerClick.value = false;
    return;
  }
  open.value = !open.value;
}

function select(value: string) {
  ignoreNextTriggerClick.value = true;
  open.value = false;
  emit("update:modelValue", value);
}

function handleClickOutside(e: MouseEvent) {
  if (!rootRef.value?.contains(e.target as Node)) {
    open.value = false;
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    nextTick(() => document.addEventListener("click", handleClickOutside));
  } else {
    document.removeEventListener("click", handleClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}

.custom-select__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 9px;
  padding-right: 32px;
  border-radius: 10px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  appearance: none;
}

.custom-select__trigger:hover {
  border-color: rgba(75, 85, 99, 0.95);
}

.custom-select__trigger:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.7);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.custom-select__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-select__chevron {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.custom-select__chevron svg {
  display: block;
  transition: transform 0.15s ease;
}

.custom-select--open .custom-select__chevron svg {
  transform: rotate(180deg);
}

.custom-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 4px 0 0;
  padding: 4px;
  list-style: none;
  border-radius: 10px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  z-index: 20;
  max-height: 220px;
  overflow-y: auto;
}

.custom-select__option {
  padding: 8px 10px;
  border-radius: 8px;
  color: #e5e7eb;
  font-size: 13px;
  cursor: pointer;
}

.custom-select__option:hover {
  background: rgba(55, 65, 81, 0.6);
}

.custom-select__option--selected {
  background: rgba(79, 70, 229, 0.25);
  color: #a5b4fc;
}

.custom-select__option--selected:hover {
  background: rgba(79, 70, 229, 0.35);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
