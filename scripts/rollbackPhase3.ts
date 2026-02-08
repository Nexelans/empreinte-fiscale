/**
 * Rollback script for Phase 3 schema changes
 *
 * This script safely rolls back all database changes introduced in Phase 3:
 * - Removes Phase 3 tables (UserBadge, UserChallenge, UserStreak, etc.)
 * - Removes Phase 3 Référentiel entries
 * - Does NOT touch core tables (User, ProfilFiscal, JournalEntry, etc.)
 *
 * WARNING: This will delete all gamification data, simulations, notifications, etc.
 *
 * Usage:
 *   npm run rollback:phase3 [--dry-run] [--confirm]
 *
 * Flags:
 *   --dry-run: Show what would be deleted without actually deleting
 *   --confirm: Skip confirmation prompt (use with caution!)
 */

import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isConfirmed = args.includes("--confirm");

// Tables to drop (in order, respecting foreign key constraints)
const PHASE_3_TABLES = [
  "UserBadge",
  "UserChallenge",
  "UserStreak",
  "Notification",
  "UserNotificationPreferences",
  "Simulation",
  "ScoreHistory",
  "SharedAnimation",
  "QuizAttempt",
];

// Référentiel categories to remove
const PHASE_3_REFERENTIEL_CATEGORIES = [
  "BADGE_DEFINITION",
  "CHALLENGE_DEFINITION",
  "NOTIFICATION_TEMPLATE",
  "FISCAL_CALENDAR",
];

async function askConfirmation(question: string): Promise<boolean> {
  if (isConfirmed) return true;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
}

async function countRecords(table: string): Promise<number> {
  try {
    const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*) as count FROM "${table}"`
    );
    return result[0] ? Number(result[0].count) : 0;
  } catch (error) {
    // Table might not exist
    return 0;
  }
}

async function rollbackPhase3() {
  console.log("🔄 Phase 3 Rollback Script\n");

  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }

  // Step 1: Count records in each table
  console.log("📊 Analyzing Phase 3 data...\n");

  const tableCounts: Record<string, number> = {};
  for (const table of PHASE_3_TABLES) {
    const count = await countRecords(table);
    tableCounts[table] = count;
    if (count > 0) {
      console.log(`  ${table}: ${count} records`);
    }
  }

  // Count Référentiel entries
  const referentielCount = await prisma.referentiel.count({
    where: {
      categorie: {
        in: PHASE_3_REFERENTIEL_CATEGORIES,
      },
    },
  });
  console.log(`  Référentiel (Phase 3): ${referentielCount} entries`);

  // Step 2: Show summary
  const totalRecords = Object.values(tableCounts).reduce((sum, count) => sum + count, 0) + referentielCount;

  console.log(`\n📋 Summary:`);
  console.log(`  Total records to delete: ${totalRecords}`);
  console.log(`  Tables to drop: ${PHASE_3_TABLES.length}`);

  if (totalRecords === 0) {
    console.log("\n✅ No Phase 3 data found. Nothing to rollback.");
    return;
  }

  // Step 3: Confirm
  if (!isDryRun) {
    console.log("\n⚠️  WARNING: This action cannot be undone!");
    console.log("   All gamification progress, simulations, and notifications will be permanently deleted.");

    const confirmed = await askConfirmation("\nAre you sure you want to proceed?");
    if (!confirmed) {
      console.log("\n❌ Rollback cancelled.");
      return;
    }
  }

  // Step 4: Delete Référentiel entries
  console.log("\n🗑️  Removing Référentiel entries...");
  if (!isDryRun) {
    const deleted = await prisma.referentiel.deleteMany({
      where: {
        categorie: {
          in: PHASE_3_REFERENTIEL_CATEGORIES,
        },
      },
    });
    console.log(`   Deleted ${deleted.count} Référentiel entries`);
  } else {
    console.log(`   Would delete ${referentielCount} Référentiel entries`);
  }

  // Step 5: Drop tables (in reverse order to respect foreign keys)
  console.log("\n🗑️  Dropping Phase 3 tables...");
  for (const table of PHASE_3_TABLES.reverse()) {
    if ((tableCounts[table] || 0) > 0 || !isDryRun) {
      if (!isDryRun) {
        try {
          await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
          console.log(`   ✓ Dropped table: ${table}`);
        } catch (error) {
          console.log(`   ⚠️  Failed to drop table: ${table} (might not exist)`);
        }
      } else {
        console.log(`   Would drop table: ${table}`);
      }
    }
  }

  // Step 6: Done
  if (isDryRun) {
    console.log("\n✅ Dry run complete. No changes were made.");
    console.log("   Run without --dry-run to actually perform the rollback.");
  } else {
    console.log("\n✅ Phase 3 rollback complete!");
    console.log("   The database has been restored to pre-Phase 3 state.");
    console.log("   Run 'npx prisma migrate reset' if you need to recreate the schema.");
  }
}

// Run the rollback
rollbackPhase3()
  .catch((error) => {
    console.error("\n❌ Rollback failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
