/**
 * API Route pour suspendre/réactiver un utilisateur (Admin)
 * POST /api/admin/users/[id]/suspend - Suspendre utilisateur
 * DELETE /api/admin/users/[id]/suspend - Réactiver utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, canManageUser } from '@/modules/admin/auth';
import { suspendUser, unsuspendUser } from '@/modules/admin/users';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request, 'suspend_users');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  // Vérifier si l'admin peut gérer cet utilisateur
  const canManage = await canManageUser(auth.userId!, params.id);
  if (!canManage) {
    return NextResponse.json(
      { error: 'Cannot suspend this user' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { error: 'Suspension reason is required' },
        { status: 400 }
      );
    }

    const result = await suspendUser(params.id, auth.userId!, reason);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: 'User suspended successfully',
    });
  } catch (error: any) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      { error: 'Failed to suspend user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request, 'suspend_users');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  // Vérifier si l'admin peut gérer cet utilisateur
  const canManage = await canManageUser(auth.userId!, params.id);
  if (!canManage) {
    return NextResponse.json(
      { error: 'Cannot unsuspend this user' },
      { status: 403 }
    );
  }

  try {
    const result = await unsuspendUser(params.id, auth.userId!);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: 'User reactivated successfully',
    });
  } catch (error: any) {
    console.error('Error unsuspending user:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate user' },
      { status: 500 }
    );
  }
}
