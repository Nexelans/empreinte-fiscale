/**
 * Logique de gestion des badges
 */

import { prisma } from "@/lib/prisma";
import type { GameEvent, BadgeDefinition, BadgeCriteriaRegistry } from "./types";
import { emitGameEvent } from "./events";

/**
 * Récupère toutes les définitions de badges depuis le Référentiel
 */
export async function getBadgeDefinitions(): Promise<BadgeDefinition[]> {
  const entries = await prisma.referentiel.findMany({
    where: {
      categorie: "BADGE_DEFINITION",
      millesime: "2026",
    },
  });

  return entries.map((entry) => {
    const valeur = entry.valeur as any;
    return {
      id: entry.cle,
      nom: valeur.nom,
      description: valeur.description,
      critere: valeur.critere,
      seuil: valeur.seuil,
      categorie: valeur.categorie,
    };
  });
}

/**
 * Vérifie si un utilisateur a déjà ce badge
 */
export async function hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
  const existing = await prisma.userBadge.findFirst({
    where: { userId, badgeId },
  });
  return !!existing;
}

/**
 * Attribue un badge à un utilisateur
 */
export async function awardBadge(userId: string, badgeId: string, progress: number = 100): Promise<void> {
  // Check if already earned
  if (await hasUserBadge(userId, badgeId)) {
    return;
  }

  // Award the badge
  await prisma.userBadge.create({
    data: {
      userId,
      badgeId,
      progress,
    },
  });

  console.log(`[Badges] Awarded badge ${badgeId} to user ${userId}`);

  // Emit event for XP reward
  await emitGameEvent("BADGE_EARNED", userId, { badgeId });
}

/**
 * Met à jour la progression d'un badge (pour badges avec progression)
 */
export async function updateBadgeProgress(userId: string, badgeId: string, progress: number): Promise<void> {
  const existing = await prisma.userBadge.findFirst({
    where: { userId, badgeId },
  });

  if (!existing) {
    // Create with progress
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
        progress,
      },
    });
  } else if (existing.progress < 100) {
    // Update progress
    await prisma.userBadge.update({
      where: { id: existing.id },
      data: { progress: Math.min(progress, 100) },
    });

    // Award if reached 100%
    if (progress >= 100) {
      await emitGameEvent("BADGE_EARNED", userId, { badgeId });
    }
  }
}

/**
 * Critères de badges - chaque critère a sa propre logique de vérification
 */
const badgeCriteria: BadgeCriteriaRegistry = {
  document_uploaded: async (userId: string) => {
    const count = await prisma.documentUpload.count({ where: { userId } });
    return count >= 1;
  },

  infrastructure_contribution: async (userId: string) => {
    // Calculate based on user's contribution to infrastructure budget
    // Simplified: check if they've calculated a score
    const score = await prisma.scoreFiscal.findFirst({
      where: { userId },
      orderBy: { calculatedAt: "desc" },
    });
    if (!score) return false;

    const detailPaye = score.detailPaye as any;
    const totalContribution = detailPaye?.impotRevenu || 0;
    // Rough estimate: 200m of road costs ~100€ per citizen
    return totalContribution >= 100;
  },

  education_services_received: async (userId: string) => {
    const profil = await prisma.profilFiscal.findUnique({ where: { userId } });
    return (profil?.nombreEnfants || 0) > 0;
  },

  health_services_received: async (userId: string) => {
    const score = await prisma.scoreFiscal.findFirst({
      where: { userId },
      orderBy: { calculatedAt: "desc" },
    });
    if (!score) return false;

    const detailRecu = score.detailRecu as any;
    const healthServices = detailRecu?.servicesMutualises?.sante || 0;
    return healthServices >= 2000;
  },

  confidence_score: async (userId: string) => {
    const profil = await prisma.profilFiscal.findUnique({ where: { userId } });
    if (!profil) return false;

    // Calculate confidence score (simplified - would use actual calculation)
    const statusData = (profil.statusData as any) || {};
    const totalFields = Object.keys(statusData).length || 1;
    const verifiedFields = Object.values(statusData).filter((s) => s === "VERIFIE").length;
    const confidenceScore = (verifiedFields / totalFields) * 100;

    return confidenceScore >= 90;
  },

  streak_days: async (userId: string, event: GameEvent) => {
    const seuil = event.payload.seuil || 7;
    const streak = await prisma.userStreak.findUnique({ where: { userId } });
    return (streak?.currentStreak || 0) >= seuil;
  },

  taxes_discovered: async (userId: string) => {
    // Count unique tax types in journal entries
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      select: { categorie: true },
    });
    const uniqueCategories = new Set(entries.map((e) => e.categorie).filter(Boolean));
    return uniqueCategories.size >= 10;
  },

  quiz_perfect_score: async (userId: string) => {
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
      },
      select: {
        score: true,
        totalQuestions: true,
      },
    });
    return quizAttempts.some(attempt => attempt.score === attempt.totalQuestions);
  },
};

/**
 * Handler pour vérifier les badges suite à un événement
 */
export async function handleBadgeCheck(event: GameEvent): Promise<void> {
  const badges = await getBadgeDefinitions();

  for (const badge of badges) {
    // Skip if already earned
    if (await hasUserBadge(event.userId, badge.id)) {
      continue;
    }

    // Check criteria
    const checker = badgeCriteria[badge.critere];
    if (!checker) {
      console.warn(`[Badges] No criteria checker for: ${badge.critere}`);
      continue;
    }

    const meetsCriteria = await checker(event.userId, event);
    if (meetsCriteria) {
      await awardBadge(event.userId, badge.id);
    }
  }
}

/**
 * Récupère les badges d'un utilisateur avec leurs définitions
 */
export async function getUserBadgesWithDefinitions(userId: string) {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    orderBy: { earnedAt: "desc" },
  });

  const definitions = await getBadgeDefinitions();
  const definitionsMap = new Map(definitions.map((d) => [d.id, d]));

  return userBadges.map((ub) => ({
    ...ub,
    definition: definitionsMap.get(ub.badgeId),
  }));
}
