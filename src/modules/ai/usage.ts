/**
 * Tracking de l'utilisation IA
 * Phase 4 - Module AI
 *
 * Suit les requêtes, tokens utilisés et coûts estimés
 */

import { prisma } from '@/lib/prisma';
import { AIUsageStats } from './types';

/**
 * Enregistrement d'une requête IA
 */
export interface AIUsageRecord {
  id: string;
  userId: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  context?: string; // dashboard, simulation, document-analysis, etc.
  createdAt: Date;
}

/**
 * Stockage en mémoire temporaire (fallback)
 * Utilisé seulement si Prisma échoue
 */
const usageStore = new Map<string, AIUsageRecord[]>();

/**
 * Enregistre l'utilisation d'une requête IA dans la base de données
 */
export async function recordUsage(record: Omit<AIUsageRecord, 'id' | 'createdAt'>): Promise<void> {
  try {
    // Enregistrer dans Prisma
    await prisma.aIUsage.create({
      data: {
        userId: record.userId,
        provider: record.provider,
        model: record.model,
        promptTokens: record.promptTokens,
        completionTokens: record.completionTokens,
        totalTokens: record.totalTokens,
        estimatedCost: record.estimatedCost,
        context: record.context || 'unknown',
      },
    });
  } catch (error) {
    console.error('[AI Usage] Failed to record usage in database, using in-memory fallback:', error);

    // Fallback vers stockage en mémoire
    const id = generateRecordId();
    const fullRecord: AIUsageRecord = {
      id,
      ...record,
      createdAt: new Date(),
    };

    const userRecords = usageStore.get(record.userId) || [];
    userRecords.push(fullRecord);
    usageStore.set(record.userId, userRecords);

    cleanupOldRecords(record.userId, 90);
  }
}

/**
 * Récupère les statistiques d'utilisation pour un utilisateur
 */
