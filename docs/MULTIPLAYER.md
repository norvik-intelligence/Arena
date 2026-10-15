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
