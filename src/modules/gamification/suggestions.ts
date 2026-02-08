/**
 * Logique de suggestion de challenges basée sur les patterns utilisateur
 */

import { prisma } from "@/lib/prisma";
import type { ChallengeDefinition } from "./types";
import { getChallengeDefinitions } from "./challenges";

interface UserPattern {
  totalEntries: number;
  scannedEntries: number;
  documentsUploaded: number;
  currentStreak: number;
  confidenceScore: number;
  daysActive: number;
  categoriesUsed: string[];
}

/**
 * Analyse les patterns d'utilisation d'un utilisateur
 */
async function analyzeUserPatterns(userId: string): Promise<UserPattern> {
  // Count journal entries
  const totalEntries = await prisma.journalEntry.count({
    where: { userId },
  });

  const scannedEntries = await prisma.journalEntry.count({
    where: {
      userId,
      statut: "VERIFIE",
    },
  });

  // Count documents uploaded
  const documentsUploaded = await prisma.documentUpload.count({
    where: { userId },
  });

  // Get streak
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  // Get profile for confidence score
  const profil = await prisma.profilFiscal.findUnique({
    where: { userId },
  });

  const statusData = (profil?.statusData as any) || {};
  const totalFields = Object.keys(statusData).length || 1;
  const verifiedFields = Object.values(statusData).filter((s) => s === "VERIFIE").length;
  const confidenceScore = (verifiedFields / totalFields) * 100;

  // Calculate days active (days with at least one entry)
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    select: { date: true, categorie: true },
  });

  const uniqueDays = new Set(
    entries.map((e) => new Date(e.date).toISOString().split("T")[0])
  );
  const daysActive = uniqueDays.size;

  // Get categories used
  const categoriesUsed = Array.from(
    new Set(entries.map((e) => e.categorie).filter((c): c is string => c !== null))
  );

  return {
    totalEntries,
    scannedEntries,
    documentsUploaded,
    currentStreak: streak?.currentStreak || 0,
    confidenceScore,
    daysActive,
    categoriesUsed,
  };
}

/**
 * Calcule un score de suggestion pour un challenge donné
 * Score élevé = challenge plus pertinent pour l'utilisateur
 */
function calculateSuggestionScore(
  challenge: ChallengeDefinition,
  pattern: UserPattern,
  existingChallenges: string[]
): number {
  // Si l'utilisateur a déjà ce challenge, score = 0
  if (existingChallenges.includes(challenge.id)) {
    return 0;
  }

  let score = 50; // Base score

  // Boost selon le type de challenge
  switch (challenge.type) {
    case "journal_entries":
      // Encourage si l'utilisateur log déjà régulièrement
      if (pattern.totalEntries > 0) {
        score += 30;
      }
      if (pattern.totalEntries >= 10) {
        score += 20;
      }
      break;

    case "ticket_scan":
      // Encourage si l'utilisateur a déjà scanné au moins un ticket
      if (pattern.scannedEntries > 0) {
        score += 40;
      } else if (pattern.totalEntries > 5) {
        // Ou s'il log manuellement beaucoup
        score += 20;
      }
      break;

    case "document_upload":
      // Encourage si le profil a besoin d'amélioration
      if (pattern.confidenceScore < 70) {
        score += 40;
      }
      if (pattern.documentsUploaded === 0) {
        score += 30; // Premier upload = important
      }
      break;

    case "confidence_milestone":
      // Encourage si proche du seuil
      const targetConfidence = challenge.target;
      const gap = targetConfidence - pattern.confidenceScore;
      if (gap > 0 && gap < 20) {
        score += 50; // Proche du but
      } else if (gap > 0 && gap < 40) {
        score += 30;
      }
      break;

    case "quiz_completion":
      // Encourage si l'utilisateur est engagé
      if (pattern.daysActive > 5) {
        score += 30;
      }
      break;

    case "simulation_created":
      // Encourage si l'utilisateur a un profil complet
      if (pattern.confidenceScore > 60) {
        score += 40;
      }
      break;
  }

  // Boost si challenge de courte durée (plus facile à atteindre)
  if (challenge.duree && challenge.duree <= 7) {
    score += 20;
  }

  // Penalty si target très élevé et utilisateur débutant
  if (challenge.target > 50 && pattern.totalEntries < 10) {
    score -= 30;
  }

  // Boost si challenge récurrent (peut être refait)
  if (challenge.recurrent) {
    score += 10;
  }

  return Math.max(0, score);
}

/**
 * Suggère des challenges pertinents pour un utilisateur
 * @param userId - ID de l'utilisateur
 * @param limit - Nombre maximum de suggestions (défaut: 3)
 */
export async function suggestChallenges(
  userId: string,
  limit: number = 3
): Promise<ChallengeDefinition[]> {
  // Analyser les patterns utilisateur
  const pattern = await analyzeUserPatterns(userId);

  // Récupérer tous les challenges disponibles
  const allChallenges = await getChallengeDefinitions();

  // Récupérer les challenges déjà actifs ou complétés
  const userChallenges = await prisma.userChallenge.findMany({
    where: { userId },
    select: { challengeId: true },
  });

  const existingChallengeIds = userChallenges.map((uc) => uc.challengeId);

  // Calculer les scores de suggestion
  const scoredChallenges = allChallenges.map((challenge) => ({
    challenge,
    score: calculateSuggestionScore(challenge, pattern, existingChallengeIds),
  }));

  // Trier par score décroissant et retourner les meilleurs
  const suggestions = scoredChallenges
    .filter((sc) => sc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((sc) => sc.challenge);

  return suggestions;
}

/**
 * Crée un challenge suggéré pour un utilisateur
 */
export async function acceptChallengeSuggestion(
  userId: string,
  challengeId: string
): Promise<void> {
  const definitions = await getChallengeDefinitions();
  const definition = definitions.find((d) => d.id === challengeId);

  if (!definition) {
    throw new Error("Challenge definition not found");
  }

  // Vérifier si le challenge n'existe pas déjà
  const existing = await prisma.userChallenge.findFirst({
    where: {
      userId,
      challengeId,
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
  });

  if (existing) {
    throw new Error("Challenge already exists");
  }

  // Créer le challenge
  const expiresAt = definition.duree
    ? new Date(Date.now() + definition.duree * 24 * 60 * 60 * 1000)
    : null;

  await prisma.userChallenge.create({
    data: {
      userId,
      challengeId,
      status: "ACTIVE",
      progress: 0,
      target: definition.target,
      expiresAt,
    },
  });
}
