import { generateWeeklyDigests } from "@/modules/notifications/generators/weeklyDigest";
import { batchSendNotifications } from "@/modules/notifications/service";
import { logCronExecution, executeWithRetry } from "@/modules/notifications/scheduling";

/**
 * Weekly Digest Cron Job
 * Runs every Sunday at 6:00 PM
 * Sends weekly activity summary to users who opted in
 */

export async function runWeeklyDigest(): Promise<{
  success: boolean;
  affectedUsers: number;
  notificationsSent: number;
  errors: string[];
}> {
  const startTime = Date.now();
  const errors: string[] = [];

  console.log("[Cron] Weekly Digest - Starting...");

  try {
    // Generate weekly digests for all eligible users
    const payloads = await executeWithRetry(async () => {
      return generateWeeklyDigests();
    });

    console.log(`[Cron] Generated ${payloads.length} weekly digests`);

    if (payloads.length === 0) {
      const duration = Date.now() - startTime;
      logCronExecution({
        jobId: "weekly-digest",
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
        errors: ["No users with weekly digest enabled"],
      };
    }

    // Send notifications in batches of 25 (smaller batches for email-heavy digest)
    const batchSize = 25;
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

        // Longer delay between batches for digest (more email-heavy)
        if (i + batchSize < payloads.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`[Cron] Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
        errors.push(`Batch failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const duration = Date.now() - startTime;
    const success = successCount > 0;

    logCronExecution({
      jobId: "weekly-digest",
      executedAt: new Date(),
      duration,
      success,
      affectedUsers: payloads.length,
      notificationsSent: successCount,
    });

    console.log(
      `[Cron] Weekly Digest - Complete: ${successCount}/${totalSent} sent (${duration}ms)`
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

    console.error("[Cron] Weekly Digest - Failed:", error);

    logCronExecution({
      jobId: "weekly-digest",
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
