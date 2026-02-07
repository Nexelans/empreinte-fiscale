import { prisma } from "@/lib/prisma";
import { JournalEntryData, JournalFilters } from "./types";
import { TicketData } from "../tickets/types";
import { calculateTaxBreakdown, getTotalTax } from "./taxRates";

/**
 * Create a journal entry from ticket data
 *
 * @param userId - User ID
 * @param ticketData - Ticket data from scan or manual entry
 * @returns Created journal entry
 */
export async function createJournalEntry(
  userId: string,
  ticketData: TicketData
): Promise<JournalEntryData> {
  // Calculate tax breakdown
  const taxBreakdown = await calculateTaxBreakdown(
    ticketData.category || "autre",
    ticketData.montantTTC,
    ticketData.montantTVA
  );

  // Prepare entry data
  const entryData: JournalEntryData = {
    userId,
    date: ticketData.date || new Date(),
    enseigne: ticketData.enseigne,
    category: ticketData.category || "autre",
    montantTTC: ticketData.montantTTC,
    montantHT: ticketData.montantHT,
    taxBreakdown,
    status: ticketData.sourceType === "SCAN" ? "VERIFIE" : "DECLARE",
  };

  // Save to database
  const created = await prisma.journalEntry.create({
    data: {
      userId: entryData.userId,
      date: entryData.date,
      enseigne: entryData.enseigne,
      categorie: entryData.category,
      montantTTC: entryData.montantTTC,
      montantTVA: ticketData.montantTVA,
      detailLignes: entryData.taxBreakdown as any, // Prisma Json type
      statut: entryData.status,
    },
  });

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
