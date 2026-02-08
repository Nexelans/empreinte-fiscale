/**
 * API Routes pour un groupe spécifique
 * GET /api/social/groups/[id] - Détails du groupe
 * PUT /api/social/groups/[id] - Mettre à jour le groupe
 * DELETE /api/social/groups/[id] - Supprimer le groupe
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteGroup, archiveGroup } from '@/modules/social/groups/service';

/**
 * GET /api/social/groups/[id]
 * Récupère les détails d'un groupe
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

    // Vérifier que l'utilisateur est membre du groupe
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }

    // Récupérer les détails du groupe
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          select: { id: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        type: group.type,
        ownerId: group.ownerId,
        ownerName: group.owner.name || group.owner.email,
        anonymous: group.anonymous,
        memberCount: group.members.length,
        createdAt: group.createdAt,
        archivedAt: group.archivedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/social/groups/[id]
 * Met à jour un groupe (nom, type, anonymous)
 * Body: { name?: string, type?: string, anonymous?: boolean, archive?: boolean }
 */
export async function PUT(
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
    const { name, type, anonymous, archive } = body;

    // Vérifier que l'utilisateur est propriétaire du groupe
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    if (group.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the owner can modify the group' },
        { status: 403 }
      );
    }

    // Si archive = true, archiver le groupe
    if (archive === true) {
      await archiveGroup(id, session.user.id);
      return NextResponse.json({ success: true, archived: true });
    }

    // Mettre à jour le groupe
    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(anonymous !== undefined && { anonymous }),
      },
    });

    return NextResponse.json({
      group: {
        id: updatedGroup.id,
        name: updatedGroup.name,
        type: updatedGroup.type,
        anonymous: updatedGroup.anonymous,
      },
    });
  } catch (error: any) {
    console.error('Error updating group:', error);

    if (error.message === 'Group not found') {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    if (error.message === 'Only the owner can archive the group') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/social/groups/[id]
 * Supprime définitivement un groupe
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

    await deleteGroup(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting group:', error);

    if (error.message === 'Group not found') {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    if (error.message === 'Only the owner can delete the group') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
