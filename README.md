# CrossStream Arena

Browser-based cross-platform multiplayer games for 2–4 Twitch and Kick streamers.

## Monorepo
- `apps/web`: React/Vite creator interface and browser-source client.
- `apps/worker`: Cloudflare Worker and Durable Object match service.
- `packages/protocol`: shared Zod schemas.
- `docs/ARCHITECTURE.md`: security and architecture decisions.

## Local development
`corepack enable && pnpm install && pnpm --filter @crossstream/web dev`

Worker: `pnpm --filter @crossstream/worker dev`.

**Status:** Scaffold only. OAuth, signed provider event verification, match authorization, gameplay and payments are NOT implemented. Sensitive routes intentionally return 501. Do not deploy as a production service.