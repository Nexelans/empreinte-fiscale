import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/modules/admin/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/seed
 * Seeds the Référentiel database with initial data
 *
 * DANGER: This will clear all existing Référentiel data!
 * Only use this for initial setup or after a complete reset.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request, "manage_referentiel");
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    // Import seed functions from seed.ts
    const seedModule = await import("@/../prisma/seed");

    console.log("🌱 Starting manual seed via API...");

    // Execute the seed
    await seedModule.main();

    console.log("✅ Seed completed successfully via API!");

    return NextResponse.json({
      success: true,
      message: "Référentiel seeded successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Seed failed:", error);
    return NextResponse.json(
      {
        error: "Seed failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
