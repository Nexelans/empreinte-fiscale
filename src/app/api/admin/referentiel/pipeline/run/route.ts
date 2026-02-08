/**
 * API Route pour déclencher manuellement le pipeline
 * POST /api/admin/referentiel/pipeline/run
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runPipeline } from '@/modules/referentiel/automation/pipeline';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les permissions admin (SUPER_ADMIN uniquement pour déclencher)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { adminRole: true },
    });

    if (user?.adminRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log(`[API] Manual pipeline trigger by admin: ${session.user.email}`);

    // Lancer le pipeline
    const result = await runPipeline();

    // Logger l'action
    await prisma.adminLog.create({
      data: {
        adminUserId: session.user.id,
        action: 'TRIGGER_PIPELINE',
        resourceType: 'ReferentielPipeline',
        resourceId: 'manual-trigger',
        details: result as any,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Pipeline executed',
      result,
    });
  } catch (error: any) {
    console.error('Error running pipeline:', error);
    return NextResponse.json(
      { error: 'Failed to run pipeline' },
      { status: 500 }
    );
  }
}
