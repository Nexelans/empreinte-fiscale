/**
 * Logique de gestion des challenges
 */

import { prisma } from "@/lib/prisma";
import type { GameEvent, ChallengeDefinition, UserChallenge, ChallengeProgressRegistry } from "./types";
import { emitGameEvent } from "./events";

/**
 * Récupère toutes les définitions de challenges depuis le Référentiel
 */
export async function getChallengeDefinitions(): Promise<ChallengeDefinition[]> {
  const entries = await prisma.referentiel.findMany({
    where: {
      categorie: "CHALLENGE_DEFINITION",
      millesime: "2026",
    },
  });

  return entries.map((entry) => {
    const valeur = entry.valeur as any;
    return {
      id: entry.cle,
      nom: valeur.nom,
      description: valeur.description,
      type: valeur.type,
      target: valeur.target,
      recompenseXP: valeur.recompenseXP,
      duree: valeur.duree,
      recurrent: valeur.recurrent,
    };
  });
}

/**
 * Initialise les challenges pour un nouvel utilisateur
 */
export async function initializeUserChallenges(userId: string): Promise<void> {
  const definitions = await getChallengeDefinitions();

  for (const def of definitions) {
    // Skip recurrent challenges - they'll be created on-demand
    if (def.recurrent) continue;

    // Create challenge if not exists
    const existing = await prisma.userChallenge.findFirst({
      where: { userId, challengeId: def.id },
    });

    if (!existing) {
      const expiresAt = def.duree ? new Date(Date.now() + def.duree * 24 * 60 * 60 * 1000) : null;

      await prisma.userChallenge.create({
        data: {
          userId,
          challengeId: def.id,
          status: "ACTIVE",
          progress: 0,
          target: def.target,
          expiresAt,
        },
      });
    }
  }
}

/**
 * Met à jour la progression d'un challenge
 */
export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  increment: number = 1
): Promise<void> {
  const challenge = await prisma.userChallenge.findFirst({
    where: { userId, challengeId, status: "ACTIVE" },
  });

  if (!challenge) return;

  const newProgress = challenge.progress + increment;
  const isCompleted = newProgress >= challenge.target;

  await prisma.userChallenge.update({
    where: { id: challenge.id },
    data: {
      progress: newProgress,
      status: isCompleted ? "COMPLETED" : "ACTIVE",
      completedAt: isCompleted ? new Date() : null,
    },
  });

  if (isCompleted) {
    console.log(`[Challenges] User ${userId} completed challenge ${challengeId}`);

    // Get challenge definition to include educational tip in the event
    const definition = await prisma.referentiel.findFirst({
      where: {
        categorie: "CHALLENGE_DEFINITION",
        cle: challengeId,
      },
    });

    const defValue = definition?.valeur as any;
    const educationalTip = defValue?.educationalTip;
    const relatedGlossaryTerms = defValue?.relatedGlossaryTerms || [];

    await emitGameEvent("CHALLENGE_COMPLETED", userId, {
      challengeId,
      educationalTip,
      relatedGlossaryTerms,
    });
  }
}

/**
 * Récupère les challenges actifs d'un utilisateur
 */
export async function getActiveChallenges(userId: string): Promise<UserChallenge[]> {
  const challenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    orderBy: { startedAt: "desc" },
  });

  return challenges as UserChallenge[];
}

/**
 * Progress updaters pour chaque type de challenge
 */
const challengeProgressUpdaters: ChallengeProgressRegistry = {
  document_upload: async (userId: string, event: GameEvent, challenge: UserChallenge) => {
    if (event.type === "DOCUMENT_UPLOADED") {
      await updateChallengeProgress(userId, challenge.challengeId, 1);
      return challenge.progress + 1;
    }
    return challenge.progress;
  },

  journal_entries: async (userId: string, event: GameEvent, challenge: UserChallenge) => {
    if (event.type === "JOURNAL_ENTRY_CREATED") {
      await updateChallengeProgress(userId, challenge.challengeId, 1);
      return challenge.progress + 1;
    }
    return challenge.progress;
  },

  quiz_completion: async (userId: string, event: GameEvent, challenge: UserChallenge) => {
    if (event.type === "QUIZ_COMPLETED") {
      await updateChallengeProgress(userId, challenge.challengeId, 1);
      return challenge.progress + 1;
    }
    return challenge.progress;
  },

  confidence_milestone: async (userId: string, event: GameEvent, challenge: UserChallenge) => {
    if (event.type === "SCORE_CALCULATED") {
      const profil = await prisma.profilFiscal.findUnique({ where: { userId } });
      if (!profil) return challenge.progress;

      // Calculate confidence score (simplified)
      const statusData = (profil.statusData as any) || {};
      const totalFields = Object.keys(statusData).length || 1;
      const verifiedFields = Object.values(statusData).filter((s) => s === "VERIFIE").length;
      const confidenceScore = (verifiedFields / totalFields) * 100;

      if (confidenceScore >= challenge.target) {
        await updateChallengeProgress(userId, challenge.challengeId, challenge.target);
        return challenge.target;
      }
    }
    return challenge.progress;
  },

  ticket_scan: async (userId: string, event: GameEvent, challenge: UserChallenge) => {
    if (event.type === "JOURNAL_ENTRY_CREATED" && event.payload.isScanned) {
      await updateChallengeProgress(userId, challenge.challengeId, 1);
      return challenge.progress + 1;
    }
    return challenge.progress;
  },

  simulation_created: async (userId: string, event: GameEvent, challenge: UserChallenge) => {
    if (event.type === "SIMULATION_CREATED") {
      await updateChallengeProgress(userId, challenge.challengeId, 1);
      return challenge.progress + 1;
    }
    return challenge.progress;
  },
};

/**
 * Handler pour mettre à jour la progression des challenges suite à un événement
 */
export async function handleChallengeProgress(event: GameEvent): Promise<void> {
  const challenges = await getActiveChallenges(event.userId);

  for (const challenge of challenges) {
    // Get challenge definition to know the type
    const definition = await prisma.referentiel.findFirst({
      where: {
        categorie: "CHALLENGE_DEFINITION",
        cle: challenge.challengeId,
      },
    });

    if (!definition) continue;

    const defValue = definition.valeur as any;
    const updater = challengeProgressUpdaters[defValue.type];

    if (updater) {
      await updater(event.userId, event, challenge);
    }
  }
}

/**
 * Vérifie et expire les challenges expirés
 */
export async function expireOldChallenges(): Promise<void> {
  await prisma.userChallenge.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: {
        lte: new Date(),
      },
    },
    data: {
      status: "EXPIRED",
    },
  });
}

/**
 * Récupère les challenges d'un utilisateur avec leurs définitions
 */
export async function getUserChallengesWithDefinitions(userId: string) {
  const userChallenges = await prisma.userChallenge.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
  });

  const definitions = await getChallengeDefinitions();
  const definitionsMap = new Map(definitions.map((d) => [d.id, d]));

  return userChallenges.map((uc) => ({
    ...uc,
    definition: definitionsMap.get(uc.challengeId),
  }));
}
