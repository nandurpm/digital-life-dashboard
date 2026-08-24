import { describe, expect, it, vi } from "vitest";
import { defaultConfig, isWidgetEnabled, moveWidget, toggleWidget, validateConfig } from "../src/config";
import { fetchGitHubActivity } from "../src/api";
import { MemoryStore, loadConfig, saveConfig } from "../src/storage";
import { createCoreRegistry, WidgetRegistry } from "../src/widgets";

describe("widget plugins", () => {
  it("registers each core widget once and rejects duplicate IDs", () => {
    const registry = createCoreRegistry();
    expect(registry.list()).toHaveLength(5);
    expect(registry.get("notes")?.name).toBe("Notes");
    const custom = new WidgetRegistry();
    custom.register({ id: "clock", name: "Clock", description: "Time", category: "overview" });
    expect(() => custom.register({ id: "clock", name: "Second clock", description: "Duplicate", category: "overview" })).toThrow(/already registered/);
  });
});

describe("configuration and persistence", () => {
  it("toggles and reorders independent widget settings", () => {
    const config = defaultConfig();
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
