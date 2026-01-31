/**
 * Returns true if the given Toggl project name is in the hidden list (case-insensitive).
 */
export function isHiddenTogglProject(
  projectName: string | null | undefined,
  hiddenNames: string[]
): boolean {
  if (projectName == null || !hiddenNames.length) return false;
  const lower = projectName.trim().toLowerCase();
  return hiddenNames.some((p) => p.trim().toLowerCase() === lower);
}
