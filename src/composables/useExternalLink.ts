import { isTauri } from "@/utils/tauri";

/**
 * Composable for handling external link clicks in Tauri vs browser
 */
export function useExternalLink() {
  async function openExternalLink(e: MouseEvent, url: string) {
    if (isTauri()) {
      e.preventDefault();
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      await openUrl(url);
    }
  }

  return { openExternalLink };
}
