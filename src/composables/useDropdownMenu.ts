import { ref, onMounted, onBeforeUnmount } from "vue";

export function useDropdownMenu() {
  const isOpen = ref(false);

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  function close() {
    isOpen.value = false;
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
      close();
    }
  }

  onMounted(() => {
    document.addEventListener("keydown", handleEscape);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleEscape);
  });

  return { isOpen, toggle, close };
}
