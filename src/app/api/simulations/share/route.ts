// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

/**
 * POST /api/simulations/share
 * Génère un lien de partage anonyme pour une simulation
 *
 * Body:
 * - simulationId: ID de la simulation à partager
 * - expiresInDays?: Nombre de jours avant expiration (défaut: 7)
 *
 * Returns:
 * - shareId: ID unique du partage
 * - shareUrl: URL complète du partage
 * - expiresAt: Date d'expiration
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
    const { simulationId, expiresInDays = 7 } = body;

    if (!simulationId) {
      return NextResponse.json(
        { error: "simulationId est requis" },
        { status: 400 }
      );
    }

    // Vérifier que la simulation appartient à l'utilisateur
    const simulation = await prisma.simulation.findFirst({
      where: {
        id: simulationId,
        userId: user.id,
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation non trouvée" },
        { status: 404 }
      );
    }

    // Générer un ID de partage unique
    const shareId = nanoid(16);

    // Calculer la date d'expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Créer l'entrée de partage
    // Note: Pour l'instant, on stocke dans la table Simulation avec des métadonnées
    // Dans une implémentation complète, créer une table SimulationShare dédiée
    await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        inputData: {
          ...(simulation.inputData as any),
          shareId,
          shareExpiresAt: expiresAt.toISOString(),
        } as any,
      },
    });

    // Générer l'URL de partage
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/share/simulation/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("[Simulations Share API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création du lien de partage",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/simulations/share?shareId=xxx
 * Récupère une simulation partagée (anonyme, pas d'auth requise)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");

    if (!shareId) {
      return NextResponse.json(
        { error: "shareId est requis" },
        { status: 400 }
      );
    }

    // Chercher la simulation avec ce shareId
    const simulation = await prisma.simulation.findFirst({
      where: {
        inputData: {
          path: ["shareId"],
          equals: shareId,
        },
      },
    });

    if (!simulation) {
      return NextResponse.json(
        { error: "Lien de partage non trouvé ou expiré" },
        { status: 404 }
      );
    }

    // Vérifier l'expiration
    const inputData = simulation.inputData as any;
    if (inputData.shareExpiresAt) {
      const expiresAt = new Date(inputData.shareExpiresAt);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Lien de partage expiré" },
          { status: 410 }
        );
      }
    }

    // Retourner les données de la simulation (anonymisées)
    return NextResponse.json({
      simulation: {
        id: simulation.id,
        scenarioType: simulation.scenarioType,
        label: simulation.name,
        outputScore: simulation.outputScore,
        createdAt: simulation.createdAt,
        // Ne pas exposer l'userId ou d'autres données sensibles
      },
    });
  } catch (error) {
    console.error("[Simulations Share API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération du partage",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
