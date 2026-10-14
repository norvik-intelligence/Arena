# Architecture decisions

- One Cloudflare Durable Object per match for authoritative state and ordered events.
- Twitch EventSub and Kick webhooks normalize **verified** events into protocol actions.
- No shared gift wallet: creators retain platform-native payouts; Bits-in-Extensions has separate revenue sharing.
- Browser source renders shared state; streamer controls require authenticated join tickets.
- Modes: duel (2), ffa3 (3), ffa4 (4), teams2v2 (4).
- Security before production: OAuth PKCE/state, signature verification, replay prevention, idempotency, rate limits, membership, origin checks, abuse controls, secrets and telemetry.
- Paid actions must originate only from verified provider events; never trust browser-submitted purchases.
- Financial mappings must be configurable and capped; no cross-platform monetary parity assumed.
- Sensitive routes intentionally return HTTP 501 until implemented.
