// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFriendLeaderboard } from "@/modules/gamification/service";

/**
 * GET /api/gamification/leaderboard
 * Récupère le leaderboard des amis (opt-in)
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

    // Check if user has opted in to leaderboard sharing
    // For MVP, we'll assume opt-in by default
    // In production, check user preferences

    const leaderboard = await getFriendLeaderboard(user.id);

    return NextResponse.json({
      leaderboard,
      userRank: leaderboard.find((entry) => entry.userId === user.id)?.rank || 0,
    });
  } catch (error) {
    console.error("[Leaderboard API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération du leaderboard",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
