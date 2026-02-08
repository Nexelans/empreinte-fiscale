/**
 * API Route pour accepter une invitation d'ami
 * POST /api/social/friends/accept - Accepte une invitation via token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { acceptInvitation, validateInvitation } from '@/modules/social/friends/service';

/**
 * POST /api/social/friends/accept
 * Accepte une invitation d'ami
 * Body: { token: string }
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
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Missing invitation token' },
        { status: 400 }
      );
    }

    // Valider l'invitation avant d'accepter
    const invitation = await validateInvitation(token);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Accepter l'invitation
    const friendship = await acceptInvitation(token, session.user.id);

    // TODO: Envoyer une notification aux deux utilisateurs (Task 28.2)

    return NextResponse.json({
      success: true,
      friendship: {
        id: friendship.id,
        friendId: friendship.friendId,
        friendName: friendship.friendName,
        friendEmail: friendship.friendEmail,
        friendImage: friendship.friendImage,
        sharingLevel: friendship.sharingLevel,
        createdAt: friendship.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error accepting invitation:', error);

    if (error.message === 'Invalid or expired invitation') {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    if (error.message === 'You are not the intended recipient of this invitation') {
      return NextResponse.json(
        { error: 'This invitation was not sent to your email address' },
        { status: 403 }
      );
    }

    if (error.message === 'Acceptor not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
