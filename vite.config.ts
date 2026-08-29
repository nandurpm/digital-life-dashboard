/*
 * ============================================================
 * FILE: vite.config.ts
 * PURPOSE: Configures the React Vite build and the Node-based Vitest test suite.
 * ============================================================
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
