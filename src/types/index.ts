export type UserRole = 'admin' | 'player' | 'store';

export interface FavoriteDeck {
  id: string;
  name: string;
  cards: string[];
  isPrimary?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  nickname: string;
  email: string;
  gemId?: string;
  favoriteDeck: string;
  favoriteDecks?: FavoriteDeck[];
  role: UserRole;
  storeId?: string;
  storeName?: string;
  createdAt?: string;
}

export interface TournamentResult {
  id: string;
  playerName: string;
  playerNickname: string;
  deck: string;
  tournamentName: string;
  eventDate: string;
  score: number;
  wins: number;
  losses: number;
  draws: number;
  storeId: string;
  storeName: string;
  createdBy: string;
  updatedAt?: string;
}

export interface StandingRow {
  id: string;
  playerName: string;
  playerNickname: string;
  deck: string;
  totalScore: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  events: number;
  stores: string[];
  lastEventDate?: string;
  rank: number;
}
