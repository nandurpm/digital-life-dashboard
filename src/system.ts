import type { SystemSnapshot } from "./types";

type ExtendedNavigator = Navigator & { deviceMemory?: number };
type ExtendedPerformance = Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } };

export async function getBrowserSystemSnapshot(): Promise<SystemSnapshot> {
  const nav = navigator as ExtendedNavigator;
  const perf = performance as ExtendedPerformance;
  const estimate = navigator.storage?.estimate ? await navigator.storage.estimate() : undefined;
  const usage = estimate?.usage;
  const quota = estimate?.quota;
  const memoryUsedPercent = perf.memory?.jsHeapSizeLimit ? Math.round((perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit) * 100) : null;
  return {
    observedAt: Date.now(),
    runtime: "browser",
    cpuCores: navigator.hardwareConcurrency ?? null,
    memoryGiB: nav.deviceMemory ?? null,
    memoryUsedPercent,
    storageUsedGiB: usage ? Number((usage / 1024 ** 3).toFixed(2)) : null,
    storageQuotaGiB: quota ? Number((quota / 1024 ** 3).toFixed(2)) : null,
    online: navigator.onLine,
    temperatureC: null,
    supportNotes: ["Browser-provided estimates only. CPU usage and temperature require an optional local system bridge."],
  };
}
