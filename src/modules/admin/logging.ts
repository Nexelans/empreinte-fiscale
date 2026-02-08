/**
 * Logging des actions admin
 * Phase 4 - Admin Interface
 */

import { prisma } from '@/lib/prisma';
import { AdminAction, AdminLogEntry } from './types';

/**
 * Log une action admin
 */
export async function logAdminAction(params: {
  adminUserId: string;
  action: AdminAction;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AdminLogEntry> {
  try {
    const log = await prisma.adminLog.create({
      data: {
        adminUserId: params.adminUserId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        details: params.details as any || {},
        ipAddress: params.ipAddress,
        timestamp: new Date(),
      },
      include: {
        admin: {
          select: { email: true },
        },
      },
    });

    return {
      id: log.id,
      adminUserId: log.adminUserId,
      adminUserEmail: log.admin.email || undefined,
      action: log.action as AdminAction,
      resourceType: log.resourceType,
      resourceId: log.resourceId || '',
      details: log.details as Record<string, any>,
      ipAddress: log.ipAddress || undefined,
      timestamp: log.timestamp,
    };
  } catch (error) {
    console.error('Error logging admin action:', error);
    throw error;
  }
}

/**
 * Récupère les logs admin avec filtres
 */
export async function getAdminLogs(options: {
  adminUserId?: string;
  action?: AdminAction;
  resourceType?: string;
  resourceId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}): Promise<{
  logs: AdminLogEntry[];
  total: number;
}> {
  const {
    adminUserId,
    action,
    resourceType,
    resourceId,
    dateFrom,
    dateTo,
    limit = 50,
    offset = 0,
  } = options;

  try {
    const where: any = {};

    if (adminUserId) {
      where.adminUserId = adminUserId;
    }

    if (action) {
      where.action = action;
    }

    if (resourceType) {
      where.resourceType = resourceType;
    }

    if (resourceId) {
      where.resourceId = resourceId;
    }

    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) {
        where.timestamp.gte = dateFrom;
      }
      if (dateTo) {
        where.timestamp.lte = dateTo;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        include: {
          admin: {
            select: { email: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.adminLog.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        adminUserId: log.adminUserId,
        adminUserEmail: log.admin.email || undefined,
        action: log.action as AdminAction,
        resourceType: log.resourceType,
        resourceId: log.resourceId || '',
        details: log.details as Record<string, any>,
        ipAddress: log.ipAddress || undefined,
          timestamp: log.timestamp,
      })),
      total,
    };
  } catch (error) {
    console.error('Error getting admin logs:', error);
    return { logs: [], total: 0 };
  }
}

/**
 * Récupère les logs pour une ressource spécifique
 */
export async function getResourceLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 20
): Promise<AdminLogEntry[]> {
  try {
    const logs = await prisma.adminLog.findMany({
      where: {
        resourceType,
        resourceId,
      },
      include: {
        admin: {
          select: { email: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      adminUserId: log.adminUserId,
      adminUserEmail: log.admin.email || undefined,
      action: log.action as AdminAction,
      resourceType: log.resourceType,
      resourceId: log.resourceId || '',
      details: log.details as Record<string, any>,
      ipAddress: log.ipAddress || undefined,
      timestamp: log.timestamp,
    }));
  } catch (error) {
    console.error('Error getting resource logs:', error);
    return [];
  }
}

/**
 * Récupère les activités récentes d'un admin
 */
export async function getAdminActivity(
  adminUserId: string,
  limit: number = 10
): Promise<AdminLogEntry[]> {
  try {
    const logs = await prisma.adminLog.findMany({
      where: { adminUserId },
      include: {
        admin: {
          select: { email: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      adminUserId: log.adminUserId,
      adminUserEmail: log.admin.email || undefined,
      action: log.action as AdminAction,
      resourceType: log.resourceType,
      resourceId: log.resourceId || '',
      details: log.details as Record<string, any>,
      ipAddress: log.ipAddress || undefined,
      timestamp: log.timestamp,
    }));
  } catch (error) {
    console.error('Error getting admin activity:', error);
    return [];
  }
}

/**
 * Compte les actions par type sur une période
 */
export async function getActionStats(
  dateFrom: Date,
  dateTo: Date
): Promise<Record<AdminAction, number>> {
  try {
    const logs = await prisma.adminLog.findMany({
      where: {
        timestamp: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      select: { action: true },
    });

    const stats: Record<string, number> = {};

    for (const log of logs) {
      const action = log.action;
      stats[action] = (stats[action] || 0) + 1;
    }

    return stats as Record<AdminAction, number>;
  } catch (error) {
    console.error('Error getting action stats:', error);
    return {} as Record<AdminAction, number>;
  }
}

/**
 * Exporte les logs en CSV
 */
export async function exportLogsCSV(options: {
  adminUserId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<string> {
  const { logs } = await getAdminLogs({
    ...options,
    limit: 10000, // Max pour export
  });

  const headers = [
    'Timestamp',
    'Admin Email',
    'Action',
    'Resource Type',
    'Resource ID',
    'IP Address',
  ];

  const rows = logs.map((log) => [
    log.timestamp.toISOString(),
    log.adminUserEmail || log.adminUserId,
    log.action,
    log.resourceType,
    log.resourceId,
    log.ipAddress || '',
  ]);

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return csv;
}

/**
 * Nettoie les vieux logs (pour conformité RGPD)
 */
export async function cleanupOldLogs(retentionDays: number = 365): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.adminLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`[Admin Logs] Cleaned up ${result.count} logs older than ${retentionDays} days`);

    return result.count;
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
    return 0;
  }
}
