// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runSimulation, getUserSimulations } from "@/modules/simulations/service";
import { getScenarioTemplate } from "@/modules/simulations/scenarios";
import type { SimulationInput } from "@/modules/simulations/types";

/**
 * GET /api/simulations
 * Récupère la liste des simulations de l'utilisateur
 */
export async function GET(request: NextRequest) {
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

    const simulations = await getUserSimulations(user.id);

    return NextResponse.json({ simulations });
  } catch (error) {
    console.error("[Simulations API] Error fetching simulations:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des simulations",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/simulations
 * Crée une nouvelle simulation
 *
 * Body:
 * - scenarioType: Type de scénario
 * - label?: Label personnalisé (optionnel)
 * - modifications: Modifications à appliquer au profil
 * - metadata?: Métadonnées supplémentaires
 *
 * OU
 *
 * - templateType: Type de template à utiliser
 * - templateParams: Paramètres du template
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

    let simulationInput: SimulationInput;

    // Mode 1: Utilisation d'un template
    if (body.templateType) {
      const template = getScenarioTemplate(body.templateType);

      if (!template) {
        return NextResponse.json(
          { error: "Template de scénario non trouvé" },
          { status: 404 }
        );
      }

      // Récupérer le profil actuel
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
      const baseProfile: any = {
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

      // Générer les modifications via le template
      const modifications = template.generateModifications(
        baseProfile,
        body.templateParams || {}
      );

      simulationInput = {
        scenarioType: template.type,
        label: body.label,
        modifications,
        metadata: body.templateParams,
      };
    }
    // Mode 2: Simulation personnalisée
    else {
      if (!body.scenarioType || !body.modifications) {
        return NextResponse.json(
          { error: "scenarioType et modifications sont requis" },
          { status: 400 }
        );
      }

      simulationInput = {
        scenarioType: body.scenarioType,
        label: body.label,
        modifications: body.modifications,
        metadata: body.metadata,
      };
    }

    // Exécuter la simulation
    const result = await runSimulation(user.id, simulationInput);

    return NextResponse.json({
      success: true,
      simulation: result,
    });
  } catch (error) {
    console.error("[Simulations API] Error creating simulation:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création de la simulation",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
