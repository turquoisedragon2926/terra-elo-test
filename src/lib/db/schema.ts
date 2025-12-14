import { pgTable, uuid, varchar, integer, timestamp, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const timeCategoryEnum = pgEnum('time_category', ['5min', '10min']);
export const resultEnum = pgEnum('result', ['white_win', 'black_win', 'draw']);

// Players Table
export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Player Ratings Table (separate row per time category)
export const playerRatings = pgTable('player_ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerId: uuid('player_id').references(() => players.id, { onDelete: 'cascade' }).notNull(),
  timeCategory: timeCategoryEnum('time_category').notNull(),
  currentElo: integer('current_elo').default(1000).notNull(),
  peakElo: integer('peak_elo').default(1000).notNull(),
  gamesPlayed: integer('games_played').default(0).notNull(),
  wins: integer('wins').default(0).notNull(),
  losses: integer('losses').default(0).notNull(),
  draws: integer('draws').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: each player can only have one rating per time category
  playerTimeCategoryUnique: unique().on(table.playerId, table.timeCategory),
  // Indexes for performance
  timeCategoryEloIdx: index('player_ratings_time_category_elo_idx').on(table.timeCategory, table.currentElo),
}));

// Matches Table
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  timeCategory: timeCategoryEnum('time_category').notNull(),
  whitePlayerId: uuid('white_player_id').references(() => players.id, { onDelete: 'cascade' }).notNull(),
  blackPlayerId: uuid('black_player_id').references(() => players.id, { onDelete: 'cascade' }).notNull(),
  result: resultEnum('result').notNull(),
  whiteEloBefore: integer('white_elo_before').notNull(),
  blackEloBefore: integer('black_elo_before').notNull(),
  whiteEloAfter: integer('white_elo_after').notNull(),
  blackEloAfter: integer('black_elo_after').notNull(),
  whiteEloChange: integer('white_elo_change').notNull(),
  blackEloChange: integer('black_elo_change').notNull(),
  playedAt: timestamp('played_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  notes: varchar('notes', { length: 500 }),
}, (table) => ({
  // Indexes for queries
  playedAtIdx: index('matches_played_at_idx').on(table.playedAt),
  timeCategoryIdx: index('matches_time_category_idx').on(table.timeCategory),
  whitePlayerIdx: index('matches_white_player_idx').on(table.whitePlayerId),
  blackPlayerIdx: index('matches_black_player_idx').on(table.blackPlayerId),
}));

// ELO History Table (for charting)
export const eloHistory = pgTable('elo_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerId: uuid('player_id').references(() => players.id, { onDelete: 'cascade' }).notNull(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  timeCategory: timeCategoryEnum('time_category').notNull(),
  eloBefore: integer('elo_before').notNull(),
  eloAfter: integer('elo_after').notNull(),
  eloChange: integer('elo_change').notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
}, (table) => ({
  // Indexes for efficient chart queries
  playerTimeCategoryIdx: index('elo_history_player_time_category_idx').on(table.playerId, table.timeCategory),
  recordedAtIdx: index('elo_history_recorded_at_idx').on(table.recordedAt),
}));

// Relations for type-safe joins
export const playersRelations = relations(players, ({ many }) => ({
  ratings: many(playerRatings),
  whiteMatches: many(matches, { relationName: 'whitePlayer' }),
  blackMatches: many(matches, { relationName: 'blackPlayer' }),
  eloHistory: many(eloHistory),
}));

export const playerRatingsRelations = relations(playerRatings, ({ one }) => ({
  player: one(players, {
    fields: [playerRatings.playerId],
    references: [players.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  whitePlayer: one(players, {
    fields: [matches.whitePlayerId],
    references: [players.id],
    relationName: 'whitePlayer',
  }),
  blackPlayer: one(players, {
    fields: [matches.blackPlayerId],
    references: [players.id],
    relationName: 'blackPlayer',
  }),
}));

export const eloHistoryRelations = relations(eloHistory, ({ one }) => ({
  player: one(players, {
    fields: [eloHistory.playerId],
    references: [players.id],
  }),
  match: one(matches, {
    fields: [eloHistory.matchId],
    references: [matches.id],
  }),
}));
