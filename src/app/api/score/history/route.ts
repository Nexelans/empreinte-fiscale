import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getScoreHistory, getLatestScoreHistory } from "@/modules/score/history";

/**
 * GET /api/score/history
 * Retrieve score history for the authenticated user
 *
 * Query params:
 * - startYear: number (optional)
 * - startMonth: number (optional)
 * - endYear: number (optional)
 * - endMonth: number (optional)
 * - limit: number (optional, default: 100)
 * - latest: boolean (optional) - if true, returns only the latest entry
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

    // Check if user wants only the latest entry
    const latestOnly = searchParams.get("latest") === "true";

    if (latestOnly) {
      const latestEntry = await getLatestScoreHistory(userId);

      if (!latestEntry) {
        return NextResponse.json(
          { error: "No score history found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: latestEntry,
      });
    }

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
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 100;

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

    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: "limit must be between 1 and 1000" },
        { status: 400 }
      );
    }

    // Fetch history
    const history = await getScoreHistory(userId, {
      startYear,
      startMonth,
      endYear,
      endMonth,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("[API] Error fetching score history:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
