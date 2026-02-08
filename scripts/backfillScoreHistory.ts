/**
 * Backfill Score History Script
 *
 * This script creates score history entries for existing users who have profiles
 * but no historical score data. It calculates their current score and saves it
 * to the current month.
 *
 * Usage:
 *   npm run backfill:score-history
 *
 * Options:
 *   --dry-run: Show what would be done without making changes
 *   --user-id=<id>: Backfill only for a specific user
 */

import { prisma } from "../src/lib/prisma";
import { calculerScoreFiscal } from "../src/modules/score";
import { saveScoreHistory } from "../src/modules/score/history";
import type { ProfilFiscalComplete } from "../src/modules/profil/types";

interface BackfillResult {
  total: number;
  success: number;
  skipped: number;
  failed: number;
  errors: Array<{ userId: string; error: string }>;
}

async function backfillScoreHistory(options: {
  dryRun?: boolean;
  userId?: string;
}): Promise<BackfillResult> {
  const { dryRun = false, userId } = options;

  const result: BackfillResult = {
    total: 0,
    success: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  console.log("\n🔄 Starting Score History Backfill");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  if (userId) {
    console.log(`Target: Single user (${userId})`);
  }
  console.log("---");

  try {
    // Fetch users with profiles
    const whereClause = userId
      ? { id: userId, profilFiscal: { isNot: null } }
      : { profilFiscal: { isNot: null } };

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        profilFiscal: true,
      },
    });

    result.total = users.length;
    console.log(`\n📊 Found ${result.total} users with profiles\n`);

    for (const user of users) {
      console.log(`Processing user: ${user.email || user.id}`);

      try {
        // Check if user already has score history for current month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const existingHistory = await prisma.scoreHistory.findFirst({
          where: {
            userId: user.id,
            year: currentYear,
            month: currentMonth,
          },
        });

        if (existingHistory) {
          console.log(`  ⏭️  Skipped - Already has history for ${currentYear}-${currentMonth}`);
          result.skipped++;
          continue;
        }

        if (dryRun) {
          console.log(`  ✅ Would create history entry for ${currentYear}-${currentMonth}`);
          result.success++;
          continue;
        }

        // Build profil complete from Prisma record
        const profilRecord = user.profilFiscal!;
        const profil: Partial<ProfilFiscalComplete> = {
          situation: {
            statut: profilRecord.statut as any,
            nombreParts: profilRecord.nombreParts || null,
            commune: profilRecord.commune || null,
            age: profilRecord.age || null,
          },
          revenus: {
            salaireBrut: profilRecord.salaireBrut || null,
            salaireNet: profilRecord.salaireNet || null,
            typeContrat: profilRecord.typeContrat as any,
            revenusFonciers: profilRecord.revenusFonciers || null,
            revenusCapitaux: profilRecord.revenusCapitaux || null,
            autresRevenus: profilRecord.autresRevenus || null,
          },
          patrimoine: {
            proprietaire: profilRecord.proprietaire || null,
            valeurLocative: profilRecord.valeurLocative || null,
            taxeFonciere: profilRecord.taxeFonciere || null,
            vehicules: (profilRecord.vehicules as any) || [],
            patrimoineIFI: profilRecord.patrimoineIFI || null,
          },
          consommation: {
            mode: profilRecord.modeConsommation as any,
            budgetMensuel: (profilRecord.budgetMensuel as any) || undefined,
            detailCategories: (profilRecord.detailCategories as any) || undefined,
            alcoolTabac: (profilRecord.alcoolTabac as any) || undefined,
          },
          familleServices: {
            nombreEnfants: profilRecord.nombreEnfants || 0,
            enfants: (profilRecord.enfantsDetails as any) || [],
            frequenceServices: (profilRecord.frequenceServices as any) || {
              transportsCommun: "jamais",
              hopitalMedecin: "annuelle",
              bibliotheque: "jamais",
              equipementsSportifs: "jamais",
            },
            aides: (profilRecord.aides as any) || {
              caf: false,
              apl: false,
              rsa: false,
              bourses: false,
              chomage: false,
              cmuc: false,
            },
          },
          statusData: (profilRecord.statusData as any) || {},
        };

        // Calculate score
        const score = await calculerScoreFiscal(profil, undefined, {
          userId: user.id,
          useJournalData: true,
        });

        // Note: calculerScoreFiscal now calls saveScoreHistory internally,
        // so we don't need to call it again here. The history is already saved.

        console.log(`  ✅ Created history entry - Score: ${score.soldeNet}€, Confidence: ${score.scoreConfiance}%`);
        result.success++;
      } catch (error) {
        console.error(`  ❌ Failed:`, error);
        result.failed++;
        result.errors.push({
          userId: user.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      // Small delay to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📈 BACKFILL SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total users:     ${result.total}`);
    console.log(`✅ Success:      ${result.success}`);
    console.log(`⏭️  Skipped:      ${result.skipped} (already had history)`);
    console.log(`❌ Failed:       ${result.failed}`);
    console.log("=".repeat(60));

    if (result.errors.length > 0) {
      console.log("\n⚠️  ERRORS:");
      result.errors.forEach((err, idx) => {
        console.log(`${idx + 1}. User ${err.userId}: ${err.error}`);
      });
    }

    if (dryRun) {
      console.log("\n💡 This was a dry run. Run without --dry-run to apply changes.");
    }
  } catch (error) {
    console.error("\n❌ Fatal error during backfill:", error);
    throw error;
  }

  return result;
}

// Parse command-line arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const userIdArg = args.find((arg) => arg.startsWith("--user-id="));
const userId = userIdArg ? userIdArg.split("=")[1] : undefined;

// Run backfill
backfillScoreHistory({ dryRun, userId })
  .then((result) => {
    if (result.failed === 0) {
      console.log("\n✅ Backfill completed successfully!");
      process.exit(0);
    } else {
      console.log("\n⚠️  Backfill completed with errors.");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n💥 Backfill failed:", error);
    process.exit(1);
  });
