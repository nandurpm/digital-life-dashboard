# Digital Life Dashboard

**Digital Life Dashboard** is a customizable, local-first personal overview for browser-supported system estimates, network state, optional public GitHub activity, notes, and quick links. It is designed to remain useful even when external services are unavailable.

| Area | What it provides |
|---|---|
| System pulse | Browser-provided CPU-core capability, device-memory estimate, site storage estimate, online/offline state, and a clearly marked optional temperature placeholder. |
| Personal tools | Persisted notes and configurable quick links stored in the active browser. |
| Widgets | Independently registered plugins that can be enabled, disabled, and reordered without modifying the dashboard shell. |
| GitHub activity | An optional public GitHub events feed that needs no token for basic use and fails into an explanatory offline state. |
| Configuration | Validated local settings with JSON import and export. |

> The browser cannot safely provide operating-system CPU utilization, full disk capacity, or device temperature in a portable way. The dashboard labels these browser estimates clearly. A future local bridge can supply additional authorized OS metrics through the same widget interface.

## Quick start

```bash
pnpm install
pnpm dev
```

The first run includes local demo notes and quick links. No credentials are committed or required. Open **Customize** to toggle widgets, reorder them, reset the demo configuration, or export/import settings.

## Local Windows and Linux use

Digital Life Dashboard runs as a portable local browser application; it does not need the hosted website. Install Node.js 20+ and pnpm, then use `./run-local.sh` on Linux or `run-local.cmd` on Windows. Both launch the dashboard at `http://127.0.0.1:5173`; add `--port=4300` to choose another port. Build with `pnpm build` and use `pnpm preview:local -- --port=4300` for a static-only preview, or `pnpm start:local -- --port=4300` for the complete optimized local server, including the optional AI endpoint. The detailed guide is available in [`docs/LOCAL_RUN.md`](docs/LOCAL_RUN.md).

No Manus production URL has been published for this project yet. When it is published, the URL will be documented here so users can choose between a managed link and the portable local app.

## AI productivity insights

The optional AI widget is **user-triggered** and uses `gpt-5-mini` to turn privacy-minimized dashboard aggregates into small productivity suggestions. It excludes notes, quick-link content, GitHub usernames and repositories, account data, and raw system details. The dashboard remains fully usable if the model is not configured. For a portable local deployment, copy [`.env.example`](.env.example) to an uncommitted `.env` file and configure your own optional AI endpoint and key; see [`docs/AI_INSIGHTS.md`](docs/AI_INSIGHTS.md).

## Theme and AI loading experience

The overview header includes a dark mode toggle. Its explicit light/dark choice is stored only in the active browser and otherwise follows the operating-system preference. The **Customize** dialog also offers a saved violet, cyan, emerald, or amber accent palette that applies in both themes; older local configurations safely retain the violet default. The AI insight widget uses a clear loading announcement and a subtle shimmer while its aggregate-only request is in progress. It keeps the last validated result visible during refresh and respects reduced-motion preferences. See [`docs/THEME_AND_ANIMATION.md`](docs/THEME_AND_ANIMATION.md) for details.

## Security and privacy

Dashboard configuration is stored under one browser-local key and remains on the device unless a user exports it. Do not put access tokens, passwords, or private URLs in notes or quick links. The optional GitHub panel requests only the selected account’s public events through GitHub’s public API and shows a recoverable error when the request fails.

| Integration mode | Credential handling |
|---|---|
| Public GitHub activity | No credential is required; the public API may be rate-limited or unavailable. |
| Future authenticated integrations | Use environment variables or a secure local bridge; never commit a token. |
| Browser system metrics | No credential is used; support depends on browser capabilities. |

## Validation

```bash
pnpm test
pnpm check
pnpm build
```

The test suite covers plugin registration, validated configuration, browser-like persistence, widget enable/disable behavior, and recoverable GitHub API failures. Additional setup details appear in [`docs/LOCAL_SYSTEM_DATA.md`](docs/LOCAL_SYSTEM_DATA.md), while a portable configuration shape appears in [`examples/config.example.json`](examples/config.example.json).

## Contributing and license

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before contributing. This repository is available under the [MIT License](LICENSE). Changes are tracked in [`CHANGELOG.md`](CHANGELOG.md).

<!-- clear-use-guide -->
## Clear use guide

### Install

Use Node.js 22 or newer, clone this repository, and install its dependencies:

```bash
git clone https://github.com/nandurpm/digital-life-dashboard.git
cd digital-life-dashboard
pnpm install
```

### Open it locally

Start the local web/report server:

```bash
pnpm start
```

Then open the URL printed by the terminal. The production report hosts use http://localhost:4080 unless a different PORT value is set. To choose another port, use PORT=5050 pnpm start on Linux/macOS or set PORT=5050 && pnpm start in Windows Command Prompt.


### Use the hosted version

**Live URL:** [https://digital-life-dashboard.onrender.com](https://digital-life-dashboard.onrender.com)

The hosted version is a browser-friendly report or application view. It runs on Render’s free tier, so the first request after inactivity can take longer while the instance starts.

### Windows and Linux

The same Node.js commands work in Windows PowerShell, Windows Command Prompt, and a Linux terminal. Use the platform-specific port command above only when you need a non-default local port.

### Important scope

This project follows its existing local-first and read-only boundaries. Demo/report content is generated or supplied through the documented local workflow; a hosted page does not provide hidden access to your device, private files, hardware, accounts, or network.

