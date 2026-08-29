/*
 * ============================================================
 * FILE: api.ts
 * PURPOSE: Fetches and normalizes an optional user's recent public GitHub activity without requiring credentials.
 * ============================================================
 */

import type { GitHubActivity } from "./types";

export async function fetchGitHubActivity(username: string, fetcher: typeof fetch = fetch): Promise<GitHubActivity[]> {
  if (!username.trim()) return [];
  const response = await fetcher(`https://api.github.com/users/${encodeURIComponent(username.trim())}/events/public?per_page=5`, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`GitHub activity is unavailable (${response.status}).`);
  const payload = await response.json() as Array<{ id?: string; type?: string; repo?: { name?: string }; created_at?: string }>;
  return payload.map(item => ({ id: item.id ?? crypto.randomUUID(), type: item.type ?? "Activity", repo: item.repo?.name ?? "Unknown repository", createdAt: item.created_at ?? new Date().toISOString() }));
}
