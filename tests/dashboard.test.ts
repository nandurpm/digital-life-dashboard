import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultConfig, isWidgetEnabled, moveWidget, toggleWidget, validateConfig } from "../src/config";
import { fetchGitHubActivity } from "../src/api";
import { parseProductivityInsight, prepareInsightInput, requestProductivityInsights } from "../src/insights";
import { MemoryStore, loadConfig, saveConfig } from "../src/storage";
import { loadDarkMode, saveDarkMode } from "../src/theme";
import { createCoreRegistry, WidgetRegistry } from "../src/widgets";

describe("build hygiene", () => {
  it("ignores generated TypeScript incremental build metadata", () => {
    const ignoreRules = readFileSync(resolve(process.cwd(), ".gitignore"), "utf8");
    expect(ignoreRules).toMatch(/^\*\.tsbuildinfo$/m);
  });
});

describe("widget plugins", () => {
  it("registers each core widget once and rejects duplicate IDs", () => {
    const registry = createCoreRegistry();
    expect(registry.list()).toHaveLength(6);
    expect(registry.get("notes")?.name).toBe("Notes");
    expect(registry.get("insights")?.name).toBe("AI productivity insights");
    const custom = new WidgetRegistry();
    custom.register({ id: "clock", name: "Clock", description: "Time", category: "overview" });
    expect(() => custom.register({ id: "clock", name: "Second clock", description: "Duplicate", category: "overview" })).toThrow(/already registered/);
  });
});

describe("configuration and persistence", () => {
  it("toggles and reorders independent widget settings", () => {
    const config = defaultConfig();
    expect(isWidgetEnabled(config, "insights")).toBe(true);
    const hidden = toggleWidget(config, "github");
    expect(isWidgetEnabled(hidden, "github")).toBe(false);
    const moved = moveWidget(hidden, "links", "up");
    expect(moved.widgets.map(widget => widget.id)).not.toEqual(hidden.widgets.map(widget => widget.id));
  });

  it("persists valid settings and safely falls back from malformed configuration", () => {
    const store = new MemoryStore();
    const expected = { ...defaultConfig(), notes: "A locally stored note" };
    saveConfig(store, expected);
    expect(loadConfig(store, defaultConfig()).notes).toBe("A locally stored note");
    store.setItem("digital-life-dashboard:config", "{not valid json");
    expect(loadConfig(store, defaultConfig()).notes).toBe(defaultConfig().notes);
    expect(() => validateConfig({ version: 1, widgets: [] })).toThrow();
  });

  it("persists an explicit theme choice and otherwise uses the system preference", () => {
    const store = new MemoryStore();
    expect(loadDarkMode(store, true)).toBe(true);
    saveDarkMode(store, false);
    expect(loadDarkMode(store, true)).toBe(false);
    saveDarkMode(store, true);
    expect(loadDarkMode(store, false)).toBe(true);
  });

  it("persists an approved accent and supplies violet for pre-accent local configuration", () => {
    const accented = validateConfig({ ...defaultConfig(), accent: "emerald" });
    expect(accented.accent).toBe("emerald");
    const legacy = { ...defaultConfig() } as Record<string, unknown>;
    delete legacy.accent;
    expect(validateConfig(legacy).accent).toBe("violet");
    expect(() => validateConfig({ ...defaultConfig(), accent: "neon" })).toThrow(/Accent/);
  });
});

describe("optional GitHub integration", () => {
  it("fails gracefully when the public API is unavailable", async () => {
    const fetcher = vi.fn(async () => new Response("unavailable", { status: 503 }));
    await expect(fetchGitHubActivity("octocat", fetcher)).rejects.toThrow(/unavailable/);
  });

  it("maps a minimal public activity response without credentials", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify([{ id: "event-1", type: "PushEvent", repo: { name: "octo/demo" }, created_at: "2026-08-24T00:00:00Z" }]), { status: 200 }));
    await expect(fetchGitHubActivity("octocat", fetcher)).resolves.toEqual([{ id: "event-1", type: "PushEvent", repo: "octo/demo", createdAt: "2026-08-24T00:00:00Z" }]);
  });
});

describe("AI productivity insights", () => {
  it("prepares aggregate-only dashboard input without notes, URLs, or repository data", () => {
    const prepared = prepareInsightInput(
      { notes: "Private focus plan: do not send this text", quickLinks: [{ label: "Private link", url: "https://private.example" }] },
      { observedAt: 1, runtime: "browser", cpuCores: 8, memoryGiB: 16, memoryUsedPercent: 32, storageUsedGiB: 1, storageQuotaGiB: 10, online: true, temperatureC: null, supportNotes: [] },
      [{ id: "event", type: "PushEvent", repo: "private/repo", createdAt: "2026-08-24T00:00:00Z" }],
    );
    expect(prepared).toMatchObject({ noteCharacterCount: 41, quickLinkCount: 1, publicActivityCount: 1, publicActivityTypes: { PushEvent: 1 }, online: true, systemSignalCount: 3 });
    expect(JSON.stringify(prepared)).not.toContain("Private focus");
    expect(JSON.stringify(prepared)).not.toContain("private.example");
    expect(JSON.stringify(prepared)).not.toContain("private/repo");
  });

  it("validates bounded output and handles a recoverable local API failure", async () => {
    const parsed = parseProductivityInsight({ summary: "A concise aggregate-only reflection.", patterns: ["Local settings are active."], suggestions: [{ title: "Choose a next task", action: "Write one priority before opening a link.", why: "A small commitment can reduce switching." }], boundary: "Aggregate dashboard counts only.", model: "gpt-5-mini" });
    expect(parsed.suggestions).toHaveLength(1);
    await expect(requestProductivityInsights({ noteCharacterCount: 0, quickLinkCount: 0, publicActivityCount: 0, publicActivityTypes: {}, online: null, systemRuntime: null, systemSignalCount: 0 }, async () => new Response(JSON.stringify({ error: "AI service offline" }), { status: 503 }))).rejects.toThrow("AI service offline");
  });
});
