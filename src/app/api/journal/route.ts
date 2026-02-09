import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createJournalEntry, getJournalEntries, JournalEntryInput } from "@/modules/journal/service";
import { JournalFilters } from "@/modules/journal/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/journal
 * Retrieve journal entries with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Parse query parameters for filters
    const { searchParams } = new URL(request.url);
    const filters: JournalFilters = {};

    const startDate = searchParams.get("startDate");
    if (startDate) filters.startDate = new Date(startDate);

    const endDate = searchParams.get("endDate");
    if (endDate) filters.endDate = new Date(endDate);

    const categories = searchParams.get("categories");
    if (categories) filters.categories = categories.split(",") as any[];

    const enseigne = searchParams.get("enseigne");
    if (enseigne) filters.enseigne = enseigne;

    // Get entries
    const entries = await getJournalEntries(user.id, filters);

    return NextResponse.json({
      success: true,
      entries,
      count: entries.length,
    });
  } catch (error) {
    console.error("[GET /api/journal] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du journal" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/journal
 * Create a new journal entry from manual entry data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { entryData } = body as { entryData: JournalEntryInput };

    if (!entryData || !entryData.montantTTC) {
      return NextResponse.json(
        { error: "Données de l'entrée manquantes ou invalides" },
        { status: 400 }
      );
    }

    // Validate montantTTC is positive
    if (entryData.montantTTC <= 0) {
      return NextResponse.json(
        { error: "Le montant doit être supérieur à 0" },
        { status: 400 }
      );
    }

    // Create journal entry
    const entry = await createJournalEntry(user.id, entryData);

    console.log(
      `[POST /api/journal] Created entry: ${entry.enseigne || "Unknown"} - ${entry.montantTTC}€`
    );

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("[POST /api/journal] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'entrée" },
      { status: 500 }
    );
  }
}
