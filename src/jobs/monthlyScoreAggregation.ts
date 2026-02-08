import { prisma } from "@/lib/prisma";
import { logCronExecution, executeWithRetry } from "@/modules/notifications/scheduling";

/**
 * Monthly Score Aggregation Cron Job
 * Runs on the 1st of every month at 2:00 AM
 * Aggregates score history for all users from the previous month
 */

export async function runMonthlyScoreAggregation(): Promise<{
  success: boolean;
  affectedUsers: number;
  aggregationsCreated: number;
  errors: string[];
}> {
  const startTime = Date.now();
  const errors: string[] = [];

  console.log("[Cron] Monthly Score Aggregation - Starting...");

  try {
    // Get the previous month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1; // JavaScript months are 0-indexed

    console.log(`[Cron] Aggregating scores for ${year}-${month}`);

    // Get all users with a profil fiscal
    const users = await executeWithRetry(async () => {
      return prisma.user.findMany({
        where: {
          profilFiscal: {
            isNot: null,
          },
        },
        select: {
          id: true,
          profilFiscal: {
            select: {
              id: true,
              userId: true,
            },
          },
        },
      });
    });

    console.log(`[Cron] Found ${users.length} users to aggregate`);

    if (users.length === 0) {
      const duration = Date.now() - startTime;
      logCronExecution({
        jobId: "monthly-score-aggregation",
        executedAt: new Date(),
        duration,
        success: true,
        affectedUsers: 0,
        notificationsSent: 0,
      });

      return {
        success: true,
        affectedUsers: 0,
        aggregationsCreated: 0,
        errors: ["No users with profil fiscal found"],
      };
    }

    let aggregationsCreated = 0;

    // Process users in batches
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      try {
        await executeWithRetry(async () => {
          // Use createMany for batch insert
          // Note: scoreData/confidenceScore don't exist in ProfilFiscal model
          // This job would need to calculate scores on-demand or use ScoreHistory table
          const data = batch
            .filter((user) => user.profilFiscal)
            .map((user) => ({
              userId: user.id,
              year,
              month,
              millesime: year.toString(),
              scoreFiscalData: {} as any, // TODO: Calculate score from profil
              confidenceScore: 0,
            }));

          if (data.length > 0) {
            await prisma.scoreHistory.createMany({
              data,
              skipDuplicates: true, // Skip if entry already exists
            });
            aggregationsCreated += data.length;
          }
        });

        console.log(
          `[Cron] Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} users processed`
        );
      } catch (error) {
        console.error(
          `[Cron] Batch ${Math.floor(i / batchSize) + 1} failed:`,
          error
        );
        errors.push(
          `Batch failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    const duration = Date.now() - startTime;
    const success = aggregationsCreated > 0;

    logCronExecution({
      jobId: "monthly-score-aggregation",
      executedAt: new Date(),
      duration,
      success,
      affectedUsers: users.length,
      notificationsSent: aggregationsCreated,
    });

    console.log(
      `[Cron] Monthly Score Aggregation - Complete: ${aggregationsCreated} aggregations created (${duration}ms)`
    );

    return {
      success,
      affectedUsers: users.length,
      aggregationsCreated,
      errors,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("[Cron] Monthly Score Aggregation - Failed:", error);

    logCronExecution({
      jobId: "monthly-score-aggregation",
      executedAt: new Date(),
      duration,
      success: false,
      error: errorMessage,
    });

    return {
      success: false,
      affectedUsers: 0,
      aggregationsCreated: 0,
      errors: [errorMessage],
    };
  }
}
