// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserChallenges, getUserActiveChallenges } from "@/modules/gamification/service";
import { getChallengeDefinitions } from "@/modules/gamification/challenges";

/**
 * GET /api/gamification/challenges
 * Récupère les challenges de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // 'active', 'completed', 'all'
    const userId = searchParams.get("userId") || session.user.id || "";

    let challenges;
    if (status === "active" || !status) {
      challenges = await getUserActiveChallenges(userId);
    } else {
      challenges = await getUserChallenges(userId);
    }

    // Calculate completion percentage for each challenge
    const challengesWithProgress = challenges.map((challenge) => {
      const progressPercent = Math.round((challenge.progress / challenge.target) * 100);
      const isExpired = challenge.expiresAt && new Date(challenge.expiresAt) < new Date();

      return {
        ...challenge,
        progressPercent,
        isExpired,
      };
    });

    // Get stats
    const allChallenges = await getUserChallenges(userId);
    const activeChallenges = allChallenges.filter((c) => c.status === "ACTIVE");
    const completedChallenges = allChallenges.filter((c) => c.status === "COMPLETED");

    return NextResponse.json({
      challenges: challengesWithProgress,
      stats: {
        total: allChallenges.length,
        active: activeChallenges.length,
        completed: completedChallenges.length,
      },
    });
  } catch (error) {
    console.error("[Challenges API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des challenges",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
