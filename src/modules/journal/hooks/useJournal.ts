"use client";

import { useState, useEffect, useCallback } from "react";
import { JournalEntryData, JournalFilters } from "../types";
import { TicketData } from "@/modules/tickets/types";

interface UseJournalReturn {
  // State
  entries: JournalEntryData[];
  filters: JournalFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadEntries: () => Promise<void>;
  addEntry: (ticketData: TicketData) => Promise<void>;
  updateEntry: (entryId: string, updates: Partial<JournalEntryData>) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  setFilters: (filters: JournalFilters) => void;
  clearFilters: () => void;
}

export function useJournal(): UseJournalReturn {
  const [entries, setEntries] = useState<JournalEntryData[]>([]);
  const [filters, setFiltersState] = useState<JournalFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load entries from API
  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate.toISOString());
      if (filters.endDate) params.append("endDate", filters.endDate.toISOString());
      if (filters.categories) params.append("categories", filters.categories.join(","));
      if (filters.enseigne) params.append("enseigne", filters.enseigne);

      const response = await fetch(`/api/journal?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement");
      }

      setEntries(data.entries || []);
    } catch (err) {
      console.error("[useJournal] Load error:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Add new entry
  const addEntry = useCallback(async (ticketData: TicketData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'ajout");
      }

      // Reload entries to get updated list
      await loadEntries();
    } catch (err) {
      console.error("[useJournal] Add error:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadEntries]);

  // Update entry
  const updateEntry = useCallback(async (
    entryId: string,
    updates: Partial<JournalEntryData>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      // Reload entries to get updated list
      await loadEntries();
    } catch (err) {
      console.error("[useJournal] Update error:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadEntries]);

  // Delete entry
  const deleteEntry = useCallback(async (entryId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      // Reload entries to get updated list
      await loadEntries();
    } catch (err) {
      console.error("[useJournal] Delete error:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadEntries]);

  // Set filters and reload
  const setFilters = useCallback((newFilters: JournalFilters) => {
    setFiltersState(newFilters);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  // Load entries on mount and when filters change
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries,
    filters,
    isLoading,
    error,
    loadEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    setFilters,
    clearFilters,
  };
}
