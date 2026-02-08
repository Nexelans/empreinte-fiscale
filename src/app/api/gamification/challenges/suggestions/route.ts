// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { suggestChallenges, acceptChallengeSuggestion } from "@/modules/gamification/suggestions";

/**
 * GET /api/gamification/challenges/suggestions
 * Récupère les suggestions de challenges pour l'utilisateur
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "3", 10);

    const suggestions = await suggestChallenges(user.id, limit);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[Suggestions API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des suggestions",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/challenges/suggestions
 * Accepte une suggestion de challenge
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
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json(
        { error: "challengeId is required" },
        { status: 400 }
      );
    }

    await acceptChallengeSuggestion(user.id, challengeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Suggestions API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'acceptation du challenge",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
