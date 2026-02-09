import { prisma } from "@/lib/prisma";
import { JournalEntryData, JournalFilters, SpendingCategory } from "./types";
import { calculateTaxBreakdown, getTotalTax } from "./taxRates";
import { emitGameEvent } from "../gamification/events";
import { updateStreak } from "../gamification/streak";

/**
 * Simplified entry data for journal creation
 */
export interface JournalEntryInput {
  date?: Date;
  enseigne?: string;
  category?: SpendingCategory;
  montantTTC: number;
  montantHT?: number;
  montantTVA?: number;
  notes?: string;
}

/**
 * Create a journal entry from manual entry data
 *
 * @param userId - User ID
 * @param entryInput - Entry data from manual entry
 * @returns Created journal entry
 */
export async function createJournalEntry(
  userId: string,
  entryInput: JournalEntryInput
): Promise<JournalEntryData> {
  // Calculate tax breakdown
  const taxBreakdown = await calculateTaxBreakdown(
    entryInput.category || "autre",
    entryInput.montantTTC,
    entryInput.montantTVA
  );

  // Prepare entry data
  const entryData: JournalEntryData = {
    userId,
    date: entryInput.date || new Date(),
    enseigne: entryInput.enseigne,
    category: entryInput.category || "autre",
    montantTTC: entryInput.montantTTC,
    montantHT: entryInput.montantHT,
    taxBreakdown,
    status: "DECLARE", // All manual entries are declared
    notes: entryInput.notes,
  };

  // Save to database
  const created = await prisma.journalEntry.create({
    data: {
      userId: entryData.userId,
      date: entryData.date,
      enseigne: entryData.enseigne,
      categorie: entryData.category,
      montantTTC: entryData.montantTTC,
      montantTVA: entryInput.montantTVA,
      detailLignes: entryData.taxBreakdown as any, // Prisma Json type
      statut: entryData.status,
    },
  });

  // Émettre l'événement pour la gamification
  await emitGameEvent("JOURNAL_ENTRY_CREATED", userId, {
    entryId: created.id,
    category: entryData.category,
    montantTTC: entryData.montantTTC,
    isScanned: false,
  });

  // Mettre à jour la série (streak) de l'utilisateur
  await updateStreak(userId);

  return {
    ...entryData,
    id: created.id,
    createdAt: created.createdAt,
  };
}

/**
 * Get journal entries for a user with optional filters
 *
 * @param userId - User ID
 * @param filters - Optional filters
 * @returns Array of journal entries
 */
export async function getJournalEntries(
  userId: string,
  filters?: JournalFilters
): Promise<JournalEntryData[]> {
  const where: any = { userId };

  // Apply filters
  if (filters) {
    if (filters.startDate) {
      where.date = { ...where.date, gte: filters.startDate };
    }
    if (filters.endDate) {
      where.date = { ...where.date, lte: filters.endDate };
    }
    if (filters.categories && filters.categories.length > 0) {
      where.categorie = { in: filters.categories };
    }
    if (filters.minAmount !== undefined) {
      where.montantTTC = { ...where.montantTTC, gte: filters.minAmount };
    }
    if (filters.maxAmount !== undefined) {
      where.montantTTC = { ...where.montantTTC, lte: filters.maxAmount };
    }
    if (filters.enseigne) {
      where.enseigne = { contains: filters.enseigne, mode: "insensitive" };
    }
    if (filters.status && filters.status.length > 0) {
      where.statut = { in: filters.status };
    }
  }

  const entries = await prisma.journalEntry.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return entries.map((entry) => ({
    id: entry.id,
    userId: entry.userId,
    date: entry.date,
    enseigne: entry.enseigne || undefined,
    category: entry.categorie as any,
    montantTTC: entry.montantTTC,
    montantHT: entry.montantTVA ? entry.montantTTC - entry.montantTVA : undefined,
    taxBreakdown: entry.detailLignes as any,
    status: entry.statut as any,
    createdAt: entry.createdAt,
  }));
}

/**
 * Get a single journal entry by ID
 *
 * @param userId - User ID
 * @param entryId - Entry ID
 * @returns Journal entry or null if not found
 */
export async function getJournalEntry(
  userId: string,
  entryId: string
): Promise<JournalEntryData | null> {
  const entry = await prisma.journalEntry.findFirst({
    where: { id: entryId, userId },
  });

  if (!entry) return null;

  return {
    id: entry.id,
    userId: entry.userId,
    date: entry.date,
    enseigne: entry.enseigne || undefined,
    category: entry.categorie as any,
    montantTTC: entry.montantTTC,
    montantHT: entry.montantTVA ? entry.montantTTC - entry.montantTVA : undefined,
    taxBreakdown: entry.detailLignes as any,
    status: entry.statut as any,
    createdAt: entry.createdAt,
  };
}

/**
 * Update a journal entry
 *
 * @param userId - User ID
 * @param entryId - Entry ID
 * @param updates - Partial entry data to update
 * @returns Updated journal entry
 */
export async function updateJournalEntry(
  userId: string,
  entryId: string,
  updates: Partial<Omit<JournalEntryData, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<JournalEntryData> {
  // Recalculate tax breakdown if amount or category changed
  if (updates.montantTTC || updates.category) {
    const existing = await getJournalEntry(userId, entryId);
    if (!existing) {
      throw new Error("Entry not found");
    }

    const montantTTC = updates.montantTTC || existing.montantTTC;
    const category = updates.category || existing.category;
    const montantHT = updates.montantHT || existing.montantHT;
    const montantTVA = montantHT ? montantTTC - montantHT : undefined;

    updates.taxBreakdown = await calculateTaxBreakdown(category, montantTTC, montantTVA);
  }

  const updated = await prisma.journalEntry.update({
    where: { id: entryId, userId },
    data: {
      date: updates.date,
      enseigne: updates.enseigne,
      categorie: updates.category,
      montantTTC: updates.montantTTC,
      montantTVA: updates.montantHT && updates.montantTTC ? updates.montantTTC - updates.montantHT : undefined,
      detailLignes: updates.taxBreakdown as any,
      statut: updates.status,
    },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    date: updated.date,
    enseigne: updated.enseigne || undefined,
    category: updated.categorie as any,
    montantTTC: updated.montantTTC,
    montantHT: updated.montantTVA ? updated.montantTTC - updated.montantTVA : undefined,
    taxBreakdown: updated.detailLignes as any,
    status: updated.statut as any,
    createdAt: updated.createdAt,
  };
}

/**
 * Delete a journal entry
 *
 * @param userId - User ID
 * @param entryId - Entry ID
 */
export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  await prisma.journalEntry.delete({
    where: { id: entryId, userId },
  });
}

/**
 * Get total tax amount for a journal entry
 *
 * @param entry - Journal entry
 * @returns Total tax amount
 */
export function getEntryTotalTax(entry: JournalEntryData): number {
  return getTotalTax(entry.taxBreakdown);
}
