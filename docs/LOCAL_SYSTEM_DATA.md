# Local System Data Boundaries

Digital Life Dashboard starts in a browser-only mode. This is deliberately portable and safe, but browsers expose a limited set of system signals.

| Signal | Browser mode | Local bridge option |
|---|---|---|
| Clock and date | Directly available. | Not needed. |
| CPU | Hardware concurrency only; this is a capability count, not current utilization. | A user-authorized bridge can provide current OS CPU utilization. |
| RAM | Device memory and JavaScript heap estimates when the browser supports them. | A bridge can provide OS memory utilization. |
| Disk | Site storage quota/usage, not full device disk capacity. | A bridge can provide disk usage for authorized volumes. |
| Network | Browser online/offline state. | A bridge can expose selected interface information. |
| Temperature | Not available in browser mode. | A bridge can expose supported sensor data. |

All browser-mode widgets show their source in the interface. Do not treat browser estimates as diagnostics or capacity planning data. Any local bridge should bind only to localhost, require explicit user authorization, and avoid exposing raw host information to third-party services.
