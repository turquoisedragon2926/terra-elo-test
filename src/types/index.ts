// Database types (inferred from Drizzle schema)
export type Player = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PlayerRating = {
  id: string;
  playerId: string;
  timeCategory: '5min' | '10min';
  currentElo: number;
  peakElo: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  updatedAt: Date;
};

export type Match = {
  id: string;
  timeCategory: '5min' | '10min';
  whitePlayerId: string;
  blackPlayerId: string;
  result: 'white_win' | 'black_win' | 'draw';
  whiteEloBefore: number;
  blackEloBefore: number;
  whiteEloAfter: number;
  blackEloAfter: number;
  whiteEloChange: number;
  blackEloChange: number;
  playedAt: Date;
  createdAt: Date;
  notes?: string | null;
};

export type EloHistory = {
  id: string;
  playerId: string;
  matchId: string;
  timeCategory: '5min' | '10min';
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  recordedAt: Date;
};

// Extended types for API responses
export type PlayerWithRatings = Player & {
  ratings: PlayerRating[];
};

export type PlayerWithStats = Player & {
  rating: PlayerRating;
  rank?: number;
};

export type MatchWithPlayers = Match & {
  whitePlayer: Player;
  blackPlayer: Player;
};

// Chart data types
export type EloChartData = {
  date: Date;
  elo: number;
  matchId: string;
};

// Leaderboard entry type
export type LeaderboardEntry = {
  rank: number;
  player: Player;
  rating: PlayerRating;
  winRate: number;
};

// Head-to-head record type
export type HeadToHeadRecord = {
  opponent: Player;
  wins: number;
  losses: number;
  draws: number;
  total: number;
};
