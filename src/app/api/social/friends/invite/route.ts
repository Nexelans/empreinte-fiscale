/**
 * API Route pour créer une invitation d'ami
 * POST /api/social/friends/invite - Génère un lien d'invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createInvitation } from '@/modules/social/friends/service';
import { checkInvitationRateLimit } from '@/lib/rateLimit';

/**
 * POST /api/social/friends/invite
 * Crée une invitation d'ami et retourne le lien
 * Body: { email: string }
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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email' },
        { status: 400 }
      );
    }

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Rate limiting: Max 10 invitations par jour par utilisateur
    const rateLimitResult = checkInvitationRateLimit(session.user.id);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You can send a maximum of 10 invitations per day. Try again after ${rateLimitResult.resetAt.toLocaleString()}`,
          resetAt: rateLimitResult.resetAt,
        },
        { status: 429 }
      );
    }

    const { invitation, invitationLink } = await createInvitation(
      session.user.id,
      email
    );

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        inviteeEmail: invitation.inviteeEmail,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      },
      invitationLink,
    });
  } catch (error: any) {
    console.error('Error creating invitation:', error);

    // Retourner des messages d'erreur spécifiques
    if (error.message === 'Cannot invite yourself') {
      return NextResponse.json(
        { error: 'Cannot invite yourself' },
        { status: 400 }
      );
    }

    if (error.message === 'Already friends or invitation pending') {
      return NextResponse.json(
        { error: 'Already friends or invitation pending' },
        { status: 409 }
      );
    }

    if (error.message === 'Invitation already sent') {
      return NextResponse.json(
        { error: 'An invitation to this email is already pending' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}
