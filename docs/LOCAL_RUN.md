# Local and Portable Use

Digital Life Dashboard is a portable browser application that runs from its checked-out folder on **Linux** and **Windows**. It has no external backend dependency for notes, settings, quick links, or browser-based system estimates. These stay in the selected browser profile on the device.

| Task | Linux / macOS shell | Windows PowerShell or Command Prompt |
|---|---|---|
| Install dependencies | `pnpm install` | `pnpm install` |
| Run locally at port 5173 | `./run-local.sh` | `run-local.cmd` |
| Run locally at a selected port | `./run-local.sh --port=4300` | `run-local.cmd --port=4300` |
| Build optimized files | `pnpm build` | `pnpm build` |
| Preview optimized files (static only) | `pnpm preview:local -- --port=4300` | `pnpm preview:local -- --port=4300` |
| Run the complete optimized local server | `pnpm start:local -- --port=4300` | `pnpm start:local -- --port=4300` |

Use Node.js 20+ and pnpm. The launch script binds to `127.0.0.1` so the local dashboard is not exposed to the local network by default. Vite will report a nearby free port if the requested port is occupied. This makes the dashboard portable without a hosted website or native installer.

The dashboard itself runs without credentials. The optional AI widget needs your own server-side `AI_API_URL` and `AI_API_KEY` in an uncommitted local `.env` file; without them, the widget shows a recoverable unavailable state while all local-first features remain available. The local Node server loads that file. `preview:local` is static-only and does not include the AI endpoint; use `dev:local` during development or `start:local` for the complete optimized local server.

> A Manus production URL will be recorded in this file and the README if this project is published through its managed-hosting interface. No production URL has been published for Digital Life Dashboard yet.
