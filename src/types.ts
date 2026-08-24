export const widgetIds = ["clock", "system", "github", "notes", "links", "insights"] as const;
export type WidgetId = (typeof widgetIds)[number];

export type WidgetConfig = {
  id: WidgetId;
  enabled: boolean;
};

export type QuickLink = {
  id: string;
  label: string;
  url: string;
  accent: "cyan" | "violet" | "amber" | "emerald";
};

export type DashboardConfig = {
  version: 1;
  widgets: WidgetConfig[];
  githubUsername: string;
  notes: string;
  quickLinks: QuickLink[];
};

export type GitHubActivity = {
  id: string;
  type: string;
  repo: string;
  createdAt: string;
};

export type SystemSnapshot = {
  observedAt: number;
  runtime: "browser" | "local-bridge" | "demo";
  cpuCores: number | null;
  memoryGiB: number | null;
  memoryUsedPercent: number | null;
  storageUsedGiB: number | null;
  storageQuotaGiB: number | null;
  online: boolean;
  temperatureC: number | null;
  supportNotes: string[];
};

export type ProductivityInsight = {
  summary: string;
  patterns: string[];
  suggestions: Array<{ title: string; action: string; why: string }>;
  boundary: string;
  model: string;
};
