/**
 * Analytics pour l'interface admin
 * Phase 4 - Admin Interface
 */

import { prisma } from '@/lib/prisma';

/**
 * Métriques de croissance utilisateur
 */
export interface UserGrowthMetrics {
  period: 'daily' | 'weekly' | 'monthly';
  data: Array<{
    date: Date;
    newUsers: number;
    totalUsers: number;
    activeUsers: number;
    churnedUsers: number;
  }>;
  summary: {
    totalGrowth: number;
    averageGrowthRate: number;
    totalActive: number;
    retentionRate: number;
  };
}

/**
 * Statistiques d'utilisation des fonctionnalités
 */
export interface FeatureUsageStats {
  feature: string;
  totalUsers: number;
  activeUsers: number;
  usageCount: number;
  lastUsed?: Date;
  trend: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Récupère les métriques de croissance des utilisateurs
 */
export async function getUserGrowthMetrics(
  period: 'daily' | 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date
): Promise<UserGrowthMetrics> {
  try {
    const data: UserGrowthMetrics['data'] = [];

    // Générer les intervalles selon la période
    const intervals = generateIntervals(period, startDate, endDate);

    for (const interval of intervals) {
      const { start, end } = interval;

      // Compter les nouveaux utilisateurs dans cet intervalle
      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: start,
            lt: end,
          },
        },
      });

      // Compter le total des utilisateurs à la fin de l'intervalle
      const totalUsers = await prisma.user.count({
        where: {
          createdAt: {
            lt: end,
          },
        },
      });

      // Utilisateurs actifs (simulé - nécessiterait un tracking de session)
      const activeUsers = Math.round(totalUsers * 0.3); // 30% d'activité simulée

      // Utilisateurs ayant quitté (simulé)
      const churnedUsers = 0;

      data.push({
        date: start,
        newUsers,
        totalUsers,
        activeUsers,
        churnedUsers,
      });
    }

    // Calculer le résumé
    const firstTotal = data[0]?.totalUsers || 0;
    const lastTotal = data[data.length - 1]?.totalUsers || 0;
    const totalGrowth = lastTotal - firstTotal;
    const averageGrowthRate =
      data.length > 1
        ? totalGrowth / (data.length - 1)
        : 0;

    return {
      period,
      data,
      summary: {
        totalGrowth,
        averageGrowthRate,
        totalActive: lastTotal,
        retentionRate: 0.7, // 70% simulé
      },
    };
  } catch (error) {
    console.error('Error getting user growth metrics:', error);
    return {
      period,
      data: [],
      summary: {
        totalGrowth: 0,
        averageGrowthRate: 0,
        totalActive: 0,
        retentionRate: 0,
      },
    };
  }
}

/**
 * Récupère les statistiques d'utilisation des fonctionnalités
 */
export async function getFeatureUsage(): Promise<FeatureUsageStats[]> {
  try {
    const [
      totalUsers,
      usersWithProfil,
      usersWithDocuments,
      usersWithAI,
      usersWithFriends,
      usersInGroups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.profilFiscal.count(),
      prisma.user.count({
        where: {
          documents: {
            some: {},
          },
        },
      }),
      prisma.aIConfig.count(),
      prisma.friend.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.groupMember.count(),
    ]);

    const features: FeatureUsageStats[] = [
      {
        feature: 'Profil Fiscal',
        totalUsers: usersWithProfil,
        activeUsers: usersWithProfil,
        usageCount: usersWithProfil,
        trend: 'increasing',
      },
      {
        feature: 'Upload Documents',
        totalUsers: usersWithDocuments,
        activeUsers: usersWithDocuments,
        usageCount: await prisma.documentUpload.count(),
        trend: 'increasing',
      },
      {
        feature: 'AI Configuration',
        totalUsers: usersWithAI,
        activeUsers: usersWithAI,
        usageCount: usersWithAI,
        trend: 'stable',
      },
      {
        feature: 'Social - Friends',
        totalUsers: usersWithFriends,
        activeUsers: usersWithFriends,
        usageCount: await prisma.friend.count(),
        trend: 'increasing',
      },
      {
        feature: 'Social - Groups',
        totalUsers: usersInGroups,
        activeUsers: usersInGroups,
        usageCount: await prisma.group.count(),
        trend: 'stable',
      },
    ];

    return features;
  } catch (error) {
    console.error('Error getting feature usage:', error);
    return [];
  }
}

/**
 * Récupère les métriques d'engagement
 */
export async function getEngagementMetrics(): Promise<{
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  averageActionsPerSession: number;
}> {
  // Pour l'instant, retourner des données simulées
  // Dans une implémentation complète, tracker les sessions et actions
  const totalUsers = await prisma.user.count();

  return {
    dailyActiveUsers: Math.round(totalUsers * 0.15), // 15%
    weeklyActiveUsers: Math.round(totalUsers * 0.35), // 35%
    monthlyActiveUsers: Math.round(totalUsers * 0.6), // 60%
    averageSessionDuration: 420, // 7 minutes en secondes
    averageActionsPerSession: 8,
  };
}

/**
 * Récupère les statistiques de rétention
 */
export async function getRetentionStats(): Promise<{
  day1: number;
  day7: number;
  day30: number;
  cohortData: Array<{
    cohortDate: Date;
    cohortSize: number;
    day1Retention: number;
    day7Retention: number;
    day30Retention: number;
  }>;
}> {
  // Données simulées pour l'instant
  // Dans une implémentation complète, calculer la rétention réelle par cohorte
  return {
    day1: 0.75, // 75%
    day7: 0.45, // 45%
    day30: 0.30, // 30%
    cohortData: [],
  };
}

/**
 * Exporte les analytics en CSV
 */
export async function exportAnalyticsCSV(
  type: 'users' | 'features' | 'engagement',
  startDate: Date,
  endDate: Date
): Promise<string> {
  if (type === 'users') {
    const metrics = await getUserGrowthMetrics('daily', startDate, endDate);

    const headers = ['Date', 'New Users', 'Total Users', 'Active Users'];
    const rows = metrics.data.map((d) => [
      d.date.toISOString().split('T')[0],
      d.newUsers.toString(),
      d.totalUsers.toString(),
      d.activeUsers.toString(),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  if (type === 'features') {
    const features = await getFeatureUsage();

    const headers = ['Feature', 'Total Users', 'Usage Count', 'Trend'];
    const rows = features.map((f) => [
      f.feature,
      f.totalUsers.toString(),
      f.usageCount.toString(),
      f.trend,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  return '';
}

/**
 * Génère des intervalles de dates selon la période
 */
function generateIntervals(
  period: 'daily' | 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date
): Array<{ start: Date; end: Date }> {
  const intervals: Array<{ start: Date; end: Date }> = [];
  const current = new Date(startDate);

  while (current < endDate) {
    const start = new Date(current);
    const end = new Date(current);

    if (period === 'daily') {
      end.setDate(end.getDate() + 1);
    } else if (period === 'weekly') {
      end.setDate(end.getDate() + 7);
    } else if (period === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    }

    // Ne pas dépasser endDate
    if (end > endDate) {
      intervals.push({ start, end: endDate });
      break;
    }

    intervals.push({ start, end });
    current.setTime(end.getTime());
  }

  return intervals;
}
