/**
 * API Routes pour la gestion d'un utilisateur spécifique (Admin)
 * GET /api/admin/users/[id] - Détails utilisateur
 * PUT /api/admin/users/[id] - Modifier utilisateur
 * DELETE /api/admin/users/[id] - Supprimer utilisateur (RGPD)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, canManageUser } from '@/modules/admin/auth';
import {
  getUserDetails,
  updateUser,
  deleteUserCompletely,
} from '@/modules/admin/users';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request, 'manage_users');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const userDetails = await getUserDetails(params.id);

    if (!userDetails) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: userDetails });
  } catch (error: any) {
    console.error('Error getting user details:', error);
    return NextResponse.json(
      { error: 'Failed to get user details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request, 'manage_users');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  // Vérifier si l'admin peut gérer cet utilisateur
  const canManage = await canManageUser(auth.userId!, params.id);
  if (!canManage) {
    return NextResponse.json(
      { error: 'Cannot manage this user' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const result = await updateUser(params.id, auth.userId!, {
      name: body.name,
      email: body.email,
      emailVerified: body.emailVerified,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request, 'delete_users');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  // Vérifier si l'admin peut gérer cet utilisateur
  const canManage = await canManageUser(auth.userId!, params.id);
  if (!canManage) {
    return NextResponse.json(
      { error: 'Cannot delete this user' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const sendNotification = searchParams.get('notify') !== 'false';

    const result = await deleteUserCompletely(
      params.id,
      auth.userId!,
      sendNotification
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: 'User deleted successfully (RGPD compliance)',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
