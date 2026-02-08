import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendNotification, batchSendNotifications } from "@/modules/notifications/service";
import type { NotificationPayload, NotificationChannel } from "@/modules/notifications/types";

/**
 * POST /api/notifications/send
 * Send a notification to one or more users
 *
 * ⚠️ ADMIN ONLY - Requires admin role
 *
 * Body:
 * {
 *   userId?: string,          // Single user
 *   userIds?: string[],       // Multiple users
 *   type: NotificationType,
 *   title: string,
 *   body: string,
 *   channels: NotificationChannel[],
 *   data?: Record<string, any>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user is admin
    // TODO: Implement proper admin role checking
    // For now, check if user email is in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const isAdmin = session.user.email && adminEmails.includes(session.user.email);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Accès refusé - droits administrateur requis" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.title || !body.body || !body.channels) {
      return NextResponse.json(
        {
          error: "Champs requis : type, title, body, channels",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.channels) || body.channels.length === 0) {
      return NextResponse.json(
        { error: "channels doit être un tableau non vide" },
        { status: 400 }
      );
    }

    // Validate channels
    const validChannels: NotificationChannel[] = ["email", "push", "in-app"];
    for (const channel of body.channels) {
      if (!validChannels.includes(channel)) {
        return NextResponse.json(
          { error: `Canal invalide : ${channel}` },
          { status: 400 }
        );
      }
    }

    // Single user or multiple users?
    if (body.userId) {
      // Send to single user
      const payload: NotificationPayload = {
        userId: body.userId,
        type: body.type,
        title: body.title,
        body: body.body,
        channels: body.channels,
        data: body.data,
      };

      const result = await sendNotification(payload);

      return NextResponse.json({
        success: result.allSuccessful,
        notificationId: result.notificationId,
        deliveryResults: result.deliveryResults,
      });
    } else if (body.userIds && Array.isArray(body.userIds)) {
      // Send to multiple users
      const payloads: NotificationPayload[] = body.userIds.map((userId: string) => ({
        userId,
        type: body.type,
        title: body.title,
        body: body.body,
        channels: body.channels,
        data: body.data,
      }));

      const results = await batchSendNotifications(payloads);

      const successCount = results.filter((r) => r.allSuccessful).length;

      return NextResponse.json({
        success: true,
        totalSent: results.length,
        successCount,
        failureCount: results.length - successCount,
        results,
      });
    } else {
      return NextResponse.json(
        { error: "userId ou userIds requis" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[API] Error sending notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la notification" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/send
 * Get information about send endpoint (for admins)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    const isAdmin = session.user.email && adminEmails.includes(session.user.email);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Accès refusé - droits administrateur requis" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      endpoint: "/api/notifications/send",
      method: "POST",
      description: "Send notifications to users (admin only)",
      requiredFields: ["type", "title", "body", "channels", "userId or userIds"],
      availableTypes: [
        "DAILY_FACT",
        "FISCAL_ALERT",
        "WEEKLY_DIGEST",
        "EVENT_TRIGGERED",
        "BADGE_EARNED",
        "CHALLENGE_COMPLETED",
        "LEVEL_UP",
        "STREAK_REMINDER",
        "SCORE_RECALCULATION_AVAILABLE",
        "REFERENTIEL_UPDATE",
      ],
      availableChannels: ["email", "push", "in-app"],
      example: {
        userId: "user_123",
        type: "DAILY_FACT",
        title: "💡 Le saviez-vous ?",
        body: "Votre contribution à l'armée : 3,40€",
        channels: ["in-app", "push"],
        data: { factId: "army_contribution" },
      },
    });
  } catch (error) {
    console.error("[API] Error fetching send info:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
