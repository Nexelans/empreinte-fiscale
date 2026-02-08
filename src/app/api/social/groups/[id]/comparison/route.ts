/**
 * API Route pour la comparaison de groupe
 * GET /api/social/groups/[id]/comparison - Données de comparaison du groupe
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateGroupComparison } from '@/modules/social/groups/service';

/**
 * GET /api/social/groups/[id]/comparison
 * Récupère les données de comparaison pour tous les membres du groupe
 * Respecte les niveaux de partage de chaque membre
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

    const comparison = await generateGroupComparison(id, session.user.id);

    return NextResponse.json({ comparison });
  } catch (error: any) {
    console.error('Error generating group comparison:', error);

    if (error.message === 'You are not a member of this group') {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    if (error.message === 'Group not found') {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate group comparison' },
      { status: 500 }
    );
  }
}
