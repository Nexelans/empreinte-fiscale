import { prisma } from "@/lib/prisma";
import type { NotificationPayload } from "../types";
import { NOTIFICATION_TEMPLATES } from "../templates";

/**
 * Fiscal Alert Generator
 * Generates alerts for upcoming fiscal deadlines and important updates
 */

export interface FiscalDeadline {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  type: "tax_filing" | "tax_payment" | "declaration" | "general";
  affectedUserTypes: ("all" | "proprietaire" | "entrepreneur" | "salaried")[];
  reminderDays: number[]; // Days before deadline to send reminders
}

/**
 * French fiscal calendar 2026
 * These dates should ideally come from the Référentiel
 */
export const FISCAL_CALENDAR_2026: FiscalDeadline[] = [
  {
    id: "ir-declaration-online",
    title: "Déclaration de revenus en ligne",
    description:
      "Date limite pour déclarer vos revenus 2025 en ligne. Ne manquez pas cette échéance !",
    deadline: new Date("2026-06-04T23:59:59"),
    type: "tax_filing",
    affectedUserTypes: ["all"],
    reminderDays: [14, 7, 3, 1],
  },
  {
    id: "taxe-habitation-paiement",
    title: "Paiement de la taxe d'habitation",
    description:
      "Date limite de paiement de la taxe d'habitation. Paiement automatique si vous êtes prélevé.",
    deadline: new Date("2026-11-15T23:59:59"),
    type: "tax_payment",
    affectedUserTypes: ["all"],
    reminderDays: [30, 7],
  },
  {
    id: "taxe-fonciere-paiement",
    title: "Paiement de la taxe foncière",
    description:
      "Date limite de paiement de la taxe foncière pour les propriétaires.",
    deadline: new Date("2026-10-15T23:59:59"),
    type: "tax_payment",
    affectedUserTypes: ["proprietaire"],
    reminderDays: [30, 7],
  },
  {
    id: "prelevement-source-regularisation",
    title: "Régularisation du prélèvement à la source",
    description:
      "Suite à votre déclaration de revenus, une régularisation de votre prélèvement à la source est effectuée.",
    deadline: new Date("2026-09-01T23:59:59"),
    type: "general",
    affectedUserTypes: ["all"],
    reminderDays: [7],
  },
  {
    id: "cfe-paiement",
    title: "Paiement de la CFE (Cotisation Foncière des Entreprises)",
    description:
      "Date limite de paiement de la CFE pour les entrepreneurs et indépendants.",
    deadline: new Date("2026-12-15T23:59:59"),
    type: "tax_payment",
    affectedUserTypes: ["entrepreneur"],
    reminderDays: [30, 7],
  },
];

/**
 * Generate fiscal alert notifications for all eligible users
 */
