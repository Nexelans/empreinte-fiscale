import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/modules/notifications/channels/inApp";

/**
 * GET /api/notifications
 * Get user's notifications with pagination
 *
 * Query params:
 * - limit: number (default 50)
 * - offset: number (default 0)
 * - unreadOnly: boolean (default false)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Validate params
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "limit doit être entre 1 et 100" },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: "offset doit être >= 0" },
        { status: 400 }
      );
    }

    // Get notifications
    const result = await getUserNotifications(session.user.id, {
      limit,
      offset,
      includeRead: !unreadOnly,
    });

    // Get unread count
    const unreadCount = await getUnreadCount(session.user.id);

    return NextResponse.json({
      notifications: result.notifications,
      pagination: {
        limit,
        offset,
        total: result.totalCount,
        hasMore: result.hasMore,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("[API] Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notification(s) as read
 *
 * Body:
 * {
 *   notificationId?: string,  // Mark single notification as read
 *   markAllAsRead?: boolean   // Mark all notifications as read
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();

    if (body.markAllAsRead) {
      // Mark all notifications as read
      const result = await markAllAsRead(session.user.id);

      return NextResponse.json({
        success: true,
        markedCount: result.count,
        message: `${result.count} notification(s) marquée(s) comme lue(s)`,
      });
    } else if (body.notificationId) {
      // Mark single notification as read
      try {
        await markAsRead(body.notificationId, session.user.id);

        return NextResponse.json({
          success: true,
          message: "Notification marquée comme lue",
        });
      } catch (error) {
        return NextResponse.json(
          { error: "Notification introuvable ou accès refusé" },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "notificationId ou markAllAsRead requis" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[API] Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Erreur lors du marquage des notifications" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete a notification
 *
 * Query params:
 * - id: string (notification ID)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "ID de notification requis" },
        { status: 400 }
      );
    }

    try {
      await deleteNotification(notificationId, session.user.id);

      return NextResponse.json({
        success: true,
        message: "Notification supprimée",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Notification introuvable ou accès refusé" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("[API] Error deleting notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la notification" },
      { status: 500 }
    );
  }
}
