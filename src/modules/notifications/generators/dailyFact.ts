import { prisma } from "@/lib/prisma";
import type { NotificationPayload } from "../types";
import { getRandomDailyFact, NOTIFICATION_TEMPLATES } from "../templates";
import {
  getPersonalizationContext,
  personalizeTemplate,
} from "../personalization";

/**
 * Daily Tax Fact Generator
 * Generates personalized daily tax facts for users who opted in
 */

export interface DailyFactOptions {
  excludeUserIds?: string[];
  limit?: number;
}

/**
 * Generate daily fact notifications for all eligible users
 */
export async function generateDailyFacts(
  options: DailyFactOptions = {}
): Promise<NotificationPayload[]> {
  const { excludeUserIds = [], limit } = options;

  console.log("[DailyFact] Generating daily facts...");

  // Get all users who have daily facts enabled
  const preferences = await prisma.userNotificationPreferences.findMany({
    where: {
      dailyFactsEnabled: true,
      userId: { notIn: excludeUserIds },
    },
    select: { userId: true },
    take: limit,
  });

  if (preferences.length === 0) {
    console.log("[DailyFact] No users with daily facts enabled");
    return [];
  }

  console.log(`[DailyFact] Generating facts for ${preferences.length} users`);

  // Generate personalized fact for each user
  const notifications = await Promise.all(
    preferences.map((pref) => generateDailyFactForUser(pref.userId))
  );

  return notifications.filter((n): n is NotificationPayload => n !== null);
}

/**
 * Generate a personalized daily fact for a specific user
 */
export async function generateDailyFactForUser(
  userId: string
): Promise<NotificationPayload | null> {
  try {
    // Get user's personalization context
    const context = await getPersonalizationContext(userId);

    // Select a random fact template
    const factTemplate = getRandomDailyFact();

    // Personalize the fact with user's data
    const personalizedFact = personalizeTemplate(factTemplate, context);

    // Get the notification template
    const template = NOTIFICATION_TEMPLATES.DAILY_FACT;

    if (!template) {
      console.error('[DailyFact] Template not found');
      return null;
    }

    // Build notification payload
    const payload: NotificationPayload = {
      userId,
      type: "DAILY_FACT",
      title: template.titleTemplate,
      body: personalizedFact,
      channels: template.channels,
      data: {
        factTemplate,
        generatedAt: new Date().toISOString(),
      },
    };

    return payload;
  } catch (error) {
    console.error(`[DailyFact] Failed to generate fact for user ${userId}:`, error);
    return null;
  }
}

/**
 * Get fact of the day for a user (synchronous, returns immediately)
 * Used for displaying fact in the UI without sending a notification
 */
export async function getFactOfTheDay(userId: string): Promise<string> {
  try {
    const context = await getPersonalizationContext(userId);
    const factTemplate = getRandomDailyFact();
    return personalizeTemplate(factTemplate, context);
  } catch (error) {
    console.error(`[DailyFact] Failed to get fact for user ${userId}:`, error);
    return "Saviez-vous que vos impôts financent des milliers de services publics chaque jour ?";
  }
}

/**
 * Get statistics about daily facts
 */
export async function getDailyFactStats(): Promise<{
  eligibleUsers: number;
  sentToday: number;
  averageEngagement: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [eligibleUsers, sentToday] = await Promise.all([
    prisma.userNotificationPreferences.count({
      where: { dailyFactsEnabled: true },
    }),
    prisma.notification.count({
      where: {
        type: "DAILY_FACT",
        sentAt: { gte: today },
      },
    }),
  ]);

  // Calculate engagement (read notifications / sent notifications)
  const readCount = await prisma.notification.count({
    where: {
      type: "DAILY_FACT",
      sentAt: { gte: today },
      read: true,
    },
  });

  const averageEngagement = sentToday > 0 ? (readCount / sentToday) * 100 : 0;

  return {
    eligibleUsers,
    sentToday,
    averageEngagement: Math.round(averageEngagement * 100) / 100,
  };
}

/**
 * Test daily fact generation for a user (for debugging)
 */
export async function testDailyFact(userId: string): Promise<{
  payload: NotificationPayload | null;
  context: any;
  template: string;
}> {
  const context = await getPersonalizationContext(userId);
  const template = getRandomDailyFact();
  const payload = await generateDailyFactForUser(userId);

  return {
    payload,
    context,
    template,
  };
}

/**
 * Schedule daily facts for optimal delivery time
 * Takes into account user's timezone and preferences
 */
export async function getOptimalDeliveryTime(userId: string): Promise<Date> {
  const preferences = await prisma.userNotificationPreferences.findUnique({
    where: { userId },
    select: { timezone: true, quietHoursStart: true, quietHoursEnd: true },
  });

  const now = new Date();

  // Default to 9 AM in user's timezone
  let deliveryHour = 9;

  if (preferences) {
    // If user's quiet hours include morning, deliver after quiet hours end
    if (preferences.quietHoursEnd > deliveryHour) {
      deliveryHour = preferences.quietHoursEnd + 1;
    }
  }

  const deliveryTime = new Date(now);
  deliveryTime.setHours(deliveryHour, 0, 0, 0);

  // If it's past delivery time today, schedule for tomorrow
  if (deliveryTime < now) {
    deliveryTime.setDate(deliveryTime.getDate() + 1);
  }

  return deliveryTime;
}
