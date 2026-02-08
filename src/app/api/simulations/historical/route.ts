// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculerScoreFiscal } from "@/modules/score";
import { calculateDelta } from "@/modules/simulations/service";
import type { ProfilFiscalData } from "@/modules/profil/types";

/**
 * POST /api/simulations/historical
 * Recalcule le score fiscal avec les barèmes d'une année passée
 *
 * Body:
 * - millesime: Année cible (ex: "2025", "2024", "2023")
 * - label?: Label personnalisé pour la simulation
 *
 * Note: Nécessite que les barèmes de l'année cible existent dans le Référentiel
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { millesime, label } = body;

    if (!millesime) {
      return NextResponse.json(
        { error: "millesime est requis" },
        { status: 400 }
      );
    }

    // Vérifier que le millésime existe dans le Référentiel
    const baremesExist = await prisma.referentiel.findFirst({
      where: { millesime },
    });

    if (!baremesExist) {
      return NextResponse.json(
        {
          error: "Millésime non disponible",
          message: `Les barèmes fiscaux pour l'année ${millesime} ne sont pas encore disponibles dans le Référentiel.`,
        },
        { status: 404 }
      );
    }

    // Récupérer le profil actuel de l'utilisateur
    const profileRecord = await prisma.profilFiscal.findUnique({
      where: { userId: user.id },
    });

    if (!profileRecord) {
      return NextResponse.json(
        { error: "Profil fiscal non trouvé" },
        { status: 404 }
      );
    }

    // Convertir en ProfilFiscalData (nested structure)
    const profile: ProfilFiscalData = {
      situation: {
        statut: profileRecord.statut as any,
        nombreParts: profileRecord.nombreParts || null,
        commune: profileRecord.commune || null,
        age: profileRecord.age || null,
      },
      revenus: {
        salaireBrut: profileRecord.salaireBrut || null,
        salaireNet: profileRecord.salaireNet || null,
        typeContrat: profileRecord.typeContrat as any,
        revenusFonciers: profileRecord.revenusFonciers || null,
        revenusCapitaux: profileRecord.revenusCapitaux || null,
        autresRevenus: profileRecord.autresRevenus || null,
      },
      patrimoine: {
        proprietaire: profileRecord.proprietaire || null,
        valeurLocative: profileRecord.valeurLocative || null,
        taxeFonciere: profileRecord.taxeFonciere || null,
        vehicules: (profileRecord.vehicules as any) || [],
        patrimoineIFI: profileRecord.patrimoineIFI || null,
      },
      consommation: {
        mode: profileRecord.modeConsommation as any,
        budgetMensuel: (profileRecord.budgetMensuel as any) || undefined,
        detailCategories: (profileRecord.detailCategories as any) || undefined,
        alcoolTabac: (profileRecord.alcoolTabac as any) || undefined,
      },
      familleServices: {
        nombreEnfants: profileRecord.nombreEnfants || 0,
        enfants: (profileRecord.enfantsDetails as any) || [],
        frequenceServices: (profileRecord.frequenceServices as any) || {
          transportsCommun: "jamais",
          hopitalMedecin: "annuelle",
          bibliotheque: "jamais",
          equipementsSportifs: "jamais",
        },
        aides: (profileRecord.aides as any) || {
          caf: false,
          apl: false,
          rsa: false,
          bourses: false,
          chomage: false,
          cmuc: false,
        },
      },
      statusData: (profileRecord.statusData as any) || {},
    };

    // Calculer le score avec le millésime actuel (2026)
    const currentScore = await calculerScoreFiscal(profile, "2026");

    // Calculer le score avec le millésime historique
    const historicalScore = await calculerScoreFiscal(profile, millesime);

    // Calculer le delta
    const delta = calculateDelta(currentScore, historicalScore);

    // Générer le label
    const finalLabel =
      label || `Mon profil en ${millesime} vs aujourd'hui`;

    // Sauvegarder la simulation
    const simulation = await prisma.simulation.create({
      data: {
        userId: user.id,
        scenarioType: "custom",
        name: finalLabel,
        inputData: {
          type: "historical",
          millesime,
          modifications: {}, // Pas de modification du profil, juste changement de barèmes
          metadata: {
            historicalMillesime: millesime,
            currentMillesime: "2026",
          },
        } as any,
        outputScore: historicalScore as any,
      },
    });

    return NextResponse.json({
      success: true,
      simulation: {
        id: simulation.id,
        userId: user.id,
        scenarioType: "custom",
        label: finalLabel,
        createdAt: simulation.createdAt,
        baseProfile: profile,
        baseScore: currentScore,
        simulatedProfile: profile, // Même profil
        simulatedScore: historicalScore,
        delta,
        metadata: {
          historicalMillesime: millesime,
          currentMillesime: "2026",
        },
      },
    });
  } catch (error) {
    console.error("[Historical API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du calcul historique",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/simulations/historical
 * Récupère la liste des millésimes disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les millésimes uniques du Référentiel
    const millesimes = await prisma.referentiel.findMany({
      select: { millesime: true },
      distinct: ["millesime"],
      orderBy: { millesime: "desc" },
    });

    const availableYears = millesimes.map((m) => ({
      year: m.millesime,
      label: `Barèmes ${m.millesime}`,
      isCurrent: m.millesime === "2026",
    }));

    return NextResponse.json({
      availableYears,
      disclaimer:
        "Les calculs historiques utilisent vos données actuelles avec les barèmes de l'année sélectionnée. Cela donne une approximation de ce que vous auriez payé/reçu si vous aviez eu ce profil à l'époque.",
    });
  } catch (error) {
    console.error("[Historical API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des millésimes",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
