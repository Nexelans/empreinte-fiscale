// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculerScoreFiscal } from "@/modules/score";
import { ProfilFiscalComplete } from "@/modules/profil/types";
import { invalidateUserSharedData } from "@/lib/cache";

/**
 * GET /api/score
 * Calcule et retourne le score fiscal de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    console.log("[Score API] ==> Starting score calculation...");

    console.log("[Score API] Step 1: Getting session...");
    const sessionStart = Date.now();
    const session = await getServerSession(authOptions);
    console.log(`[Score API] Session check took ${Date.now() - sessionStart}ms`);

    if (!session?.user?.email) {
      console.log("[Score API] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Score API] Session found for:", session.user.email);

    console.log("[Score API] Step 2: Fetching user from database...");
    const userStart = Date.now();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profilFiscal: true,
      },
    });
    console.log(`[Score API] User fetch took ${Date.now() - userStart}ms`);

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

    console.log("[Score API] Step 3: Transforming profil data...");

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

    console.log("[Score API] Step 4: Calling calculerScoreFiscal...");
    const calcStart = Date.now();
    const score = await calculerScoreFiscal(profil, undefined, {
      userId: user.id,
      useJournalData: false, // TEMPORARILY DISABLED - Use pure estimation for now
    });
    console.log(`[Score API] Calculation took ${Date.now() - calcStart}ms`);

    console.log("[Score API] Score calculated successfully:", {
      totalPaye: score.totalPaye,
      totalRecu: score.totalRecu,
      soldeNet: score.soldeNet,
    });

    // Invalidate cached shared data (Task 30.4)
    console.log("[Score API] Invalidating cached shared data...");
    await invalidateUserSharedData(user.id);

    const totalTime = Date.now() - startTime;
    console.log(`[Score API] <== Total request time: ${totalTime}ms`);

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
