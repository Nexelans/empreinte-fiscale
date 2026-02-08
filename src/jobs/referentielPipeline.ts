/**
 * Cron job pour l'automation du Référentiel
 * Phase 4 - Referentiel Automation
 *
 * Exécute le pipeline quotidiennement à 2h du matin
 */

import { runPipeline, shouldRunPipeline } from '@/modules/referentiel/automation/pipeline';

/**
 * Handler du cron job
 * À appeler via un système de scheduling (Vercel Cron, node-cron, etc.)
 */
export async function referentielPipelineJob(): Promise<void> {
  console.log('[Cron] Starting referentiel pipeline job');

  try {
    // Vérifier si le pipeline doit s'exécuter
    const shouldRun = await shouldRunPipeline();

    if (!shouldRun) {
      console.log('[Cron] Pipeline execution skipped (interval not reached)');
      return;
    }

    // Exécuter le pipeline
    const result = await runPipeline();

    if (result.success) {
      console.log(
        `[Cron] Pipeline completed successfully. Updates detected: ${result.updatesDetected}`
      );
    } else {
      console.error(
        `[Cron] Pipeline completed with errors:`,
        result.errors
      );
    }

    // Logger le résultat
    await logPipelineExecution(result);
  } catch (error: any) {
    console.error('[Cron] Fatal error in pipeline job:', error);

    // Logger l'erreur
    await logPipelineError(error);
  }
}

/**
 * Log l'exécution du pipeline
 */
async function logPipelineExecution(result: any): Promise<void> {
  // Dans une implémentation complète, logger dans une table dédiée
  console.log('[Cron] Pipeline execution logged:', {
    timestamp: result.timestamp,
    success: result.success,
    duration: result.duration,
    sourcesPolled: result.sourcesPolled,
    updatesDetected: result.updatesDetected,
    errorCount: result.errors.length,
  });
}

/**
 * Log une erreur fatale du pipeline
 */
async function logPipelineError(error: Error): Promise<void> {
  console.error('[Cron] Pipeline error logged:', {
    timestamp: new Date(),
    error: error.message,
    stack: error.stack,
  });
}

/**
 * Configuration du cron (pour référence)
 *
 * Vercel Cron (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/referentiel-pipeline",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 *
 * Node-cron:
 * import cron from 'node-cron';
 * cron.schedule('0 2 * * *', referentielPipelineJob);
 */
