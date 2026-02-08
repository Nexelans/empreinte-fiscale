import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserNotificationPreferences,
  updateNotificationPreferences,
} from "@/modules/notifications/service";

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const preferences = await getUserNotificationPreferences(session.user.id);

    if (!preferences) {
      return NextResponse.json(
        { error: "Préférences introuvables" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      preferences: {
        dailyFactsEnabled: preferences.dailyFactsEnabled,
        fiscalAlertsEnabled: preferences.fiscalAlertsEnabled,
        weeklyDigestEnabled: preferences.weeklyDigestEnabled,
        emailChannel: preferences.emailChannel,
        pushChannel: preferences.pushChannel,
        inAppChannel: preferences.inAppChannel,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
        timezone: preferences.timezone,
      },
    });
  } catch (error) {
    console.error("[API] Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des préférences" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 *
 * Body:
 * {
 *   dailyFactsEnabled?: boolean,
 *   fiscalAlertsEnabled?: boolean,
 *   weeklyDigestEnabled?: boolean,
 *   emailChannel?: boolean,
 *   pushChannel?: boolean,
 *   inAppChannel?: boolean,
 *   quietHoursStart?: number,
 *   quietHoursEnd?: number,
 *   timezone?: string
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validations = [
      {
        field: "dailyFactsEnabled",
        type: "boolean",
        value: body.dailyFactsEnabled,
      },
      {
        field: "fiscalAlertsEnabled",
        type: "boolean",
        value: body.fiscalAlertsEnabled,
      },
      {
        field: "weeklyDigestEnabled",
        type: "boolean",
        value: body.weeklyDigestEnabled,
      },
      { field: "emailChannel", type: "boolean", value: body.emailChannel },
      { field: "pushChannel", type: "boolean", value: body.pushChannel },
      { field: "inAppChannel", type: "boolean", value: body.inAppChannel },
      {
        field: "quietHoursStart",
        type: "number",
        value: body.quietHoursStart,
        min: 0,
        max: 23,
      },
      {
        field: "quietHoursEnd",
        type: "number",
        value: body.quietHoursEnd,
        min: 0,
        max: 23,
      },
      { field: "timezone", type: "string", value: body.timezone },
    ];

    for (const validation of validations) {
      if (validation.value !== undefined) {
        if (typeof validation.value !== validation.type) {
          return NextResponse.json(
            { error: `${validation.field} doit être de type ${validation.type}` },
            { status: 400 }
          );
        }

        if (
          validation.type === "number" &&
          (validation.min !== undefined || validation.max !== undefined)
        ) {
          const numValue = validation.value as number;
          if (
            validation.min !== undefined &&
            numValue < validation.min
          ) {
            return NextResponse.json(
              {
                error: `${validation.field} doit être >= ${validation.min}`,
              },
              { status: 400 }
            );
          }
          if (
            validation.max !== undefined &&
            numValue > validation.max
          ) {
            return NextResponse.json(
              {
                error: `${validation.field} doit être <= ${validation.max}`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // At least one channel must be enabled
    if (
      body.emailChannel === false &&
      body.pushChannel === false &&
      body.inAppChannel === false
    ) {
      return NextResponse.json(
        { error: "Au moins un canal de notification doit être activé" },
        { status: 400 }
      );
    }

    // Update preferences
    const updatedPreferences = await updateNotificationPreferences(
      session.user.id,
      body
    );

    return NextResponse.json({
      success: true,
      preferences: {
        dailyFactsEnabled: updatedPreferences.dailyFactsEnabled,
        fiscalAlertsEnabled: updatedPreferences.fiscalAlertsEnabled,
        weeklyDigestEnabled: updatedPreferences.weeklyDigestEnabled,
        emailChannel: updatedPreferences.emailChannel,
        pushChannel: updatedPreferences.pushChannel,
        inAppChannel: updatedPreferences.inAppChannel,
        quietHoursStart: updatedPreferences.quietHoursStart,
        quietHoursEnd: updatedPreferences.quietHoursEnd,
        timezone: updatedPreferences.timezone,
      },
    });
  } catch (error) {
    console.error("[API] Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des préférences" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/preferences
 * Disable all notifications (convenience endpoint)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await updateNotificationPreferences(session.user.id, {
      dailyFactsEnabled: false,
      fiscalAlertsEnabled: false,
      weeklyDigestEnabled: false,
      emailChannel: false,
      pushChannel: false,
      inAppChannel: true, // Keep in-app for important system notifications
    });

    return NextResponse.json({
      success: true,
      message: "Toutes les notifications ont été désactivées",
    });
  } catch (error) {
    console.error("[API] Error disabling notifications:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désactivation des notifications" },
      { status: 500 }
    );
  }
}
