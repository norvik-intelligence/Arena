# CrossStream Arena — Platform Expansion Blueprint

## Product principle
One authoritative match, multiple creators and communities, platform-native monetization. Twitch and Kick are the initial identity and event providers. Do not pretend to support platforms without verified official APIs and permission.

## Integration layers

1. **Identity adapters** — Twitch/Kick OAuth, account linking, refresh, revocation and creator roles. No self-declared production identity.
2. **Event adapters** — Verify provider signatures and timestamp, prevent replay, normalize to the strict `ProviderEvent` schema. Platform-specific currency and gifting semantics must not be treated as interchangeable.
3. **Effect policy** — Creator-controlled opt-in, per-match allowlist, budget and cooldown, moderation and a hard cap. The existing pure mapping is not a live paid-event integration.
4. **Game SDK** — Each game exports deterministic tick reducer, action schema, game-state schema, start/end rules, spectator projection and tests. No direct provider network calls inside games.
5. **Broadcast** — Read-only OBS/browser source, overlay presets, delayed spectator feeds, moderation controls and caption-friendly status.
6. **Analytics** — Privacy-conscious match summaries, latency, disconnects, event delivery and game balance. No raw chat retention by default.

## Differentiating game concepts (proposed, not built)

- **Community Alliance**: two creators combine communities against a shared cooperative boss.
- **Arena Director**: verified viewer events vote on hazards; cooldown and fairness budget prevent pay-to-win.
- **Cross-Channel Tournament**: bracket management and match handoffs across Twitch and Kick.
- **Rivalry Seasons**: opt-in creator leagues with verifiable results and abuse-resistant leaderboards.
- **Creator Game Studio**: a constrained game SDK enabling new games without changing provider adapters.
- **Stream-Safe Replay**: reproducible authoritative match replays for highlights.

## Current implementation boundary
- Done in source: lobby, demo tickets, multiplayer simulation, preliminary 2v2 victory, read-only OBS spectator view, strict provider-event schema.
- Unverified: browser integration, build and CI, runtime performance and OBS behavior.
- Not built: production OAuth/webhooks, idempotent event ingestion, game SDK, tournament service, real-time spectator WebSocket, privacy operations, anti-fraud and replay service.

## Release gates
1. Green typecheck, tests and build.
2. Multi-browser smoke test across all match formats.
3. Load and recovery tests of Durable Object simulation.
4. Provider-approved OAuth and signed event flows.
5. Abuse, privacy and security review.
6. Staging validation before production deployment.
