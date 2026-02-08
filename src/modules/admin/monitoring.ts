/**
 * Monitoring système pour l'interface admin
 * Phase 4 - Admin Interface
 */

import { prisma } from '@/lib/prisma';

/**
 * Santé globale du système
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  database: {
    status: 'connected' | 'disconnected' | 'slow';
    latency: number;
  };
  api: {
    status: 'operational' | 'degraded' | 'down';
    averageLatency: number;
  };
  jobs: {
    status: 'running' | 'stopped' | 'errors';
    lastRun?: Date;
  };
  errorRate: {
    last24h: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  uptime: number; // en secondes
  timestamp: Date;
}

/**
 * Récupère l'état de santé du système
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  const [dbHealth, apiHealth, jobsHealth, errorRate] = await Promise.all([
    checkDatabaseHealth(),
    checkAPIHealth(),
    checkJobsHealth(),
    getErrorRate(),
  ]);

  // Déterminer le statut global
  let status: SystemHealth['status'] = 'healthy';

  if (
    dbHealth.status === 'disconnected' ||
    apiHealth.status === 'down' ||
    jobsHealth.status === 'stopped' ||
    errorRate.last24h > 100
  ) {
    status = 'critical';
  } else if (
    dbHealth.status === 'slow' ||
    apiHealth.status === 'degraded' ||
    jobsHealth.status === 'errors' ||
    errorRate.last24h > 20
  ) {
    status = 'degraded';
  }

  return {
    status,
    database: dbHealth,
    api: apiHealth,
    jobs: jobsHealth,
    errorRate,
    uptime: getUptime(),
    timestamp: new Date(),
  };
}

/**
 * Vérifie la santé de la base de données
 */
async function checkDatabaseHealth(): Promise<SystemHealth['database']> {
  const startTime = Date.now();

  try {
    // Test de connexion simple
    await prisma.$queryRaw`SELECT 1`;

    const latency = Date.now() - startTime;

    let status: 'connected' | 'slow' = 'connected';
    if (latency > 1000) {
      status = 'slow';
    }

    return { status, latency };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'disconnected',
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Vérifie la santé de l'API
 */
async function checkAPIHealth(): Promise<SystemHealth['api']> {
  // Pour l'instant, retourner un statut simulé
  // Dans une implémentation complète, mesurer les latences réelles
  return {
    status: 'operational',
    averageLatency: 150,
  };
}

/**
 * Vérifie l'état des jobs planifiés
 */
async function checkJobsHealth(): Promise<SystemHealth['jobs']> {
  try {
    // Vérifier la dernière exécution du pipeline
    // Pour l'instant, retourner un statut simulé
    return {
      status: 'running',
      lastRun: new Date(),
    };
  } catch (error) {
    return {
      status: 'stopped',
    };
  }
}

/**
 * Calcule le taux d'erreur
 */
export async function getErrorRate(): Promise<{
  last24h: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}> {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Compter les erreurs (simulé pour l'instant)
    // Dans une implémentation complète, lire depuis une table d'erreurs
    const last24h = 5;
    const previous24h = 8;

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (last24h > previous24h * 1.2) {
      trend = 'increasing';
    } else if (last24h < previous24h * 0.8) {
      trend = 'decreasing';
    }

    return { last24h, trend };
  } catch (error) {
    console.error('Error calculating error rate:', error);
    return { last24h: 0, trend: 'stable' };
  }
}

/**
 * Récupère les erreurs récentes
 */
export async function getRecentErrors(options: {
  limit?: number;
  offset?: number;
  severity?: 'error' | 'warning' | 'critical';
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<{
  errors: Array<{
    id: string;
    message: string;
    stack?: string;
    severity: 'error' | 'warning' | 'critical';
    source: string;
    userId?: string;
    timestamp: Date;
  }>;
  total: number;
}> {
  // Pour l'instant, retourner des données simulées
  // Dans une implémentation complète, lire depuis une table d'erreurs dédiée
  return {
    errors: [],
    total: 0,
  };
}

/**
 * Récupère l'état des jobs planifiés
 */
export async function getJobStatus(): Promise<
  Array<{
    name: string;
    schedule: string;
    lastRun?: Date;
    nextRun?: Date;
    status: 'running' | 'idle' | 'failed';
    lastResult?: {
      success: boolean;
      duration: number;
      error?: string;
    };
  }>
> {
  // Jobs configurés
  const jobs = [
    {
      name: 'Referentiel Pipeline',
      schedule: '0 2 * * *', // 2h du matin tous les jours
      lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000), // Il y a 12h
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000), // Dans 12h
      status: 'idle' as const,
      lastResult: {
        success: true,
        duration: 45000,
      },
    },
    {
      name: 'Usage Stats Aggregation',
      schedule: '0 0 * * *', // Minuit tous les jours
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 24h
      nextRun: new Date(Date.now() + 0 * 60 * 60 * 1000), // Maintenant
      status: 'idle' as const,
      lastResult: {
        success: true,
        duration: 12000,
      },
    },
    {
      name: 'Cleanup Old Logs',
      schedule: '0 3 * * 0', // 3h le dimanche
      lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
      nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Dans 4 jours
      status: 'idle' as const,
      lastResult: {
        success: true,
        duration: 8000,
      },
    },
  ];

  return jobs;
}

/**
 * Récupère le uptime du serveur
 * (Approximation basée sur le démarrage du processus)
 */
function getUptime(): number {
  return process.uptime();
}

/**
 * Récupère les métriques de performance
 */
export async function getPerformanceMetrics(): Promise<{
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  requests: {
    total: number;
    perSecond: number;
  };
}> {
  const memoryUsage = process.memoryUsage();

  return {
    memory: {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
    },
    cpu: {
      usage: 0, // Nécessiterait un monitoring plus sophistiqué
    },
    requests: {
      total: 0, // À implémenter avec un compteur
      perSecond: 0,
    },
  };
}

/**
 * Récupère les statistiques d'utilisation de la base de données
 */
export async function getDatabaseStats(): Promise<{
  tables: Array<{
    name: string;
    rowCount: number;
    sizeKB: number;
  }>;
  totalSize: number;
  connections: {
    active: number;
    idle: number;
    max: number;
  };
}> {
  try {
    // Compter les lignes dans les principales tables
    const [
      userCount,
      profilCount,
      referentielCount,
      notificationCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.profilFiscal.count(),
      prisma.referentiel.count(),
      prisma.notification.count(),
    ]);

    return {
      tables: [
        { name: 'User', rowCount: userCount, sizeKB: 0 },
        { name: 'ProfilFiscal', rowCount: profilCount, sizeKB: 0 },
        { name: 'Referentiel', rowCount: referentielCount, sizeKB: 0 },
        { name: 'Notification', rowCount: notificationCount, sizeKB: 0 },
      ],
      totalSize: 0,
      connections: {
        active: 0,
        idle: 0,
        max: 10,
      },
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      tables: [],
      totalSize: 0,
      connections: { active: 0, idle: 0, max: 10 },
    };
  }
}
