import { prisma } from "@/lib/prisma";
import type { NotificationPayload, NotificationDeliveryResult } from "../types";

/**
 * In-App notification channel
 * Creates a Notification record in the database
 */
export async function sendInAppNotification(
  payload: NotificationPayload
): Promise<NotificationDeliveryResult> {
  const startTime = new Date();

  try {
    // Create notification record
    await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        channels: ["in-app"],
        read: false,
        sentAt: startTime,
      },
    });

    return {
      success: true,
      channel: "in-app",
      timestamp: startTime,
    };
  } catch (error) {
    console.error("[InAppChannel] Failed to create notification:", error);
    return {
      success: false,
      channel: "in-app",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: startTime,
    };
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: {
      sentAt: "desc",
    },
    take: limit,
  });
}

/**
 * Get all notifications for a user with pagination
 */
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    includeRead?: boolean;
  } = {}
) {
  const { limit = 50, offset = 0, includeRead = true } = options;

  const where = includeRead ? { userId } : { userId, read: false };

  const [notifications, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: {
        sentAt: "desc",
      },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    totalCount,
    hasMore: offset + limit < totalCount,
  };
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.update({
    where: {
      id: notificationId,
      userId, // Ensure user owns this notification
    },
    data: {
      read: true,
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
  return prisma.notification.delete({
    where: {
      id: notificationId,
      userId, // Ensure user owns this notification
    },
  });
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}
