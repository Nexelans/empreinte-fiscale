/**
 * API Route pour récupérer les données fiscales partagées d'un ami
 * GET /api/social/friends/[friendId]/data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSharedData } from '@/modules/social/friends/service';
import { getCachedSharedScore, cacheSharedScore } from '@/lib/cache';

/**
 * GET /api/social/friends/[friendId]/data
 * Récupère les données fiscales partagées d'un ami
 * Respecte les permissions de partage configurées par l'ami
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { friendId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { friendId } = params;

    if (!friendId) {
      return NextResponse.json(
        { error: 'Missing friendId' },
        { status: 400 }
      );
    }

    // Check cache first (Task 30.3)
    const cachedData = await getCachedSharedScore(friendId, session.user.id);
    if (cachedData) {
      return NextResponse.json({
        data: cachedData,
        cached: true,
      });
    }

    // Cache miss - fetch from database
    const sharedData = await getSharedData(session.user.id, friendId);

    if (!sharedData) {
      return NextResponse.json(
        { error: 'No data available. Either not friends or friend has no fiscal data.' },
        { status: 404 }
      );
    }

    // Write to cache with 5-minute TTL (Task 30.3)
    await cacheSharedScore(friendId, session.user.id, sharedData);

    return NextResponse.json({
      data: sharedData,
    });
  } catch (error) {
    console.error('Error fetching shared data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared data' },
      { status: 500 }
    );
  }
}
