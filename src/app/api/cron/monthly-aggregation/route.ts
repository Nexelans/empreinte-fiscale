import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/modules/notifications/scheduling";
import { runMonthlyScoreAggregation } from "@/jobs/monthlyScoreAggregation";

/**
 * Monthly Score Aggregation Cron Endpoint
 * Triggered by Vercel Cron or external scheduler on 1st of month at 2:00 AM
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = authHeader?.replace("Bearer ", "") || null;

  if (!verifyCronSecret(cronSecret)) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid cron secret" },
      { status: 401 }
    );
  }

  console.log("[API] Monthly Aggregation Cron - Triggered");

  try {
    const result = await runMonthlyScoreAggregation();

    return NextResponse.json({
      success: result.success,
      jobId: "monthly-aggregation",
      executedAt: new Date().toISOString(),
      stats: {
        affectedUsers: result.affectedUsers,
        aggregationsCreated: result.aggregationsCreated,
        errors: result.errors.length,
      },
      errors: result.errors.slice(0, 10),
    });
  } catch (error) {
    console.error("[API] Monthly Aggregation Cron - Failed:", error);

    return NextResponse.json(
      {
        success: false,
        jobId: "monthly-aggregation",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    jobId: "monthly-aggregation",
    schedule: "0 2 1 * *",
    description: "Aggregate monthly score history for all users",
    status: "ready",
  });
}
