/**
 * Pipeline d'automation du Référentiel
 * Phase 4 - Referentiel Automation
 *
 * Orchestre la détection, extraction, transformation et staging des mises à jour
 */

import { prisma } from '@/lib/prisma';
import {
  DataSource,
  UpdateRecord,
  UpdateStatus,
  ExtractionResult,
  PollResult,
} from './types';
import { pollDataGouv } from './sources/datagouv';
import { pollINSEE } from './sources/insee';
import { pollLegifrance } from './sources/legifrance';
import { validateData, VALIDATION_SCHEMAS } from './parsers';

/**
 * Résultat d'une exécution du pipeline
 */
export interface PipelineResult {
  success: boolean;
  sourcesPolled: number;
  updatesDetected: number;
  updatesStaged: number;
  errors: string[];
  duration: number;
  timestamp: Date;
}

/**
 * Exécute le pipeline complet
 */
export async function runPipeline(): Promise<PipelineResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let sourcesPolled = 0;
  let updatesDetected = 0;
  const updatesStaged = 0;

  console.log('[Pipeline] Starting referentiel automation pipeline...');

  try {
    // Phase 1: Récupérer les sources actives
    const sources = await getActiveSources();
    console.log(`[Pipeline] Found ${sources.length} active sources`);

    // Phase 2: Poll chaque source
    for (const source of sources) {
      try {
        console.log(`[Pipeline] Polling source: ${source.name}`);

        const pollResult = await pollSource(source);
        sourcesPolled++;

        if (pollResult.success) {
          console.log(
            `[Pipeline] Source ${source.name}: ${pollResult.updatesDetected} updates detected`
          );
          updatesDetected += pollResult.updatesDetected;

          // Mettre à jour le statut de la source
          await updateSourceStatus(source.id, {
            lastPollAt: pollResult.timestamp,
            lastSuccessAt: pollResult.timestamp,
          });
        } else {
          console.error(
            `[Pipeline] Source ${source.name} failed:`,
            pollResult.errors
          );
          errors.push(
            `Source ${source.name}: ${pollResult.errors.join(', ')}`
          );

          // Mettre à jour le statut avec l'erreur
          await updateSourceStatus(source.id, {
            lastPollAt: pollResult.timestamp,
            lastErrorAt: pollResult.timestamp,
            lastError: pollResult.errors[0],
          });
        }

        // Respect du rate limiting entre sources
        await sleep(1000);
      } catch (error: any) {
        console.error(`[Pipeline] Error polling source ${source.name}:`, error);
        errors.push(`Source ${source.name}: ${error.message}`);
      }
    }

    // Phase 3: Traiter les mises à jour détectées
    // (Pour l'instant, les updates sont déjà créées dans pollSource)
    // Cette phase pourrait inclure des transformations ou validations supplémentaires

    // Phase 4: Notifier les admins s'il y a des updates en attente
    const pendingCount = await getPendingReviewCount();
    if (pendingCount > 0) {
      console.log(
        `[Pipeline] ${pendingCount} updates pending review. Sending notification...`
      );
      await notifyAdmins(pendingCount);
    }

    const duration = Date.now() - startTime;

    console.log(
      `[Pipeline] Completed in ${duration}ms. Sources: ${sourcesPolled}, Updates: ${updatesDetected}, Errors: ${errors.length}`
    );

    return {
      success: errors.length === 0,
      sourcesPolled,
      updatesDetected,
      updatesStaged,
      errors,
      duration,
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error('[Pipeline] Fatal error:', error);
    return {
      success: false,
      sourcesPolled,
      updatesDetected,
      updatesStaged,
      errors: [error.message || 'Unknown error'],
      duration: Date.now() - startTime,
      timestamp: new Date(),
    };
  }
}

/**
 * Poll une source de données
 */
async function pollSource(source: DataSource): Promise<PollResult> {
  // Router vers le bon poller selon le type
  switch (source.name.toLowerCase()) {
    case 'data.gouv.fr':
      return pollDataGouv(source);

    case 'insee':
      return pollINSEE(source);

    case 'legifrance':
      return pollLegifrance(source);

    default:
      return {
        sourceId: source.id,
        success: false,
        updatesDetected: 0,
        errors: [`Unknown source type: ${source.name}`],
        latency: 0,
        timestamp: new Date(),
      };
  }
}

/**
 * Récupère les sources actives
 */
