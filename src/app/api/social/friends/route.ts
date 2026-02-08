/**
 * API Routes pour la gestion des amis
 * GET /api/social/friends - Liste des amis
 * POST /api/social/friends - Supprimer un ami
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFriends, removeFriend } from '@/modules/social/friends/service';

/**
 * GET /api/social/friends
 * Récupère la liste des amis de l'utilisateur connecté
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const friends = await getFriends(session.user.id);

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/friends
 * Supprime un ami
 * Body: { friendId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json(
        { error: 'Missing friendId' },
        { status: 400 }
      );
    }

    await removeFriend(session.user.id, friendId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 }
    );
  }
}
