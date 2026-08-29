/*
 * ============================================================
 * FILE: widgets.ts
 * PURPOSE: Defines the widget plugin contract, registry, and built-in dashboard widget metadata.
 * ============================================================
 */

import type { WidgetId } from "./types";

export type WidgetPlugin = {
  id: WidgetId;
  name: string;
  description: string;
  category: "overview" | "personal" | "integration";
};

export class WidgetRegistry {
  private readonly plugins = new Map<WidgetId, WidgetPlugin>();
  register(plugin: WidgetPlugin) {
    if (this.plugins.has(plugin.id)) throw new Error(`Widget ${plugin.id} is already registered.`);
    this.plugins.set(plugin.id, plugin);
  }
  get(id: WidgetId) { return this.plugins.get(id); }
  list() { return Array.from(this.plugins.values()); }
}

export const coreWidgets: WidgetPlugin[] = [
  { id: "clock", name: "Clock & date", description: "Local device time and date.", category: "overview" },
  { id: "system", name: "System pulse", description: "Browser-supported device and network estimates.", category: "overview" },
  { id: "github", name: "GitHub activity", description: "Optional public activity feed.", category: "integration" },
  { id: "notes", name: "Notes", description: "Private browser-stored notes.", category: "personal" },
  { id: "links", name: "Quick links", description: "Personal shortcuts.", category: "personal" },
  { id: "insights", name: "AI productivity insights", description: "User-triggered suggestions from aggregate dashboard signals.", category: "personal" },
];

export function createCoreRegistry() {
  const registry = new WidgetRegistry();
  coreWidgets.forEach(widget => registry.register(widget));
  return registry;
}
