/**
 * API Route pour le classement entre amis
 * GET /api/social/leaderboard/friends - Classement des amis par métrique
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFriendLeaderboard } from '@/modules/social/leaderboard/service';
import { LeaderboardMetric } from '@/modules/social/leaderboard/types';

/**
 * GET /api/social/leaderboard/friends?metric=soldeNet
 * Récupère le classement entre amis pour une métrique donnée
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

    const leaderboard = await getFriendLeaderboard(
      session.user.id,
      metric as LeaderboardMetric
    );

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching friend leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
