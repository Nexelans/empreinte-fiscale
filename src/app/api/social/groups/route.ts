/**
 * API Routes pour la gestion des groupes
 * GET /api/social/groups - Liste des groupes
 * POST /api/social/groups - Créer un groupe
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createGroup, getUserGroups } from '@/modules/social/groups/service';
import { GroupType } from '@/modules/social/groups/types';

/**
 * GET /api/social/groups
 * Récupère la liste des groupes de l'utilisateur
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

    const groups = await getUserGroups(session.user.id);

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/groups
 * Crée un nouveau groupe
 * Body: { name: string, type: GroupType, anonymous?: boolean }
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
    const { name, type, anonymous } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name and type' },
        { status: 400 }
      );
    }

    // Valider le type de groupe
    if (!Object.values(GroupType).includes(type as GroupType)) {
      return NextResponse.json(
        { error: 'Invalid group type' },
        { status: 400 }
      );
    }

    const group = await createGroup(
      session.user.id,
      name,
      type as GroupType,
      anonymous || false
    );

    return NextResponse.json({ group }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating group:', error);

    if (error.message === 'Owner not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
