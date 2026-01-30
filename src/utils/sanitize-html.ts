import DOMPurify from "dompurify";

/**
 * Sanitize HTML for safe rendering (e.g. task description).
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "code", "blockquote"],
    ALLOWED_ATTR: ["href", "target", "rel"]
  });
}

/**
 * Strip HTML tags and return plain text (e.g. for search result preview).
 * Uses DOMPurify with no allowed tags so no scripts execute; never assigns raw HTML to the DOM.
 */
export function stripHtmlToText(html: string): string {
  if (!html || typeof html !== "string") return "";
  const safe = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  if (typeof document === "undefined") {
    return safe.trim();
  }
  const div = document.createElement("div");
  div.innerHTML = safe;
  return (div.textContent ?? div.innerText ?? "").trim();
}
