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
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profilFiscal: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.profilFiscal) {
      return NextResponse.json(
        { error: "Profil not found. Please complete your profile first." },
        { status: 404 }
      );
    }

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

    // Calculate score
    const score = await calculerScoreFiscal(profil);

    return NextResponse.json(score);
  } catch (error) {
    console.error("Error calculating score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
