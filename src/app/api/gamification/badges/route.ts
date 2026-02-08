// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserBadges } from "@/modules/gamification/service";
import { getBadgeDefinitions } from "@/modules/gamification/badges";

/**
 * GET /api/gamification/badges
 * Récupère tous les badges de l'utilisateur (earned + available)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Get all badge definitions
    const allBadges = await getBadgeDefinitions();

    // Get user's earned badges
    const earnedBadges = await getUserBadges(userId || session.user.id || "");

    // Combine to show which badges are earned vs available
    const badgesWithStatus = allBadges.map((badge) => {
      const userBadge = earnedBadges.find((ub) => ub.badgeId === badge.id);

      return {
        ...badge,
        earned: !!userBadge,
        earnedAt: userBadge?.earnedAt || null,
        progress: userBadge?.progress || 0,
      };
    });

    // Sort by earned (earned first), then by category
    badgesWithStatus.sort((a, b) => {
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      return a.categorie.localeCompare(b.categorie);
    });

    return NextResponse.json({
      badges: badgesWithStatus,
      stats: {
        total: allBadges.length,
        earned: earnedBadges.length,
        progress: Math.round((earnedBadges.length / allBadges.length) * 100),
      },
    });
  } catch (error) {
    console.error("[Badges API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des badges",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
