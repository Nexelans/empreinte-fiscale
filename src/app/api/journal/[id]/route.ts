import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/modules/journal/service";

export const dynamic = "force-dynamic";

/**
 * PUT /api/journal/[id]
 * Update a journal entry
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const entryId = params.id;
    const updates = await request.json();

    // Verify entry exists and belongs to user
    const existing = await getJournalEntry(user.id, entryId);
    if (!existing) {
      return NextResponse.json(
        { error: "Entrée non trouvée" },
        { status: 404 }
      );
    }

    // Update entry
    const updated = await updateJournalEntry(user.id, entryId, updates);

    console.log(`[PUT /api/journal/${entryId}] Entry updated`);

    return NextResponse.json({
      success: true,
      entry: updated,
    });
  } catch (error) {
    console.error(`[PUT /api/journal/${params.id}] Error:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'entrée" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/journal/[id]
 * Delete a journal entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const entryId = params.id;

    // Verify entry exists and belongs to user
    const existing = await getJournalEntry(user.id, entryId);
    if (!existing) {
      return NextResponse.json(
        { error: "Entrée non trouvée" },
        { status: 404 }
      );
    }

    // Delete entry
    await deleteJournalEntry(user.id, entryId);

    console.log(`[DELETE /api/journal/${entryId}] Entry deleted`);

    return NextResponse.json({
      success: true,
      message: "Entrée supprimée",
    });
  } catch (error) {
    console.error(`[DELETE /api/journal/${params.id}] Error:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'entrée" },
      { status: 500 }
    );
  }
}
