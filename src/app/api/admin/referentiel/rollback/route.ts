/**
 * API Route pour rollback une mise à jour
 * POST /api/admin/referentiel/rollback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rollbackUpdate } from '@/modules/referentiel/automation/review';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les permissions admin (SUPER_ADMIN uniquement pour rollback)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { adminRole: true },
    });

    if (user?.adminRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { updateId } = body;

    if (!updateId) {
      return NextResponse.json(
        { error: 'updateId is required' },
        { status: 400 }
      );
    }

    const result = await rollbackUpdate(updateId, session.user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Update rolled back successfully',
    });
  } catch (error: any) {
    console.error('Error rolling back update:', error);
    return NextResponse.json(
      { error: 'Failed to rollback update' },
      { status: 500 }
    );
  }
}
