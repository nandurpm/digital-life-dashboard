import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowDown, ArrowUp, CheckCircle2, ChevronRight, CloudOff, Cpu, Download, ExternalLink, FileText, Github, HardDrive, LayoutDashboard, Link2, LoaderCircle, MemoryStick, Moon, Network, Plus, Settings2, Sun, Thermometer, Upload, Wifi, X, Zap } from "lucide-react";
import { defaultConfig, isWidgetEnabled, moveWidget, toggleWidget, validateConfig } from "./config";
import { fetchGitHubActivity } from "./api";
import { getBrowserSystemSnapshot } from "./system";
import { CONFIG_STORAGE_KEY, loadConfig, saveConfig } from "./storage";
import { createCoreRegistry } from "./widgets";
import type { DashboardConfig, GitHubActivity, SystemSnapshot, WidgetId } from "./types";

const registry = createCoreRegistry();

function prettyTime(value: number) {
  return new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }).format(value);
}

function Metric({ icon: Icon, label, value, hint, tone = "cyan" }: { icon: typeof Cpu; label: string; value: string; hint: string; tone?: "cyan" | "violet" | "amber" | "emerald" }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}><Icon size={18} /></span><div><p>{label}</p><strong>{value}</strong><small>{hint}</small></div></article>;
}

function Empty({ title, copy }: { title: string; copy: string }) {
  return <div className="empty"><CloudOff size={22} /><strong>{title}</strong><span>{copy}</span></div>;
}

