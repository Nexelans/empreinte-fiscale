/**
 * Module de gestion des consentements RGPD pour l'IA utilisateur
 * Phase 4 - Module AI
 *
 * Garantit la conformité RGPD avant toute transmission de données
 */

import { prisma } from '@/lib/prisma';

export type ConsentType = 'AI_DATA_TRANSMISSION' | 'DOCUMENT_EXTRACTION' | 'SOCIAL_SHARING';

/**
 * Vérifie si un utilisateur a donné son consentement pour un type donné
 */
export async function checkAIConsent(
  userId: string,
  consentType: ConsentType = 'AI_DATA_TRANSMISSION'
): Promise<boolean> {
  const consent = await prisma.userConsent.findUnique({
    where: {
      userId_consentType: {
        userId,
        consentType,
      },
    },
  });

  // Consentement accordé et non révoqué
  return consent !== null && consent.granted && consent.withdrawnAt === null;
}

/**
 * Enregistre le consentement d'un utilisateur
 */
export async function grantAIConsent(
  userId: string,
  consentType: ConsentType = 'AI_DATA_TRANSMISSION'
): Promise<void> {
  await prisma.userConsent.upsert({
    where: {
      userId_consentType: {
        userId,
        consentType,
      },
    },
    create: {
      userId,
      consentType,
      granted: true,
      grantedAt: new Date(),
    },
    update: {
      granted: true,
      grantedAt: new Date(),
      withdrawnAt: null, // Réinitialiser si révoqué précédemment
    },
  });
}

/**
 * Révoque le consentement d'un utilisateur
 * Supprime automatiquement la config IA si c'est AI_DATA_TRANSMISSION
 */
export async function withdrawAIConsent(
  userId: string,
  consentType: ConsentType = 'AI_DATA_TRANSMISSION'
): Promise<void> {
  // Marquer le consentement comme révoqué
  await prisma.userConsent.update({
    where: {
      userId_consentType: {
        userId,
        consentType,
      },
    },
    data: {
      granted: false,
      withdrawnAt: new Date(),
    },
  });

  // Si c'est le consentement AI, supprimer la config IA
  if (consentType === 'AI_DATA_TRANSMISSION') {
    const aiConfig = await prisma.aIConfig.findUnique({
      where: { userId },
    });

    if (aiConfig) {
      await prisma.aIConfig.delete({
        where: { userId },
      });
    }
  }
}

/**
 * Récupère tous les consentements d'un utilisateur
 */
export async function getUserConsents(userId: string) {
  return prisma.userConsent.findMany({
    where: { userId },
    orderBy: { grantedAt: 'desc' },
  });
}

/**
 * Vérifie si l'utilisateur a déjà été présenté avec le consentement
 * (accordé ou refusé dans le passé)
 */
export async function hasSeenConsentPrompt(
  userId: string,
  consentType: ConsentType = 'AI_DATA_TRANSMISSION'
): Promise<boolean> {
  const consent = await prisma.userConsent.findUnique({
    where: {
      userId_consentType: {
        userId,
        consentType,
      },
    },
  });

  return consent !== null;
}
