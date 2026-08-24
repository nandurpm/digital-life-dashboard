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
