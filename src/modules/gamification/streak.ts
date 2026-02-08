import { prisma } from "@/lib/prisma";
import { emitGameEvent } from "./events";

interface StreakUpdateResult {
  currentStreak: number;
  longestStreak: number;
  isNewRecord: boolean;
  milestoneReached: number | null;
  freezeTokensAwarded: number;
}

/**
 * Met à jour la série (streak) de l'utilisateur après une activité
 * Logique :
 * - Si log aujourd'hui : ne rien faire
 * - Si log hier : incrémenter la série
 * - Si interruption mais période de grâce active : maintenir la série
 * - Si interruption sans grâce : réinitialiser à 1
 * - Déclenche les badges de jalons si applicable
 */
export async function updateStreak(userId: string): Promise<StreakUpdateResult> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Récupérer ou créer le streak de l'utilisateur
  let streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  if (!streak) {
    // Première activité de l'utilisateur
    streak = await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastLoggedDate: today,
      },
    });

    await emitGameEvent("STREAK_UPDATED", userId, {
      currentStreak: 1,
      longestStreak: 1,
      isNewRecord: true,
    });

    return {
      currentStreak: 1,
      longestStreak: 1,
      isNewRecord: true,
      milestoneReached: null,
      freezeTokensAwarded: 0,
    };
  }

  // Si déjà loggé aujourd'hui, ne rien faire
  if (streak.lastLoggedDate) {
    const lastLogged = new Date(streak.lastLoggedDate);
    const lastLoggedDay = new Date(
      lastLogged.getFullYear(),
      lastLogged.getMonth(),
      lastLogged.getDate()
    );

    if (lastLoggedDay.getTime() === today.getTime()) {
      return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        isNewRecord: false,
        milestoneReached: null,
        freezeTokensAwarded: 0,
      };
    }
  }

  let newStreak = 1;
  let isConsecutive = false;

  if (streak.lastLoggedDate) {
    const lastLogged = new Date(streak.lastLoggedDate);
    const lastLoggedDay = new Date(
      lastLogged.getFullYear(),
      lastLogged.getMonth(),
      lastLogged.getDate()
    );

    // Vérifier si loggé hier (série continue)
    if (lastLoggedDay.getTime() === yesterday.getTime()) {
      newStreak = streak.currentStreak + 1;
      isConsecutive = true;
    } else {
      // Vérifier si période de grâce active
      if (streak.gracePeriodEnds && new Date(streak.gracePeriodEnds) > now) {
        // Période de grâce active : maintenir la série
        newStreak = streak.currentStreak + 1;
        isConsecutive = true;
      } else {
        // Série interrompue : réinitialiser à 1
        newStreak = 1;
        isConsecutive = false;
      }
    }
  }

  // Calculer le nouveau record
  const newLongestStreak = Math.max(newStreak, streak.longestStreak);
  const isNewRecord = newLongestStreak > streak.longestStreak;

  // Vérifier les jalons et attribuer des tokens de gel
  const milestones = [7, 14, 30, 50, 100];
  let milestoneReached: number | null = null;
  let freezeTokensAwarded = 0;

  for (const milestone of milestones) {
    if (newStreak === milestone) {
      milestoneReached = milestone;
      // Attribuer 1 token de gel par jalon
      freezeTokensAwarded = 1;
      break;
    }
  }

  // Mettre à jour le streak (et retirer la période de grâce si elle était active)
  const updatedStreak = await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastLoggedDate: today,
      freezeTokens: streak.freezeTokens + freezeTokensAwarded,
      gracePeriodEnds: null, // Réinitialiser la période de grâce
    },
  });

  // Émettre l'événement de mise à jour
  await emitGameEvent("STREAK_UPDATED", userId, {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    isNewRecord,
    milestoneReached,
    freezeTokensAwarded,
    isConsecutive,
  });

  // Si un jalon est atteint, déclencher l'attribution du badge
  if (milestoneReached) {
    await awardStreakMilestoneBadge(userId, milestoneReached);
  }

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    isNewRecord,
    milestoneReached,
    freezeTokensAwarded,
  };
}

/**
 * Attribue le badge de jalon de série correspondant
 */
async function awardStreakMilestoneBadge(
  userId: string,
  milestone: number
): Promise<void> {
  // Mapper les jalons aux IDs de badges
  const badgeIdMap: Record<number, string> = {
    7: "ASSIDU_7J",
    14: "ASSIDU_14J",
    30: "ASSIDU_30J",
    50: "ASSIDU_50J",
    100: "ASSIDU_100J",
  };

  const badgeId = badgeIdMap[milestone];
  if (!badgeId) return;

  // Vérifier si le badge n'a pas déjà été obtenu
  const existingBadge = await prisma.userBadge.findFirst({
    where: {
      userId,
      badgeId,
    },
  });

  if (existingBadge) return;

  // Attribuer le badge
  await prisma.userBadge.create({
    data: {
      userId,
      badgeId,
      progress: 100,
    },
  });

  await emitGameEvent("BADGE_EARNED", userId, {
    badgeId,
    milestone,
    fromStreak: true,
  });
}

/**
 * Utilise un token de gel pour activer une période de grâce de 24h
 */
export async function useFreezeToken(userId: string): Promise<boolean> {
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  if (!streak || streak.freezeTokens <= 0) {
    return false;
  }

  const gracePeriodEnd = new Date();
  gracePeriodEnd.setHours(gracePeriodEnd.getHours() + 24);

  await prisma.userStreak.update({
    where: { userId },
    data: {
      freezeTokens: streak.freezeTokens - 1,
      gracePeriodEnds: gracePeriodEnd,
    },
  });

  return true;
}

/**
 * Récupère les données de série de l'utilisateur
 */
export async function getUserStreak(userId: string) {
  let streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  if (!streak) {
    // Créer un streak par défaut
    streak = await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  }

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastLoggedDate: streak.lastLoggedDate,
    freezeTokens: streak.freezeTokens,
    gracePeriodEnds: streak.gracePeriodEnds,
  };
}
