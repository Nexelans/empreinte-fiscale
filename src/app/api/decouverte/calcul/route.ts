import { NextRequest, NextResponse } from "next/server";
import { calculerScoreFiscal } from "@/modules/score";
import { ProfilFiscalComplete } from "@/modules/profil/types";

/**
 * POST /api/decouverte/calcul
 * Calcule le score fiscal pour un profil type (mode découverte)
 * Pas d'authentification requise
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profil } = body;

    if (!profil) {
      return NextResponse.json(
        { error: "Profil manquant" },
        { status: 400 }
      );
    }

    // Calculate score without user ID (discovery mode)
    const score = await calculerScoreFiscal(profil as Partial<ProfilFiscalComplete>, undefined, {
      useJournalData: false,
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error("[Decouverte API] Error calculating score:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
