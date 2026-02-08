/**
 * Types et interfaces pour le système de gamification
 */

export type GameEventType =
  | "DOCUMENT_UPLOADED"
  | "JOURNAL_ENTRY_CREATED"
  | "SCORE_CALCULATED"
  | "STREAK_UPDATED"
  | "QUIZ_COMPLETED"
  | "SIMULATION_CREATED"
  | "BADGE_EARNED"
  | "CHALLENGE_COMPLETED"
  | "LEVEL_UP";

export interface GameEvent {
  type: GameEventType;
  userId: string;
  timestamp: Date;
  payload: Record<string, any>;
}

export interface BadgeDefinition {
  id: string;
  nom: string;
  description: string;
  critere: string; // e.g., "document_uploaded", "streak_days", "confidence_score"
  seuil: number;
  categorie: "onboarding" | "fiscal_contribution" | "fiscal_services" | "data_quality" | "engagement" | "pedagogical";
  relatedGlossaryTerms?: string[]; // Task 28.1: Links to glossary terms
  educationalTip?: string; // Task 28.2: Educational tip on completion
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  progress: number;
}

export interface ChallengeDefinition {
  id: string;
  nom: string;
  description: string;
  type: string; // e.g., "document_upload", "journal_entries", "quiz_completion"
  target: number;
  recompenseXP: number;
  duree: number | null; // null = no expiration, number = days
  recurrent: boolean;
  educationalTip?: string; // Task 28.2: Educational tip on completion
  relatedGlossaryTerms?: string[]; // Related glossary terms
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  progress: number;
  target: number;
  startedAt: Date;
  completedAt: Date | null;
  expiresAt: Date | null;
}

export interface UserLevel {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
}

export interface XPAward {
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: Date | null;
  freezeTokens: number;
  gracePeriodEnds: Date | null;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  level: number;
  totalXP: number;
  badgeCount: number;
  currentStreak: number;
  rank: number;
}

// Badge criteria checkers
export type BadgeCriteriaChecker = (userId: string, event: GameEvent) => Promise<boolean>;

export interface BadgeCriteriaRegistry {
  [critere: string]: BadgeCriteriaChecker;
}

// Challenge progress updaters
export type ChallengeProgressUpdater = (userId: string, event: GameEvent, challenge: UserChallenge) => Promise<number>;

export interface ChallengeProgressRegistry {
  [type: string]: ChallengeProgressUpdater;
}
