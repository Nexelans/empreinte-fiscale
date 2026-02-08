import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildScenes } from "@/modules/animations/sceneBuilder";
import type { ProfilFiscalComplete } from "@/modules/profil/types";

/**
 * POST /api/animations/generate
 * Generate animated fiscal day data for the authenticated user
 *
 * Body:
 * - date?: string (YYYY-MM-DD, optional, defaults to today)
 * - useJournalData?: boolean (default: true)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { date = new Date().toISOString().split("T")[0], useJournalData = true } = body;

    console.log(`[Animations] Generating for user ${userId}, date ${date}`);

    // Fetch user's profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profilFiscal: true,
      },
    });

    if (!user || !user.profilFiscal) {
      return NextResponse.json(
        { error: "Profile not found. Please complete your fiscal profile first." },
        { status: 404 }
      );
    }

    // Build profil complete from Prisma record
    const profilRecord = user.profilFiscal;
    const profil: Partial<ProfilFiscalComplete> = {
      situation: {
        statut: profilRecord.statut as any,
        nombreParts: profilRecord.nombreParts || null,
        commune: profilRecord.commune || null,
        age: profilRecord.age || null,
      },
      revenus: {
        salaireBrut: profilRecord.salaireBrut || null,
        salaireNet: profilRecord.salaireNet || null,
        typeContrat: profilRecord.typeContrat as any,
        revenusFonciers: profilRecord.revenusFonciers || null,
        revenusCapitaux: profilRecord.revenusCapitaux || null,
        autresRevenus: profilRecord.autresRevenus || null,
      },
      patrimoine: {
        proprietaire: profilRecord.proprietaire || null,
        valeurLocative: profilRecord.valeurLocative || null,
        taxeFonciere: profilRecord.taxeFonciere || null,
        vehicules: (profilRecord.vehicules as any) || [],
        patrimoineIFI: profilRecord.patrimoineIFI || null,
      },
      consommation: {
        mode: profilRecord.modeConsommation as any,
        budgetMensuel: (profilRecord.budgetMensuel as any) || undefined,
        detailCategories: (profilRecord.detailCategories as any) || undefined,
        alcoolTabac: (profilRecord.alcoolTabac as any) || undefined,
      },
      familleServices: {
        nombreEnfants: profilRecord.nombreEnfants || 0,
        enfants: (profilRecord.enfantsDetails as any) || [],
        frequenceServices: (profilRecord.frequenceServices as any) || {
          transportsCommun: "jamais",
          hopitalMedecin: "annuelle",
          bibliotheque: "jamais",
          equipementsSportifs: "jamais",
        },
        aides: (profilRecord.aides as any) || {
          caf: false,
          apl: false,
          rsa: false,
          bourses: false,
          chomage: false,
          cmuc: false,
        },
      },
      statusData: (profilRecord.statusData as any) || {},
    };

    // Fetch journal entries for the date if requested
    let journalEntries: any[] = [];
    if (useJournalData) {
      journalEntries = await prisma.journalEntry.findMany({
        where: {
          userId,
          date: new Date(date),
        },
      });

      console.log(`[Animations] Found ${journalEntries.length} journal entries for ${date}`);
    }

    // Build scenes
    const fiscalDayData = buildScenes({
      profil,
      journalEntries,
      date,
    });

    // Set userId
    fiscalDayData.userId = userId;

    return NextResponse.json({
      success: true,
      data: fiscalDayData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Animations] Error generating animation:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/animations/generate
 * Get generation status or documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/animations/generate",
    method: "POST",
    description: "Generate animated fiscal day data for the authenticated user",
    body: {
      date: "string (YYYY-MM-DD, optional, defaults to today)",
      useJournalData: "boolean (optional, default: true)",
    },
    response: {
      success: "boolean",
      data: "FiscalDayData object",
      generatedAt: "ISO 8601 timestamp",
    },
  });
}
