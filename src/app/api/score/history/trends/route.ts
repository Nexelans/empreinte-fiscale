import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getScoreHistory } from "@/modules/score/history";
import { analyzeTrend, getMilestones } from "@/modules/score/trends";

/**
 * GET /api/score/history/trends
 * Analyze trends in user's score history
 *
 * Query params:
 * - startYear: number (optional)
 * - startMonth: number (optional)
 * - endYear: number (optional)
 * - endMonth: number (optional)
 * - includeMilestones: boolean (optional, default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // Parse query parameters for date range filtering
    const startYear = searchParams.get("startYear")
      ? parseInt(searchParams.get("startYear")!)
      : undefined;
    const startMonth = searchParams.get("startMonth")
      ? parseInt(searchParams.get("startMonth")!)
      : undefined;
    const endYear = searchParams.get("endYear")
      ? parseInt(searchParams.get("endYear")!)
      : undefined;
    const endMonth = searchParams.get("endMonth")
      ? parseInt(searchParams.get("endMonth")!)
      : undefined;
    const includeMilestones = searchParams.get("includeMilestones") === "true";

    // Validation
    if (startMonth !== undefined && (startMonth < 1 || startMonth > 12)) {
      return NextResponse.json(
        { error: "startMonth must be between 1 and 12" },
        { status: 400 }
      );
    }

    if (endMonth !== undefined && (endMonth < 1 || endMonth > 12)) {
      return NextResponse.json(
        { error: "endMonth must be between 1 and 12" },
        { status: 400 }
      );
    }

    // Fetch history
    const history = await getScoreHistory(userId, {
      startYear,
      startMonth,
      endYear,
      endMonth,
    });

    if (history.length === 0) {
      return NextResponse.json(
        {
          error: "No score history found",
          suggestion: "Calculate your score first to generate history",
        },
        { status: 404 }
      );
    }

    // Analyze trends
    const trendAnalysis = analyzeTrend(history);

    // Optionally include milestones
    const milestones = includeMilestones ? getMilestones(history) : undefined;

    return NextResponse.json({
      success: true,
      dataPoints: history.length,
      periodStart: history[0] ? `${history[0].year}-${String(history[0].month).padStart(2, "0")}` : "N/A",
      periodEnd: history.length > 0 && history[history.length - 1] ? `${history[history.length - 1]!.year}-${String(history[history.length - 1]!.month).padStart(2, "0")}` : "N/A",
      analysis: trendAnalysis,
      milestones,
    });
  } catch (error) {
    console.error("[API] Error analyzing trends:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
