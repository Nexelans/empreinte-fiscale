import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendNotification } from "@/modules/notifications/service";
import type { NotificationPayload, NotificationChannel } from "@/modules/notifications/types";

/**
 * POST /api/notifications/test
 * Send a test notification to the current user
 *
 * This allows users to test their notification settings
 *
 * Body:
 * {
 *   channels?: NotificationChannel[]  // Optional, defaults to all enabled channels
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    // Default to all channels if not specified
    const channels: NotificationChannel[] = body.channels || ["in-app", "email", "push"];

    // Validate channels if provided
    if (body.channels) {
      const validChannels: NotificationChannel[] = ["email", "push", "in-app"];
      for (const channel of body.channels) {
        if (!validChannels.includes(channel)) {
          return NextResponse.json(
            { error: `Canal invalide : ${channel}` },
            { status: 400 }
          );
        }
      }
    }

    // Create test notification payload
    const userName = session.user.name || session.user.email?.split("@")[0] || "utilisateur";

    const payload: NotificationPayload = {
      userId: session.user.id,
      type: "EVENT_TRIGGERED",
      title: "🧪 Notification de test",
      body: `Bonjour ${userName} ! Ceci est une notification de test. Si vous recevez ce message, vos notifications fonctionnent correctement.`,
      channels,
      data: {
        isTest: true,
        testTimestamp: new Date().toISOString(),
        requestedChannels: channels,
      },
    };

    // Send the test notification
    const result = await sendNotification(payload);

    // Build response with detailed information
    const response = {
      success: result.allSuccessful,
      notificationId: result.notificationId,
      message: result.allSuccessful
        ? "Notification de test envoyée avec succès"
        : "La notification a été envoyée partiellement",
      deliveryResults: result.deliveryResults.map((dr) => ({
        channel: dr.channel,
        success: dr.success,
        error: dr.error,
        timestamp: dr.timestamp.toISOString(),
      })),
      tips: getTipsForFailedChannels(result.deliveryResults),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] Error sending test notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la notification de test" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/test
 * Get information about test notifications
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json({
      endpoint: "/api/notifications/test",
      method: "POST",
      description: "Send a test notification to verify your notification settings",
      optionalFields: {
        channels: "Array of channels to test (default: all enabled channels)",
      },
      availableChannels: [
        {
          name: "in-app",
          description: "In-app notifications (always works)",
          requirements: "None",
        },
        {
          name: "email",
          description: "Email notifications",
          requirements: "SENDGRID_API_KEY or RESEND_API_KEY must be configured",
        },
        {
          name: "push",
          description: "Push notifications",
          requirements:
            "VAPID keys or ONESIGNAL credentials must be configured, and user must have granted push permission",
        },
      ],
      example: {
        channels: ["in-app", "email"],
      },
    });
  } catch (error) {
    console.error("[API] Error fetching test info:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * Generate helpful tips for failed channels
 */
function getTipsForFailedChannels(
  deliveryResults: Array<{
    channel: NotificationChannel;
    success: boolean;
    error?: string;
  }>
): string[] {
  const tips: string[] = [];
  const failedChannels = deliveryResults.filter((dr) => !dr.success);

  for (const failed of failedChannels) {
    switch (failed.channel) {
      case "email":
        if (failed.error?.includes("No email provider configured")) {
          tips.push(
            "📧 Email : Aucun fournisseur d'email n'est configuré. Contactez l'administrateur pour configurer SendGrid ou Resend."
          );
        } else {
          tips.push(
            "📧 Email : Vérifiez que votre adresse email est correcte et que les emails ne sont pas bloqués par votre fournisseur."
          );
        }
        break;

      case "push":
        if (failed.error?.includes("No push provider configured")) {
          tips.push(
            "🔔 Push : Aucun fournisseur de notifications push n'est configuré. Contactez l'administrateur pour configurer Web Push ou OneSignal."
          );
        } else if (failed.error?.includes("no push subscription")) {
          tips.push(
            "🔔 Push : Vous devez autoriser les notifications push dans votre navigateur. Cliquez sur l'icône de notification dans la barre d'adresse."
          );
        } else {
          tips.push(
            "🔔 Push : Assurez-vous d'avoir autorisé les notifications dans les paramètres de votre navigateur."
          );
        }
        break;

      case "in-app":
        tips.push(
          "📱 In-app : Une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support."
        );
        break;
    }
  }

  if (tips.length === 0 && failedChannels.length === 0) {
    tips.push("✅ Tous les canaux fonctionnent correctement !");
  }

  return tips;
}