export async function getUsageStats(
  userId: string,
  period: 'day' | 'month' | 'today' = 'month'
): Promise<AIUsageStats> {
  try {
    // Calculer la date limite
    const now = new Date();
    const cutoffDate = new Date();

    if (period === 'day' || period === 'today') {
      cutoffDate.setHours(0, 0, 0, 0); // Début de la journée
    } else {
      cutoffDate.setDate(cutoffDate.getDate() - 30);
    }

    // Requête Prisma
    const records = await prisma.aIUsage.findMany({
      where: {
        userId,
        createdAt: {
          gte: cutoffDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculer les statistiques
    const requestCount = records.length;
    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const estimatedCost = records.reduce((sum, r) => sum + r.estimatedCost, 0);
    const chatRequestsToday = period === 'today'
      ? records.filter(r => r.context === 'chat').length
      : undefined;

    const lastRequestAt = records.length > 0 ? records[0]!.createdAt : undefined;

    return {
      userId,
      period,
      requestCount,
      totalTokens,
      estimatedCost,
      lastRequestAt,
      chatRequestsToday,
    };
  } catch (error) {
    console.error('[AI Usage] Failed to get stats from database, using in-memory fallback:', error);

    // Fallback vers stockage en mémoire
    const records = usageStore.get(userId) || [];
    const now = new Date();
    const cutoffDate = new Date();

    if (period === 'day' || period === 'today') {
      cutoffDate.setDate(cutoffDate.getDate() - 1);
    } else {
      cutoffDate.setDate(cutoffDate.getDate() - 30);
    }

    const periodRecords = records.filter((r) => r.createdAt >= cutoffDate);
    const requestCount = periodRecords.length;
    const totalTokens = periodRecords.reduce((sum, r) => sum + r.totalTokens, 0);
    const estimatedCost = periodRecords.reduce((sum, r) => sum + r.estimatedCost, 0);
    const lastRequestAt =
      periodRecords.length > 0 ? periodRecords[periodRecords.length - 1]!.createdAt : undefined;

    return {
      userId,
      period,
      requestCount,
      totalTokens,
      estimatedCost,
      lastRequestAt,
    };
  }
}

/**
 * Récupère les statistiques détaillées par provider
 */
export async function getUsageByProvider(
  userId: string,
  days: number = 30
): Promise<Array<{ provider: string; requests: number; tokens: number; cost: number }>> {
  try {
    // Calculer la date limite
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Requête Prisma avec groupBy
    const records = await prisma.aIUsage.findMany({
      where: {
        userId,
        createdAt: {
          gte: cutoffDate,
        },
      },
    });

    // Grouper manuellement par provider
    const byProvider = new Map<string, { requests: number; tokens: number; cost: number }>();

    for (const record of records) {
      const existing = byProvider.get(record.provider) || { requests: 0, tokens: 0, cost: 0 };
      byProvider.set(record.provider, {
        requests: existing.requests + 1,
        tokens: existing.tokens + record.totalTokens,
        cost: existing.cost + record.estimatedCost,
      });
    }

    // Convertir en array
    return Array.from(byProvider.entries()).map(([provider, data]) => ({
      provider,
      ...data,
    }));
  } catch (error) {
    console.error('[AI Usage] Failed to get usage by provider from database:', error);

    // Fallback vers stockage en mémoire
    const records = usageStore.get(userId) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const periodRecords = records.filter((r) => r.createdAt >= cutoffDate);

    const byProvider = new Map<string, { requests: number; tokens: number; cost: number }>();
    for (const record of periodRecords) {
      const existing = byProvider.get(record.provider) || { requests: 0, tokens: 0, cost: 0 };
      byProvider.set(record.provider, {
        requests: existing.requests + 1,
        tokens: existing.tokens + record.totalTokens,
        cost: existing.cost + record.estimatedCost,
      });
    }

    return Array.from(byProvider.entries()).map(([provider, data]) => ({
      provider,
      ...data,
    }));
  }
}

/**
 * Récupère les statistiques par contexte d'utilisation
 */
export async function getUsageByContext(
  userId: string,
  days: number = 30
): Promise<Array<{ context: string; requests: number; tokens: number; cost: number }>> {
  try {
    // Calculer la date limite
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Requête Prisma
    const records = await prisma.aIUsage.findMany({
      where: {
        userId,
        createdAt: {
          gte: cutoffDate,
        },
      },
    });

    // Grouper manuellement par contexte
    const byContext = new Map<string, { requests: number; tokens: number; cost: number }>();

    for (const record of records) {
      const context = record.context || 'other';
      const existing = byContext.get(context) || { requests: 0, tokens: 0, cost: 0 };
      byContext.set(context, {
        requests: existing.requests + 1,
        tokens: existing.tokens + record.totalTokens,
        cost: existing.cost + record.estimatedCost,
      });
    }

    // Convertir en array
    return Array.from(byContext.entries()).map(([context, data]) => ({
      context,
      ...data,
    }));
  } catch (error) {
    console.error('[AI Usage] Failed to get usage by context from database:', error);

    // Fallback vers stockage en mémoire
    const records = usageStore.get(userId) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const periodRecords = records.filter((r) => r.createdAt >= cutoffDate);

    const byContext = new Map<string, { requests: number; tokens: number; cost: number }>();
    for (const record of periodRecords) {
      const context = record.context || 'other';
      const existing = byContext.get(context) || { requests: 0, tokens: 0, cost: 0 };
      byContext.set(context, {
        requests: existing.requests + 1,
        tokens: existing.tokens + record.totalTokens,
        cost: existing.cost + record.estimatedCost,
      });
    }

    return Array.from(byContext.entries()).map(([context, data]) => ({
      context,
      ...data,
    }));
  }
}

/**
 * Récupère l'historique détaillé des requêtes
 */
export function getUsageHistory(
  userId: string,
  limit: number = 50
): AIUsageRecord[] {
  const records = usageStore.get(userId) || [];

  // Retourner les N derniers enregistrements
  return records.slice(-limit).reverse();
}

/**
 * Exporte les données d'utilisation au format CSV
 */
export function exportUsageCSV(userId: string, days: number = 30): string {
  const records = usageStore.get(userId) || [];

  // Calculer la date limite
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Filtrer les enregistrements
  const periodRecords = records.filter((r) => r.createdAt >= cutoffDate);

  // Générer le CSV
  const headers = [
    'Date',
    'Provider',
    'Model',
    'Prompt Tokens',
    'Completion Tokens',
    'Total Tokens',
    'Cost (€)',
    'Context',
  ];

  const rows = periodRecords.map((r) => [
    r.createdAt.toISOString(),
    r.provider,
    r.model,
    r.promptTokens.toString(),
    r.completionTokens.toString(),
    r.totalTokens.toString(),
    r.estimatedCost.toFixed(6),
    r.context || '',
  ]);

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return csv;
}

/**
 * Nettoie les anciens enregistrements
 */
function cleanupOldRecords(userId: string, maxAgeDays: number): void {
  const records = usageStore.get(userId) || [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

  const filteredRecords = records.filter((r) => r.createdAt >= cutoffDate);

  usageStore.set(userId, filteredRecords);
}

/**
 * Supprime tous les enregistrements d'un utilisateur
 */
export function deleteUserUsage(userId: string): void {
  usageStore.delete(userId);
}

/**
 * Calcule les projections de coût
 */
export function getCostProjections(userId: string): {
  currentMonth: number;
  projectedMonth: number;
  averagePerRequest: number;
  averagePerDay: number;
} {
  const monthlyStats = getUsageStats(userId, 'month');
  const dailyStats = getUsageStats(userId, 'day');

  // Coût actuel du mois
  const currentMonth = monthlyStats.estimatedCost;

  // Projection sur le mois (basée sur la moyenne des 30 derniers jours)
  const daysInMonth = 30;
  const averagePerDay = currentMonth / daysInMonth;
  const projectedMonth = averagePerDay * daysInMonth;

  // Moyenne par requête
  const averagePerRequest =
    monthlyStats.requestCount > 0 ? currentMonth / monthlyStats.requestCount : 0;

  return {
    currentMonth,
    projectedMonth,
    averagePerRequest,
    averagePerDay,
  };
}

/**
 * Vérifie si l'utilisateur approche d'une limite de budget
 * (À implémenter avec une fonctionnalité de budget utilisateur)
 */
export function checkBudgetLimit(
  userId: string,
  monthlyBudget: number
): {
  isNearLimit: boolean;
  percentageUsed: number;
  remainingBudget: number;
} {
  const stats = getUsageStats(userId, 'month');

  const percentageUsed = (stats.estimatedCost / monthlyBudget) * 100;
  const remainingBudget = monthlyBudget - stats.estimatedCost;
  const isNearLimit = percentageUsed >= 80;

  return {
    isNearLimit,
    percentageUsed,
    remainingBudget,
  };
}

/**
 * Génère un ID unique pour un enregistrement
 */
function generateRecordId(): string {
  return `usage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Récupère les statistiques globales (admin)
 * Agrégation sur tous les utilisateurs
 */
export function getGlobalUsageStats(days: number = 30): {
  totalUsers: number;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byProvider: Record<string, { requests: number; cost: number }>;
} {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const stats = {
    totalUsers: 0,
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    byProvider: {} as Record<string, { requests: number; cost: number }>,
  };

  const userSet = new Set<string>();

  for (const [userId, records] of Array.from(usageStore.entries())) {
    const periodRecords = records.filter((r) => r.createdAt >= cutoffDate);

    if (periodRecords.length > 0) {
      userSet.add(userId);

      for (const record of periodRecords) {
        stats.totalRequests++;
        stats.totalTokens += record.totalTokens;
        stats.totalCost += record.estimatedCost;

        if (!stats.byProvider[record.provider]) {
          stats.byProvider[record.provider] = { requests: 0, cost: 0 };
        }

        stats.byProvider[record.provider]!.requests++;
        stats.byProvider[record.provider]!.cost += record.estimatedCost;
      }
    }
  }

  stats.totalUsers = userSet.size;

  return stats;
}
