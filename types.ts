
export type GameType = 'PLINKO' | 'CRASH' | 'MINES' | 'SHELLS' | 'TOWER' | 'WHEEL' | 'CHESS' | 'PINGPONG' | 'DICE' | 'ROULETTE' | 'SUDOKU' | 'SLOTS' | 'LIMBO' | 'KENO' | 'CROSSING';

export interface GameState {
  balance: number;
  betAmount: number;
  currentGame: GameType;
}

export interface HistoryItem {
  id: string;
  game: GameType;
  bet: number;
  multiplier: number;
  payout: number;
  timestamp: number;
}
