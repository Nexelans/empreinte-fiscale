"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJournal } from "@/modules/journal/hooks/useJournal";
import { useTicketScan } from "@/modules/tickets/hooks/useTicketScan";
import { TimelineView } from "@/components/journal/TimelineView";
import { AddEntryForm } from "@/components/journal/AddEntryForm";
import { EditEntryModal } from "@/components/journal/EditEntryModal";
import { MonthlyChart } from "@/components/journal/MonthlyChart";
import { DailyScoreImpact } from "@/components/journal/DailyScoreImpact";
import { CameraCapture } from "@/components/scan/CameraCapture";
import { OCRProgress } from "@/components/scan/OCRProgress";
import { TicketValidation } from "@/components/scan/TicketValidation";
import { JournalEntryData } from "@/modules/journal/types";
import { getCurrentYearAggregation } from "@/modules/journal/aggregations";
import { SpendingCategory, SPENDING_CATEGORY_LABELS } from "@/modules/tickets/types";

type ViewMode = "timeline" | "add" | "scan";

export default function JournalPage() {
  const journal = useJournal();
  const ticketScan = useTicketScan();
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [editingEntry, setEditingEntry] = useState<JournalEntryData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SpendingCategory | "all">("all");

  // Calculate yearly aggregation for charts
  const yearlyAgg = getCurrentYearAggregation(journal.entries);

  // Estimate daily services value (simplified: annual services / 365)
  const estimatedDailyServices = 30;

  // Filter entries by search query and category
  const filteredEntries = journal.entries.filter((e) => {
    const matchesSearch = !searchQuery || e.enseigne?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (entry: JournalEntryData) => {
    setEditingEntry(entry);
  };

  const handleSaveEdit = async (updates: Partial<JournalEntryData>) => {
    if (!editingEntry?.id) return;
    try {
      await journal.updateEntry(editingEntry.id, updates);
      setEditingEntry(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) return;
    try {
      await journal.deleteEntry(entryId);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleAddEntry = async (ticketData: any) => {
    try {
      await journal.addEntry(ticketData);
      setViewMode("timeline");
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleScanConfirm = async (ticketData: any) => {
    try {
      await ticketScan.confirmValidation(ticketData);
      await journal.addEntry(ticketData);
      ticketScan.reset();
      setViewMode("timeline");
    } catch (err) {
      // Error handled in hooks
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal fiscal</h1>
          <p className="text-gray-600 mt-2">
            Suivez vos dépenses quotidiennes et visualisez les taxes que vous payez
          </p>
        </div>
        <Button
          onClick={() => setViewMode("scan")}
          className="flex items-center gap-2"
        >
          <span>📸</span>
          <span>Scanner un ticket</span>
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => setViewMode("timeline")}
          variant={viewMode === "timeline" ? "default" : "outline"}
        >
          📋 Timeline
        </Button>
        <Button
          onClick={() => setViewMode("add")}
          variant={viewMode === "add" ? "default" : "outline"}
        >
          ➕ Ajouter une dépense
        </Button>
        <Button
          onClick={() => setViewMode("scan")}
          variant={viewMode === "scan" ? "default" : "outline"}
        >
          📸 Scanner un ticket
        </Button>
      </div>

      {viewMode === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Rechercher une enseigne..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value as SpendingCategory | "all")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {Object.entries(SPENDING_CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {journal.isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Chargement...</p>
                </div>
              ) : journal.error ? (
                <div className="text-center py-8 text-red-600">
                  <p>{journal.error}</p>
                  <Button onClick={journal.loadEntries} className="mt-4">
                    Réessayer
                  </Button>
                </div>
              ) : (
                <TimelineView
                  entries={filteredEntries}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            {filteredEntries.length > 0 && (
              <DailyScoreImpact
                dailyTaxes={
                  filteredEntries
                    .filter((e) => {
                      const today = new Date().toISOString().split("T")[0];
                      const entryDate = new Date(e.date).toISOString().split("T")[0];
                      return entryDate === today;
                    })
                    .reduce(
                      (sum, e) =>
                        sum +
                        (e.taxBreakdown.tva +
                          (e.taxBreakdown.ticpe || 0) +
                          (e.taxBreakdown.autresTaxes || 0)),
                      0
                    )
                }
                dailyServicesValue={estimatedDailyServices}
              />
            )}

            {yearlyAgg && yearlyAgg.byMonth.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <MonthlyChart monthlyData={yearlyAgg.byMonth} />
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "add" && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-6">
          <AddEntryForm
            onSubmit={handleAddEntry}
            onCancel={() => setViewMode("timeline")}
            isSubmitting={journal.isLoading}
          />
        </div>
      )}

      {viewMode === "scan" && (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-6">
          {ticketScan.step === "idle" && (
            <CameraCapture
              onCapture={ticketScan.startScan}
              disabled={ticketScan.isLoading}
            />
          )}

          {ticketScan.step === "scanning" && (
            <OCRProgress estimatedTimeMs={ticketScan.estimatedTimeMs} />
          )}

          {ticketScan.step === "validating" && ticketScan.scanResult && (
            <TicketValidation
              scanResult={ticketScan.scanResult}
              onConfirm={handleScanConfirm}
              onCancel={() => {
                ticketScan.reset();
                setViewMode("timeline");
              }}
              isSubmitting={ticketScan.isLoading}
            />
          )}

          {ticketScan.step === "success" && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ticket ajouté !</h3>
              <Button onClick={() => setViewMode("timeline")} className="mt-4">
                Retour au journal
              </Button>
            </div>
          )}

          {ticketScan.step === "error" && ticketScan.error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✕</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h3>
              <p className="text-red-600 mb-4">{ticketScan.error}</p>
              <Button onClick={ticketScan.reset} variant="outline">
                Réessayer
              </Button>
            </div>
          )}
        </div>
      )}

      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          isOpen={true}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEdit}
          isSubmitting={journal.isLoading}
        />
      )}
    </div>
  );
}
