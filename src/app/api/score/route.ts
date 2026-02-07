// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculerScoreFiscal } from "@/modules/score";
import { ProfilFiscalComplete } from "@/modules/profil/types";

/**
 * GET /api/score
 * Calcule et retourne le score fiscal de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[Score API] Starting score calculation...");
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log("[Score API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Score API] Session found for:", session.user.email);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profilFiscal: true,
      },
    });

    if (!user) {
      console.log("[Score API] User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.profilFiscal) {
      console.log("[Score API] Profil not found");
      return NextResponse.json(
        { error: "Profil not found. Please complete your profile first." },
        { status: 404 }
      );
    }

    console.log("[Score API] Profil found, transforming data...");

    // Transform Prisma profil to ProfilFiscalComplete format
    const profil: Partial<ProfilFiscalComplete> = {
      situation: {
        statut: user.profilFiscal.statut as any,
        nombreParts: user.profilFiscal.nombreParts,
        commune: user.profilFiscal.commune,
        age: user.profilFiscal.age,
      },
      revenus: {
        salaireBrut: user.profilFiscal.salaireBrut,
        salaireNet: user.profilFiscal.salaireNet,
        typeContrat: user.profilFiscal.typeContrat as any,
        revenusFonciers: user.profilFiscal.revenusFonciers,
        revenusCapitaux: user.profilFiscal.revenusCapitaux,
        autresRevenus: user.profilFiscal.autresRevenus,
      },
      patrimoine: {
        proprietaire: user.profilFiscal.proprietaire,
        valeurLocative: user.profilFiscal.valeurLocative,
        taxeFonciere: user.profilFiscal.taxeFonciere,
        vehicules: user.profilFiscal.vehicules as any,
        patrimoineIFI: user.profilFiscal.patrimoineIFI,
      },
      consommation: {
        mode: user.profilFiscal.modeConsommation as any,
        budgetMensuel: user.profilFiscal.budgetMensuel as any,
        detailCategories: user.profilFiscal.detailCategories as any,
        alcoolTabac: user.profilFiscal.alcoolTabac as any,
      },
      familleServices: {
        nombreEnfants: user.profilFiscal.nombreEnfants || 0,
        enfants: user.profilFiscal.enfantsDetails as any || [],
        frequenceServices: user.profilFiscal.frequenceServices as any,
        aides: user.profilFiscal.aides as any,
      },
      statusData: user.profilFiscal.statusData as any,
    };

    // Calculate score with journal data integration
    console.log("[Score API] Calling calculerScoreFiscal...");
    const score = await calculerScoreFiscal(profil, undefined, {
      userId: user.id,
      useJournalData: true, // Use hybrid calculation with journal data
    });
    console.log("[Score API] Score calculated successfully:", {
      totalPaye: score.totalPaye,
      totalRecu: score.totalRecu,
      soldeNet: score.soldeNet,
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error("[Score API] Error calculating score:", error);
    console.error("[Score API] Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
