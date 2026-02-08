/**
 * Service pour le système de classement (Leaderboard)
 * Phase 4 - Module Social
 */

import { prisma } from '@/lib/prisma';
import {
  getCached,
  setCached,
  invalidatePattern,
  getLeaderboardKey,
} from '@/lib/cache';
import {
  LeaderboardEntry,
  LeaderboardMetric,
  LeaderboardScope,
  FriendLeaderboard,
  NationalPercentile,
} from './types';

const MINIMUM_NATIONAL_PARTICIPANTS = 100;
const LEADERBOARD_CACHE_TTL = 300; // 5 minutes

/**
 * Récupère le classement entre amis pour une métrique donnée
 * Utilise le cache Redis avec TTL de 5 minutes (Task 8.4)
 */
export async function getFriendLeaderboard(
  userId: string,
  metric: LeaderboardMetric
): Promise<FriendLeaderboard> {
  // Vérifier le cache d'abord
  const cacheKey = `${getLeaderboardKey('friends', userId)}:${metric}`;
  const cached = await getCached<FriendLeaderboard>(cacheKey);

  if (cached) {
    return cached;
  }

  // Récupérer tous les amis actifs
  const friendships = await prisma.friend.findMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  const friendIds = friendships.map((f) => f.friendId);
  friendIds.push(userId); // Inclure l'utilisateur lui-même

  // Récupérer les derniers scores fiscaux pour tous
  const scores = await Promise.all(
    friendIds.map(async (id) => {
      const score = await prisma.scoreFiscal.findFirst({
        where: { userId: id },
        orderBy: { calculatedAt: 'desc' },
      });
      return { userId: id, score };
    })
  );

  // Filtrer les scores null et construire les entrées
  const validScores = scores.filter((s) => s.score !== null);

  if (validScores.length === 0) {
    return {
      metric,
      scope: LeaderboardScope.FRIENDS,
      entries: [],
      totalParticipants: 0,
      generatedAt: new Date(),
    };
  }

  // Extraire les valeurs et trier
  const entries: LeaderboardEntry[] = await Promise.all(
    validScores.map(async ({ userId: uid, score }) => {
      const user = await prisma.user.findUnique({
        where: { id: uid },
        select: { name: true, email: true, image: true },
      });

      return {
        rank: 0, // Sera calculé après tri
        userId: uid,
        userName: user?.name || user?.email || 'Utilisateur',
        userImage: user?.image || undefined,
        value: score![metric],
        scoreConfiance: score!.scoreConfiance,
        isCurrentUser: uid === userId,
      };
    })
  );

  // Trier par valeur décroissante (sauf pour ratio où plus élevé = mieux)
  entries.sort((a, b) => {
    if (metric === LeaderboardMetric.RATIO) {
      return b.value - a.value; // Plus élevé = meilleur rang
    } else if (metric === LeaderboardMetric.SOLDE_NET) {
      return b.value - a.value; // Plus élevé (moins négatif) = meilleur rang
    } else {
      return b.value - a.value;
    }
  });

  // Assigner les rangs
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  const currentUserEntry = entries.find((e) => e.isCurrentUser);

  const result: FriendLeaderboard = {
    metric,
    scope: LeaderboardScope.FRIENDS,
    entries,
    totalParticipants: entries.length,
    currentUserRank: currentUserEntry?.rank,
    generatedAt: new Date(),
  };

  // Mettre en cache pour 5 minutes
  await setCached(cacheKey, result, LEADERBOARD_CACHE_TTL);

  return result;
}

/**
 * Calcule le percentile national d'un utilisateur
 * Respecte la vie privée en ne retournant que des statistiques agrégées
 * Utilise le cache Redis avec TTL de 5 minutes (Task 8.4)
 */
