/**
 * API Route pour les statistiques de groupe
 * GET /api/social/groups/[id]/stats - Statistiques agrégées du groupe
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGroupStats, calculateGroupPercentile } from '@/modules/social/groups/service';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/social/groups/[id]/stats
 * Récupère les statistiques agrégées du groupe (médiane, moyenne, percentiles)
 * Query params: ?metric=soldeNet|totalPaye|totalRecu|ratio (pour le percentile utilisateur)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') as 'soldeNet' | 'totalPaye' | 'totalRecu' | 'ratio' | null;

    // Vérifier que l'utilisateur est membre
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Récupérer les stats du groupe
    const stats = await getGroupStats(id);

    // Si une métrique spécifique est demandée, calculer le percentile de l'utilisateur
    let userPercentile = null;
    if (metric) {
      const validMetrics = ['soldeNet', 'totalPaye', 'totalRecu', 'ratio'];
      if (!validMetrics.includes(metric)) {
        return NextResponse.json(
          { error: 'Invalid metric. Must be one of: soldeNet, totalPaye, totalRecu, ratio' },
          { status: 400 }
        );
      }

      try {
        userPercentile = await calculateGroupPercentile(
          id,
          session.user.id,
          metric
        );
      } catch (error: any) {
        // Si l'utilisateur n'a pas de données, continuer sans le percentile
        if (error.message !== 'User has no fiscal data') {
          throw error;
        }
      }
    }

    return NextResponse.json({
      stats,
      userPercentile,
    });
  } catch (error: any) {
    console.error('Error fetching group stats:', error);

    if (error.message === 'Group not found') {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    if (error.message === 'No members in group') {
      return NextResponse.json(
        { error: 'No members in group' },
        { status: 400 }
      );
    }

    if (error.message === 'No fiscal data available for group members') {
      return NextResponse.json(
        { error: 'No fiscal data available for group members' },
        { status: 400 }
      );
    }

    if (error.message === 'Insufficient data for percentile calculation') {
      return NextResponse.json(
        { error: 'Insufficient data for percentile calculation' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch group stats' },
      { status: 500 }
    );
  }
}
