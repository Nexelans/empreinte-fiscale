import { prisma } from "@/lib/prisma";
import type { ScoreFiscal } from "./types";

/**
 * Score History Module
 * Manages historical score data for temporal evolution tracking
 */

export interface ScoreHistoryEntry {
  id: string;
  userId: string;
  month: number;
  year: number;
  scoreFiscalData: ScoreFiscal;
  confidenceScore: number;
  createdAt: Date;
}

export interface ScoreHistoryOptions {
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
  limit?: number;
}

/**
 * Save current score to history
 * Called after score calculation to track changes over time
 */
export async function saveScoreHistory(
  userId: string,
  score: ScoreFiscal,
  confidenceScore: number
): Promise<ScoreHistoryEntry> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed

  console.log(`[ScoreHistory] Saving score for user ${userId} (${year}-${month})`);

  try {
    // Check if entry already exists for this month
    const existing = await prisma.scoreHistory.findFirst({
      where: {
        userId,
        year,
        month,
      },
    });

    if (existing) {
      // Update existing entry
      const updated = await prisma.scoreHistory.update({
        where: { id: existing.id },
        data: {
          scoreFiscalData: score as any,
          confidenceScore,
        },
      });

      console.log(`[ScoreHistory] Updated existing entry for ${year}-${month}`);

      return {
        id: updated.id,
        userId: updated.userId,
        month: updated.month,
        year: updated.year,
        scoreFiscalData: updated.scoreFiscalData as any as ScoreFiscal,
        confidenceScore: updated.confidenceScore,
        createdAt: updated.createdAt,
      };
    } else {
      // Create new entry
      const created = await prisma.scoreHistory.create({
        data: {
          userId,
          year,
          month,
          millesime: score.millesime || year.toString(),
          scoreFiscalData: score as any,
          confidenceScore,
        },
      });

      console.log(`[ScoreHistory] Created new entry for ${year}-${month}`);

      return {
        id: created.id,
        userId: created.userId,
        month: created.month,
        year: created.year,
        scoreFiscalData: created.scoreFiscalData as any as ScoreFiscal,
        confidenceScore: created.confidenceScore,
        createdAt: created.createdAt,
      };
    }
  } catch (error) {
    console.error("[ScoreHistory] Error saving score history:", error);
    throw error;
  }
}

/**
 * Get score history for a user
 * Returns entries sorted by date (oldest first)
 */
export async function getScoreHistory(
  userId: string,
  options: ScoreHistoryOptions = {}
): Promise<ScoreHistoryEntry[]> {
  const { startYear, startMonth, endYear, endMonth, limit } = options;

  console.log(`[ScoreHistory] Fetching history for user ${userId}`);

  try {
    const where: any = { userId };

    // Apply date filters
    if (startYear !== undefined && startMonth !== undefined) {
      where.OR = [
        { year: { gt: startYear } },
        { year: startYear, month: { gte: startMonth } },
      ];
    }

    if (endYear !== undefined && endMonth !== undefined) {
      where.AND = [
        {
          OR: [
            { year: { lt: endYear } },
            { year: endYear, month: { lte: endMonth } },
          ],
        },
      ];
    }

    const entries = await prisma.scoreHistory.findMany({
      where,
      orderBy: [{ year: "asc" }, { month: "asc" }],
      take: limit,
    });

    return entries.map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      month: entry.month,
      year: entry.year,
      scoreFiscalData: entry.scoreFiscalData as any as ScoreFiscal,
      confidenceScore: entry.confidenceScore,
      createdAt: entry.createdAt,
    }));
  } catch (error) {
    console.error("[ScoreHistory] Error fetching score history:", error);
    throw error;
  }
}

/**
 * Get the most recent score history entry for a user
 */
