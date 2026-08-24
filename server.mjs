import { createServer } from "node:http";
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT ?? 5173);
const isProduction = process.env.NODE_ENV === "production";
const contentTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function extractText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(extractText).join("\n");
  if (!value || typeof value !== "object") return "";
  return typeof value.text === "string" ? value.text : extractText(value.content);
}

async function bodyJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) throw new Error("Insight input is too large.");
  }
  return JSON.parse(raw || "{}");
}

async function createInsights(input) {
  const apiUrl = process.env.AI_API_URL ?? process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.AI_API_KEY ?? process.env.BUILT_IN_FORGE_API_KEY;
  if (!apiUrl || !apiKey) throw new Error("AI insights are unavailable in this local run because no server-side model credential is configured.");
  const schema = { name: "productivity_insights", strict: true, schema: { type: "object", properties: { summary: { type: "string" }, patterns: { type: "array", items: { type: "string" }, maxItems: 3 }, suggestions: { type: "array", items: { type: "object", properties: { title: { type: "string" }, action: { type: "string" }, why: { type: "string" } }, required: ["title", "action", "why"], additionalProperties: false }, maxItems: 3 }, boundary: { type: "string" } }, required: ["summary", "patterns", "suggestions", "boundary"], additionalProperties: false } };
  const response = await fetch(`${apiUrl}/v1/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-5-mini", max_completion_tokens: 900, response_format: { type: "json_schema", json_schema: schema }, messages: [{ role: "system", content: "Give practical, non-medical productivity suggestions based only on aggregate dashboard signals. Do not infer identity, personal habits, health, mental state, or private content. Do not claim causality. Return concise JSON only." }, { role: "user", content: `Analyze these privacy-minimized dashboard aggregates: ${JSON.stringify(input)}` }] }) });
  if (!response.ok) throw new Error("The AI insight service did not respond successfully.");
  const payload = await response.json();
  const text = extractText(payload.choices?.[0]?.message?.content);
  if (!text) throw new Error("The AI insight service returned no visible result.");
  return { ...JSON.parse(text), model: "gpt-5-mini" };
}

async function route(req, res) {
  if (req.method === "POST" && new URL(req.url, "http://localhost").pathname === "/api/insights") {
    try { json(res, 200, await createInsights(await bodyJson(req))); }
    catch (error) { json(res, 503, { error: error instanceof Error ? error.message : "AI insights are temporarily unavailable." }); }
    return true;
  }
  return false;
}

const app = createServer(async (req, res) => {
  if (await route(req, res)) return;
  const requestPath = new URL(req.url, "http://localhost").pathname;
  const safePath = normalize(requestPath).replace(/^([.][.][/\\])+/, "");
  const target = requestPath.includes(".") ? join(process.cwd(), "dist", safePath) : join(process.cwd(), "dist", "index.html");
  try { const content = await readFile(target); res.writeHead(200, { "Content-Type": contentTypes[extname(target)] ?? "application/octet-stream" }); res.end(content); }
  catch { res.writeHead(404); res.end("Not found"); }
});

if (!isProduction) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
  app.removeAllListeners("request");
  app.on("request", async (req, res) => {
    if (await route(req, res)) return;
    vite.middlewares(req, res);
  });
}

app.listen(port, "127.0.0.1", () => console.log(`Digital Life Dashboard running at http://127.0.0.1:${port}`));
