import { prisma } from "@/lib/prisma";
import type { NotificationPayload } from "../types";
import { NOTIFICATION_TEMPLATES, interpolateTemplate } from "../templates";

/**
 * Weekly Digest Generator
 * Compiles a summary of user's fiscal activity over the past week
 */

export interface WeeklyDigestData {
  userId: string;
  weekStart: Date;
  weekEnd: Date;

  // Journal activity
  entriesCount: number;
  totalTaxesPaid: number;
  totalServicesReceived: number;

  // Gamification
  streakDays: number;
  longestStreak: number;
  badgesEarned: number;
  challengesCompleted: number;
  xpGained: number;
  levelUps: number;

  // Engagement
  profileUpdates: number;
  simulationsCreated: number;

  // Insights
  topTaxCategory: string;
  topTaxAmount: number;
  averageDailyTaxes: number;
}

/**
 * Generate weekly digest notifications for all eligible users
 */
export async function generateWeeklyDigests(): Promise<NotificationPayload[]> {
  console.log("[WeeklyDigest] Generating weekly digests...");

  // Get all users who have weekly digest enabled
  const preferences = await prisma.userNotificationPreferences.findMany({
    where: { weeklyDigestEnabled: true },
    select: { userId: true },
  });

  if (preferences.length === 0) {
    console.log("[WeeklyDigest] No users with weekly digest enabled");
    return [];
  }

  console.log(`[WeeklyDigest] Generating digests for ${preferences.length} users`);

  // Generate digest for each user
  const notifications = await Promise.all(
    preferences.map((pref) => generateWeeklyDigestForUser(pref.userId))
  );

  return notifications.filter((n): n is NotificationPayload => n !== null);
}

/**
 * Generate a weekly digest for a specific user
 */
export async function generateWeeklyDigestForUser(
  userId: string
): Promise<NotificationPayload | null> {
  try {
    const digestData = await compileWeeklyDigestData(userId);

    // Skip if user had no activity
    if (digestData.entriesCount === 0 && digestData.profileUpdates === 0) {
      console.log(`[WeeklyDigest] User ${userId} had no activity, skipping`);
      return null;
    }

    const notification = createWeeklyDigestNotification(digestData);
    return notification;
  } catch (error) {
    console.error(`[WeeklyDigest] Failed to generate digest for user ${userId}:`, error);
    return null;
  }
}

/**
 * Compile weekly digest data for a user
 */
