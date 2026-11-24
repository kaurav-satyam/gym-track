import { safeStorage } from "@/shared/lib/storage";

const THEME_STORAGE_KEY = "gym-track-theme";

const THEME_PREFERENCES = ["system", "dark", "light"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

function isThemePreference(value: string | null): value is ThemePreference {
  return THEME_PREFERENCES.some((preference) => preference === value);
}

export function getStoredThemePreference(): ThemePreference {
  const stored = safeStorage.get(THEME_STORAGE_KEY);

  return isThemePreference(stored) ? stored : "system";
}

/**
 * "system" removes the override so the CSS `prefers-color-scheme` rules apply;
 * "dark"/"light" pin the theme via `data-theme` on <html>.
 */
export function applyThemePreference(preference: ThemePreference) {
  const root = document.documentElement;

  if (preference === "system") {
    root.removeAttribute("data-theme");
    root.style.colorScheme = "";
    return;
  }

  root.dataset.theme = preference;
  root.style.colorScheme = preference;
}

export function persistThemePreference(preference: ThemePreference) {
  if (preference === "system") {
    safeStorage.remove(THEME_STORAGE_KEY);
  } else {
    safeStorage.set(THEME_STORAGE_KEY, preference);
  }

  applyThemePreference(preference);
}