export async function calculateNationalPercentile(
  userId: string,
  metric: LeaderboardMetric
): Promise<NationalPercentile | null> {
  // Vérifier le cache d'abord
  const cacheKey = `${getLeaderboardKey('national', userId)}:${metric}`;
  const cached = await getCached<NationalPercentile>(cacheKey);

  if (cached) {
    return cached;
  }

  // Vérifier que l'utilisateur a opté pour le classement national
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { socialPreferences: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const preferences = user.socialPreferences as any;
  if (!preferences?.leaderboardOptIn) {
    throw new Error('User has not opted in to national leaderboard');
  }

  // Récupérer le score de l'utilisateur
  const userScore = await prisma.scoreFiscal.findFirst({
    where: { userId },
    orderBy: { calculatedAt: 'desc' },
  });

  if (!userScore) {
    return null;
  }

  const userValue = userScore[metric];

  // Compter le nombre total d'utilisateurs qui ont opté
  const totalOptIns = await prisma.user.count({
    where: {
      socialPreferences: {
        path: ['leaderboardOptIn'],
        equals: true,
      },
    },
  });

  // Vérifier le seuil minimum pour la protection de la vie privée
  if (totalOptIns < MINIMUM_NATIONAL_PARTICIPANTS) {
    return null;
  }

  // Compter combien d'utilisateurs opt-in ont une valeur inférieure
  // Sans récupérer leurs identités
  const usersWithScores = await prisma.user.findMany({
    where: {
      socialPreferences: {
        path: ['leaderboardOptIn'],
        equals: true,
      },
    },
    select: {
      id: true,
    },
  });

  let countBelow = 0;

  for (const u of usersWithScores) {
    const score = await prisma.scoreFiscal.findFirst({
      where: { userId: u.id },
      orderBy: { calculatedAt: 'desc' },
    });

    if (score && score[metric] < userValue) {
      countBelow++;
    }
  }

  // Calculer le percentile
  const percentile = Math.floor((countBelow / totalOptIns) * 100);

  const result: NationalPercentile = {
    userId,
    metric,
    value: userValue,
    percentile,
    totalOptIns,
    generatedAt: new Date(),
  };

  // Mettre en cache pour 5 minutes
  await setCached(cacheKey, result, LEADERBOARD_CACHE_TTL);

  return result;
}

/**
 * Invalide le cache du leaderboard pour un utilisateur
 * Appelé après recalcul du score (Task 8.4)
 *
 * IMPORTANT: Invalide tous les leaderboards où l'utilisateur apparaît:
 * - Son propre leaderboard amis
 * - Les leaderboards amis de ses amis (car son score a changé)
 * - Le leaderboard national (son percentile a changé)
 */
export async function invalidateLeaderboard(userId: string): Promise<void> {
  // Invalider tous les leaderboards de l'utilisateur (toutes métriques)
  await invalidatePattern(`leaderboard:*:${userId}:*`);

  // Invalider le national (car le percentile global a changé)
  await invalidatePattern('leaderboard:national:*');

  // Invalider les leaderboards de tous ses amis (car leur classement peut avoir changé)
  const friendships = await prisma.friend.findMany({
    where: {
      OR: [{ userId }, { friendId: userId }],
      status: 'ACTIVE',
    },
    select: { userId: true, friendId: true },
  });

  for (const friendship of friendships) {
    const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
    await invalidatePattern(`leaderboard:friends:${friendId}:*`);
  }

  console.log(`Leaderboard cache invalidated for user ${userId} and friends`);
}

/**
 * Récupère les préférences de leaderboard d'un utilisateur
 */
export async function getLeaderboardPreferences(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { socialPreferences: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const preferences = (user.socialPreferences as any) || {};

  return {
    optInNational: preferences.leaderboardOptIn || false,
    notifyOnRankChange: preferences.notifyOnRankChange || false,
    notifyOnFriendSurpass: preferences.notifyOnFriendSurpass || false,
    preferredMetric: preferences.preferredMetric || LeaderboardMetric.SOLDE_NET,
  };
}

/**
 * Met à jour les préférences de leaderboard d'un utilisateur
 */
export async function updateLeaderboardPreferences(
  userId: string,
  preferences: {
    optInNational?: boolean;
    notifyOnRankChange?: boolean;
    notifyOnFriendSurpass?: boolean;
    preferredMetric?: LeaderboardMetric;
  }
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { socialPreferences: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const currentPreferences = (user.socialPreferences as any) || {};

  await prisma.user.update({
    where: { id: userId },
    data: {
      socialPreferences: {
        ...currentPreferences,
        ...(preferences.optInNational !== undefined && {
          leaderboardOptIn: preferences.optInNational,
        }),
        ...(preferences.notifyOnRankChange !== undefined && {
          notifyOnRankChange: preferences.notifyOnRankChange,
        }),
        ...(preferences.notifyOnFriendSurpass !== undefined && {
          notifyOnFriendSurpass: preferences.notifyOnFriendSurpass,
        }),
        ...(preferences.preferredMetric !== undefined && {
          preferredMetric: preferences.preferredMetric,
        }),
      },
    },
  });
}
