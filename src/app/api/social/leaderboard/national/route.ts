/**
 * API Route pour le classement national (percentile uniquement)
 * GET /api/social/leaderboard/national - Percentile national de l'utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { calculateNationalPercentile } from '@/modules/social/leaderboard/service';
import { LeaderboardMetric } from '@/modules/social/leaderboard/types';

/**
 * GET /api/social/leaderboard/national?metric=soldeNet
 * Récupère le percentile national de l'utilisateur
 * Ne retourne QUE le percentile, jamais de données individuelles d'autres utilisateurs
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'soldeNet';

    // Valider la métrique
    const validMetrics = Object.values(LeaderboardMetric);
    if (!validMetrics.includes(metric as LeaderboardMetric)) {
      return NextResponse.json(
        { error: `Invalid metric. Must be one of: ${validMetrics.join(', ')}` },
        { status: 400 }
      );
    }

    const percentile = await calculateNationalPercentile(
      session.user.id,
      metric as LeaderboardMetric
    );

    if (!percentile) {
      return NextResponse.json(
        {
          error: 'Insufficient data',
          message: 'National percentile requires at least 100 opt-in users with fiscal data',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ percentile });
  } catch (error: any) {
    console.error('Error calculating national percentile:', error);

    if (error.message === 'User has not opted in to national leaderboard') {
      return NextResponse.json(
        {
          error: 'Not opted in',
          message: 'You must opt in to the national leaderboard to see your percentile',
        },
        { status: 403 }
      );
    }

    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to calculate percentile' },
      { status: 500 }
    );
  }
}
