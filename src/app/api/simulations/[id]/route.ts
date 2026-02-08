// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSimulationById, deleteSimulation } from "@/modules/simulations/service";

/**
 * GET /api/simulations/[id]
 * Récupère une simulation spécifique avec tous les détails
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const simulation = await getSimulationById(params.id, user.id);

    if (!simulation) {
      return NextResponse.json(
        { error: "Simulation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ simulation });
  } catch (error) {
    console.error("[Simulations API] Error fetching simulation:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de la simulation",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/simulations/[id]
 * Supprime une simulation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await deleteSimulation(params.id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Simulations API] Error deleting simulation:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la suppression de la simulation",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
