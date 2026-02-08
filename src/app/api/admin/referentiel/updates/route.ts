/**
 * API Routes pour la gestion des mises à jour du Référentiel (Admin)
 * GET /api/admin/referentiel/updates - Liste les updates
 * POST /api/admin/referentiel/updates - Approve/Reject updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  listPendingUpdates,
  approveUpdate,
  rejectUpdate,
  bulkApprove,
  getComparisonData,
} from '@/modules/referentiel/automation/review';

/**
 * GET /api/admin/referentiel/updates
 * Liste les mises à jour en attente de review
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les permissions admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { adminRole: true },
    });

    if (!user?.adminRole || !['DATA_ADMIN', 'SUPER_ADMIN'].includes(user.adminRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categorie = searchParams.get('categorie') || undefined;
    const millesime = searchParams.get('millesime') || undefined;

    // Lister les updates
    const result = await listPendingUpdates({
      limit,
      offset,
      categorie,
      millesime,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error listing updates:', error);
    return NextResponse.json(
      { error: 'Failed to list updates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/referentiel/updates
 * Approve ou reject une ou plusieurs updates
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les permissions admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { adminRole: true },
    });

    if (!user?.adminRole || !['DATA_ADMIN', 'SUPER_ADMIN'].includes(user.adminRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, updateId, updateIds, reason } = body;

    // Valider l'action
    if (!['approve', 'reject', 'bulk_approve'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Approve simple
    if (action === 'approve') {
      if (!updateId) {
        return NextResponse.json(
          { error: 'updateId is required' },
          { status: 400 }
        );
      }

      const result = await approveUpdate(updateId, session.user.id);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ message: 'Update approved successfully' });
    }

    // Reject
    if (action === 'reject') {
      if (!updateId) {
        return NextResponse.json(
          { error: 'updateId is required' },
          { status: 400 }
        );
      }

      if (!reason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      const result = await rejectUpdate(updateId, session.user.id, reason);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ message: 'Update rejected successfully' });
    }

    // Bulk approve
    if (action === 'bulk_approve') {
      if (!updateIds || !Array.isArray(updateIds)) {
        return NextResponse.json(
          { error: 'updateIds array is required' },
          { status: 400 }
        );
      }

      const result = await bulkApprove(updateIds, session.user.id);

      return NextResponse.json({
        message: `Approved ${result.approved} updates, ${result.failed} failed`,
        approved: result.approved,
        failed: result.failed,
        errors: result.errors,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing update action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
