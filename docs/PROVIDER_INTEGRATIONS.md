# Twitch and Kick integration contract

All externally delivered events are untrusted. Never send raw provider payloads directly into a match Durable Object.

1. Validate transport signature against provider-specific current documentation and secrets.
2. Validate timestamp freshness and reject event IDs already processed within retention window.
3. Verify creator identity and active match ownership; enforce subscriptions and scopes.
4. Normalize to `ProviderEvent` with strict Zod parsing.
5. Map verified events to capped effects with `mapVerifiedEvent`.
6. Apply global and per-creator cooldowns, replay prevention, and moderation.
7. Record idempotency before affecting authoritative state.

**Current state:** schema and pure mapping implemented. There are no production provider webhook handlers yet. The `mapVerifiedEvent` function is intentionally not exposed as a public API route. It must not be used on client-submitted payloads. Actual platform-specific pricing/value semantics need review before any monetized effect is enabled.