async function getActiveSources(): Promise<DataSource[]> {
  // Pour l'instant, retourner des sources en dur
  // Dans une implémentation complète, lire depuis la base de données
  return [
    {
      id: 'datagouv',
      name: 'data.gouv.fr',
      type: 'api' as any,
      url: 'https://www.data.gouv.fr/api/1',
      status: 'active' as any,
      pollIntervalHours: 24,
      uptime: 99.5,
      config: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'insee',
      name: 'insee',
      type: 'api' as any,
      url: 'https://api.insee.fr',
      status: 'active' as any,
      pollIntervalHours: 24,
      uptime: 98.0,
      config: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'legifrance',
      name: 'legifrance',
      type: 'rss' as any,
      url: 'https://www.legifrance.gouv.fr/rss/jo.xml',
      status: 'active' as any,
      pollIntervalHours: 12,
      uptime: 99.9,
      config: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

/**
 * Met à jour le statut d'une source
 */
async function updateSourceStatus(
  sourceId: string,
  updates: {
    lastPollAt?: Date;
    lastSuccessAt?: Date;
    lastErrorAt?: Date;
    lastError?: string;
  }
): Promise<void> {
  // Dans une implémentation complète, mettre à jour dans la base de données
  console.log(`[Pipeline] Updating source ${sourceId} status:`, updates);
}

/**
 * Compte les updates en attente de review
 */
async function getPendingReviewCount(): Promise<number> {
  try {
    const count = await prisma.referentielUpdate.count({
      where: {
        status: 'PENDING_REVIEW',
      },
    });
    return count;
  } catch (error) {
    console.error('Failed to count pending reviews:', error);
    return 0;
  }
}

/**
 * Notifie les admins des updates en attente
 */
async function notifyAdmins(pendingCount: number): Promise<void> {
  try {
    // Récupérer les admins
    const admins = await prisma.user.findMany({
      where: {
        adminRole: {
          in: ['DATA_ADMIN', 'SUPER_ADMIN'],
        },
      },
    });

    // Créer une notification pour chaque admin
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'REFERENTIEL_UPDATE',
          title: 'Mises à jour du Référentiel en attente',
          body: `${pendingCount} mise(s) à jour du Référentiel nécessitent votre validation.`,
          data: {
            link: '/admin/referentiel/updates',
          },
          channels: ['in-app', 'email'],
        },
      });
    }

    console.log(`[Pipeline] Notified ${admins.length} admins of ${pendingCount} pending updates`);
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
}

/**
 * Détecte les changements entre l'ancienne et la nouvelle valeur
 */
export async function detectChanges(
  millesime: string,
  categorie: string,
  cle: string,
  newValue: any
): Promise<{
  hasChanged: boolean;
  oldValue: any;
  newValue: any;
}> {
  try {
    // Récupérer la valeur actuelle dans le Référentiel
    const existing = await prisma.referentiel.findUnique({
      where: {
        millesime_categorie_cle: {
          millesime,
          categorie,
          cle,
        },
      },
    });

    if (!existing) {
      return {
        hasChanged: true,
        oldValue: null,
        newValue,
      };
    }

    // Comparer les valeurs
    const hasChanged = JSON.stringify(existing.valeur) !== JSON.stringify(newValue);

    return {
      hasChanged,
      oldValue: existing.valeur,
      newValue,
    };
  } catch (error) {
    console.error('Error detecting changes:', error);
    return {
      hasChanged: false,
      oldValue: null,
      newValue: null,
    };
  }
}

/**
 * Crée un enregistrement de mise à jour
 */
export async function createUpdateRecord(
  sourceId: string,
  millesime: string,
  categorie: string,
  cle: string,
  oldValue: any,
  newValue: any,
  source: string
): Promise<UpdateRecord> {
  const updateRecord = await prisma.referentielUpdate.create({
    data: {
      millesime,
      categorie,
      cle,
      source,
      status: 'DETECTED',
      oldValue: oldValue as any,
      newValue: newValue as any,
      detectedAt: new Date(),
    },
  });

  return updateRecord as any;
}

/**
 * Vérifie si le pipeline doit s'exécuter (selon la dernière exécution)
 */
export async function shouldRunPipeline(): Promise<boolean> {
  // Dans une implémentation complète, vérifier la dernière exécution
  // et respecter les intervalles de polling
  return true;
}

/**
 * Récupère les statistiques du pipeline
 */
export async function getPipelineStats(): Promise<{
  lastRun?: Date;
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  totalUpdatesDetected: number;
}> {
  // Dans une implémentation complète, lire depuis une table de logs
  return {
    totalRuns: 0,
    successRate: 0,
    averageDuration: 0,
    totalUpdatesDetected: 0,
  };
}

/**
 * Utility: Sleep function
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry logic avec exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      console.log(`[Pipeline] Attempt ${attempt + 1}/${maxRetries} failed:`, error.message);

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[Pipeline] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
