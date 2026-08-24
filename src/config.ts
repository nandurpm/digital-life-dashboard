import { type DashboardConfig, type QuickLink, type WidgetConfig, widgetIds } from "./types";

export const DEFAULT_QUICK_LINKS: QuickLink[] = [
  { id: "calendar", label: "Calendar", url: "https://calendar.google.com", accent: "cyan" },
  { id: "mail", label: "Mail", url: "https://mail.google.com", accent: "violet" },
  { id: "github", label: "GitHub", url: "https://github.com", accent: "emerald" },
];

export const defaultConfig = (): DashboardConfig => ({
  version: 1,
  widgets: widgetIds.map(id => ({ id, enabled: true })),
  githubUsername: "",
  notes: "Welcome to your local-first dashboard. Add a note, connect a public GitHub account, or tailor the widget layout.",
  quickLinks: DEFAULT_QUICK_LINKS,
});

const isWidgetConfig = (value: unknown): value is WidgetConfig => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string" && widgetIds.includes(candidate.id as (typeof widgetIds)[number]) && typeof candidate.enabled === "boolean";
};

const isQuickLink = (value: unknown): value is QuickLink => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string" && typeof candidate.label === "string" && typeof candidate.url === "string" && ["cyan", "violet", "amber", "emerald"].includes(String(candidate.accent));
};

export function validateConfig(value: unknown): DashboardConfig {
  if (!value || typeof value !== "object") throw new Error("Configuration must be an object.");
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== 1) throw new Error("Unsupported configuration version.");
  if (!Array.isArray(candidate.widgets) || !candidate.widgets.every(isWidgetConfig)) throw new Error("Widget configuration is malformed.");
  if (new Set(candidate.widgets.map(widget => widget.id)).size !== widgetIds.length) throw new Error("Every registered widget must have a configuration entry.");
  if (typeof candidate.githubUsername !== "string" || typeof candidate.notes !== "string") throw new Error("Text settings are malformed.");
  if (!Array.isArray(candidate.quickLinks) || !candidate.quickLinks.every(isQuickLink)) throw new Error("Quick-link configuration is malformed.");
  return candidate as DashboardConfig;
}

export function isWidgetEnabled(config: DashboardConfig, id: WidgetConfig["id"]) {
  return config.widgets.find(widget => widget.id === id)?.enabled ?? false;
}

export function toggleWidget(config: DashboardConfig, id: WidgetConfig["id"]): DashboardConfig {
  return { ...config, widgets: config.widgets.map(widget => widget.id === id ? { ...widget, enabled: !widget.enabled } : widget) };
}

export function moveWidget(config: DashboardConfig, id: WidgetConfig["id"], direction: "up" | "down"): DashboardConfig {
  const index = config.widgets.findIndex(widget => widget.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= config.widgets.length) return config;
  const widgets = [...config.widgets];
  [widgets[index], widgets[target]] = [widgets[target], widgets[index]];
  return { ...config, widgets };
}
