import type { NotificationPayload } from "../types";
import { NOTIFICATION_TEMPLATES } from "../templates";
import { sendNotification } from "../service";

/**
 * Event-Triggered Notification Generator
 * Generates notifications in response to specific user actions or system events
 */

/**
 * Send badge earned notification
 */
export async function notifyBadgeEarned(
  userId: string,
  badgeName: string,
  badgeIcon: string
): Promise<void> {
  const template = NOTIFICATION_TEMPLATES.BADGE_EARNED;

  if (!template) {
    console.error('[notifyBadgeEarned] Template not found');
    return;
  }

  const payload: NotificationPayload = {
    userId,
    type: "BADGE_EARNED",
    title: template.titleTemplate,
    body: `${badgeIcon} ${badgeName}`,
    channels: template.channels,
    data: {
      badgeName,
      badgeIcon,
      actionUrl: "/gamification",
      actionLabel: "Voir mes badges",
    },
  };

  await sendNotification(payload);
}

/**
 * Send challenge completed notification
 */
export async function notifyChallengeCompleted(
  userId: string,
  challengeName: string,
  xpAwarded: number
): Promise<void> {
  const template = NOTIFICATION_TEMPLATES.CHALLENGE_COMPLETED;

  if (!template) {
    console.error('[notifyChallengeCompleted] Template not found');
    return;
  }

  const payload: NotificationPayload = {
    userId,
    type: "CHALLENGE_COMPLETED",
    title: template.titleTemplate,
    body: `Bravo ! Vous avez terminé le défi «${challengeName}». Récompense : +${xpAwarded} XP`,
    channels: template.channels,
    data: {
      challengeName,
      xpAwarded,
      actionUrl: "/gamification",
      actionLabel: "Voir ma progression",
    },
  };

  await sendNotification(payload);
}

/**
 * Send level up notification
 */
export async function notifyLevelUp(
  userId: string,
  newLevel: number,
  tierName?: string
): Promise<void> {
  const template = NOTIFICATION_TEMPLATES.LEVEL_UP;

  if (!template) {
    console.error('[notifyLevelUp] Template not found');
    return;
  }

  let body = `Félicitations ! Vous êtes maintenant niveau ${newLevel}.`;
  if (tierName) {
    body += ` Vous avez atteint le tier ${tierName} !`;
  }
  body += " Continuez comme ça !";

  const payload: NotificationPayload = {
    userId,
    type: "LEVEL_UP",
    title: template.titleTemplate,
    body,
    channels: template.channels,
    data: {
      level: newLevel,
      tierName,
      actionUrl: "/gamification",
      actionLabel: "Voir mon niveau",
    },
  };

  await sendNotification(payload);
}

/**
 * Send streak reminder notification
 */
export async function notifyStreakReminder(
  userId: string,
  streakDays: number
): Promise<void> {
  const template = NOTIFICATION_TEMPLATES.STREAK_REMINDER;

  if (!template) {
    console.error('[notifyStreakReminder] Template not found');
    return;
  }

  const payload: NotificationPayload = {
    userId,
    type: "STREAK_REMINDER",
    title: template.titleTemplate,
    body: `Vous avez une série de ${streakDays} jours. Loggez une dépense aujourd'hui pour la maintenir !`,
    channels: template.channels,
    data: {
      streakDays,
      actionUrl: "/journal",
      actionLabel: "Logger une dépense",
    },
  };

  await sendNotification(payload);
}

/**
 * Send score recalculation available notification
 */
export async function notifyScoreRecalculationAvailable(
  userId: string,
  reason: string
): Promise<void> {
  const template = NOTIFICATION_TEMPLATES.SCORE_RECALCULATION_AVAILABLE;

  if (!template) {
    console.error('[notifyScoreRecalculationAvailable] Template not found');
    return;
  }

  const payload: NotificationPayload = {
    userId,
    type: "SCORE_RECALCULATION_AVAILABLE",
    title: template.titleTemplate,
    body: `${reason}. Recalculez votre score fiscal pour voir l'impact des changements.`,
    channels: template.channels,
    data: {
      reason,
      actionUrl: "/dashboard",
      actionLabel: "Recalculer mon score",
    },
  };

  await sendNotification(payload);
}

/**
 * Send profile completion reminder
 * Not in templates, but useful for engagement
 */
export async function notifyProfileCompletion(
  userId: string,
  completionPercentage: number,
  missingFields: string[]
): Promise<void> {
  const payload: NotificationPayload = {
    userId,
    type: "EVENT_TRIGGERED",
    title: "📝 Complétez votre profil",
    body: `Votre profil est complété à ${completionPercentage}%. Ajoutez ${missingFields.join(", ")} pour améliorer la précision de votre score.`,
    channels: ["in-app"],
    data: {
      completionPercentage,
      missingFields,
      actionUrl: "/profil",
      actionLabel: "Compléter mon profil",
    },
  };

  await sendNotification(payload);
}

