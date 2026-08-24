import type { GitHubActivity, ProductivityInsight, SystemSnapshot } from "./types";

export type InsightInput = {
  noteCharacterCount: number;
  quickLinkCount: number;
  publicActivityCount: number;
  publicActivityTypes: Record<string, number>;
  online: boolean | null;
  systemRuntime: SystemSnapshot["runtime"] | null;
  systemSignalCount: number;
};

export function prepareInsightInput(config: { notes: string; quickLinks: unknown[] }, snapshot: SystemSnapshot | null, activity: GitHubActivity[]): InsightInput {
  const publicActivityTypes = activity.reduce<Record<string, number>>((result, item) => {
    result[item.type] = (result[item.type] ?? 0) + 1;
    return result;
  }, {});
  const systemSignalCount = snapshot ? [snapshot.cpuCores, snapshot.memoryGiB, snapshot.storageQuotaGiB, snapshot.temperatureC].filter(value => value !== null).length : 0;
  return {
    noteCharacterCount: config.notes.trim().length,
    quickLinkCount: config.quickLinks.length,
    publicActivityCount: activity.length,
    publicActivityTypes,
    online: snapshot?.online ?? null,
    systemRuntime: snapshot?.runtime ?? null,
    systemSignalCount,
  };
}

export function parseProductivityInsight(value: unknown): ProductivityInsight {
  if (!value || typeof value !== "object") throw new Error("AI insights returned an invalid response.");
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.summary !== "string" || typeof candidate.boundary !== "string" || typeof candidate.model !== "string" || !Array.isArray(candidate.patterns) || !Array.isArray(candidate.suggestions)) throw new Error("AI insights returned an incomplete response.");
  if (!candidate.patterns.every(item => typeof item === "string") || candidate.patterns.length > 3 || candidate.suggestions.length > 3) throw new Error("AI insights returned an invalid insight list.");
  const suggestions = candidate.suggestions.map(item => {
    if (!item || typeof item !== "object") throw new Error("AI insights returned an invalid suggestion.");
    const suggestion = item as Record<string, unknown>;
    if (typeof suggestion.title !== "string" || typeof suggestion.action !== "string" || typeof suggestion.why !== "string") throw new Error("AI insights returned an incomplete suggestion.");
    return { title: suggestion.title, action: suggestion.action, why: suggestion.why };
  });
  return { summary: candidate.summary, patterns: candidate.patterns as string[], suggestions, boundary: candidate.boundary, model: candidate.model };
}

export async function requestProductivityInsights(input: InsightInput, fetcher: typeof fetch = fetch): Promise<ProductivityInsight> {
  const response = await fetcher("/api/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "AI insights are temporarily unavailable.");
  return parseProductivityInsight(body);
}
