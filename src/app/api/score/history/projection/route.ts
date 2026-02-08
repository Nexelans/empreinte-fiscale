import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getScoreHistory } from "@/modules/score/history";
import type { ScoreFiscal } from "@/modules/score/types";

/**
 * GET /api/score/history/projection
 * Project future scores based on historical trends
 *
 * Query params:
 * - months: number (optional, default: 6, max: 24)
 * - method: "linear" | "average" (optional, default: "linear")
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

    // Parse parameters
    const monthsParam = searchParams.get("months");
    const months = monthsParam ? parseInt(monthsParam) : 6;
    const method = (searchParams.get("method") as "linear" | "average") || "linear";

    // Validation
    if (months < 1 || months > 24) {
      return NextResponse.json(
        { error: "months must be between 1 and 24" },
        { status: 400 }
      );
    }

    if (method !== "linear" && method !== "average") {
      return NextResponse.json(
        { error: "method must be 'linear' or 'average'" },
        { status: 400 }
      );
    }

    // Fetch history (need at least 3 months for projection)
    const history = await getScoreHistory(userId, {});

    if (history.length < 3) {
      return NextResponse.json(
        {
          error: "Insufficient data for projection",
          message: "At least 3 months of score history are required for projection",
          currentDataPoints: history.length,
        },
        { status: 400 }
      );
    }

    // Calculate projection
    const projection = calculateProjection(history, months, method);

    return NextResponse.json({
      success: true,
      method,
      projectionMonths: months,
      basedOnDataPoints: history.length,
      lastActualDate: history.length > 0 && history[history.length - 1] ? `${history[history.length - 1]!.year}-${String(history[history.length - 1]!.month).padStart(2, "0")}` : "N/A",
      projection,
      disclaimer:
        "Cette projection est une estimation basée sur les données historiques. Elle ne prend pas en compte les changements futurs de votre situation (nouvel emploi, mariage, naissance, etc.) ni les changements de barèmes fiscaux.",
    });
  } catch (error) {
    console.error("[API] Error calculating projection:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate score projection
 */
function calculateProjection(
  history: Awaited<ReturnType<typeof getScoreHistory>>,
  months: number,
  method: "linear" | "average"
) {
  // Sort by date
  const sorted = [...history].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const projections = [];

  if (method === "linear") {
    // Linear regression on recent data (last 6 months or all if less)
    const recentData = sorted.slice(-Math.min(6, sorted.length));

    // Calculate trends for each metric
    const trends = calculateLinearTrends(recentData);

    // Project future months
    const lastEntry = sorted[sorted.length - 1];
    if (!lastEntry) {
      return NextResponse.json(
        { error: "No historical data available for projection" },
        { status: 400 }
      );
    }

    let currentYear = lastEntry.year;
    let currentMonth = lastEntry.month;

    for (let i = 1; i <= months; i++) {
      // Increment month
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }

      // Project values
      const projectedTotalPaye = Math.max(
        0,
        lastEntry.scoreFiscalData.totalPaye + trends.totalPaye * i
      );
      const projectedTotalRecu = Math.max(
        0,
        lastEntry.scoreFiscalData.totalRecu + trends.totalRecu * i
      );
      const projectedSoldeNet = projectedTotalPaye - projectedTotalRecu;
      const projectedRatio =
        projectedTotalRecu > 0 ? projectedTotalPaye / projectedTotalRecu : 0;
      const projectedConfidence = Math.min(
        100,
        Math.max(0, lastEntry.confidenceScore + trends.confidence * i)
      );

      projections.push({
        date: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
        year: currentYear,
        month: currentMonth,
        totalPaye: Math.round(projectedTotalPaye),
        totalRecu: Math.round(projectedTotalRecu),
        soldeNet: Math.round(projectedSoldeNet),
        ratio: Math.round(projectedRatio * 100) / 100,
        confidenceScore: Math.round(projectedConfidence),
        confidence: "low", // Projections always have low confidence
      });
    }
  } else {
    // Average method: use average of all historical data
    const averages = calculateAverages(sorted);

    const lastEntry = sorted[sorted.length - 1];
    if (!lastEntry) {
      return NextResponse.json(
        { error: "No historical data available for projection" },
        { status: 400 }
      );
    }

    let currentYear = lastEntry.year;
    let currentMonth = lastEntry.month;

    for (let i = 1; i <= months; i++) {
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }

      projections.push({
        date: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
        year: currentYear,
        month: currentMonth,
        totalPaye: Math.round(averages.totalPaye),
        totalRecu: Math.round(averages.totalRecu),
        soldeNet: Math.round(averages.soldeNet),
        ratio: averages.ratio,
        confidenceScore: Math.round(averages.confidence),
        confidence: "low",
      });
    }
  }

  return projections;
}

/**
 * Calculate linear trends using simple linear regression
 */
function calculateLinearTrends(history: Awaited<ReturnType<typeof getScoreHistory>>) {
  const n = history.length;

  // Create x values (0, 1, 2, ..., n-1)
  const x = Array.from({ length: n }, (_, i) => i);

  // Extract y values for each metric
  const yTotalPaye = history.map((h) => h.scoreFiscalData.totalPaye);
  const yTotalRecu = history.map((h) => h.scoreFiscalData.totalRecu);
  const yConfidence = history.map((h) => h.confidenceScore);

  // Calculate slopes (trend per month)
  const totalPayeTrend = calculateSlope(x, yTotalPaye);
  const totalRecuTrend = calculateSlope(x, yTotalRecu);
  const confidenceTrend = calculateSlope(x, yConfidence);

  return {
    totalPaye: totalPayeTrend,
    totalRecu: totalRecuTrend,
    confidence: confidenceTrend,
  };
}

/**
 * Calculate slope of linear regression
 */
function calculateSlope(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * (y[i] || 0), 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  // Slope formula: (n*Σxy - Σx*Σy) / (n*Σx² - (Σx)²)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  return isNaN(slope) ? 0 : slope;
}

/**
 * Calculate averages
 */
function calculateAverages(history: Awaited<ReturnType<typeof getScoreHistory>>) {
  const n = history.length;

  const totalPaye =
    history.reduce((sum, h) => sum + h.scoreFiscalData.totalPaye, 0) / n;
  const totalRecu =
    history.reduce((sum, h) => sum + h.scoreFiscalData.totalRecu, 0) / n;
  const soldeNet =
    history.reduce((sum, h) => sum + h.scoreFiscalData.soldeNet, 0) / n;
  const confidence = history.reduce((sum, h) => sum + h.confidenceScore, 0) / n;
  const ratio = totalRecu > 0 ? totalPaye / totalRecu : 0;

  return {
    totalPaye,
    totalRecu,
    soldeNet,
    ratio: Math.round(ratio * 100) / 100,
    confidence,
  };
}
