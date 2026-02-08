// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/documents/[id]
 * Supprime un document uploadé de l'historique
 * RGPD: Droit à l'effacement (Art. 17)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const documentId = params.id;

    // Vérifier que le document existe et appartient à l'utilisateur
    const document = await prisma.documentUpload.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - This document does not belong to you" },
        { status: 403 }
      );
    }

    // Supprimer le document
    await prisma.documentUpload.delete({
      where: { id: documentId },
    });

    console.log(
      `[DELETE /api/documents/${documentId}] Document deleted for user ${user.email}`
    );

    return NextResponse.json({
      success: true,
      message: "Document supprimé avec succès",
    });
  } catch (error) {
    console.error("[DELETE /api/documents/[id]] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la suppression du document",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
