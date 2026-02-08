import type { NotificationPayload, NotificationDeliveryResult } from "../types";

/**
 * Push notification channel
 * Sends push notifications via Web Push API or OneSignal
 *
 * Setup Options:
 *
 * Option 1 - Web Push API (Free, self-hosted):
 * 1. Install: npm install web-push
 * 2. Generate VAPID keys: npx web-push generate-vapid-keys
 * 3. Add to .env:
 *    VAPID_PUBLIC_KEY=""
 *    VAPID_PRIVATE_KEY=""
 *    VAPID_SUBJECT="mailto:contact@empreinte-fiscale.fr"
 *
 * Option 2 - OneSignal (Managed service):
 * 1. Install: npm install onesignal-node
 * 2. Create app on onesignal.com
 * 3. Add to .env:
 *    ONESIGNAL_APP_ID=""
 *    ONESIGNAL_API_KEY=""
 */

interface PushProvider {
  send(subscription: PushSubscription, notification: PushNotification): Promise<void>;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

/**
 * Initialize push provider based on environment variables
 */
function getPushProvider(): PushProvider | null {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const oneSignalAppId = process.env.ONESIGNAL_APP_ID;
  const oneSignalApiKey = process.env.ONESIGNAL_API_KEY;

  // For MVP: Push packages not installed yet
  // Return null to use in-app notifications only
  if (vapidPublicKey || vapidPrivateKey || oneSignalAppId || oneSignalApiKey) {
    console.warn(
      "[PushChannel] Push providers not installed. Install web-push or onesignal-node to enable push notifications."
    );
  }

  return null;
}

/**
 * Web Push API provider implementation (STUB - package not installed)
 * To enable: npm install web-push
 */
function getWebPushProvider(publicKey: string, privateKey: string): PushProvider {
  throw new Error("web-push not installed. Run: npm install web-push");
}

/**
 * OneSignal provider implementation (STUB - package not installed)
 * To enable: npm install onesignal-node
 */
function getOneSignalProvider(appId: string, apiKey: string): PushProvider {
  throw new Error("onesignal-node not installed. Run: npm install onesignal-node");
}

/**
 * Send push notification
 */
export async function sendPushNotification(
  payload: NotificationPayload,
  pushSubscription: PushSubscription | null
): Promise<NotificationDeliveryResult> {
  const startTime = new Date();

  try {
    const provider = getPushProvider();

    if (!provider) {
      return {
        success: false,
        channel: "push",
        error: "No push provider configured",
        timestamp: startTime,
      };
    }

    if (!pushSubscription) {
      return {
        success: false,
        channel: "push",
        error: "User has no push subscription",
        timestamp: startTime,
      };
    }

    await provider.send(pushSubscription, {
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });

    return {
      success: true,
      channel: "push",
      timestamp: startTime,
    };
  } catch (error) {
    console.error("[PushChannel] Failed to send push notification:", error);
    return {
      success: false,
      channel: "push",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: startTime,
    };
  }
}

/**
 * Store push subscription for a user
 * This should be called from the client-side when user grants permission
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<void> {
  // This would typically store the subscription in the database
  // For now, this is a placeholder
  console.log(`[PushChannel] Saving subscription for user ${userId}:`, subscription);

  // TODO: Add PushSubscription model to Prisma schema
  // await prisma.pushSubscription.upsert({
  //   where: { userId },
  //   update: { subscription: subscription as any },
  //   create: { userId, subscription: subscription as any },
  // });
}

/**
 * Get push subscription for a user
 */
export async function getPushSubscription(
  userId: string
): Promise<PushSubscription | null> {
  // This would typically retrieve the subscription from the database
  // For now, return null (push notifications not yet configured)
  console.log(`[PushChannel] Retrieving subscription for user ${userId}`);

  // TODO: Implement after adding PushSubscription model
  // const record = await prisma.pushSubscription.findUnique({ where: { userId } });
  // return record?.subscription as PushSubscription | null;

  return null;
}

/**
 * Delete push subscription for a user
 */
export async function deletePushSubscription(userId: string): Promise<void> {
  console.log(`[PushChannel] Deleting subscription for user ${userId}`);

  // TODO: Implement after adding PushSubscription model
  // await prisma.pushSubscription.delete({ where: { userId } });
}
