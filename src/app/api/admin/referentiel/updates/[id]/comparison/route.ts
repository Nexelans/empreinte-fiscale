/**
 * API Route pour obtenir les données de comparaison d'une update
 * GET /api/admin/referentiel/updates/[id]/comparison
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getComparisonData } from '@/modules/referentiel/automation/review';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const comparison = await getComparisonData(params.id);

    if (!comparison.update) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    return NextResponse.json(comparison);
  } catch (error: any) {
    console.error('Error getting comparison:', error);
    return NextResponse.json(
      { error: 'Failed to get comparison data' },
      { status: 500 }
    );
  }
}
