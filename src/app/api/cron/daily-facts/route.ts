import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/modules/notifications/scheduling";
import { runDailyFactsNotification } from "@/jobs/dailyFactsNotification";

/**
 * Daily Facts Cron Endpoint
 * Triggered by Vercel Cron or external scheduler at 9:00 AM daily
 */
export async function POST(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = authHeader?.replace("Bearer ", "") || null;

  if (!verifyCronSecret(cronSecret)) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid cron secret" },
      { status: 401 }
    );
  }

  console.log("[API] Daily Facts Cron - Triggered");

  try {
    const result = await runDailyFactsNotification();

    return NextResponse.json({
      success: result.success,
      jobId: "daily-facts",
      executedAt: new Date().toISOString(),
      stats: {
        affectedUsers: result.affectedUsers,
        notificationsSent: result.notificationsSent,
        errors: result.errors.length,
      },
      errors: result.errors.slice(0, 10), // Limit error list in response
    });
  } catch (error) {
    console.error("[API] Daily Facts Cron - Failed:", error);

    return NextResponse.json(
      {
        success: false,
        jobId: "daily-facts",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Allow GET for health check
export async function GET() {
  return NextResponse.json({
    jobId: "daily-facts",
    schedule: "0 9 * * *",
    description: "Send daily tax facts to opted-in users",
    status: "ready",
  });
}
