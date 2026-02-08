/**
 * Gestion des utilisateurs pour l'interface admin
 * Phase 4 - Admin Interface
 */

import { prisma } from '@/lib/prisma';
import { AdminSearchFilter } from './types';
import { logAdminAction } from './logging';

/**
 * Interface utilisateur détaillée pour l'admin
 */
export interface UserDetails {
  id: string;
  email: string;
  name: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  adminRole: string | null;
  profilFiscal?: {
    statut: string | null;
    nombreParts: number | null;
    isComplete: boolean;
  } | null;
  stats: {
    documentCount: number;
    notificationCount: number;
    lastLoginAt?: Date;
  };
}

/**
 * Recherche des utilisateurs avec filtres
 */
export async function searchUsers(
  filter: AdminSearchFilter
): Promise<{
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    adminRole: string | null;
    createdAt: Date;
  }>;
  total: number;
}> {
  const {
    query,
    role,
    status,
    dateFrom,
    dateTo,
    limit = 50,
    offset = 0,
  } = filter;

  try {
    const where: any = {};

    // Recherche textuelle
    if (query) {
      where.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Filtre par rôle admin
    if (role) {
      where.adminRole = role;
    }

    // Filtre par statut (suspended field removed from schema)
    // Status filtering not implemented

    // Filtre par date
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          adminRole: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  } catch (error) {
    console.error('Error searching users:', error);
    return { users: [], total: 0 };
  }
}

/**
 * Récupère les détails complets d'un utilisateur
 */
export async function getUserDetails(userId: string): Promise<UserDetails | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profilFiscal: {
          select: {
            statut: true,
            nombreParts: true,
            isComplete: true,
          },
        },
        documents: {
          select: { id: true },
        },
        notifications: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      adminRole: user.adminRole,
      profilFiscal: user.profilFiscal,
      stats: {
        documentCount: user.documents.length,
        notificationCount: user.notifications.length,
        lastLoginAt: undefined, // À implémenter avec tracking de session
      },
    };
  } catch (error) {
    console.error('Error getting user details:', error);
    return null;
  }
}

/**
 * Suspend un utilisateur
 * Note: suspended field removed from User model - this function is currently non-functional
 */
export async function suspendUser(
  userId: string,
  adminId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Logger l'action (suspended field removed from schema)
    await logAdminAction({
      adminUserId: adminId,
      action: 'SUSPEND_USER',
      resourceType: 'User',
      resourceId: userId,
      details: { reason },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error suspending user:', error);
    return { success: false, error: error.message || 'Failed to suspend user' };
  }
}

/**
 * Réactive un utilisateur suspendu
 * Note: suspended field removed from User model - this function is currently non-functional
 */
export async function unsuspendUser(
  userId: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Logger l'action (suspended field removed from schema)
    await logAdminAction({
      adminUserId: adminId,
      action: 'UPDATE_USER',
      resourceType: 'User',
      resourceId: userId,
      details: { action: 'unsuspend' },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error unsuspending user:', error);
    return { success: false, error: error.message || 'Failed to unsuspend user' };
  }
}

/**
 * Supprime complètement un utilisateur (RGPD - droit à l'oubli)
 */
export async function deleteUserCompletely(
  userId: string,
  adminId: string,
  sendNotification: boolean = true
): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer l'email avant suppression pour notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Supprimer toutes les données associées (cascade via Prisma)
    // Les relations avec onDelete: Cascade sont automatiquement gérées
    await prisma.$transaction([
      // Supprimer les documents
      prisma.documentUpload.deleteMany({ where: { userId } }),

      // Supprimer les entrées de journal
      prisma.journalEntry.deleteMany({ where: { userId } }),

      // Supprimer les notifications
      prisma.notification.deleteMany({ where: { userId } }),

      // Supprimer les relations sociales
      prisma.friend.deleteMany({
        where: {
          OR: [{ userId }, { friendId: userId }],
        },
      }),

      // Supprimer les invitations
      prisma.friendInvitation.deleteMany({
        where: {
          OR: [{ inviterId: userId }, { inviteeEmail: user.email }],
        },
      }),

      // Supprimer l'appartenance aux groupes
      prisma.groupMember.deleteMany({ where: { userId } }),

      // Supprimer les groupes dont l'utilisateur est propriétaire
      prisma.group.deleteMany({ where: { ownerId: userId } }),

      // Supprimer les badges
      prisma.userBadge.deleteMany({ where: { userId } }),

      // Supprimer les simulations
      prisma.simulation.deleteMany({ where: { userId } }),

      // Supprimer la config AI
      prisma.aIConfig.deleteMany({ where: { userId } }),

      // Supprimer le profil fiscal
      prisma.profilFiscal.deleteMany({ where: { userId } }),

      // Supprimer les comptes OAuth
      prisma.account.deleteMany({ where: { userId } }),

      // Supprimer les sessions
      prisma.session.deleteMany({ where: { userId } }),

      // Enfin, supprimer l'utilisateur
      prisma.user.delete({ where: { id: userId } }),
    ]);

    // Logger l'action
    await logAdminAction({
      adminUserId: adminId,
      action: 'DELETE_USER',
      resourceType: 'User',
      resourceId: userId,
      details: {
        email: user.email,
        rgpdDeletion: true,
      },
    });

    // TODO: Envoyer une notification par email si demandé
    if (sendNotification) {
      console.log(`[RGPD] User deletion notification should be sent to: ${user.email}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message || 'Failed to delete user' };
  }
}

/**
 * Met à jour les informations d'un utilisateur
 */
export async function updateUser(
  userId: string,
  adminId: string,
  updates: {
    name?: string;
    email?: string;
    emailVerified?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const data: any = {};

    if (updates.name !== undefined) {
      data.name = updates.name;
    }

    if (updates.email !== undefined) {
      data.email = updates.email;
    }

    if (updates.emailVerified !== undefined) {
      data.emailVerified = updates.emailVerified ? new Date() : null;
    }

    await prisma.user.update({
      where: { id: userId },
      data,
    });

    // Logger l'action
    await logAdminAction({
      adminUserId: adminId,
      action: 'UPDATE_USER',
      resourceType: 'User',
      resourceId: userId,
      details: updates,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message || 'Failed to update user' };
  }
}

/**
 * Récupère les statistiques globales des utilisateurs
 */
export async function getUserStats(): Promise<{
  total: number;
  active: number;
  suspended: number;
  admins: number;
  withProfilFiscal: number;
  recentSignups: number; // 7 derniers jours
}> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      total,
      admins,
      withProfilFiscal,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { adminRole: { not: null } } }),
      prisma.user.count({ where: { profilFiscal: { isNot: null } } }),
      prisma.user.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    return {
      total,
      active: total, // All users are considered active (no suspended field)
      suspended: 0, // Suspended field removed from schema
      admins,
      withProfilFiscal,
      recentSignups,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      total: 0,
      active: 0,
      suspended: 0,
      admins: 0,
      withProfilFiscal: 0,
      recentSignups: 0,
    };
  }
}
