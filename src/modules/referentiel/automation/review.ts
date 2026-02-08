/**
 * Système de review admin pour les mises à jour du Référentiel
 * Phase 4 - Referentiel Automation
 *
 * Permet aux admins d'approuver, rejeter ou rollback des updates
 */

import { prisma } from '@/lib/prisma';
import { UpdateRecord, UpdateStatus } from './types';

/**
 * Approuve une mise à jour et l'applique au Référentiel
 */
export async function approveUpdate(
  updateId: string,
  reviewerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer l'update
    const update = await prisma.referentielUpdate.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      return { success: false, error: 'Update not found' };
    }

    if (update.status !== 'PENDING_REVIEW' && update.status !== 'DETECTED') {
      return {
        success: false,
        error: `Cannot approve update with status: ${update.status}`,
      };
    }

    // Appliquer la mise à jour au Référentiel
    await prisma.referentiel.upsert({
      where: {
        millesime_categorie_cle: {
          millesime: update.millesime,
          categorie: update.categorie,
          cle: update.cle,
        },
      },
      update: {
        valeur: update.newValue as any,
        source: update.source,
        dateIntegration: new Date(),
        statut: 'OFFICIEL',
      },
      create: {
        millesime: update.millesime,
        categorie: update.categorie,
        cle: update.cle,
        valeur: update.newValue as any,
        unite: 'unspecified', // À améliorer
        source: update.source,
        urlSource: '',
        datePublication: new Date(),
        dateIntegration: new Date(),
        statut: 'OFFICIEL',
      },
    });

    // Mettre à jour le statut de l'update
    await prisma.referentielUpdate.update({
      where: { id: updateId },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });

    // Logger l'action admin
    await prisma.adminLog.create({
      data: {
        adminUserId: reviewerId,
        action: 'APPROVE_UPDATE',
        resourceType: 'ReferentielUpdate',
        resourceId: updateId,
        details: {
          millesime: update.millesime,
          categorie: update.categorie,
          cle: update.cle,
          oldValue: update.oldValue,
          newValue: update.newValue,
        } as any,
        timestamp: new Date(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error approving update:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Rejette une mise à jour
 */
export async function rejectUpdate(
  updateId: string,
  reviewerId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer l'update
    const update = await prisma.referentielUpdate.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      return { success: false, error: 'Update not found' };
    }

    // Mettre à jour le statut
    await prisma.referentielUpdate.update({
      where: { id: updateId },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        // rejectionReason is logged in AdminLog details
      },
    });

    // Logger l'action admin
    await prisma.adminLog.create({
      data: {
        adminUserId: reviewerId,
        action: 'REJECT_UPDATE',
        resourceType: 'ReferentielUpdate',
        resourceId: updateId,
        details: {
          millesime: update.millesime,
          categorie: update.categorie,
          cle: update.cle,
          reason,
        } as any,
        timestamp: new Date(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting update:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Approuve plusieurs mises à jour en une seule opération atomique
 */
export async function bulkApprove(
  updateIds: string[],
  reviewerId: string
): Promise<{
  success: boolean;
  approved: number;
  failed: number;
  errors: Array<{ updateId: string; error: string }>;
}> {
  let approved = 0;
  const errors: Array<{ updateId: string; error: string }> = [];

  for (const updateId of updateIds) {
    const result = await approveUpdate(updateId, reviewerId);

    if (result.success) {
      approved++;
    } else {
      errors.push({ updateId, error: result.error || 'Unknown error' });
    }
  }

  return {
    success: errors.length === 0,
    approved,
    failed: errors.length,
    errors,
  };
}

/**
 * Rollback une mise à jour approuvée (restaure l'ancienne valeur)
 */
export async function rollbackUpdate(
  updateId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer l'update
    const update = await prisma.referentielUpdate.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      return { success: false, error: 'Update not found' };
    }

    if (update.status !== 'APPROVED') {
      return {
        success: false,
        error: 'Can only rollback approved updates',
      };
    }

    // Restaurer l'ancienne valeur dans le Référentiel
    if (update.oldValue === null) {
      // Si c'était une création, supprimer l'entrée
      await prisma.referentiel.delete({
        where: {
          millesime_categorie_cle: {
            millesime: update.millesime,
            categorie: update.categorie,
            cle: update.cle,
          },
        },
      });
    } else {
      // Sinon, restaurer l'ancienne valeur
      await prisma.referentiel.update({
        where: {
          millesime_categorie_cle: {
            millesime: update.millesime,
            categorie: update.categorie,
            cle: update.cle,
          },
        },
        data: {
          valeur: update.oldValue as any,
          dateIntegration: new Date(),
        },
      });
    }

    // Marquer l'update comme rolled back
    await prisma.referentielUpdate.update({
      where: { id: updateId },
      data: {
        status: 'ROLLED_BACK',
      },
    });

    // Logger l'action admin
    await prisma.adminLog.create({
      data: {
        adminUserId: adminId,
        action: 'ROLLBACK_UPDATE',
        resourceType: 'ReferentielUpdate',
        resourceId: updateId,
        details: {
          millesime: update.millesime,
          categorie: update.categorie,
          cle: update.cle,
          restoredValue: update.oldValue,
        } as any,
        timestamp: new Date(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error rolling back update:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Récupère les données de comparaison pour une update (side-by-side)
 */
export async function getComparisonData(updateId: string): Promise<{
  update: UpdateRecord | null;
  currentValue: any;
  proposedValue: any;
  diff: any;
}> {
  try {
    const update = await prisma.referentielUpdate.findUnique({
      where: { id: updateId },
    });

    if (!update) {
      return {
        update: null,
        currentValue: null,
        proposedValue: null,
        diff: null,
      };
    }

    // Calculer le diff (simplifié)
    const diff = calculateDiff(update.oldValue, update.newValue);

    return {
      update: update as any,
      currentValue: update.oldValue,
      proposedValue: update.newValue,
      diff,
    };
  } catch (error) {
    console.error('Error getting comparison data:', error);
    return {
      update: null,
      currentValue: null,
      proposedValue: null,
      diff: null,
    };
  }
}

/**
 * Calcule les différences entre deux valeurs
 */
function calculateDiff(oldValue: any, newValue: any): any {
  if (oldValue === null) {
    return { type: 'created', value: newValue };
  }

  if (typeof oldValue !== typeof newValue) {
    return { type: 'type_changed', old: oldValue, new: newValue };
  }

  if (typeof oldValue === 'object' && !Array.isArray(oldValue)) {
    const diff: any = {};
    const allKeys = new Set([
      ...Object.keys(oldValue || {}),
      ...Object.keys(newValue || {}),
    ]);

    for (const key of Array.from(allKeys)) {
      if (!(key in oldValue)) {
        diff[key] = { type: 'added', value: newValue[key] };
      } else if (!(key in newValue)) {
        diff[key] = { type: 'removed', value: oldValue[key] };
      } else if (oldValue[key] !== newValue[key]) {
        diff[key] = { type: 'changed', old: oldValue[key], new: newValue[key] };
      }
    }

    return diff;
  }

  if (oldValue !== newValue) {
    return { type: 'changed', old: oldValue, new: newValue };
  }

  return { type: 'unchanged' };
}

/**
 * Liste les updates en attente de review
 */
export async function listPendingUpdates(options: {
  limit?: number;
  offset?: number;
  categorie?: string;
  millesime?: string;
}): Promise<{
  updates: UpdateRecord[];
  total: number;
}> {
  const { limit = 50, offset = 0, categorie, millesime } = options;

  const where: any = {
    status: {
      in: ['PENDING_REVIEW', 'DETECTED'],
    },
  };

  if (categorie) {
    where.categorie = categorie;
  }

  if (millesime) {
    where.millesime = millesime;
  }

  const [updates, total] = await Promise.all([
    prisma.referentielUpdate.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { detectedAt: 'desc' },
    }),
    prisma.referentielUpdate.count({ where }),
  ]);

  return {
    updates: updates as any[],
    total,
  };
}
