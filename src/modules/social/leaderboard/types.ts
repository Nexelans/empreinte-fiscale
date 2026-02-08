/**
 * Types pour le système de classement (Leaderboard)
 * Phase 4 - Module Social
 */

export enum LeaderboardMetric {
  SOLDE_NET = 'soldeNet',
  TOTAL_PAYE = 'totalPaye',
  TOTAL_RECU = 'totalRecu',
  RATIO = 'ratio',
  SCORE_CONFIANCE = 'scoreConfiance',
}

export enum LeaderboardScope {
  FRIENDS = 'FRIENDS',      // Classement entre amis
  GROUP = 'GROUP',          // Classement dans un groupe spécifique
  NATIONAL = 'NATIONAL',    // Classement national (anonymisé)
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userImage?: string;
  value: number;
  scoreConfiance?: number;
  isCurrentUser?: boolean;
}

export interface FriendLeaderboard {
  metric: LeaderboardMetric;
  scope: LeaderboardScope;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  currentUserRank?: number;
  generatedAt: Date;
}

export interface NationalPercentile {
  userId: string;
  metric: LeaderboardMetric;
  value: number;
  percentile: number;
  totalOptIns: number;
  generatedAt: Date;
}

export interface LeaderboardPreferences {
  optInNational: boolean;
  notifyOnRankChange: boolean;
  notifyOnFriendSurpass: boolean;
  preferredMetric: LeaderboardMetric;
}