/**
 * Send first simulation created congratulations
 */
export async function notifyFirstSimulation(
  userId: string,
  simulationLabel: string
): Promise<void> {
  const payload: NotificationPayload = {
    userId,
    type: "EVENT_TRIGGERED",
    title: "🎉 Première simulation créée !",
    body: `Félicitations ! Vous avez créé votre première simulation : "${simulationLabel}". Explorez d'autres scénarios pour voir l'impact sur votre situation fiscale.`,
    channels: ["in-app"],
    data: {
      simulationLabel,
      actionUrl: "/simulations",
      actionLabel: "Voir mes simulations",
    },
  };

  await sendNotification(payload);
}

/**
 * Send document upload success notification
 */
export async function notifyDocumentProcessed(
  userId: string,
  documentType: string,
  fieldsExtracted: number,
  confidenceIncrease: number
): Promise<void> {
  const payload: NotificationPayload = {
    userId,
    type: "EVENT_TRIGGERED",
    title: "✅ Document traité avec succès",
    body: `Votre ${documentType} a été analysé. ${fieldsExtracted} champs extraits. Votre score de confiance a augmenté de ${confidenceIncrease}%.`,
    channels: ["in-app"],
    data: {
      documentType,
      fieldsExtracted,
      confidenceIncrease,
      actionUrl: "/profil",
      actionLabel: "Voir mon profil",
    },
  };

  await sendNotification(payload);
}

/**
 * Send simulation shared notification
 */
export async function notifySimulationShared(
  userId: string,
  shareUrl: string,
  expiresAt: Date
): Promise<void> {
  const payload: NotificationPayload = {
    userId,
    type: "EVENT_TRIGGERED",
    title: "🔗 Simulation partagée",
    body: `Votre lien de partage a été créé avec succès. Il expire le ${expiresAt.toLocaleDateString("fr-FR")}.`,
    channels: ["in-app"],
    data: {
      shareUrl,
      expiresAt: expiresAt.toISOString(),
    },
  };

  await sendNotification(payload);
}

/**
 * Send referral program notification (future feature)
 */
export async function notifyReferralBonus(
  userId: string,
  referredUserName: string,
  bonusXP: number
): Promise<void> {
  const payload: NotificationPayload = {
    userId,
    type: "EVENT_TRIGGERED",
    title: "🎁 Bonus de parrainage !",
    body: `${referredUserName} a rejoint Empreinte Fiscale grâce à vous ! Vous gagnez +${bonusXP} XP.`,
    channels: ["in-app", "email"],
    data: {
      referredUserName,
      bonusXP,
      actionUrl: "/gamification",
    },
  };

  await sendNotification(payload);
}

/**
 * Batch send streak reminders to all users who need them
 */
export async function sendStreakReminders(): Promise<number> {
  console.log("[EventTriggered] Sending streak reminders...");

  // Get users who:
  // 1. Have a current streak > 0
  // 2. Haven't logged today
  // 3. Have notifications enabled

  const { prisma } = await import("@/lib/prisma");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all users with active streaks
  const activeStreaks = await prisma.userStreak.findMany({
    where: {
      currentStreak: { gt: 0 },
    },
    select: {
      userId: true,
      currentStreak: true,
      lastLoggedDate: true,
    },
  });

  let remindersSetn = 0;

  for (const streak of activeStreaks) {
    // Check if user already logged today
    if (!streak.lastLoggedDate) {
      continue;
    }

    const lastLogged = new Date(streak.lastLoggedDate);
    lastLogged.setHours(0, 0, 0, 0);

    if (lastLogged.getTime() === today.getTime()) {
      // Already logged today, skip
      continue;
    }

    // Send reminder
    try {
      await notifyStreakReminder(streak.userId, streak.currentStreak);
      remindersSetn++;
    } catch (error) {
      console.error(
        `[EventTriggered] Failed to send streak reminder to ${streak.userId}:`,
        error
      );
    }
  }

  console.log(`[EventTriggered] Sent ${remindersSetn} streak reminders`);
  return remindersSetn;
}

/**
 * Event notification registry
 * Maps event types to their handlers
 */
export const EVENT_NOTIFICATION_HANDLERS = {
  BADGE_EARNED: notifyBadgeEarned,
  CHALLENGE_COMPLETED: notifyChallengeCompleted,
  LEVEL_UP: notifyLevelUp,
  STREAK_REMINDER: notifyStreakReminder,
  SCORE_RECALCULATION_AVAILABLE: notifyScoreRecalculationAvailable,
  PROFILE_COMPLETION: notifyProfileCompletion,
  FIRST_SIMULATION: notifyFirstSimulation,
  DOCUMENT_PROCESSED: notifyDocumentProcessed,
  SIMULATION_SHARED: notifySimulationShared,
  REFERRAL_BONUS: notifyReferralBonus,
} as const;

export type EventType = keyof typeof EVENT_NOTIFICATION_HANDLERS;
