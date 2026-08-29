# Src

## Purpose

Contains the production implementation of Digital Life Dashboard: command handling, domain rules, storage, reports, and local serving as applicable.

## Contents

- `api.ts` — Fetches and normalizes an optional user's recent public GitHub activity without requiring credentials.
- `App.tsx` — Composes the dashboard interface and coordinates widget settings, local persistence, public GitHub activity, browser system signals, themes, and user-triggered insights.
- `config.ts` — Defines default dashboard settings and validates, toggles, and reorders widget and quick-link configuration.
- `insights.ts` — Minimizes dashboard data into aggregate insight input, validates model responses, and calls the local insight endpoint.
- `main.tsx` — Bootstraps React in strict mode and mounts the dashboard application into the browser document.
- `storage.ts` — Provides validated dashboard-configuration persistence through browser storage or an in-memory test adapter.
- `styles.css` — Defines the dashboard's responsive layout, themes, accent variants, panels, controls, animation states, and accessibility motion fallback.
- `system.ts` — Collects the browser-exposed system, storage, memory, runtime, and network estimates displayed by the dashboard.
- `theme.ts` — Loads and saves the user's explicit light or dark theme preference with a system-preference fallback.
- `types.ts` — Defines the shared widget, configuration, GitHub activity, system snapshot, and productivity insight contracts.
- `widgets.ts` — Defines the widget plugin contract, registry, and built-in dashboard widget metadata.

## Responsibilities

Production behavior belongs here. Generated reports, user data, and repository documentation should remain outside this folder.

## Important Notes

- This folder is part of **Digital Life Dashboard** and should be kept consistent with the commands and architecture documented in the root README.
- Paths and file roles listed above reflect the current repository implementation.

