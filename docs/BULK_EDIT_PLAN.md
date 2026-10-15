# CrossStream Arena — Bulk Edit Execution Plan

## Batch A — Multiplayer correctness and quality
- [x] Shared match simulation and 2–4 player capacity
- [x] Browser WebSocket multiplayer client and start action
- [x] Regression tests for match simulation
- [ ] Verified green CI and real 2–4 browser end-to-end session
- [ ] Crash-safe tick scheduling and disconnect/rejoin

## Batch B — Identity and platform adapters
- [ ] Twitch OAuth with state/PKCE, token refresh, account binding
- [ ] Kick OAuth and account binding
- [ ] Twitch EventSub signature, replay prevention and lifecycle
- [ ] Kick webhook signature, replay prevention and lifecycle
- [ ] Idempotent normalized event processing

## Batch C — Gameplay and streaming
- [ ] Match start countdown, team assignment and victory logic for 2v2
- [ ] Mobile input, reconnect, spectator mode and OBS browser source
- [ ] Configurable capped viewer effects and moderation
- [ ] Accessibility and telemetry

## Batch D — Production gates
- [ ] Security review, rate limiting, privacy, retention, incident playbook
- [ ] Integration and load tests
- [ ] Deployment staging and production smoke tests

Current status: source changes are committed, not verified by CI or deployment. Demo identity is not production authentication.
