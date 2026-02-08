/**
 * API Routes pour la gestion des membres d'un groupe
 * GET /api/social/groups/[id]/members - Liste des membres
 * POST /api/social/groups/[id]/members - Ajouter un membre
 * DELETE /api/social/groups/[id]/members - Retirer un membre
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getGroupMembers,
  addMember,
  removeMember,
} from '@/modules/social/groups/service';
import { GroupMemberRole } from '@/modules/social/groups/types';

/**
 * GET /api/social/groups/[id]/members
 * Récupère la liste des membres d'un groupe
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

    const members = await getGroupMembers(id);

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/groups/[id]/members
 * Ajoute un membre au groupe
 * Body: { userId: string, role?: GroupMemberRole }
 */
export async function POST(
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
    const body = await request.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Valider le rôle si fourni
    if (role && !Object.values(GroupMemberRole).includes(role as GroupMemberRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const member = await addMember(
      id,
      userId,
      session.user.id,
      role as GroupMemberRole || GroupMemberRole.MEMBER
    );

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding group member:', error);

    if (error.message === 'Group not found') {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    if (error.message === 'Cannot add members to archived group') {
      return NextResponse.json(
        { error: 'Cannot add members to archived group' },
        { status: 400 }
      );
    }

    if (error.message === 'Insufficient permissions to add members') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (error.message === 'User is already a member of this group') {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 409 }
      );
    }

    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/groups/[id]/members
 * Retire un membre du groupe
 * Body: { userId: string }
 */
export async function DELETE(
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
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    await removeMember(id, userId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing group member:', error);

    if (error.message === 'Member not found') {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    if (error.message === 'Insufficient permissions to remove members') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (error.message === 'Cannot remove the owner. Transfer ownership first.') {
      return NextResponse.json(
        { error: 'Cannot remove the owner. Transfer ownership first.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
