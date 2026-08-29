/*
 * ============================================================
 * FILE: main.tsx
 * PURPOSE: Bootstraps React in strict mode and mounts the dashboard application into the browser document.
 * ============================================================
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
