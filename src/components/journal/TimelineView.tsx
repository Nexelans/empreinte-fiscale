"use client";

import { JournalEntryData } from "@/modules/journal/types";
import { groupEntriesByDay, getDailyTaxTotal } from "@/modules/journal/aggregations";
import { EntryCard } from "./EntryCard";

interface TimelineViewProps {
  entries: JournalEntryData[];
  onEdit?: (entry: JournalEntryData) => void;
  onDelete?: (entryId: string) => void;
}

export function TimelineView({ entries, onEdit, onDelete }: TimelineViewProps) {
  const groupedByDay = groupEntriesByDay(entries);
  const sortedDays = Array.from(groupedByDay.keys()).sort().reverse(); // Most recent first

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucune dépense enregistrée
        </h3>
        <p className="text-gray-600">
          Ajoutez vos dépenses manuellement pour commencer à suivre vos taxes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDays.map((dayKey) => {
        const dayEntries = groupedByDay.get(dayKey)!;
        const date = new Date(dayKey);
        const dailyTaxes = getDailyTaxTotal(dayEntries);
        const dailyTotal = dayEntries.reduce((sum, e) => sum + e.montantTTC, 0);

        return (
          <div key={dayKey} className="relative">
            {/* Date header with daily summary */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {date.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {dayEntries.length} dépense{dayEntries.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total dépensé</div>
                  <div className="text-xl font-bold text-gray-900">
                    {dailyTotal.toFixed(2)} €
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    dont {dailyTaxes.toFixed(2)} € de taxes
                  </div>
                </div>
              </div>
            </div>

            {/* Entries for this day */}
            <div className="space-y-3 pl-4 border-l-2 border-gray-200">
              {dayEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
