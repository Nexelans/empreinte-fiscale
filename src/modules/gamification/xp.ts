/**
 * Système d'XP et de niveaux
 */

import { prisma } from "@/lib/prisma";
import type { GameEvent, UserLevel } from "./types";
import { emitGameEvent } from "./events";

/**
 * Calcule le niveau basé sur l'XP total
 * Formule: level = floor(sqrt(totalXP / 100))
 * Niveau 1: 0-99 XP
 * Niveau 2: 100-399 XP
 * Niveau 3: 400-899 XP
 * etc.
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

/**
 * Calcule l'XP nécessaire pour atteindre un niveau donné
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 100;
}

/**
 * Calcule l'XP nécessaire pour le niveau suivant
 */
export function getXPForNextLevel(currentLevel: number): number {
  return getXPForLevel(currentLevel + 1);
}

/**
 * Récupère l'XP total d'un utilisateur depuis ses badges et challenges
 * Note: Dans une vraie implémentation, on stockerait l'XP dans une table dédiée
 * Pour le MVP, on le calcule à la volée depuis les badges/challenges
 */
export async function getUserTotalXP(userId: string): Promise<number> {
  // XP from badges (100 XP per badge)
  const badgeCount = await prisma.userBadge.count({ where: { userId } });
  const badgeXP = badgeCount * 100;

  // XP from completed challenges
  const challenges = await prisma.userChallenge.findMany({
    where: { userId, status: "COMPLETED" },
  });

  let challengeXP = 0;
  for (const challenge of challenges) {
    const definition = await prisma.referentiel.findFirst({
      where: {
        categorie: "CHALLENGE_DEFINITION",
        cle: challenge.challengeId,
      },
    });

    if (definition) {
      const defValue = definition.valeur as any;
      challengeXP += defValue.recompenseXP || 0;
    }
  }

  // XP from journal entries (10 XP per entry)
  const journalCount = await prisma.journalEntry.count({ where: { userId } });
  const journalXP = journalCount * 10;

  // XP from quizzes (varies by score)
  const quizAttempts = await prisma.quizAttempt.findMany({ where: { userId } });
  const quizXP = quizAttempts.reduce((sum, attempt) => {
    // 10 XP per correct answer
    return sum + (attempt.score * 10);
  }, 0);

  return badgeXP + challengeXP + journalXP + quizXP;
}

/**
 * Calcule le niveau et la progression d'un utilisateur
 */
export async function getUserLevel(userId: string): Promise<UserLevel> {
  const totalXP = await getUserTotalXP(userId);
  const level = calculateLevel(totalXP);
  const xpForCurrentLevel = getXPForLevel(level);
  const xpForNextLevel = getXPForNextLevel(level);
  const currentXP = totalXP - xpForCurrentLevel;

  return {
    level,
    currentXP,
    xpForNextLevel: xpForNextLevel - xpForCurrentLevel,
    totalXP,
  };
}

/**
 * Attribution d'XP selon le type d'événement
 */
const xpRewards: Record<string, number> = {
  DOCUMENT_UPLOADED: 100,
  JOURNAL_ENTRY_CREATED: 10,
  QUIZ_COMPLETED: 0, // Handled by quiz score
  BADGE_EARNED: 100,
  CHALLENGE_COMPLETED: 0, // Handled by challenge definition
  SIMULATION_CREATED: 50,
};

/**
 * Handler pour attribuer de l'XP suite à un événement
 * Note: Dans cette implémentation simplifiée, l'XP est calculé à la volée
 * Pas besoin de le stocker explicitement - il découle des actions (badges, challenges, etc.)
 */
export async function handleXPAward(event: GameEvent): Promise<void> {
  const baseXP = xpRewards[event.type] || 0;

  if (baseXP === 0) return;

  // Get user level before
  const levelBefore = await getUserLevel(event.userId);

  // XP is implicitly awarded by the action itself (journal entry, badge, etc.)
  // So we just check if level changed after this action

  // Get user level after (recalculate)
  const levelAfter = await getUserLevel(event.userId);

  // Check for level up
  if (levelAfter.level > levelBefore.level) {
    console.log(`[XP] User ${event.userId} leveled up to level ${levelAfter.level}!`);
    await emitGameEvent("LEVEL_UP", event.userId, {
      oldLevel: levelBefore.level,
      newLevel: levelAfter.level,
    });
  }
}

/**
 * Récupère le leaderboard basé sur l'XP total
 */
export async function getXPLeaderboard(limit: number = 10): Promise<Array<{ userId: string; totalXP: number; level: number }>> {
  // Get all users with any gamification activity
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { badges: { some: {} } },
        { challenges: { some: {} } },
        { journalEntries: { some: {} } },
        { quizAttempts: { some: {} } },
      ],
    },
    select: { id: true },
  });

  // Calculate XP for each user
  const leaderboard = await Promise.all(
    users.map(async (user) => {
      const totalXP = await getUserTotalXP(user.id);
      const level = calculateLevel(totalXP);
      return { userId: user.id, totalXP, level };
    })
  );

  // Sort by totalXP descending
  leaderboard.sort((a, b) => b.totalXP - a.totalXP);

  return leaderboard.slice(0, limit);
}
