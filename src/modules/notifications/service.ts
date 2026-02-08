import { prisma } from "@/lib/prisma";
import type {
  NotificationPayload,
  NotificationChannel,
  SendNotificationResult,
  NotificationDeliveryResult,
  NotificationPreferences,
} from "./types";
import { sendInAppNotification } from "./channels/inApp";
import { sendEmailNotification } from "./channels/email";
import { sendPushNotification, getPushSubscription } from "./channels/push";

/**
 * Main notification service
 * Orchestrates notification delivery across multiple channels
 */

/**
 * Send a notification to a user across specified channels
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<SendNotificationResult> {
  console.log(`[NotificationService] Sending notification to user ${payload.userId}:`, payload.type);

  // Get user preferences and check if notifications are enabled
  const preferences = await getUserNotificationPreferences(payload.userId);
  if (!preferences || !(await shouldSendNotification(payload, preferences))) {
    console.log(`[NotificationService] Notification blocked by user preferences`);
    return {
      notificationId: "",
      deliveryResults: [],
      allSuccessful: false,
    };
  }

  // Filter channels based on user preferences
  const enabledChannels = filterEnabledChannels(payload.channels, preferences);

  if (enabledChannels.length === 0) {
    console.log(`[NotificationService] No enabled channels for this notification`);
    return {
      notificationId: "",
      deliveryResults: [],
      allSuccessful: false,
    };
  }

  // Get user email for email channel
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { email: true },
  });

  if (!user) {
    throw new Error(`User ${payload.userId} not found`);
  }

  // Send to each enabled channel
  const deliveryResults: NotificationDeliveryResult[] = [];

  for (const channel of enabledChannels) {
    let result: NotificationDeliveryResult;

    switch (channel) {
      case "in-app":
        result = await sendInAppNotification(payload);
        break;

      case "email":
        result = await sendEmailNotification(payload, user.email);
        break;

      case "push":
        const pushSubscription = await getPushSubscription(payload.userId);
        result = await sendPushNotification(payload, pushSubscription);
        break;

      default:
        result = {
          success: false,
          channel,
          error: "Unknown channel",
          timestamp: new Date(),
        };
    }

    deliveryResults.push(result);
  }

  const successfulDeliveries = deliveryResults.filter((r) => r.success);
  const notificationId =
    successfulDeliveries.length > 0
      ? `notif_${payload.userId}_${Date.now()}`
      : "";

  console.log(
    `[NotificationService] Delivered to ${successfulDeliveries.length}/${deliveryResults.length} channels`
  );

  return {
    notificationId,
    deliveryResults,
    allSuccessful: successfulDeliveries.length === deliveryResults.length,
  };
}

/**
 * Get user notification preferences
 */
export async function getUserNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  const prefs = await prisma.userNotificationPreferences.findUnique({
    where: { userId },
  });

  if (!prefs) {
    // Create default preferences if they don't exist
    const newPrefs = await prisma.userNotificationPreferences.create({
      data: {
        userId,
        dailyFactsEnabled: false,
        fiscalAlertsEnabled: true,
        weeklyDigestEnabled: false,
        emailChannel: true,
        pushChannel: false,
        inAppChannel: true,
        quietHoursStart: 22,
        quietHoursEnd: 8,
        timezone: "Europe/Paris",
      },
    });
    return newPrefs;
  }

  return prefs;
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  return prisma.userNotificationPreferences.upsert({
    where: { userId },
    update: updates,
    create: {
      userId,
      dailyFactsEnabled: false,
      fiscalAlertsEnabled: true,
      weeklyDigestEnabled: false,
      emailChannel: true,
      pushChannel: false,
      inAppChannel: true,
      quietHoursStart: 22,
      quietHoursEnd: 8,
      timezone: "Europe/Paris",
      ...updates,
    },
  });
}

/**
 * Check if notification should be sent based on user preferences
 */
async function shouldSendNotification(
  payload: NotificationPayload,
  preferences: NotificationPreferences
): Promise<boolean> {
  // Check type-specific preferences
  switch (payload.type) {
    case "DAILY_FACT":
      if (!preferences.dailyFactsEnabled) return false;
      break;
    case "FISCAL_ALERT":
      if (!preferences.fiscalAlertsEnabled) return false;
      break;
    case "WEEKLY_DIGEST":
      if (!preferences.weeklyDigestEnabled) return false;
      break;
    // Other types (BADGE_EARNED, LEVEL_UP, etc.) are always sent
  }

  // Check quiet hours
  if (isInQuietHours(preferences)) {
    console.log(`[NotificationService] In quiet hours, skipping notification`);
    return false;
  }

  return true;
}

/**
 * Check if current time is in user's quiet hours
 */
function isInQuietHours(preferences: NotificationPreferences): boolean {
  const now = new Date();
  const currentHour = now.getHours();

  const { quietHoursStart, quietHoursEnd } = preferences;

  // Handle quiet hours that span midnight (e.g., 22:00 to 08:00)
  if (quietHoursStart > quietHoursEnd) {
    return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
  }

  return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
}

/**
 * Filter channels based on user preferences
 */
function filterEnabledChannels(
  channels: NotificationChannel[],
  preferences: NotificationPreferences
): NotificationChannel[] {
  return channels.filter((channel) => {
    switch (channel) {
      case "email":
        return preferences.emailChannel;
      case "push":
        return preferences.pushChannel;
      case "in-app":
        return preferences.inAppChannel;
      default:
        return false;
    }
  });
}

/**
 * Batch send notifications to multiple users
 */
export async function batchSendNotifications(
  payloads: NotificationPayload[]
): Promise<SendNotificationResult[]> {
  console.log(`[NotificationService] Batch sending ${payloads.length} notifications`);

  const results = await Promise.allSettled(
    payloads.map((payload) => sendNotification(payload))
  );

  return results.map((result) =>
    result.status === "fulfilled"
      ? result.value
      : {
          notificationId: "",
          deliveryResults: [],
          allSuccessful: false,
        }
  );
}

/**
 * Schedule a notification for future delivery
 * This is a placeholder for future cron job integration
 */
export async function scheduleNotification(
  payload: NotificationPayload
): Promise<string> {
  if (!payload.scheduledFor) {
    throw new Error("scheduledFor is required for scheduled notifications");
  }

  console.log(
    `[NotificationService] Scheduling notification for ${payload.scheduledFor.toISOString()}`
  );

  // TODO: Implement with a job queue (Bull, BullMQ, etc.)
  // For now, just log it
  return `scheduled_${Date.now()}`;
}
