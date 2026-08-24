# Theme and AI Loading Experience

Digital Life Dashboard now exposes an accessible theme control in the overview header. The setting is stored locally under `digital-life-dashboard-theme`, applies a light or dark color scheme to the dashboard, and respects the operating-system preference only when no saved choice exists.

The AI productivity-insights widget has an explicit loading state that announces aggregate-only analysis, uses a short shimmer treatment for placeholder lines, and keeps the previous validated insight visible during a refresh. The animations honor `prefers-reduced-motion`.

## Local visual verification

On 2026-08-24, the app was opened from `http://127.0.0.1:4320`. The overview, visible **Switch to dark mode** control, responsive dashboard cards, and the empty AI insight panel all rendered successfully. The local page exposed the Generate control and the aggregate-only privacy disclosure before an insight was requested.
