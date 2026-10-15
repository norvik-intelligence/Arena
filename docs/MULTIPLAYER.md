# Multiplayer demo

Run `pnpm install`, `pnpm --filter @crossstream/worker dev`, and `pnpm --filter @crossstream/web dev` in separate terminals.

1. Create lobby. Creator receives an ownerToken (kept in the current browser session only).
2. Each participant joins with a display name and receives a demo ticket.
3. Browser opens a WebSocket using the demo ticket; inputs are sent at 20 Hz.
4. Match owner starts when at least two participants have joined.
5. Durable Object simulates movement and tiles at 30 Hz, broadcasts authoritative snapshots.

## Security limitations

This is a **development-only** demonstration. Identity is self-declared, and the join route is unauthenticated. Tickets are bearer secrets in a WebSocket query parameter and can be exposed in proxy logs. They must be replaced by short-lived, one-time, scoped authenticated tickets before production. Lobby creation and join endpoints are not rate-limited. The 30 Hz loop uses a runtime interval and is not crash-recovery-safe; add durable alarms and recovery semantics. Snapshot writes every tick are not cost-optimized. Do not connect monetary events or publish the demo endpoints on a public production domain.

## Production TODO
OAuth, origin allowlist, signed join tokens, ticket rotation, spectator permissions, reconnect and disconnect handling, idle room expiry, tick scheduling and persistence strategy, anti-abuse, load tests and observability.

## OBS spectator prototype

Create a demo lobby and copy the **OBS spectator browser source** URL. Add it in OBS as a Browser Source at 1280 × 720 (or use a custom canvas size). The URL uses `?overlay=<lobby UUID>` and contains no creator ticket. The current spectator polls the public lobby state every 250 ms; it is not an optimized production transport and should be replaced with an authenticated, read-only broadcast feed. Because the lobby is publicly addressable by UUID, do not put private information in its public state. The view is intended for development, not for production monetized streams.
