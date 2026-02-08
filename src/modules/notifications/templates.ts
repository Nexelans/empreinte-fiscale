import type { NotificationTemplate } from "./types";

/**
 * Notification content templates
 * Variables are replaced at runtime using {{variableName}} syntax
 */

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  DAILY_FACT: {
    type: "DAILY_FACT",
    titleTemplate: "💡 Le saviez-vous ?",
    bodyTemplate: "{{factText}}",
    channels: ["in-app", "push"],
    requiresUserPreference: "dailyFactsEnabled",
  },

  FISCAL_ALERT_DEADLINE: {
    type: "FISCAL_ALERT",
    titleTemplate: "⏰ {{title}}",
    bodyTemplate: "{{description}} Date limite : {{deadline}}",
    channels: ["in-app", "email", "push"],
    requiresUserPreference: "fiscalAlertsEnabled",
  },

  FISCAL_ALERT_UPDATE: {
    type: "FISCAL_ALERT",
    titleTemplate: "📢 {{title}}",
    bodyTemplate: "{{description}}",
    channels: ["in-app", "email"],
    requiresUserPreference: "fiscalAlertsEnabled",
  },

  WEEKLY_DIGEST: {
    type: "WEEKLY_DIGEST",
    titleTemplate: "📊 Votre semaine fiscale",
    bodyTemplate:
      "Du {{weekStart}} au {{weekEnd}} : {{entriesCount}} entrées loggées, {{taxesPaid}}€ de taxes payées, {{servicesReceived}}€ de services reçus. Série : {{streakDays}} jours 🔥",
    channels: ["in-app", "email"],
    requiresUserPreference: "weeklyDigestEnabled",
  },

  BADGE_EARNED: {
    type: "BADGE_EARNED",
    titleTemplate: "🏆 Nouveau badge débloqué !",
    bodyTemplate: "Félicitations ! Vous venez de débloquer le badge : {{badgeName}}",
    channels: ["in-app", "push"],
  },

  CHALLENGE_COMPLETED: {
    type: "CHALLENGE_COMPLETED",
    titleTemplate: "✅ Défi accompli !",
    bodyTemplate:
      "Bravo ! Vous avez terminé le défi «{{challengeName}}». Récompense : +{{xpAwarded}} XP",
    channels: ["in-app", "push"],
  },

  LEVEL_UP: {
    type: "LEVEL_UP",
    titleTemplate: "🎉 Niveau supérieur !",
    bodyTemplate:
      "Félicitations ! Vous êtes maintenant niveau {{level}}. Continuez comme ça !",
    channels: ["in-app", "push"],
  },

  STREAK_REMINDER: {
    type: "STREAK_REMINDER",
    titleTemplate: "🔥 N'oubliez pas votre série !",
    bodyTemplate:
      "Vous avez une série de {{streakDays}} jours. Loggez une dépense aujourd'hui pour la maintenir !",
    channels: ["in-app", "push"],
  },

  SCORE_RECALCULATION_AVAILABLE: {
    type: "SCORE_RECALCULATION_AVAILABLE",
    titleTemplate: "🔄 Recalcul disponible",
    bodyTemplate:
      "Votre profil a été modifié. Recalculez votre score fiscal pour voir l'impact des changements.",
    channels: ["in-app"],
  },

  REFERENTIEL_UPDATE: {
    type: "REFERENTIEL_UPDATE",
    titleTemplate: "📚 Nouveaux barèmes disponibles",
    bodyTemplate:
      "Les barèmes fiscaux ont été mis à jour (millésime {{millesime}}). Voulez-vous recalculer votre score ?",
    channels: ["in-app", "email"],
  },
};

/**
 * Daily tax facts library
 * These are rotated and personalized with user data
 */
export const DAILY_FACTS_LIBRARY = [
  "Votre contribution à l'armée aujourd'hui : {{armyContribution}}€, soit environ le prix d'un café ☕",
  "Grâce à vos impôts, vous financez {{educationHours}}h d'éducation publique par an 📚",
  "Votre part de la dette publique : {{debtShare}}€ d'intérêts cette année",
  "Ce mois-ci, vous avez contribué {{healthContribution}}€ au système de santé 🏥",
  "Votre série actuelle : {{streakDays}} jours consécutifs de logging ! 🔥",
  "Cette semaine, vous avez loggé {{weeklyTaxes}}€ de taxes cachées",
  "Saviez-vous ? La TVA représente {{tvaPercent}}% de ce que vous payez à l'État",
  "Votre ratio fiscal : pour 1€ payé, vous recevez {{ratio}}€ de services",
  "Cette année, vous financez {{infrastructureKm}} km de routes avec vos impôts 🛣️",
  "Votre contribution à la culture : {{cultureContribution}}€, soit {{museumVisits}} entrées de musée 🎨",
  "Depuis le début de l'année : {{yearTaxes}}€ de taxes, {{yearServices}}€ de services reçus",
  "Votre score fiscal a {{scoreEvolution}} depuis le mois dernier",
  "Votre niveau de confiance : {{confidenceScore}}% — {{confidenceTip}}",
  "En France, la TVA normale est de 20%, mais certains produits bénéficient de taux réduits",
  "Les cotisations patronales représentent environ 40% de votre salaire brut",
  "Le quotient familial peut réduire significativement votre impôt sur le revenu",
  "La CSG finance principalement la Sécurité sociale et représente 9,2% de vos revenus",
  "Chaque année, l'État dépense environ {{publicSpendingPerCapita}}€ par habitant",
  "Votre contribution annuelle aux transports publics : {{transportContribution}}€ 🚇",
  "Cette année, vous avez débloqué {{badgesCount}} badges fiscaux ! 🏅",
];

/**
 * Replace template variables with actual values
 */
export function interpolateTemplate(
  template: string,
  context: Record<string, any>
): string {
  let result = template;
  for (const [key, value] of Object.entries(context)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, String(value));
  }
  return result;
}

/**
 * Get a random daily fact template
 */
export function getRandomDailyFact(): string {
  const randomIndex = Math.floor(Math.random() * DAILY_FACTS_LIBRARY.length);
  return DAILY_FACTS_LIBRARY[randomIndex] || DAILY_FACTS_LIBRARY[0] || "Fait fiscal du jour";
}
