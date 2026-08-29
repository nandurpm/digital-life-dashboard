/*
 * ============================================================
 * FILE: run-local.mjs
 * PURPOSE: Validates local run modes and ports, then launches the Vite development server, preview server, or production Node server.
 * ============================================================
 */

import { spawn } from "node:child_process";

const mode = process.argv[2] ?? "dev";
const args = process.argv.slice(3);
const suppliedPort = args.find(arg => arg.startsWith("--port="))?.split("=")[1]
  ?? args[args.indexOf("--port") + 1];
const port = suppliedPort && !suppliedPort.startsWith("--") ? suppliedPort : process.env.PORT ?? "5173";

if (!Number.isInteger(Number(port)) || Number(port) < 1 || Number(port) > 65535) {
  throw new Error("Provide a valid port with --port=5173 or PORT=5173.");
}
if (mode !== "dev" && mode !== "preview" && mode !== "start") throw new Error("Use 'dev', 'preview', or 'start'.");

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const commandArgs = mode === "preview" ? ["exec", "vite", "preview", "--host", "127.0.0.1", "--port", port] : ["exec", "node", "server.mjs"];
const child = spawn(pnpmCommand, commandArgs, { stdio: "inherit", env: { ...process.env, NODE_ENV: mode === "start" ? "production" : "development", PORT: port } });
child.on("exit", code => process.exit(code ?? 0));
