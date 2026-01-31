import { computed } from "vue";
import { useUIStore } from "@/stores/uiStore";
import type { ShortcutModifier } from "@/stores/uiStore";
import { isTauri } from "@/utils/tauri";

export function useShortcutSettings() {
  const ui = useUIStore();

  const shortcutModifier = computed({
    get: () => ui.shortcutModifier,
    set: (value: ShortcutModifier) => ui.setShortcutModifier(value)
  });

  const shortcutModifierOptions = computed(() => {
    const options: { value: ShortcutModifier; label: string }[] = [
      { value: "alt", label: "Alt" },
      { value: "ctrl", label: "Ctrl" },
      { value: "ctrlAlt", label: "Ctrl+Alt" },
      { value: "meta", label: "Command" }
    ];
    return isTauri() ? options : options.filter((o) => o.value !== "meta");
  });

  return {
    shortcutModifier,
    shortcutModifierOptions
  };
}
