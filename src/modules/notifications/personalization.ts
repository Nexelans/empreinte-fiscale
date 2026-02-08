import { prisma } from "@/lib/prisma";
import type { ScoreFiscal } from "@/modules/score/types";

/**
 * Personalization service for notifications
 * Injects user's real data into notification templates
 */

export interface PersonalizationContext {
  userName: string;
  userEmail: string;

  // Score data
  totalPaye?: number;
  totalRecu?: number;
  soldeNet?: number;
  ratio?: number;
  confidenceScore?: number;

  // Detailed contributions
  armyContribution?: number;
  healthContribution?: number;
  educationContribution?: number;
  cultureContribution?: number;
  infrastructureContribution?: number;
  transportContribution?: number;

  // Calculated insights
  educationHours?: number;
  infrastructureKm?: number;
  museumVisits?: number;
  publicSpendingPerCapita?: number;

  // Activity data
  streakDays?: number;
  weeklyTaxes?: number;
  yearTaxes?: number;
  yearServices?: number;
  entriesCount?: number;
  badgesCount?: number;
  level?: number;

  // Trends
  scoreEvolution?: string;
  confidenceTip?: string;
  tvaPercent?: number;
}

/**
 * Get full personalization context for a user
 */
export async function getPersonalizationContext(
  userId: string
): Promise<PersonalizationContext> {
  // Fetch all necessary data in parallel
  const [user, profilFiscal, gamificationData, streak, badges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    prisma.profilFiscal.findUnique({
      where: { userId },
      select: { id: true, userId: true },
    }),
    // Note: userGamification model doesn't exist yet - stubbed
    Promise.resolve(null),
    prisma.userStreak.findUnique({
      where: { userId },
      select: { currentStreak: true },
    }),
    prisma.userBadge.count({
      where: { userId },
    }),
  ]);

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const context: PersonalizationContext = {
    userName: user.name || user.email.split("@")[0] || "Utilisateur",
    userEmail: user.email,
  };

  // Add score data
  // Note: scoreData doesn't exist in ProfilFiscal model yet - all score personalization stubbed
  /*
  if (profilFiscal?.scoreData) {
    const score = profilFiscal.scoreData as any as ScoreFiscal;
    // ... score personalization code ...
  }
  */

  // Add gamification data
  // Note: gamificationData stubbed (model doesn't exist yet)
  // if (gamificationData) {
  //   context.level = gamificationData.level;
  // }

  if (streak) {
    context.streakDays = streak.currentStreak;
  }

  context.badgesCount = badges;

  // Add weekly taxes (would need journal entry data)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyEntries = await prisma.journalEntry.findMany({
    where: {
      userId,
      date: { gte: weekAgo },
    },
    select: { montantTVA: true },
  });

  context.weeklyTaxes = weeklyEntries.reduce(
    (sum, entry) => sum + (entry.montantTVA || 0),
    0
  );
  context.entriesCount = weeklyEntries.length;

  return context;
}

/**
 * Get confidence tip based on score
 */
function getConfidenceTip(confidenceScore: number): string {
  if (confidenceScore >= 90) {
    return "Excellent ! Votre profil est très précis";
  } else if (confidenceScore >= 70) {
    return "Bon score, mais vous pouvez améliorer en uploadant vos documents";
  } else if (confidenceScore >= 50) {
    return "Score moyen, uploadez vos documents fiscaux pour plus de précision";
  } else {
    return "Score faible, vos résultats sont principalement estimés";
  }
}

/**
 * Personalize a template string with context
 */
export function personalizeTemplate(
  template: string,
  context: Partial<PersonalizationContext>
): string {
  let result = template;

  for (const [key, value] of Object.entries(context)) {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    result = result.replace(placeholder, formatValue(value));
  }

  return result;
}

/**
 * Format value for display in notifications
 */
function formatValue(value: any): string {
  if (typeof value === "number") {
    // Check if it's a currency amount (typically > 10)
    if (value > 10 || value < -10) {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    // Small numbers (ratios, percentages)
    return value.toFixed(2);
  }

  if (value === null || value === undefined) {
    return "N/A";
  }

  return String(value);
}

/**
 * Get personalized greeting based on time of day
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Bonjour";
  } else if (hour < 18) {
    return "Bon après-midi";
  } else {
    return "Bonsoir";
  }
}

/**
 * Generate personalized subject line
 */
export function personalizeSubject(
  baseSubject: string,
  userName: string
): string {
  const greeting = getTimeBasedGreeting();
  return `${greeting} ${userName} — ${baseSubject}`;
}
