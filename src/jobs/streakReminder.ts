import { sendStreakReminders } from "@/modules/notifications/generators/eventTriggered";
import { logCronExecution, executeWithRetry } from "@/modules/notifications/scheduling";

/**
 * Streak Reminder Cron Job
 * Runs every day at 8:00 PM
 * Reminds users to log an entry to maintain their streak
 */

export async function runStreakReminder(): Promise<{
  success: boolean;
  affectedUsers: number;
  notificationsSent: number;
  errors: string[];
}> {
  const startTime = Date.now();
  const errors: string[] = [];

  console.log("[Cron] Streak Reminder - Starting...");

  try {
    // Send streak reminders to all eligible users
    const remindersSent = await executeWithRetry(async () => {
      return sendStreakReminders();
    });

    const duration = Date.now() - startTime;
    const success = remindersSent > 0;

    logCronExecution({
      jobId: "streak-reminder",
      executedAt: new Date(),
      duration,
      success: true, // Even if no reminders sent, job succeeded
      affectedUsers: remindersSent,
      notificationsSent: remindersSent,
    });

    console.log(
      `[Cron] Streak Reminder - Complete: ${remindersSent} reminders sent (${duration}ms)`
    );

    return {
      success: true,
      affectedUsers: remindersSent,
      notificationsSent: remindersSent,
      errors: remindersSent === 0 ? ["No users needed reminders"] : [],
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("[Cron] Streak Reminder - Failed:", error);

    logCronExecution({
      jobId: "streak-reminder",
      executedAt: new Date(),
      duration,
      success: false,
      error: errorMessage,
    });

    return {
      success: false,
      affectedUsers: 0,
      notificationsSent: 0,
      errors: [errorMessage],
    };
  }
}
