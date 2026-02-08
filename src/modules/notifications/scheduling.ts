/**
 * Notification scheduling and cron job registration
 *
 * This module defines the schedule for automated notifications.
 * Actual cron job execution will be handled by:
 * - Vercel Cron (for Vercel deployments)
 * - GitHub Actions (for scheduled workflows)
 * - External schedulers like cron-job.org
 *
 * Setup:
 * 1. For Vercel: Add vercel.json with cron configuration
 * 2. For GitHub Actions: Add .github/workflows/cron.yml
 * 3. For external: Configure webhooks to API endpoints
 */

export interface CronJob {
  id: string;
  name: string;
  schedule: string; // Cron expression
  handler: string; // API endpoint to call
  description: string;
  enabled: boolean;
}

/**
 * All registered cron jobs for notifications
 */
export const NOTIFICATION_CRON_JOBS: CronJob[] = [
  {
    id: "daily-facts",
    name: "Daily Tax Facts",
    schedule: "0 9 * * *", // Every day at 9:00 AM
    handler: "/api/cron/daily-facts",
    description: "Send daily tax fact to users who opted in",
    enabled: true,
  },
  {
    id: "streak-reminder",
    name: "Streak Reminder",
    schedule: "0 20 * * *", // Every day at 8:00 PM
    handler: "/api/cron/streak-reminder",
    description: "Remind users to log an entry to maintain their streak",
    enabled: true,
  },
  {
    id: "weekly-digest",
    name: "Weekly Digest",
    schedule: "0 18 * * 0", // Every Sunday at 6:00 PM
    handler: "/api/cron/weekly-digest",
    description: "Send weekly fiscal activity digest",
    enabled: true,
  },
  {
    id: "monthly-score-aggregation",
    name: "Monthly Score Aggregation",
    schedule: "0 2 1 * *", // 1st of every month at 2:00 AM
    handler: "/api/cron/monthly-aggregation",
    description: "Aggregate monthly score history for all users",
    enabled: true,
  },
  {
    id: "fiscal-alerts-check",
    name: "Fiscal Alerts Check",
    schedule: "0 10 * * *", // Every day at 10:00 AM
    handler: "/api/cron/fiscal-alerts",
    description: "Check for upcoming fiscal deadlines and send alerts",
    enabled: true,
  },
  {
    id: "challenge-expiry-check",
    name: "Challenge Expiry Check",
    schedule: "0 0 * * *", // Every day at midnight
    handler: "/api/cron/challenge-expiry",
    description: "Check for expired challenges and update status",
    enabled: true,
  },
];

/**
 * Get all enabled cron jobs
 */
export function getEnabledCronJobs(): CronJob[] {
  return NOTIFICATION_CRON_JOBS.filter((job) => job.enabled);
}

/**
 * Get cron job by ID
 */
export function getCronJobById(id: string): CronJob | undefined {
  return NOTIFICATION_CRON_JOBS.find((job) => job.id === id);
}

/**
 * Validate cron expression
 * Basic validation - for production use a library like cron-parser
 */
export function validateCronExpression(expression: string): boolean {
  const parts = expression.trim().split(/\s+/);
  return parts.length === 5 || parts.length === 6;
}

/**
 * Generate Vercel cron configuration
 * This can be used to generate vercel.json
 */
export function generateVercelCronConfig(): string {
  const config = {
    crons: getEnabledCronJobs().map((job) => ({
      path: job.handler,
      schedule: job.schedule,
    })),
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Generate GitHub Actions workflow for cron jobs
 * This can be used to generate .github/workflows/cron.yml
 */
export function generateGitHubActionsWorkflow(): string {
  const jobs = getEnabledCronJobs();

  const workflow = {
    name: "Scheduled Notifications",
    on: {
      schedule: jobs.map((job) => ({ cron: job.schedule })),
      workflow_dispatch: {}, // Allow manual trigger
    },
    jobs: jobs.reduce((acc, job) => {
      acc[job.id] = {
        "runs-on": "ubuntu-latest",
        steps: [
          {
            name: `Run ${job.name}`,
            run: `curl -X POST $\{{ secrets.APP_URL }}${job.handler} -H "Authorization: Bearer $\{{ secrets.CRON_SECRET }}"`,
          },
        ],
      };
      return acc;
    }, {} as Record<string, any>),
  };

  return `# This workflow is auto-generated from scheduling.ts
${JSON.stringify(workflow, null, 2)}`;
}

/**
 * Cron job execution logger
 * Tracks execution history for monitoring
 */
export interface CronExecutionLog {
  jobId: string;
  executedAt: Date;
  duration: number; // milliseconds
  success: boolean;
  error?: string;
  affectedUsers?: number;
  notificationsSent?: number;
}

/**
 * Log cron job execution
 * In production, this would write to a database or monitoring service
 */
export function logCronExecution(log: CronExecutionLog): void {
  console.log(`[CronScheduler] Job executed:`, {
    jobId: log.jobId,
    executedAt: log.executedAt.toISOString(),
    duration: `${log.duration}ms`,
    success: log.success,
    affectedUsers: log.affectedUsers,
    notificationsSent: log.notificationsSent,
    error: log.error,
  });

  // TODO: Store in database for monitoring dashboard
  // await prisma.cronExecutionLog.create({ data: log });
}

/**
 * Retry policy for failed cron jobs
 */
export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number; // exponential backoff
  initialDelayMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelayMs: 1000,
};

/**
 * Execute with retry logic
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= policy.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[CronScheduler] Attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < policy.maxRetries) {
        const delayMs = policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attempt);
        console.log(`[CronScheduler] Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error("Unknown error during retry");
}

/**
 * Check if cron job should run based on environment
 */
export function shouldRunCron(): boolean {
  // Don't run cron jobs in development unless explicitly enabled
  if (process.env.NODE_ENV === "development" && !process.env.ENABLE_CRON) {
    return false;
  }

  // Don't run in CI/test environments
  if (process.env.CI === "true" || process.env.NODE_ENV === "test") {
    return false;
  }

  return true;
}

/**
 * Verify cron secret for security
 * All cron endpoints should check this
 */
export function verifyCronSecret(providedSecret: string | null): boolean {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn("[CronScheduler] CRON_SECRET not set - cron endpoints are unprotected!");
    return true; // Allow in development
  }

  return providedSecret === cronSecret;
}
