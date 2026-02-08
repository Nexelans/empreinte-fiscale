/**
 * API Route pour mettre à jour le niveau de partage avec un ami
 * PUT /api/social/friends/[friendId]/sharing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { setSharingLevel } from '@/modules/social/friends/service';
import { SharingLevel } from '@/modules/social/friends/types';

/**
 * PUT /api/social/friends/[friendId]/sharing
 * Met à jour le niveau de partage avec un ami
 * Body: { sharingLevel: 'SCORE_ONLY' | 'SUMMARY' | 'DETAILED' }
 */
export async function PUT(
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

    const body = await request.json();
    const { sharingLevel } = body;

    if (!sharingLevel) {
      return NextResponse.json(
        { error: 'Missing sharingLevel' },
        { status: 400 }
      );
    }

    // Valider que le niveau de partage est valide
    if (!Object.values(SharingLevel).includes(sharingLevel as SharingLevel)) {
      return NextResponse.json(
        { error: 'Invalid sharingLevel. Must be SCORE_ONLY, SUMMARY, or DETAILED' },
        { status: 400 }
      );
    }

    await setSharingLevel(session.user.id, friendId, sharingLevel as SharingLevel);

    // TODO: Invalider le cache pour cette relation (Task 30.4)

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating sharing level:', error);

    if (error.message === 'Friendship not found') {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      );
    }

    if (error.message === 'Invalid sharing level') {
      return NextResponse.json(
        { error: 'Invalid sharing level' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update sharing level' },
      { status: 500 }
    );
  }
}
