/**
 * Authentification et autorisation admin
 * Phase 4 - Admin Interface
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminRole, AdminPermission, ROLE_PERMISSIONS } from './types';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Vérifie si un utilisateur a un rôle admin spécifique
 */
export async function hasRole(userId: string, role: AdminRole): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { adminRole: true },
    });

    return user?.adminRole === role;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 *
 * PERMISSION MODEL (RBAC - Role-Based Access Control):
 * Le système utilise une matrice de permissions définie dans ROLE_PERMISSIONS.
 * Chaque rôle admin a un ensemble de permissions prédéfinies.
 *
 * Hiérarchie des rôles (du plus puissant au moins puissant):
 * 1. SUPER_ADMIN (niveau 4) - Toutes les permissions
 * 2. SUPPORT_ADMIN (niveau 3) - Gestion utilisateurs
 * 3. DATA_ADMIN (niveau 2) - Gestion référentiel uniquement
 * 4. ANALYTICS_VIEWER (niveau 1) - Lecture analytiques uniquement
 *
 * @param userId - ID de l'utilisateur dont on vérifie les permissions
 * @param permission - Permission à vérifier (ex: 'manage_users', 'manage_referentiel')
 * @returns true si l'utilisateur a cette permission, false sinon
 */
export async function hasPermission(
  userId: string,
  permission: AdminPermission
): Promise<boolean> {
  try {
    // Étape 1: Récupérer le rôle admin de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { adminRole: true },
    });

    // Si l'utilisateur n'a pas de rôle admin, refuser immédiatement
    if (!user?.adminRole) {
      return false;
    }

    // Étape 2: Récupérer les permissions associées au rôle
    // ROLE_PERMISSIONS est défini dans types.ts et contient la matrice complète
    const role = user.adminRole as AdminRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

    // Étape 3: Vérifier si la permission demandée est dans la liste
    // IMPORTANT: Ce check est le point central de sécurité pour toutes les actions admin
    return permissions.includes(permission);
  } catch (error) {
    // En cas d'erreur DB, refuser par défaut (fail-safe)
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Vérifie si un utilisateur est admin (n'importe quel rôle)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { adminRole: true },
    });

    return user?.adminRole !== null && user?.adminRole !== undefined;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Middleware pour vérifier les permissions admin dans les API routes
 *
 * UTILISATION TYPIQUE:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAdmin(request, 'view_analytics');
 *   if (!auth.authorized) {
 *     return unauthorizedResponse(auth.error);
 *   }
 *   // L'utilisateur est autorisé, continuer...
 * }
 * ```
 *
 * SÉCURITÉ:
 * - Vérifie d'abord la session (authentification)
 * - Vérifie ensuite le rôle admin (autorisation de base)
 * - Vérifie enfin la permission spécifique si fournie (autorisation granulaire)
 * - Retourne 401 si pas authentifié, 403 si pas autorisé
 *
 * @param request - Next.js request object
 * @param permission - Permission spécifique requise (optionnel)
 * @returns Objet avec authorized: boolean et infos utilisateur si autorisé
 */
export async function requireAdmin(
  request: NextRequest,
  permission?: AdminPermission
): Promise<{
  authorized: boolean;
  userId?: string;
  role?: AdminRole;
  error?: string;
}> {
  try {
    // Étape 1: Vérifier l'authentification (session valide)
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      // Pas de session = utilisateur non connecté
      // HTTP 401 Unauthorized
      return {
        authorized: false,
        error: 'Unauthorized - No session',
      };
    }

    // Étape 2: Vérifier que l'utilisateur a un rôle admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { adminRole: true },
    });

    if (!user?.adminRole) {
      // Utilisateur connecté mais pas admin
      // HTTP 403 Forbidden
      return {
        authorized: false,
        error: 'Forbidden - Not an admin',
      };
    }

    // Étape 3: Si une permission spécifique est requise, la vérifier
    // Cela permet un contrôle granulaire (ex: manage_users vs view_analytics)
    if (permission) {
      const role = user.adminRole as AdminRole;
      const permissions = ROLE_PERMISSIONS[role] || [];

      if (!permissions.includes(permission)) {
        // L'admin n'a pas cette permission spécifique
        // Ex: DATA_ADMIN essaie d'accéder à manage_users
        // HTTP 403 Forbidden
        return {
          authorized: false,
          error: `Forbidden - Missing permission: ${permission}`,
        };
      }
    }

    // Toutes les vérifications passées: l'admin est autorisé
    return {
      authorized: true,
      userId: session.user.id,
      role: user.adminRole as AdminRole,
    };
  } catch (error: any) {
    // En cas d'erreur (DB down, etc.), refuser l'accès par sécurité
    console.error('Error in requireAdmin middleware:', error);
    return {
      authorized: false,
      error: 'Internal server error',
    };
  }
}

/**
 * Helper pour créer une réponse d'erreur standardisée
 */
export function unauthorizedResponse(error?: string): NextResponse {
  return NextResponse.json(
    { error: error || 'Unauthorized' },
    { status: error?.includes('Forbidden') ? 403 : 401 }
  );
}

/**
 * Récupère les informations admin d'un utilisateur
 */
export async function getAdminInfo(userId: string): Promise<{
  isAdmin: boolean;
  role?: AdminRole;
  permissions: AdminPermission[];
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { adminRole: true },
    });

    if (!user?.adminRole) {
      return {
        isAdmin: false,
        permissions: [],
      };
    }

    const role = user.adminRole as AdminRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

    return {
      isAdmin: true,
      role,
      permissions,
    };
  } catch (error) {
    console.error('Error getting admin info:', error);
    return {
      isAdmin: false,
      permissions: [],
    };
  }
}

/**
 * Vérifie si un admin peut gérer un autre utilisateur
 *
 * RÈGLES HIÉRARCHIQUES:
 * 1. Un admin doit avoir la permission 'manage_users' (vérifié séparément)
 * 2. SUPER_ADMIN peut gérer n'importe qui (y compris autres SUPER_ADMIN)
 * 3. Les autres admins ne peuvent PAS gérer d'autres admins
 * 4. Un admin ne peut pas se gérer lui-même via cette fonction
 *
 * SÉCURITÉ:
 * Empêche qu'un SUPPORT_ADMIN ou DATA_ADMIN puisse suspendre/supprimer
 * un autre admin, ce qui pourrait être utilisé pour une escalade de privilèges.
 *
 * EXEMPLE D'UTILISATION:
 * ```typescript
 * const canSuspend = await hasPermission(adminId, 'manage_users')
 *                    && await canManageUser(adminId, targetUserId);
 * if (!canSuspend) {
 *   return NextResponse.json({ error: 'Cannot manage this user' }, { status: 403 });
 * }
 * ```
 *
 * @param adminId - ID de l'admin qui veut effectuer l'action
 * @param targetUserId - ID de l'utilisateur cible
 * @returns true si l'admin peut gérer cet utilisateur, false sinon
 */
export async function canManageUser(
  adminId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    // Récupérer les rôles des deux utilisateurs en parallèle (optimisation)
    const [admin, target] = await Promise.all([
      prisma.user.findUnique({
        where: { id: adminId },
        select: { adminRole: true },
      }),
      prisma.user.findUnique({
        where: { id: targetUserId },
        select: { adminRole: true },
      }),
    ]);

    // Si l'appelant n'est pas admin, refuser immédiatement
    if (!admin?.adminRole) {
      return false;
    }

    // Règle spéciale: SUPER_ADMIN peut tout faire
    // Cela inclut gérer d'autres SUPER_ADMIN (nécessaire pour rotation des rôles)
    if (admin.adminRole === AdminRole.SUPER_ADMIN) {
      return true;
    }

    // Pour tous les autres rôles admin (SUPPORT_ADMIN, DATA_ADMIN, ANALYTICS_VIEWER):
    // Ils ne peuvent PAS gérer d'autres admins, quel que soit le niveau
    // Cela empêche:
    // - Un DATA_ADMIN de suspendre un SUPPORT_ADMIN
    // - Un SUPPORT_ADMIN de supprimer un autre SUPPORT_ADMIN
    // - Toute tentative d'escalade de privilèges via gestion d'admins
    if (target?.adminRole) {
      return false;
    }

    // Si on arrive ici: admin non-SUPER essaie de gérer un utilisateur normal
    // C'est permis (sous réserve qu'il ait manage_users, vérifié ailleurs)
    return true;
  } catch (error) {
    // En cas d'erreur, refuser par défaut (fail-safe)
    console.error('Error checking manage permission:', error);
    return false;
  }
}

/**
 * Assigne un rôle admin à un utilisateur
 * (Seuls les SUPER_ADMIN peuvent assigner des rôles)
 */
export async function assignAdminRole(
  adminId: string,
  targetUserId: string,
  role: AdminRole
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier que l'admin a la permission
    const hasPermissionResult = await hasPermission(adminId, 'manage_admins');

    if (!hasPermissionResult) {
      return {
        success: false,
        error: 'Insufficient permissions to assign admin roles',
      };
    }

    // Assigner le rôle
    await prisma.user.update({
      where: { id: targetUserId },
      data: { adminRole: role },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error assigning admin role:', error);
    return {
      success: false,
      error: error.message || 'Failed to assign role',
    };
  }
}

/**
 * Révoque le rôle admin d'un utilisateur
 */
export async function revokeAdminRole(
  adminId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier que l'admin a la permission
    const hasPermissionResult = await hasPermission(adminId, 'manage_admins');

    if (!hasPermissionResult) {
      return {
        success: false,
        error: 'Insufficient permissions to revoke admin roles',
      };
    }

    // Empêcher de se révoquer soi-même
    if (adminId === targetUserId) {
      return {
        success: false,
        error: 'Cannot revoke your own admin role',
      };
    }

    // Révoquer le rôle
    await prisma.user.update({
      where: { id: targetUserId },
      data: { adminRole: null },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error revoking admin role:', error);
    return {
      success: false,
      error: error.message || 'Failed to revoke role',
    };
  }
}
