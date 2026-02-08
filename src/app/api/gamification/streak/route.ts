// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/gamification/streak
 * Récupère la streak actuelle de l'utilisateur
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

    // Get streak data
    const streak = await prisma.userStreak.findUnique({
      where: { userId: user.id },
    });

    if (!streak) {
      // Create initial streak record
      const newStreak = await prisma.userStreak.create({
        data: {
          userId: user.id,
          currentStreak: 0,
          longestStreak: 0,
        },
      });

      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastLoggedDate: null,
        freezeTokens: 0,
        gracePeriodEnds: null,
        isActive: false,
      });
    }

    // Check if streak is still active (logged today or yesterday)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastLogged = streak.lastLoggedDate ? new Date(streak.lastLoggedDate) : null;
    const lastLoggedDate = lastLogged
      ? new Date(lastLogged.getFullYear(), lastLogged.getMonth(), lastLogged.getDate())
      : null;

    const isActive =
      lastLoggedDate &&
      (lastLoggedDate.getTime() === today.getTime() ||
        lastLoggedDate.getTime() === yesterday.getTime());

    return NextResponse.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastLoggedDate: streak.lastLoggedDate,
      freezeTokens: streak.freezeTokens,
      gracePeriodEnds: streak.gracePeriodEnds,
      isActive,
    });
  } catch (error) {
    console.error("[Streak API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de la streak",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification/streak
 * Met à jour la streak (utilisé pour le freeze token usage)
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
    const { action } = body; // 'use_freeze_token'

    if (action === "use_freeze_token") {
      const streak = await prisma.userStreak.findUnique({
        where: { userId: user.id },
      });

      if (!streak) {
        return NextResponse.json({ error: "Streak not found" }, { status: 404 });
      }

      if (streak.freezeTokens <= 0) {
        return NextResponse.json({ error: "No freeze tokens available" }, { status: 400 });
      }

      // Use a freeze token
      const updated = await prisma.userStreak.update({
        where: { userId: user.id },
        data: {
          freezeTokens: streak.freezeTokens - 1,
          gracePeriodEnds: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h grace period
        },
      });

      return NextResponse.json({
        success: true,
        message: "Freeze token utilisé. Vous avez 24h pour logger une entrée.",
        streak: {
          currentStreak: updated.currentStreak,
          freezeTokens: updated.freezeTokens,
          gracePeriodEnds: updated.gracePeriodEnds,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Streak API POST] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la mise à jour de la streak",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