export async function compileWeeklyDigestData(
  userId: string
): Promise<WeeklyDigestData> {
  const weekEnd = new Date();
  weekEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  // Fetch all data in parallel
  const [
    journalEntries,
    streak,
    badgesEarned,
    challengesCompleted,
    gamificationData,
    simulations,
    profileUpdates,
  ] = await Promise.all([
    // Journal entries
    prisma.journalEntry.findMany({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
      select: {
        montantTVA: true,
        statut: true,
      },
    }),

    // Streak data
    prisma.userStreak.findUnique({
      where: { userId },
      select: { currentStreak: true, longestStreak: true },
    }),

    // Badges earned this week
    prisma.userBadge.count({
      where: {
        userId,
        earnedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),

    // Challenges completed this week
    prisma.userChallenge.count({
      where: {
        userId,
        status: "COMPLETED",
        completedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),

    // Gamification data (for XP calculation)
    // Note: userGamification model doesn't exist yet - stubbed for now
    Promise.resolve(null),

    // Simulations created this week
    prisma.simulation.count({
      where: {
        userId,
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),

    // Profile updates (approximate - would need a proper audit log)
    prisma.profilFiscal.findUnique({
      where: { userId },
      select: { updatedAt: true },
    }),
  ]);

  // Calculate totals
  const totalTaxesPaid = journalEntries.reduce(
    (sum, entry) => sum + (entry.montantTVA || 0),
    0
  );

  // Estimate services received (would need actual calculation)
  const totalServicesReceived = totalTaxesPaid * 0.8; // Simplified

  // Check if profile was updated this week
  const profileUpdatesCount =
    profileUpdates && profileUpdates.updatedAt >= weekStart &&
    profileUpdates.updatedAt <= weekEnd
      ? 1
      : 0;

  // Calculate XP gained this week (would need historical tracking)
  const xpGained = challengesCompleted * 100; // Simplified

  const averageDailyTaxes = totalTaxesPaid / 7;

  return {
    userId,
    weekStart,
    weekEnd,
    entriesCount: journalEntries.length,
    totalTaxesPaid: Math.round(totalTaxesPaid * 100) / 100,
    totalServicesReceived: Math.round(totalServicesReceived * 100) / 100,
    streakDays: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    badgesEarned,
    challengesCompleted,
    xpGained,
    levelUps: 0, // Would need historical tracking
    profileUpdates: profileUpdatesCount,
    simulationsCreated: simulations,
    topTaxCategory: "TVA", // Simplified
    topTaxAmount: totalTaxesPaid,
    averageDailyTaxes: Math.round(averageDailyTaxes * 100) / 100,
  };
}

/**
 * Create a weekly digest notification from compiled data
 */
function createWeeklyDigestNotification(
  data: WeeklyDigestData
): NotificationPayload {
  const template = NOTIFICATION_TEMPLATES.WEEKLY_DIGEST;

  if (!template) {
    throw new Error('WEEKLY_DIGEST template not found');
  }

  // Format dates
  const weekStartStr = data.weekStart.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
  const weekEndStr = data.weekEnd.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  // Build engaging body text
  let body = `📊 **Votre semaine fiscale** (${weekStartStr} - ${weekEndStr})\n\n`;

  // Activity section
  if (data.entriesCount > 0) {
    body += `🧾 **Activité**\n`;
    body += `• ${data.entriesCount} entrées enregistrées\n`;
    body += `• ${formatCurrency(data.totalTaxesPaid)} de taxes payées\n`;
    body += `• ${formatCurrency(data.totalServicesReceived)} de services reçus\n\n`;
  }

  // Gamification section
  if (data.streakDays > 0 || data.badgesEarned > 0 || data.challengesCompleted > 0) {
    body += `🎮 **Progression**\n`;
    if (data.streakDays > 0) {
      body += `• Série : ${data.streakDays} jours 🔥\n`;
    }
    if (data.badgesEarned > 0) {
      body += `• ${data.badgesEarned} badge${data.badgesEarned > 1 ? "s" : ""} débloqué${data.badgesEarned > 1 ? "s" : ""}\n`;
    }
    if (data.challengesCompleted > 0) {
      body += `• ${data.challengesCompleted} défi${data.challengesCompleted > 1 ? "s" : ""} accompli${data.challengesCompleted > 1 ? "s" : ""}\n`;
    }
    if (data.xpGained > 0) {
      body += `• +${data.xpGained} XP gagnés\n`;
    }
    body += `\n`;
  }

  // Insights section
  if (data.entriesCount > 0) {
    body += `💡 **Insights**\n`;
    body += `• Moyenne quotidienne : ${formatCurrency(data.averageDailyTaxes)}\n`;
    if (data.simulationsCreated > 0) {
      body += `• ${data.simulationsCreated} simulation${data.simulationsCreated > 1 ? "s" : ""} créée${data.simulationsCreated > 1 ? "s" : ""}\n`;
    }
  }

  // Encouragement
  if (data.entriesCount > 5) {
    body += `\n🌟 Excellente semaine ! Continuez comme ça !`;
  } else if (data.entriesCount > 0) {
    body += `\n👍 Bon début ! Essayez de logger encore plus la semaine prochaine.`;
  } else {
    body += `\n📝 Semaine calme... Loggez vos dépenses pour mieux suivre vos taxes !`;
  }

  return {
    userId: data.userId,
    type: "WEEKLY_DIGEST",
    title: template.titleTemplate,
    body,
    channels: template.channels,
    data: {
      weekStart: data.weekStart.toISOString(),
      weekEnd: data.weekEnd.toISOString(),
      stats: data,
    },
  };
}

/**
 * Get weekly digest preview for a user (without sending)
 */
export async function getWeeklyDigestPreview(
  userId: string
): Promise<WeeklyDigestData> {
  return compileWeeklyDigestData(userId);
}

/**
 * Get weekly digest statistics
 */
export async function getWeeklyDigestStats(): Promise<{
  eligibleUsers: number;
  sentThisWeek: number;
  averageEngagement: number;
}> {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const [eligibleUsers, sentThisWeek] = await Promise.all([
    prisma.userNotificationPreferences.count({
      where: { weeklyDigestEnabled: true },
    }),
    prisma.notification.count({
      where: {
        type: "WEEKLY_DIGEST",
        sentAt: { gte: weekStart },
      },
    }),
  ]);

  const readCount = await prisma.notification.count({
    where: {
      type: "WEEKLY_DIGEST",
      sentAt: { gte: weekStart },
      read: true,
    },
  });

  const averageEngagement = sentThisWeek > 0 ? (readCount / sentThisWeek) * 100 : 0;

  return {
    eligibleUsers,
    sentThisWeek,
    averageEngagement: Math.round(averageEngagement * 100) / 100,
  };
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
