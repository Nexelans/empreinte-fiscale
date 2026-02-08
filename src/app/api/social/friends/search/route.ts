/**
 * API Route pour rechercher des utilisateurs par email
 * POST /api/social/friends/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/social/friends/search
 * Recherche un utilisateur par email pour l'inviter
 * Body: { email: string }
 *
 * Respecte la vie privée :
 * - Ne retourne que l'existence de l'utilisateur et son nom public
 * - Ne révèle pas d'informations sensibles
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

    // Ne pas permettre de se rechercher soi-même
    if (email === session.user.email) {
      return NextResponse.json(
        { error: 'Cannot search for yourself' },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { found: false, message: 'User not found. You can still send an invitation to this email.' },
        { status: 200 }
      );
    }

    // Vérifier si déjà ami ou invitation en attente
    const existingFriendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: user.id },
          { userId: user.id, friendId: session.user.id },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        {
          found: true,
          alreadyFriends: true,
          message: 'You are already friends with this user',
        },
        { status: 200 }
      );
    }

    // Vérifier si invitation en attente
    const existingInvitation = await prisma.friendInvitation.findFirst({
      where: {
        inviterId: session.user.id,
        inviteeEmail: email,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        {
          found: true,
          invitationPending: true,
          message: 'An invitation to this user is already pending',
        },
        { status: 200 }
      );
    }

    // Retourner les informations publiques de l'utilisateur
    return NextResponse.json({
      found: true,
      user: {
        name: user.name || 'User',
        email: user.email,
        image: user.image,
      },
      message: 'User found. You can send an invitation.',
    });
  } catch (error) {
    console.error('Error searching user:', error);
    return NextResponse.json(
      { error: 'Failed to search user' },
      { status: 500 }
    );
  }
}
