/**
 * Types pour l'interface admin
 * Phase 4 - Admin Interface
 */

/**
 * Rôles administrateur
 */
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DATA_ADMIN = 'DATA_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',
  ANALYTICS_VIEWER = 'ANALYTICS_VIEWER',
}

/**
 * Permissions administrateur par rôle
 */
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.SUPER_ADMIN]: [
    'manage_users',
    'manage_referentiel',
    'manage_admins',
    'trigger_pipeline',
    'rollback_updates',
    'suspend_users',
    'delete_users',
    'view_analytics',
    'view_logs',
    'manage_system',
  ],
  [AdminRole.DATA_ADMIN]: [
    'manage_referentiel',
    'view_analytics',
    'view_logs',
  ],
  [AdminRole.SUPPORT_ADMIN]: [
    'manage_users',
    'suspend_users',
    'view_logs',
  ],
  [AdminRole.ANALYTICS_VIEWER]: [
    'view_analytics',
  ],
};

/**
 * Permission spécifique
 */
export type AdminPermission =
  | 'manage_users'
  | 'manage_referentiel'
  | 'manage_admins'
  | 'trigger_pipeline'
  | 'rollback_updates'
  | 'suspend_users'
  | 'delete_users'
  | 'view_analytics'
  | 'view_logs'
  | 'manage_system';

/**
 * Action admin loggée
 */
export type AdminAction =
  | 'APPROVE_UPDATE'
  | 'REJECT_UPDATE'
  | 'ROLLBACK_UPDATE'
  | 'TRIGGER_PIPELINE'
  | 'SUSPEND_USER'
  | 'DELETE_USER'
  | 'ASSIGN_ADMIN_ROLE'
  | 'REVOKE_ADMIN_ROLE'
  | 'UPDATE_USER'
  | 'VIEW_USER_DATA'
  | 'EXPORT_ANALYTICS';

/**
 * Entrée de log admin
 */
export interface AdminLogEntry {
  id: string;
  adminUserId: string;
  adminUserEmail?: string;
  action: AdminAction;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Statistiques admin
 */
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  adminUsers: number;
  pendingReferentielUpdates: number;
  recentErrors: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

/**
 * Filtre de recherche admin
 */
export interface AdminSearchFilter {
  query?: string;
  role?: AdminRole;
  status?: 'active' | 'suspended' | 'deleted';
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}