export async function getLatestScoreHistory(
  userId: string
): Promise<ScoreHistoryEntry | null> {
  try {
    const entry = await prisma.scoreHistory.findFirst({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    if (!entry) {
      return null;
    }

    return {
      id: entry.id,
      userId: entry.userId,
      month: entry.month,
      year: entry.year,
      scoreFiscalData: entry.scoreFiscalData as any as ScoreFiscal,
      confidenceScore: entry.confidenceScore,
      createdAt: entry.createdAt,
    };
  } catch (error) {
    console.error("[ScoreHistory] Error fetching latest score history:", error);
    throw error;
  }
}

/**
 * Get score history count for a user
 */
export async function getScoreHistoryCount(userId: string): Promise<number> {
  try {
    return prisma.scoreHistory.count({ where: { userId } });
  } catch (error) {
    console.error("[ScoreHistory] Error counting score history:", error);
    throw error;
  }
}

/**
 * Delete score history for a user
 * Used when user deletes their account
 */
export async function deleteScoreHistory(userId: string): Promise<number> {
  try {
    const result = await prisma.scoreHistory.deleteMany({
      where: { userId },
    });

    console.log(`[ScoreHistory] Deleted ${result.count} entries for user ${userId}`);

    return result.count;
  } catch (error) {
    console.error("[ScoreHistory] Error deleting score history:", error);
    throw error;
  }
}

/**
 * Get score history for multiple users (admin only)
 */
export async function getScoreHistoryForUsers(
  userIds: string[],
  options: ScoreHistoryOptions = {}
): Promise<Record<string, ScoreHistoryEntry[]>> {
  try {
    const allEntries = await prisma.scoreHistory.findMany({
      where: {
        userId: { in: userIds },
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
      take: options.limit,
    });

    // Group by userId
    const grouped: Record<string, ScoreHistoryEntry[]> = {};
    for (const entry of allEntries) {
      if (!grouped[entry.userId]) {
        grouped[entry.userId] = [];
      }
      grouped[entry.userId]!.push({
        id: entry.id,
        userId: entry.userId,
        month: entry.month,
        year: entry.year,
        scoreFiscalData: entry.scoreFiscalData as any as ScoreFiscal,
        confidenceScore: entry.confidenceScore,
        createdAt: entry.createdAt,
      });
    }

    return grouped;
  } catch (error) {
    console.error("[ScoreHistory] Error fetching score history for users:", error);
    throw error;
  }
}

/**
 * Calculate month-over-month change
 */
export function calculateMonthlyChange(
  current: ScoreFiscal,
  previous: ScoreFiscal
): {
  totalPayeChange: number;
  totalRecuChange: number;
  soldeNetChange: number;
  ratioChange: number;
} {
  return {
    totalPayeChange: current.totalPaye - previous.totalPaye,
    totalRecuChange: current.totalRecu - previous.totalRecu,
    soldeNetChange: current.soldeNet - previous.soldeNet,
    ratioChange: current.ratio - previous.ratio,
  };
}

/**
 * Get year-over-year comparison
 */
export async function getYearOverYearComparison(
  userId: string,
  year: number
): Promise<{
  currentYear: ScoreHistoryEntry[];
  previousYear: ScoreHistoryEntry[];
  totalPayeChange: number;
  totalRecuChange: number;
  soldeNetChange: number;
} | null> {
  try {
    const currentYear = await getScoreHistory(userId, {
      startYear: year,
      startMonth: 1,
      endYear: year,
      endMonth: 12,
    });

    const previousYear = await getScoreHistory(userId, {
      startYear: year - 1,
      startMonth: 1,
      endYear: year - 1,
      endMonth: 12,
    });

    if (currentYear.length === 0 && previousYear.length === 0) {
      return null;
    }

    // Calculate totals
    const currentTotal = currentYear.reduce(
      (sum, entry) => sum + entry.scoreFiscalData.totalPaye,
      0
    );
    const previousTotal = previousYear.reduce(
      (sum, entry) => sum + entry.scoreFiscalData.totalPaye,
      0
    );

    const currentRecu = currentYear.reduce(
      (sum, entry) => sum + entry.scoreFiscalData.totalRecu,
      0
    );
    const previousRecu = previousYear.reduce(
      (sum, entry) => sum + entry.scoreFiscalData.totalRecu,
      0
    );

    return {
      currentYear,
      previousYear,
      totalPayeChange: currentTotal - previousTotal,
      totalRecuChange: currentRecu - previousRecu,
      soldeNetChange:
        currentTotal - currentRecu - (previousTotal - previousRecu),
    };
  } catch (error) {
    console.error("[ScoreHistory] Error getting year-over-year comparison:", error);
    throw error;
  }
}
