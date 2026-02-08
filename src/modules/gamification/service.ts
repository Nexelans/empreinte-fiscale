/**
 * Service principal pour la gamification
 * API unifiée pour accéder à toutes les fonctionnalités
 */

import { getUserBadgesWithDefinitions } from "./badges";
import { getUserChallengesWithDefinitions, getActiveChallenges } from "./challenges";
import { getUserLevel, getUserTotalXP } from "./xp";
import { prisma } from "@/lib/prisma";
import type { UserLevel, LeaderboardEntry } from "./types";

/**
 * Récupère tous les badges d'un utilisateur
 */
export async function getUserBadges(userId: string) {
  return getUserBadgesWithDefinitions(userId);
}

/**
 * Récupère tous les challenges d'un utilisateur
 */
export async function getUserChallenges(userId: string) {
  return getUserChallengesWithDefinitions(userId);
}

/**
 * Récupère les challenges actifs d'un utilisateur
 */
export async function getUserActiveChallenges(userId: string) {
  return getActiveChallenges(userId);
}

/**
 * Récupère le niveau et l'XP d'un utilisateur
 */
export async function getUserLevelInfo(userId: string): Promise<UserLevel> {
  return getUserLevel(userId);
}

/**
 * Récupère le classement des amis d'un utilisateur
 */
export async function getFriendLeaderboard(userId: string): Promise<LeaderboardEntry[]> {
  // Get user's friends
  const friendLinks = await prisma.friendLink.findMany({
    where: {
      userId,
      status: "ACCEPTED",
    },
    select: { friendId: true },
  });

  const friendIds = friendLinks.map((f) => f.friendId);

  // Include the user themselves
  const allUserIds = [userId, ...friendIds];

  // Calculate leaderboard
  const entries = await Promise.all(
    allUserIds.map(async (uid) => {
      const user = await prisma.user.findUnique({
        where: { id: uid },
        select: { name: true },
      });

      const totalXP = await getUserTotalXP(uid);
      const levelInfo = await getUserLevel(uid);
      const badgeCount = await prisma.userBadge.count({ where: { userId: uid } });
      const streak = await prisma.userStreak.findUnique({ where: { userId: uid } });

      return {
        userId: uid,
        userName: user?.name || "Anonyme",
        level: levelInfo.level,
        totalXP,
        badgeCount,
        currentStreak: streak?.currentStreak || 0,
        rank: 0, // Will be set after sorting
      };
    })
  );

  // Sort by totalXP descending
  entries.sort((a, b) => b.totalXP - a.totalXP);

  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries;
}

/**
 * Récupère le dashboard complet de gamification pour un utilisateur
 */
export async function getGamificationDashboard(userId: string) {
  const [badges, challenges, levelInfo, streak] = await Promise.all([
    getUserBadges(userId),
    getUserActiveChallenges(userId),
    getUserLevelInfo(userId),
    prisma.userStreak.findUnique({ where: { userId } }),
  ]);

  return {
    level: levelInfo,
    streak: streak || {
      currentStreak: 0,
      longestStreak: 0,
      freezeTokens: 0,
    },
    badges: {
      earned: badges.length,
      total: 10, // Total number of badges available (from seed data)
      recent: badges.slice(0, 3),
    },
    challenges: {
      active: challenges.length,
      recent: challenges.slice(0, 3),
    },
  };
}

/**
 * Initialise la gamification pour un nouvel utilisateur
 */
export async function initializeGamification(userId: string): Promise<void> {
  // Create challenges (handled by challenges.ts)
  const { initializeUserChallenges } = await import("./challenges");
  await initializeUserChallenges(userId);

  // Create streak record
  const existing = await prisma.userStreak.findUnique({ where: { userId } });
  if (!existing) {
    await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  }

  console.log(`[Gamification] Initialized for user ${userId}`);
}

/**
 * Met à jour les statistiques globales de gamification
 */
export async function getGlobalGamificationStats() {
  const [
    totalUsers,
    totalBadgesEarned,
    totalChallengesCompleted,
    averageLevel,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.userBadge.count(),
    prisma.userChallenge.count({ where: { status: "COMPLETED" } }),
    // Average level (simplified calculation)
    prisma.user.count().then(() => 5), // Placeholder
  ]);

  return {
    totalUsers,
    totalBadgesEarned,
    totalChallengesCompleted,
    averageLevel,
  };
}
