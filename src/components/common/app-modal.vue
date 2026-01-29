<template>
  <div class="backdrop" @click.self="onBackdrop">
    <div class="modal">
      <header class="modal-header">
        <slot name="title" />
        <button class="close" type="button" @click="emit('close')">✕</button>
      </header>
      <section class="modal-body">
        <slot />
      </section>
      <footer v-if="$slots.footer" class="modal-footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  close: [];
}>();

const onBackdrop = () => {
  emit("close");
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.modal {
  width: 480px;
  max-width: calc(100% - 32px);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 1));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(31, 41, 55, 0.9);
  font-size: 14px;
  font-weight: 500;
}

.modal-body {
  padding: 12px 14px 14px;
  font-size: 13px;
}

.modal-footer {
  padding: 8px 14px 12px;
  border-top: 1px solid rgba(31, 41, 55, 0.9);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.close {
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  font-size: 14px;
}
</style>
