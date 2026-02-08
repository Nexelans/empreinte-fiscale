// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateExtraction } from "@/modules/documents/service";
import { DocumentType, ExtractedData } from "@/modules/documents/types";
import { emitGameEvent } from "@/modules/gamification/events";

/**
 * POST /api/documents/validate
 * Valide les données extraites et les injecte dans le ProfilFiscal
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profilFiscal: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { documentType, extractedData, userCorrections } = body as {
      documentType: DocumentType;
      extractedData: ExtractedData;
      userCorrections?: Partial<ExtractedData>;
    };

    if (!documentType || !extractedData) {
      return NextResponse.json(
        { error: "documentType et extractedData sont requis" },
        { status: 400 }
      );
    }

    // Valider et merger les corrections utilisateur
    const validatedData = validateExtraction(extractedData, userCorrections);

    // Préparer les mises à jour du ProfilFiscal selon le type de document
    const profilUpdates: any = {};
    const statusUpdates: any = user.profilFiscal?.statusData || {};

    switch (documentType) {
      case "bulletin_paie":
        if (validatedData.salaireBrut !== undefined) {
          profilUpdates.salaireBrut = validatedData.salaireBrut;
          statusUpdates.salaireBrut = "VERIFIE";
        }
        if (validatedData.salaireNet !== undefined) {
          profilUpdates.salaireNet = validatedData.salaireNet;
          statusUpdates.salaireNet = "VERIFIE";
        }
        break;

      case "avis_imposition":
        if (validatedData.revenuNetImposable !== undefined) {
          profilUpdates.salaireNet = validatedData.revenuNetImposable;
          statusUpdates.salaireNet = "VERIFIE";
        }
        if (validatedData.nombreParts !== undefined) {
          profilUpdates.nombreParts = validatedData.nombreParts;
          statusUpdates.nombreParts = "VERIFIE";
        }
        if (validatedData.revenusFonciers !== undefined) {
          profilUpdates.revenusFonciers = validatedData.revenusFonciers;
          statusUpdates.revenusFonciers = "VERIFIE";
        }
        if (validatedData.revenusCapitaux !== undefined) {
          profilUpdates.revenusCapitaux = validatedData.revenusCapitaux;
          statusUpdates.revenusCapitaux = "VERIFIE";
        }
        break;

      case "taxe_fonciere":
        if (validatedData.taxeFonciere !== undefined) {
          profilUpdates.taxeFonciere = validatedData.taxeFonciere;
          statusUpdates.taxeFonciere = "VERIFIE";
        }
        if (validatedData.valeurLocative !== undefined) {
          profilUpdates.valeurLocative = validatedData.valeurLocative;
          statusUpdates.valeurLocative = "VERIFIE";
        }
        if (validatedData.commune !== undefined) {
          profilUpdates.commune = validatedData.commune;
          statusUpdates.commune = "VERIFIE";
        }
        if (validatedData.taxeFonciere && validatedData.taxeFonciere > 0) {
          profilUpdates.proprietaire = true;
        }
        break;

      case "releve_caf":
        // Les données CAF vont dans les aides du ProfilFiscal
        const aides = (user.profilFiscal?.aides as any) || {};
        if (validatedData.allocations !== undefined && validatedData.allocations > 0) {
          aides.caf = true;
        }
        if (validatedData.apl !== undefined && validatedData.apl > 0) {
          aides.apl = true;
        }
        profilUpdates.aides = aides;
        break;
    }

    profilUpdates.statusData = statusUpdates;

    // Mettre à jour ou créer le ProfilFiscal
    const profilFiscal = await prisma.profilFiscal.upsert({
      where: { userId: user.id },
      update: profilUpdates,
      create: {
        userId: user.id,
        ...profilUpdates,
      },
    });

    // Créer un enregistrement DocumentUpload pour traçabilité
    const document = await prisma.documentUpload.create({
      data: {
        userId: user.id,
        type: documentType,
        status: "VALIDATED",
        extractedData: validatedData as any,
      },
    });

    console.log(
      `[Validate] Document ${documentType} validated and injected for user ${user.email}`
    );

    // Émettre l'événement pour la gamification
    await emitGameEvent("DOCUMENT_UPLOADED", user.id, {
      documentType,
      documentId: document.id,
    });

    return NextResponse.json({
      success: true,
      message: "Données validées et intégrées à votre profil",
      updatedFields: Object.keys(profilUpdates),
    });
  } catch (error) {
    console.error("[Validate] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la validation des données",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