export async function generateFiscalAlerts(): Promise<NotificationPayload[]> {
  console.log("[FiscalAlert] Checking for upcoming fiscal deadlines...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifications: NotificationPayload[] = [];

  // Check each fiscal deadline
  for (const deadline of FISCAL_CALENDAR_2026) {
    // Check if deadline is in the future
    if (deadline.deadline < today) {
      continue;
    }

    // Check each reminder day
    for (const reminderDays of deadline.reminderDays) {
      const reminderDate = new Date(deadline.deadline);
      reminderDate.setDate(reminderDate.getDate() - reminderDays);
      reminderDate.setHours(0, 0, 0, 0);

      // If today is a reminder day
      if (reminderDate.getTime() === today.getTime()) {
        console.log(
          `[FiscalAlert] Reminder for "${deadline.title}" (${reminderDays} days before)`
        );

        // Get affected users
        const affectedUsers = await getAffectedUsers(deadline.affectedUserTypes);

        // Create notification for each affected user
        for (const userId of affectedUsers) {
          const notification = createFiscalAlertNotification(
            userId,
            deadline,
            reminderDays
          );
          notifications.push(notification);
        }
      }
    }
  }

  console.log(`[FiscalAlert] Generated ${notifications.length} fiscal alerts`);
  return notifications;
}

/**
 * Get users affected by a fiscal deadline
 */
async function getAffectedUsers(
  affectedTypes: ("all" | "proprietaire" | "entrepreneur" | "salaried")[]
): Promise<string[]> {
  // Get users who have fiscal alerts enabled
  const preferences = await prisma.userNotificationPreferences.findMany({
    where: { fiscalAlertsEnabled: true },
    select: { userId: true },
  });

  if (affectedTypes.includes("all")) {
    return preferences.map((p) => p.userId);
  }

  // Filter by user type (would need to check ProfilFiscal for actual user types)
  // For now, return all eligible users
  return preferences.map((p) => p.userId);
}

/**
 * Create a fiscal alert notification payload
 */
function createFiscalAlertNotification(
  userId: string,
  deadline: FiscalDeadline,
  daysUntilDeadline: number
): NotificationPayload {
  const template =
    deadline.type === "tax_filing" || deadline.type === "tax_payment"
      ? NOTIFICATION_TEMPLATES.FISCAL_ALERT_DEADLINE
      : NOTIFICATION_TEMPLATES.FISCAL_ALERT_UPDATE;

  if (!template) {
    throw new Error('Template not found for fiscal alert');
  }

  const deadlineStr = deadline.deadline.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const urgencyPrefix =
    daysUntilDeadline === 1
      ? "⚠️ Dernier jour ! "
      : daysUntilDeadline <= 3
      ? "⏰ Plus que " + daysUntilDeadline + " jours ! "
      : "";

  return {
    userId,
    type: "FISCAL_ALERT",
    title: urgencyPrefix + deadline.title,
    body: `${deadline.description}\n\nDate limite : ${deadlineStr}`,
    channels: template.channels,
    data: {
      deadlineId: deadline.id,
      deadlineDate: deadline.deadline.toISOString(),
      daysUntilDeadline,
      type: deadline.type,
    },
  };
}

/**
 * Check for Référentiel updates and generate alerts
 */
export async function checkReferentielUpdates(): Promise<NotificationPayload[]> {
  console.log("[FiscalAlert] Checking for Référentiel updates...");

  const notifications: NotificationPayload[] = [];

  // Get the most recent Référentiel entry
  const latestReferentiel = await prisma.referentiel.findFirst({
    orderBy: { dateIntegration: "desc" },
    select: {
      millesime: true,
      dateIntegration: true,
      categorie: true,
    },
  });

  if (!latestReferentiel) {
    return notifications;
  }

  // Check if it was integrated in the last 24 hours
  const dayAgo = new Date();
  dayAgo.setDate(dayAgo.getDate() - 1);

  if (latestReferentiel.dateIntegration > dayAgo) {
    console.log(
      `[FiscalAlert] New Référentiel update detected: ${latestReferentiel.millesime}`
    );

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    // Create notification for each user
    for (const user of users) {
      notifications.push({
        userId: user.id,
        type: "REFERENTIEL_UPDATE",
        title: "📚 Nouveaux barèmes disponibles",
        body: `Les barèmes fiscaux ont été mis à jour (millésime ${latestReferentiel.millesime}). Voulez-vous recalculer votre score ?`,
        channels: ["in-app", "email"],
        data: {
          millesime: latestReferentiel.millesime,
          categorie: latestReferentiel.categorie,
          actionUrl: "/dashboard",
        },
      });
    }
  }

  return notifications;
}

/**
 * Get upcoming deadlines for a specific user
 */
export async function getUpcomingDeadlines(
  userId: string,
  limit = 5
): Promise<FiscalDeadline[]> {
  const today = new Date();

  return FISCAL_CALENDAR_2026.filter((d) => d.deadline > today)
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, limit);
}

/**
 * Get fiscal alert statistics
 */
export async function getFiscalAlertStats(): Promise<{
  activeDeadlines: number;
  alertsSentToday: number;
  upcomingInWeek: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const activeDeadlines = FISCAL_CALENDAR_2026.filter(
    (d) => d.deadline >= today
  ).length;

  const upcomingInWeek = FISCAL_CALENDAR_2026.filter(
    (d) => d.deadline >= today && d.deadline <= nextWeek
  ).length;

  const alertsSentToday = await prisma.notification.count({
    where: {
      type: "FISCAL_ALERT",
      sentAt: { gte: today },
    },
  });

  return {
    activeDeadlines,
    alertsSentToday,
    upcomingInWeek,
  };
}
