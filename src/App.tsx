import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Brain,
  CheckCircle2,
  ChevronRight,
  CloudOff,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  Github,
  HardDrive,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  MemoryStick,
  Moon,
  Network,
  Settings2,
  Sparkles,
  Sun,
  Thermometer,
  Upload,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import {
  defaultConfig,
  DASHBOARD_ACCENTS,
  isWidgetEnabled,
  moveWidget,
  toggleWidget,
  validateConfig,
} from "./config";
import { fetchGitHubActivity } from "./api";
import { prepareInsightInput, requestProductivityInsights } from "./insights";
import { getBrowserSystemSnapshot } from "./system";
import { CONFIG_STORAGE_KEY, loadConfig, saveConfig } from "./storage";
import { loadDarkMode, saveDarkMode } from "./theme";
import { createCoreRegistry } from "./widgets";
import type {
  DashboardConfig,
  GitHubActivity,
  ProductivityInsight,
  SystemSnapshot,
  DashboardAccent,
  WidgetId,
} from "./types";

const registry = createCoreRegistry();
const accentLabels: Record<DashboardAccent, string> = { violet: "Violet", cyan: "Cyan", emerald: "Emerald", amber: "Amber" };
const prettyTime = (value: number) =>
  new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);

function Metric({
  icon: Icon,
  label,
  value,
  hint,
  tone = "cyan",
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
  hint: string;
  tone?: "cyan" | "violet" | "amber" | "emerald";
}) {
  return (
    <article className="metric-card">
      <span className={`metric-icon ${tone}`}>
        <Icon size={18} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}

function Empty({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="empty">
      <CloudOff size={22} />
      <strong>{title}</strong>
      <span>{copy}</span>
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState<DashboardConfig>(() =>
    loadConfig(localStorage, defaultConfig()),
  );
  const [now, setNow] = useState(Date.now());
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [githubActivity, setGithubActivity] = useState<GitHubActivity[]>([]);
  const [githubStatus, setGithubStatus] = useState<
    "idle" | "loading" | "error" | "ready"
  >("idle");
  const [insight, setInsight] = useState<ProductivityInsight | null>(null);
  const [insightStatus, setInsightStatus] = useState<
    "idle" | "loading" | "error" | "ready"
  >("idle");
  const [insightError, setInsightError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [dark, setDark] = useState(() => loadDarkMode(localStorage, window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false));
  const importRef = useRef<HTMLInputElement>(null);

  const updateConfig = (next: DashboardConfig) => {
    setConfig(next);
    saveConfig(localStorage, next);
  };
  const visible = (id: WidgetId) => isWidgetEnabled(config, id);
  const appClass = `app ${dark ? "dark " : ""}accent-${config.accent}`;
  const enabledWidgets = useMemo(
    () => config.widgets.filter((widget) => widget.enabled),
    [config],
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    saveDarkMode(localStorage, dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    const refresh = async () => {
      try {
        setSnapshotError(null);
        setSnapshot(await getBrowserSystemSnapshot());
      } catch {
        setSnapshotError(
          "System estimates could not be collected in this browser.",
        );
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
    };
  }, []);

  const refreshGithub = async () => {
    if (!config.githubUsername.trim()) {
      setGithubStatus("idle");
      setGithubActivity([]);
      return;
    }
    setGithubStatus("loading");
    try {
      setGithubActivity(await fetchGitHubActivity(config.githubUsername));
      setGithubStatus("ready");
    } catch {
      setGithubStatus("error");
    }
  };

  const generateInsights = async () => {
    setInsightStatus("loading");
    setInsightError(null);
    try {
      setInsight(
        await requestProductivityInsights(
          prepareInsightInput(config, snapshot, githubActivity),
        ),
      );
      setInsightStatus("ready");
    } catch (error) {
      setInsightStatus("error");
      setInsightError(
        error instanceof Error
          ? error.message
          : "AI insights are temporarily unavailable.",
      );
    }
  };

  const downloadConfig = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(config, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "digital-life-dashboard-config.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = async (file: File) => {
    try {
      updateConfig(validateConfig(JSON.parse(await file.text())));
    } catch {
      alert("That configuration file is not valid for Digital Life Dashboard.");
    }
  };

  return (
    <div className={appClass}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Zap size={18} />
          </span>
          <div>
            <strong>Digital Life</strong>
            <small>Personal dashboard</small>
          </div>
        </div>
        <nav>
          <a className="active">
            <LayoutDashboard size={17} /> Overview
          </a>
          <a onClick={() => setShowSettings(true)}>
            <Settings2 size={17} /> Customize
          </a>
        </nav>
        <div className="sidebar-footer">
          <span className="runtime-dot" /> Local-first settings
          <br />
          <small>Stored in this browser</small>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR DAY, AT A GLANCE</p>
            <h1>
              Good{" "}
              {new Date(now).getHours() < 12
                ? "morning"
                : new Date(now).getHours() < 18
                  ? "afternoon"
                  : "evening"}
              .
            </h1>
          </div>
          <div className="top-actions">
            <button
              className="icon-button"
              onClick={() => setDark(!dark)}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={dark}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="settings-button"
              onClick={() => setShowSettings(true)}
            >
              <Settings2 size={17} /> Customize
            </button>
          </div>
        </header>
        <section className="hero">
          <div>
            <p className="eyebrow">LOCAL TIME</p>
            <h2>
              {new Intl.DateTimeFormat("en", {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              }).format(now)}
            </h2>
            <p>{prettyTime(now)}</p>
          </div>
          <div className="system-pill">
            <span
              className={
                snapshot?.online ? "status-dot online" : "status-dot offline"
              }
            />{" "}
            {snapshot?.online
              ? "Online · browser estimates"
              : "Offline · settings remain available"}
          </div>
        </section>
        {snapshotError && (
          <div className="notice error">
            <CloudOff size={17} /> {snapshotError}
          </div>
        )}
        {visible("system") && (
          <section className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">SYSTEM PULSE</p>
                <h2>What this device can share</h2>
              </div>
              <button
                className="quiet-button"
                onClick={() =>
                  void getBrowserSystemSnapshot().then(setSnapshot)
                }
              >
                Refresh <ChevronRight size={15} />
              </button>
            </div>
            <div className="metrics-grid">
              {snapshot ? (
                <>
                  <Metric
                    icon={Cpu}
                    label="CPU capability"
                    value={
                      snapshot.cpuCores
                        ? `${snapshot.cpuCores} cores`
                        : "Unavailable"
                    }
                    hint="Usage requires local bridge"
                  />
                  <Metric
                    icon={MemoryStick}
                    label="Memory"
                    value={
                      snapshot.memoryGiB
                        ? `${snapshot.memoryGiB} GB`
                        : "Unavailable"
                    }
                    hint={
                      snapshot.memoryUsedPercent
                        ? `${snapshot.memoryUsedPercent}% JS heap used`
                        : "Browser estimate"
                    }
                    tone="violet"
                  />
                  <Metric
                    icon={HardDrive}
                    label="Storage"
                    value={
                      snapshot.storageQuotaGiB
                        ? `${snapshot.storageUsedGiB ?? 0} / ${snapshot.storageQuotaGiB} GB`
                        : "Unavailable"
                    }
                    hint="Browser site storage quota"
                    tone="amber"
                  />
                  <Metric
                    icon={snapshot.online ? Wifi : Network}
                    label="Network"
                    value={snapshot.online ? "Connected" : "Offline"}
                    hint="Network state only"
                    tone="emerald"
                  />
                  <Metric
                    icon={Thermometer}
                    label="Temperature"
                    value={
                      snapshot.temperatureC
                        ? `${snapshot.temperatureC}°C`
                        : "Optional"
                    }
                    hint="Requires local bridge"
                    tone="amber"
                  />
                </>
              ) : (
                <>
                  <Metric
                    icon={Cpu}
                    label="System status"
                    value="Loading"
                    hint="Collecting browser estimates"
                  />
                  <Metric
                    icon={MemoryStick}
                    label="Memory"
                    value="—"
                    hint="Waiting for browser support"
                    tone="violet"
                  />
                  <Metric
                    icon={HardDrive}
                    label="Storage"
                    value="—"
                    hint="Waiting for browser support"
                    tone="amber"
                  />
                </>
              )}
            </div>
            <p className="support-note">
              <Activity size={14} />{" "}
              {snapshot?.supportNotes[0] ??
                "Browser system information is loading."}
            </p>
          </section>
        )}
        <div className="dashboard-grid">
          {visible("insights") && (
            <section className="panel insights-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-icon violet">
                    <Brain size={17} />
                  </span>
                  <div>
                    <h3>AI productivity insights</h3>
                    <p>User-triggered, aggregate-only reflection</p>
                  </div>
                </div>
                <button
                  className="quiet-button"
                  onClick={() => void generateInsights()}
                  disabled={insightStatus === "loading"}
                >
                  {insightStatus === "loading" ? (
                    <LoaderCircle className="spin" size={15} />
                  ) : (
                    <>
                      <Sparkles size={15} /> {insight ? "Refresh" : "Generate"}
                    </>
                  )}
                </button>
              </div>
              <p className="insight-privacy-note">
                Uses only counts and browser-status aggregates. It excludes note
                text, quick-link labels and URLs, GitHub usernames, and account
                data.
              </p>
              {insightStatus === "error" ? (
                <Empty
                  title="Insights unavailable"
                  copy={insightError ?? "The local AI service did not respond."}
                />
              ) : insightStatus === "loading" && !insight ? (
                <div className="insight-loading" role="status" aria-live="polite">
                  <div className="insight-loading-heading"><LoaderCircle className="spin" size={18} /><strong>Analyzing privacy-minimized signals</strong></div>
                  <p>The model is preparing a bounded reflection from aggregate dashboard counts.</p>
                  <div className="insight-skeleton-lines" aria-hidden="true"><span /><span /><span /></div>
                </div>
              ) : insight ? (
                <div className={`insight-result ${insightStatus === "loading" ? "is-refreshing" : ""}`}>
                  {insightStatus === "loading" && <div className="insight-refresh-banner" role="status"><LoaderCircle className="spin" size={14} />Refreshing while the current reflection remains visible.</div>}
                  <p className="insight-summary">{insight.summary}</p>
                  <div className="insight-patterns">
                    {insight.patterns.map((pattern) => (
                      <span key={pattern}>
                        {pattern}
                      </span>
                    ))}
                  </div>
                  {insight.suggestions.map((item) => (
                    <article key={item.title} className="insight-suggestion">
                      <strong>{item.title}</strong>
                      <p>{item.action}</p>
                      <small>{item.why}</small>
                    </article>
                  ))}
                  <p className="insight-boundary">
                    <strong>Boundary.</strong> {insight.boundary}{" "}
                    <em>{insight.model}</em>
                  </p>
                </div>
              ) : (
                <Empty
                  title="Generate a focused reflection"
                  copy="Choose Generate when you want suggestions based on the dashboard’s privacy-minimized aggregate signals."
                />
              )}
            </section>
          )}
          {visible("github") && (
            <section className="panel github-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-icon violet">
                    <Github size={17} />
                  </span>
                  <div>
                    <h3>GitHub activity</h3>
                    <p>Optional public account feed</p>
                  </div>
                </div>
                <button
                  className="quiet-button"
                  onClick={() => void refreshGithub()}
                  disabled={githubStatus === "loading"}
                >
                  {githubStatus === "loading" ? (
                    <LoaderCircle className="spin" size={15} />
                  ) : (
                    "Refresh"
                  )}
                </button>
              </div>
              <div className="integration-row">
                <input
                  value={config.githubUsername}
                  onChange={(event) =>
                    updateConfig({
                      ...config,
                      githubUsername: event.target.value,
                    })
                  }
                  placeholder="GitHub username (optional)"
                  aria-label="GitHub username"
                />
                <button
                  className="compact-button"
                  onClick={() => void refreshGithub()}
                >
                  Load
                </button>
              </div>
              {githubStatus === "error" ? (
                <Empty
                  title="Activity unavailable"
                  copy="The public GitHub API did not respond. Your dashboard still works offline."
                />
              ) : githubActivity.length ? (
                <ul className="activity-list">
                  {githubActivity.map((item) => (
                    <li key={item.id}>
                      <Github size={15} />
                      <span>
                        <strong>{item.type.replace("Event", "")}</strong>
                        <small>{item.repo}</small>
                      </span>
                      <time>
                        {new Intl.DateTimeFormat("en", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(item.createdAt))}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty
                  title="Connect a public feed"
                  copy="Enter a GitHub username to load recent public activity. No token is required."
                />
              )}
            </section>
          )}
          {visible("notes") && (
            <section className="panel notes-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-icon amber">
                    <FileText size={17} />
                  </span>
                  <div>
                    <h3>Notes</h3>
                    <p>Saved only in this browser</p>
                  </div>
                </div>
                <CheckCircle2 size={18} className="saved" />
              </div>
              <textarea
                value={config.notes}
                onChange={(event) =>
                  updateConfig({ ...config, notes: event.target.value })
                }
                aria-label="Personal notes"
              />
              <p className="autosave">Autosaved locally</p>
            </section>
          )}
          {visible("links") && (
            <section className="panel links-panel">
              <div className="panel-heading">
                <div>
                  <span className="panel-icon cyan">
                    <Link2 size={17} />
                  </span>
                  <div>
                    <h3>Quick links</h3>
                    <p>Small routes into your day</p>
                  </div>
                </div>
              </div>
              <div className="quick-links">
                {config.quickLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`quick-link ${link.accent}`}
                  >
                    <span>{link.label.slice(0, 1)}</span>
                    <strong>{link.label}</strong>
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
        {visible("clock") && (
          <section className="focus-card">
            <div>
              <p className="eyebrow">STATUS</p>
              <h2>
                {snapshot?.online
                  ? "Everything essential is within reach."
                  : "Offline mode keeps your personal dashboard available."}
              </h2>
              <p>
                System widgets use clearly labelled browser estimates. AI
                suggestions are optional and only use aggregate signals when you
                explicitly request them.
              </p>
            </div>
            <div className="focus-orb">
              <span>{new Date(now).getDate()}</span>
              <small>
                {new Intl.DateTimeFormat("en", { month: "short" }).format(now)}
              </small>
            </div>
          </section>
        )}
      </main>
      {showSettings && (
        <div
          className="modal-wrap"
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard settings"
        >
          <div className="modal">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">PERSONALIZE</p>
                <h2>Widget settings</h2>
                <p>
                  Enable, disable, or reorder independently registered widgets.
                </p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>
            <fieldset className="accent-picker">
              <legend>Accent color</legend>
              <p>Choose the shared highlight color for both light and dark modes.</p>
              <div role="radiogroup" aria-label="Dashboard accent color" className="accent-options">
                {DASHBOARD_ACCENTS.map(accent => (
                  <button
                    key={accent}
                    type="button"
                    className={`accent-option ${accent} ${config.accent === accent ? "selected" : ""}`}
                    onClick={() => updateConfig({ ...config, accent })}
                    role="radio"
                    aria-checked={config.accent === accent}
                  >
                    <span aria-hidden="true" />{accentLabels[accent]}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="widget-settings">
              {config.widgets.map((widget, index) => {
                const plugin = registry.get(widget.id);
                return (
                  <div key={widget.id} className="widget-setting">
                    <div>
                      <strong>{plugin?.name ?? widget.id}</strong>
                      <span>{plugin?.description}</span>
                    </div>
                    <div className="setting-actions">
                      <button
                        onClick={() =>
                          updateConfig(moveWidget(config, widget.id, "up"))
                        }
                        disabled={index === 0}
                        aria-label="Move widget up"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        onClick={() =>
                          updateConfig(moveWidget(config, widget.id, "down"))
                        }
                        disabled={index === config.widgets.length - 1}
                        aria-label="Move widget down"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={widget.enabled}
                          onChange={() =>
                            updateConfig(toggleWidget(config, widget.id))
                          }
                        />
                        <span />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="modal-footer">
              <button className="quiet-button" onClick={downloadConfig}>
                <Download size={15} /> Export configuration
              </button>
              <button
                className="quiet-button"
                onClick={() => importRef.current?.click()}
              >
                <Upload size={15} /> Import configuration
              </button>
              <input
                ref={importRef}
                type="file"
                accept="application/json"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importConfig(file);
                  event.currentTarget.value = "";
                }}
              />
              <button
                className="compact-button"
                onClick={() => {
                  updateConfig(defaultConfig());
                  localStorage.removeItem(CONFIG_STORAGE_KEY);
                }}
              >
                Reset demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
