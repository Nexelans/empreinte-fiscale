// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserLevelInfo } from "@/modules/gamification/service";
import { getXPLeaderboard } from "@/modules/gamification/xp";

/**
 * GET /api/gamification/xp
 * Récupère l'XP et le niveau de l'utilisateur
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
    const includeLeaderboard = searchParams.get("includeLeaderboard") === "true";

    const levelInfo = await getUserLevelInfo(user.id);

    const response: any = {
      level: levelInfo.level,
      currentXP: levelInfo.currentXP,
      xpForNextLevel: levelInfo.xpForNextLevel,
      totalXP: levelInfo.totalXP,
      progressPercent: Math.round((levelInfo.currentXP / levelInfo.xpForNextLevel) * 100),
    };

    if (includeLeaderboard) {
      const leaderboard = await getXPLeaderboard(10);
      response.leaderboard = leaderboard;
      response.rank = leaderboard.findIndex((entry) => entry.userId === user.id) + 1 || 0;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[XP API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de l'XP",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
