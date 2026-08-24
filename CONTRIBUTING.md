# Contributing

Contributions should preserve the dashboard’s local-first and clearly labeled data model. New widgets must register through `WidgetRegistry`, use a unique supported identifier, work when disabled, and document whether their values are browser estimates, local-bridge measurements, demo data, or external data.

| Change | Required checks |
|---|---|
| Widget plugin | Add registration and enable/disable coverage. |
| Configuration behavior | Validate import/export and persistence fallback paths. |
| External integration | Fail gracefully, omit credentials from source control, and document its data boundary. |
| UI work | Confirm responsive, loading, offline, and error states. |

Use pnpm, keep commits focused, and run `pnpm test`, `pnpm check`, and `pnpm build` before opening a pull request. Never commit `.env` files, API keys, tokens, exported personal configuration, or sensitive notes.