export default function App() {
  const [config, setConfig] = useState<DashboardConfig>(() => loadConfig(localStorage, defaultConfig()));
  const [now, setNow] = useState(Date.now());
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [githubActivity, setGithubActivity] = useState<GitHubActivity[]>([]);
  const [githubStatus, setGithubStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [showSettings, setShowSettings] = useState(false);
  const [dark, setDark] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const enabledWidgets = useMemo(() => config.widgets.filter(widget => widget.enabled), [config]);
  const updateConfig = (next: DashboardConfig) => { setConfig(next); saveConfig(localStorage, next); };

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const refresh = async () => {
      try { setSnapshotError(null); setSnapshot(await getBrowserSystemSnapshot()); }
      catch { setSnapshotError("System estimates could not be collected in this browser."); }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("online", refresh); window.removeEventListener("offline", refresh); };
  }, []);

  const refreshGithub = async () => {
    if (!config.githubUsername.trim()) { setGithubStatus("idle"); setGithubActivity([]); return; }
    setGithubStatus("loading");
    try { setGithubActivity(await fetchGitHubActivity(config.githubUsername)); setGithubStatus("ready"); }
    catch { setGithubStatus("error"); }
  };

  const downloadConfig = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "digital-life-dashboard-config.json"; anchor.click(); URL.revokeObjectURL(url);
  };

  const importConfig = async (file: File) => {
    try { updateConfig(validateConfig(JSON.parse(await file.text()))); }
    catch { alert("That configuration file is not valid for Digital Life Dashboard."); }
  };

  const visible = (id: WidgetId) => isWidgetEnabled(config, id);
  const appClass = dark ? "app dark" : "app";

  return <div className={appClass}>
    <aside className="sidebar"><div className="brand"><span className="brand-mark"><Zap size={18} /></span><div><strong>Digital Life</strong><small>Personal dashboard</small></div></div><nav><a className="active"><LayoutDashboard size={17} /> Overview</a><a onClick={() => setShowSettings(true)}><Settings2 size={17} /> Customize</a></nav><div className="sidebar-footer"><span className="runtime-dot" /> Local-first settings<br /><small>Stored in this browser</small></div></aside>
    <main className="main"><header className="topbar"><div><p className="eyebrow">YOUR DAY, AT A GLANCE</p><h1>Good {new Date(now).getHours() < 12 ? "morning" : new Date(now).getHours() < 18 ? "afternoon" : "evening"}.</h1></div><div className="top-actions"><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="settings-button" onClick={() => setShowSettings(true)}><Settings2 size={17} /> Customize</button></div></header>
      <section className="hero"><div><p className="eyebrow">LOCAL TIME</p><h2>{new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(now)}</h2><p>{prettyTime(now)}</p></div><div className="system-pill"><span className={snapshot?.online ? "status-dot online" : "status-dot offline"} /> {snapshot?.online ? "Online · browser estimates" : "Offline · settings remain available"}</div></section>
      {snapshotError && <div className="notice error"><CloudOff size={17} /> {snapshotError}</div>}
      {visible("system") && <section className="section"><div className="section-heading"><div><p className="eyebrow">SYSTEM PULSE</p><h2>What this device can share</h2></div><button className="quiet-button" onClick={() => void getBrowserSystemSnapshot().then(setSnapshot)}>Refresh <ChevronRight size={15} /></button></div><div className="metrics-grid">{snapshot ? <><Metric icon={Cpu} label="CPU capability" value={snapshot.cpuCores ? `${snapshot.cpuCores} cores` : "Unavailable"} hint="Usage requires local bridge" /><Metric icon={MemoryStick} label="Memory" value={snapshot.memoryGiB ? `${snapshot.memoryGiB} GB` : "Unavailable"} hint={snapshot.memoryUsedPercent ? `${snapshot.memoryUsedPercent}% JS heap used` : "Browser estimate"} tone="violet" /><Metric icon={HardDrive} label="Storage" value={snapshot.storageQuotaGiB ? `${snapshot.storageUsedGiB ?? 0} / ${snapshot.storageQuotaGiB} GB` : "Unavailable"} hint="Browser site storage quota" tone="amber" /><Metric icon={snapshot.online ? Wifi : Network} label="Network" value={snapshot.online ? "Connected" : "Offline"} hint="Network state only" tone="emerald" /><Metric icon={Thermometer} label="Temperature" value={snapshot.temperatureC ? `${snapshot.temperatureC}°C` : "Optional"} hint="Requires local bridge" tone="amber" /></> : <><Metric icon={Cpu} label="System status" value="Loading" hint="Collecting browser estimates" /><Metric icon={MemoryStick} label="Memory" value="—" hint="Waiting for browser support" tone="violet" /><Metric icon={HardDrive} label="Storage" value="—" hint="Waiting for browser support" tone="amber" /></>}</div><p className="support-note"><Activity size={14} /> {snapshot?.supportNotes[0] ?? "Browser system information is loading."}</p></section>}
      <div className="dashboard-grid">{visible("github") && <section className="panel github-panel"><div className="panel-heading"><div><span className="panel-icon violet"><Github size={17} /></span><div><h3>GitHub activity</h3><p>Optional public account feed</p></div></div><button className="quiet-button" onClick={() => void refreshGithub()} disabled={githubStatus === "loading"}>{githubStatus === "loading" ? <LoaderCircle className="spin" size={15} /> : "Refresh"}</button></div><div className="integration-row"><input value={config.githubUsername} onChange={event => updateConfig({ ...config, githubUsername: event.target.value })} placeholder="GitHub username (optional)" aria-label="GitHub username" /><button className="compact-button" onClick={() => void refreshGithub()}>Load</button></div>{githubStatus === "error" ? <Empty title="Activity unavailable" copy="The public GitHub API did not respond. Your dashboard still works offline." /> : githubActivity.length ? <ul className="activity-list">{githubActivity.map(item => <li key={item.id}><Github size={15} /><span><strong>{item.type.replace("Event", "")}</strong><small>{item.repo}</small></span><time>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(item.createdAt))}</time></li>)}</ul> : <Empty title="Connect a public feed" copy="Enter a GitHub username to load recent public activity. No token is required." />}</section>}
        {visible("notes") && <section className="panel notes-panel"><div className="panel-heading"><div><span className="panel-icon amber"><FileText size={17} /></span><div><h3>Notes</h3><p>Saved only in this browser</p></div></div><CheckCircle2 size={18} className="saved" /></div><textarea value={config.notes} onChange={event => updateConfig({ ...config, notes: event.target.value })} aria-label="Personal notes" /><p className="autosave">Autosaved locally</p></section>}
        {visible("links") && <section className="panel links-panel"><div className="panel-heading"><div><span className="panel-icon cyan"><Link2 size={17} /></span><div><h3>Quick links</h3><p>Small routes into your day</p></div></div></div><div className="quick-links">{config.quickLinks.map(link => <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className={`quick-link ${link.accent}`}><span>{link.label.slice(0, 1)}</span><strong>{link.label}</strong><ExternalLink size={14} /></a>)}</div></section>}
      </div>
      {visible("clock") && <section className="focus-card"><div><p className="eyebrow">STATUS</p><h2>{snapshot?.online ? "Everything essential is within reach." : "Offline mode keeps your personal dashboard available."}</h2><p>System widgets use clearly labeled browser estimates. A future local bridge can add OS-level CPU usage, disk state, and temperature without changing the widget API.</p></div><div className="focus-orb"><span>{new Date(now).getDate()}</span><small>{new Intl.DateTimeFormat("en", { month: "short" }).format(now)}</small></div></section>}
    </main>
    {showSettings && <div className="modal-wrap" role="dialog" aria-modal="true" aria-label="Dashboard settings"><div className="modal"><div className="modal-heading"><div><p className="eyebrow">PERSONALIZE</p><h2>Widget settings</h2><p>Enable, disable, or reorder independently registered widgets.</p></div><button className="icon-button" onClick={() => setShowSettings(false)} aria-label="Close settings"><X size={18} /></button></div><div className="widget-settings">{config.widgets.map((widget, index) => { const plugin = registry.get(widget.id); return <div key={widget.id} className="widget-setting"><div><strong>{plugin?.name ?? widget.id}</strong><span>{plugin?.description}</span></div><div className="setting-actions"><button onClick={() => updateConfig(moveWidget(config, widget.id, "up"))} disabled={index === 0} aria-label="Move widget up"><ArrowUp size={15} /></button><button onClick={() => updateConfig(moveWidget(config, widget.id, "down"))} disabled={index === config.widgets.length - 1} aria-label="Move widget down"><ArrowDown size={15} /></button><label className="switch"><input type="checkbox" checked={widget.enabled} onChange={() => updateConfig(toggleWidget(config, widget.id))} /><span /></label></div></div>; })}</div><div className="modal-footer"><button className="quiet-button" onClick={downloadConfig}><Download size={15} /> Export configuration</button><button className="quiet-button" onClick={() => importRef.current?.click()}><Upload size={15} /> Import configuration</button><input ref={importRef} type="file" accept="application/json" hidden onChange={event => { const file = event.target.files?.[0]; if (file) void importConfig(file); event.currentTarget.value = ""; }} /><button className="compact-button" onClick={() => { updateConfig(defaultConfig()); localStorage.removeItem(CONFIG_STORAGE_KEY); }}>Reset demo</button></div></div></div>}
  </div>;
}
