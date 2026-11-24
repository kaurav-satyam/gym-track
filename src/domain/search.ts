/** Canonical form used to compare and index exercise titles. */
export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}
