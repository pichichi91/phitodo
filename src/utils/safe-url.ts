const ALLOWED_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

/**
 * Returns the URL for use in href only if it has a safe scheme (http, https, mailto, tel).
 * Prevents javascript:, data:, vbscript:, etc. from being used as links.
 */
export function getSafeHref(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    const scheme = parsed.protocol.toLowerCase();
    if (ALLOWED_SCHEMES.includes(scheme)) return trimmed;
  } catch {
    // Invalid or relative URL; reject for safety
  }
  return null;
}
