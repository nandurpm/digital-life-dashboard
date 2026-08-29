/*
 * ============================================================
 * FILE: storage.ts
 * PURPOSE: Provides validated dashboard-configuration persistence through browser storage or an in-memory test adapter.
 * ============================================================
 */

import { validateConfig } from "./config";
import type { DashboardConfig } from "./types";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class MemoryStore implements KeyValueStore {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

export const CONFIG_STORAGE_KEY = "digital-life-dashboard:config";

export function loadConfig(store: KeyValueStore, fallback: DashboardConfig): DashboardConfig {
  const saved = store.getItem(CONFIG_STORAGE_KEY);
  if (!saved) return fallback;
  try { return validateConfig(JSON.parse(saved)); } catch { return fallback; }
}

export function saveConfig(store: KeyValueStore, config: DashboardConfig) {
  store.setItem(CONFIG_STORAGE_KEY, JSON.stringify(validateConfig(config)));
}
