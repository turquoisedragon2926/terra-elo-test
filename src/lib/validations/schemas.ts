import { z } from 'zod';

// Time category schema
export const timeCategorySchema = z.enum(['5min', '10min']);

// Result schema
export const resultSchema = z.enum(['white_win', 'black_win', 'draw']);

// Match creation schema
export const createMatchSchema = z
  .object({
    timeCategory: timeCategorySchema,
    whitePlayerId: z.string().uuid('Invalid white player ID'),
    blackPlayerId: z.string().uuid('Invalid black player ID'),
    result: resultSchema,
    playedAt: z.coerce.date(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.whitePlayerId !== data.blackPlayerId, {
    message: 'White and black players must be different',
    path: ['blackPlayerId'],
  });

// Player creation schema
export const createPlayerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

// Query parameter schemas
export const playerQuerySchema = z.object({
  timeCategory: timeCategorySchema.optional(),
});

export const matchesQuerySchema = z.object({
  timeCategory: timeCategorySchema.optional(),
  playerId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

// Type exports for convenience
export type TimeCategory = z.infer<typeof timeCategorySchema>;
export type Result = z.infer<typeof resultSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type PlayerQueryInput = z.infer<typeof playerQuerySchema>;
export type MatchesQueryInput = z.infer<typeof matchesQuerySchema>;
