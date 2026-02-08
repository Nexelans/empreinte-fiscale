import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/modules/notifications/scheduling";
import { runStreakReminder } from "@/jobs/streakReminder";

/**
 * Streak Reminder Cron Endpoint
 * Triggered by Vercel Cron or external scheduler at 8:00 PM daily
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

  console.log("[API] Streak Reminder Cron - Triggered");

  try {
    const result = await runStreakReminder();

    return NextResponse.json({
      success: result.success,
      jobId: "streak-reminder",
      executedAt: new Date().toISOString(),
      stats: {
        affectedUsers: result.affectedUsers,
        notificationsSent: result.notificationsSent,
        errors: result.errors.length,
      },
      errors: result.errors.slice(0, 10),
    });
  } catch (error) {
    console.error("[API] Streak Reminder Cron - Failed:", error);

    return NextResponse.json(
      {
        success: false,
        jobId: "streak-reminder",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    jobId: "streak-reminder",
    schedule: "0 20 * * *",
    description: "Remind users to maintain their streak",
    status: "ready",
  });
}
