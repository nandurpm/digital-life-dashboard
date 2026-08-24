# AI Productivity Insights

The **AI productivity insights** widget is optional and runs only after a user presses **Generate** or **Refresh**. It uses the currently available `gpt-5-mini` model and is intended to suggest small, practical workflow experiments rather than diagnose a person, predict behavior, or assess health.

| Sent to the model | Explicitly excluded |
|---|---|
| Note character count | Note text |
| Number of quick links | Link labels and URLs |
| Count and type totals for loaded public activity | GitHub username, repository names, and event identifiers |
| Online/offline state, supported browser-signal count, and runtime label | Device name, raw browser storage values, temperature, and system support notes |

The backend validates the model output into a short summary, up to three patterns, up to three suggestions, and a boundary statement. If the model is not configured or available, the widget displays a recoverable error and leaves the rest of the local dashboard usable.

## Local use

The managed environment supplies its server-side model credentials automatically. For a portable local installation, the dashboard works without any secret, while the AI widget requires optional environment variables. Copy `.env.example` to an uncommitted `.env` file and configure an OpenAI-compatible server endpoint and key for your own deployment; the local Node server loads this file before it handles requests. Use `pnpm dev:local` while developing or `pnpm build && pnpm start:local` for the complete optimized local server. Static `preview:local` does not provide AI insights. Never put a real key in notes, exported dashboard configuration, or source control.
