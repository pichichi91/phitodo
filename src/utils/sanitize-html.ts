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
 */
export function stripHtmlToText(html: string): string {
  if (!html || typeof html !== "string") return "";
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, "").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent ?? div.innerText ?? "").trim();
}
