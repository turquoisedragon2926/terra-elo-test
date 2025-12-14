import {
  K_FACTOR_PROVISIONAL,
  K_FACTOR_ESTABLISHED,
  PROVISIONAL_GAMES_THRESHOLD,
} from './constants';

/**
 * Calculate the expected score for a player using the ELO formula
 * @param playerElo - Current ELO of the player
 * @param opponentElo - Current ELO of the opponent
 * @returns Expected score (0 to 1, where 0.5 is evenly matched)
 */
export function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/**
 * Determine K-factor based on number of games played
 * @param gamesPlayed - Total games played by the player
 * @returns K-factor to use in ELO calculation
 */
export function determineKFactor(gamesPlayed: number): number {
  return gamesPlayed < PROVISIONAL_GAMES_THRESHOLD
    ? K_FACTOR_PROVISIONAL
    : K_FACTOR_ESTABLISHED;
}

/**
 * Calculate new ELO rating after a game
 * @param currentElo - Player's current ELO
 * @param expectedScore - Expected score (from calculateExpectedScore)
 * @param actualScore - Actual score (1 = win, 0.5 = draw, 0 = loss)
 * @param kFactor - K-factor to use
 * @returns New ELO rating (rounded to nearest integer)
 */
export function calculateNewElo(
  currentElo: number,
  expectedScore: number,
  actualScore: number,
  kFactor: number
): number {
  const newElo = currentElo + kFactor * (actualScore - expectedScore);
  return Math.round(newElo);
}

/**
 * Process a match result and calculate ELO changes for both players
 * @param whitePlayer - White player's data (elo, gamesPlayed)
 * @param blackPlayer - Black player's data (elo, gamesPlayed)
 * @param result - Match result ('white_win', 'black_win', or 'draw')
 * @returns Object containing new ELOs and changes for both players
 */
export function processMatchResult(
  whitePlayer: { elo: number; gamesPlayed: number },
  blackPlayer: { elo: number; gamesPlayed: number },
  result: 'white_win' | 'black_win' | 'draw'
) {
  // Determine actual scores based on result
  let whiteScore: number;
  let blackScore: number;

  switch (result) {
    case 'white_win':
      whiteScore = 1;
      blackScore = 0;
      break;
    case 'black_win':
      whiteScore = 0;
      blackScore = 1;
      break;
    case 'draw':
      whiteScore = 0.5;
      blackScore = 0.5;
      break;
  }

  // Calculate expected scores
  const whiteExpected = calculateExpectedScore(whitePlayer.elo, blackPlayer.elo);
  const blackExpected = calculateExpectedScore(blackPlayer.elo, whitePlayer.elo);

  // Determine K-factors
  const whiteKFactor = determineKFactor(whitePlayer.gamesPlayed);
  const blackKFactor = determineKFactor(blackPlayer.gamesPlayed);

  // Calculate new ELOs
  const whiteNewElo = calculateNewElo(
    whitePlayer.elo,
    whiteExpected,
    whiteScore,
    whiteKFactor
  );
  const blackNewElo = calculateNewElo(
    blackPlayer.elo,
    blackExpected,
    blackScore,
    blackKFactor
  );

  // Calculate changes
  const whiteEloChange = whiteNewElo - whitePlayer.elo;
  const blackEloChange = blackNewElo - blackPlayer.elo;

  return {
    white: {
      eloBefore: whitePlayer.elo,
      eloAfter: whiteNewElo,
      eloChange: whiteEloChange,
    },
    black: {
      eloBefore: blackPlayer.elo,
      eloAfter: blackNewElo,
      eloChange: blackEloChange,
    },
  };
}
