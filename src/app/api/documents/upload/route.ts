// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseDocument } from "@/modules/documents/service";
import { DocumentType } from "@/modules/documents/types";

/**
 * POST /api/documents/upload
 * Upload et parse un document fiscal PDF
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as DocumentType;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: "Type de document manquant" }, { status: 400 });
    }

    // Validation du type de fichier
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Format non supporté. Seuls les PDF sont acceptés." },
        { status: 400 }
      );
    }

    // Validation de la taille (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 10MB)" },
        { status: 400 }
      );
    }

    // Convertir le fichier en Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parser le document
    console.log(`[Upload] Parsing document type: ${documentType}, size: ${file.size} bytes`);
    const parseResult = await parseDocument(buffer, documentType);

    console.log(
      `[Upload] Parse result: ${parseResult.status}, confidence: ${parseResult.confidence}%`
    );

    // Retourner le résultat du parsing pour validation utilisateur
    return NextResponse.json({
      success: true,
      parseResult,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du traitement du document",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
