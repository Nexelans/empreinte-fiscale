import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/modules/notifications/scheduling";
import { runWeeklyDigest } from "@/jobs/weeklyDigest";

/**
 * Weekly Digest Cron Endpoint
 * Triggered by Vercel Cron or external scheduler every Sunday at 6:00 PM
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

  console.log("[API] Weekly Digest Cron - Triggered");

  try {
    const result = await runWeeklyDigest();

    return NextResponse.json({
      success: result.success,
      jobId: "weekly-digest",
      executedAt: new Date().toISOString(),
      stats: {
        affectedUsers: result.affectedUsers,
        notificationsSent: result.notificationsSent,
        errors: result.errors.length,
      },
      errors: result.errors.slice(0, 10),
    });
  } catch (error) {
    console.error("[API] Weekly Digest Cron - Failed:", error);

    return NextResponse.json(
      {
        success: false,
        jobId: "weekly-digest",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    jobId: "weekly-digest",
    schedule: "0 18 * * 0",
    description: "Send weekly activity digest to opted-in users",
    status: "ready",
  });
}
