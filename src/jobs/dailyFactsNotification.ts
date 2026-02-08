import { generateDailyFacts } from "@/modules/notifications/generators/dailyFact";
import { batchSendNotifications } from "@/modules/notifications/service";
import { logCronExecution, executeWithRetry } from "@/modules/notifications/scheduling";

/**
 * Daily Facts Notification Cron Job
 * Runs every day at 9:00 AM
 * Sends personalized tax facts to users who opted in
 */

export async function runDailyFactsNotification(): Promise<{
  success: boolean;
  affectedUsers: number;
  notificationsSent: number;
  errors: string[];
}> {
  const startTime = Date.now();
  const errors: string[] = [];

  console.log("[Cron] Daily Facts Notification - Starting...");

  try {
    // Generate daily facts for all eligible users
    const payloads = await executeWithRetry(async () => {
      return generateDailyFacts();
    });

    console.log(`[Cron] Generated ${payloads.length} daily facts`);

    if (payloads.length === 0) {
      const duration = Date.now() - startTime;
      logCronExecution({
        jobId: "daily-facts",
        executedAt: new Date(),
        duration,
        success: true,
        affectedUsers: 0,
        notificationsSent: 0,
      });

      return {
        success: true,
        affectedUsers: 0,
        notificationsSent: 0,
        errors: ["No users with daily facts enabled"],
      };
    }

    // Send notifications in batches of 50 to avoid overwhelming the system
    const batchSize = 50;
    let totalSent = 0;
    let successCount = 0;

    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);

      try {
        const results = await executeWithRetry(async () => {
          return batchSendNotifications(batch);
        });

        const batchSuccessCount = results.filter((r) => r.allSuccessful).length;
        successCount += batchSuccessCount;
        totalSent += batch.length;

        console.log(
          `[Cron] Batch ${Math.floor(i / batchSize) + 1}: ${batchSuccessCount}/${batch.length} sent successfully`
        );

        // Log failures
        results.forEach((result, index) => {
          if (!result.allSuccessful) {
            const failedChannels = result.deliveryResults
              .filter((dr) => !dr.success)
              .map((dr) => `${dr.channel}: ${dr.error}`);
            const user = batch[index];
            if (user) {
              errors.push(
                `User ${user.userId}: ${failedChannels.join(", ")}`
              );
            }
          }
        });

        // Small delay between batches to avoid rate limits
        if (i + batchSize < payloads.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`[Cron] Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
        errors.push(`Batch failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const duration = Date.now() - startTime;
    const success = successCount > 0;

    logCronExecution({
      jobId: "daily-facts",
      executedAt: new Date(),
      duration,
      success,
      affectedUsers: payloads.length,
      notificationsSent: successCount,
    });

    console.log(
      `[Cron] Daily Facts Notification - Complete: ${successCount}/${totalSent} sent (${duration}ms)`
    );

    return {
      success,
      affectedUsers: payloads.length,
      notificationsSent: successCount,
      errors,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("[Cron] Daily Facts Notification - Failed:", error);

    logCronExecution({
      jobId: "daily-facts",
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
