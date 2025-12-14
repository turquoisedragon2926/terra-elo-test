// ELO Rating System Constants

export const STARTING_ELO = 1000;

// K-factors determine how much ratings change after each game
export const K_FACTOR_PROVISIONAL = 40; // For players with < 30 games
export const K_FACTOR_ESTABLISHED = 32; // For established players
export const PROVISIONAL_GAMES_THRESHOLD = 30;

// Rating range (optional, for validation)
export const MIN_ELO = 0;
export const MAX_ELO = 3000;
