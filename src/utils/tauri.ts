/**
 * Check if the app is running in Tauri
 */
export function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window as Window & { __TAURI__?: unknown }).__TAURI__
  );
}
