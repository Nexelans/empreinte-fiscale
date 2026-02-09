"use client";

import { Button } from "@/components/ui/button";
import { JournalEntryData } from "@/modules/journal/types";
import { SPENDING_CATEGORY_LABELS } from "@/modules/journal/types";
import { getEntryTotalTax } from "@/modules/journal/service";

interface EntryCardProps {
  entry: JournalEntryData;
  onEdit?: (entry: JournalEntryData) => void;
  onDelete?: (entryId: string) => void;
}

const STATUS_BADGE = {
  VERIFIE: { label: "✓ Vérifié", className: "bg-green-100 text-green-800" },
  DECLARE: { label: "Déclaré", className: "bg-blue-100 text-blue-800" },
  ESTIME: { label: "Estimé", className: "bg-gray-100 text-gray-800" },
};

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const totalTax = getEntryTotalTax(entry);
  const categoryLabel = SPENDING_CATEGORY_LABELS[entry.category] || entry.category;
  const statusBadge = STATUS_BADGE[entry.status];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Left: Enseigne + Category */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {entry.enseigne ? (
              <h4 className="font-semibold text-gray-900">{entry.enseigne}</h4>
            ) : (
              <h4 className="font-semibold text-gray-400 italic">Enseigne inconnue</h4>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge.className}`}
            >
              {statusBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <span className="flex items-center gap-1">
              <span className="text-gray-400">📁</span>
              {categoryLabel}
            </span>
            {entry.notes && (
              <span className="text-xs text-gray-500 italic truncate max-w-xs">
                {entry.notes}
              </span>
            )}
          </div>
        </div>

        {/* Right: Amount + Taxes */}
        <div className="text-right ml-4">
          <div className="text-xl font-bold text-gray-900">
            {entry.montantTTC.toFixed(2)} €
          </div>
          <div className="text-xs text-red-600 mt-1">
            dont {totalTax.toFixed(2)} € de taxes
          </div>
          <div className="text-xs text-gray-500 mt-1">
            TVA {entry.taxBreakdown.tauxTVA}%
          </div>
        </div>
      </div>

      {/* Tax breakdown details (collapsible or tooltip in future) */}
      {entry.taxBreakdown.ticpe && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
          <span className="mr-3">
            TVA: {entry.taxBreakdown.tva.toFixed(2)} €
          </span>
          <span>
            TICPE: {entry.taxBreakdown.ticpe.toFixed(2)} €
          </span>
        </div>
      )}

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(entry)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              ✏️ Modifier
            </Button>
          )}
          {onDelete && entry.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(entry.id!)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              🗑️ Supprimer
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
