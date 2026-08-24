export const THEME_STORAGE_KEY = "digital-life-dashboard-theme";

export type ThemePreferenceStore = Pick<Storage, "getItem" | "setItem">;

export function loadDarkMode(store: ThemePreferenceStore, systemPrefersDark = false) {
  const saved = store.getItem(THEME_STORAGE_KEY);
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return systemPrefersDark;
}

export function saveDarkMode(store: ThemePreferenceStore, dark: boolean) {
  store.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
}
