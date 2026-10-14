import { z } from 'zod';
export const Platform = z.enum(['twitch', 'kick']);
export const MatchMode = z.enum(['duel', 'ffa3', 'ffa4', 'teams2v2']);
export const GameAction = z.object({
  eventId: z.string().min(1).max(128),
  matchId: z.string().uuid(),
  playerId: z.string().uuid(),
  platform: Platform,
  type: z.enum(['vote', 'spawn', 'shield', 'hazard']),
  payload: z.record(z.unknown()).default({}),
  issuedAt: z.number().int().nonnegative()
});
export type GameAction = z.infer<typeof GameAction>;
