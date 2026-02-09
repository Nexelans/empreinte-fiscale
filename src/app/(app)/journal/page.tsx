"use client";

import { useState, useEffect } from "react";
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
import { TimelineView } from "@/components/journal/TimelineView";
import { AddEntryForm } from "@/components/journal/AddEntryForm";
import { EditEntryModal } from "@/components/journal/EditEntryModal";
import { MonthlyChart } from "@/components/journal/MonthlyChart";
import { DailyScoreImpact } from "@/components/journal/DailyScoreImpact";
import { JournalEntryData, SpendingCategory, SPENDING_CATEGORY_LABELS } from "@/modules/journal/types";
import { getCurrentYearAggregation } from "@/modules/journal/aggregations";
import { StreakBanner } from "@/components/gamification/StreakBanner";
import { FreezeModal } from "@/components/gamification/FreezeModal";
import { ChallengesCarousel } from "@/components/gamification/ChallengesCarousel";
import { ChallengeCompletionToast, useChallengeCompletionToast } from "@/components/gamification/ChallengeCompletionToast";
import type { StreakData, UserChallenge } from "@/modules/gamification/types";

type ViewMode = "timeline" | "add";

export default function JournalPage() {
  const journal = useJournal();
  const { toast, showToast, hideToast } = useChallengeCompletionToast();
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [editingEntry, setEditingEntry] = useState<JournalEntryData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SpendingCategory | "all">("all");
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState<UserChallenge[]>([]);
  const [previousChallenges, setPreviousChallenges] = useState<UserChallenge[]>([]);

  // Fetch streak data and challenges
  useEffect(() => {
    async function fetchGamificationData() {
      try {
        // Fetch streak
        const streakRes = await fetch("/api/gamification/streak");
        if (streakRes.ok) {
          const streakData = await streakRes.json();
          setStreak(streakData.streak);
        }

        // Fetch active challenges
        const challengesRes = await fetch("/api/gamification/challenges");
        if (challengesRes.ok) {
          const challengesData = await challengesRes.json();
          const active = challengesData.challenges.filter(
            (c: UserChallenge) => c.status === "ACTIVE"
          );
          setActiveChallenges(active);
        }
      } catch (error) {
        console.error("[Journal] Error fetching gamification data:", error);
      }
    }
    fetchGamificationData();
  }, []);

  // Refresh streak and challenges when a new entry is added
  useEffect(() => {
    if (journal.entries.length > 0) {
      const refreshGamificationData = async () => {
        try {
          // Refresh streak
          const streakRes = await fetch("/api/gamification/streak");
          if (streakRes.ok) {
            const streakData = await streakRes.json();
            setStreak(streakData.streak);
          }

          // Refresh challenges
          const challengesRes = await fetch("/api/gamification/challenges");
          if (challengesRes.ok) {
            const challengesData = await challengesRes.json();
            const allChallenges = challengesData.challenges || [];
            const active = allChallenges.filter(
              (c: UserChallenge) => c.status === "ACTIVE"
            );

            // Detect newly completed challenges
            const newlyCompleted = allChallenges.filter(
              (c: UserChallenge) =>
                c.status === "COMPLETED" &&
                previousChallenges.find(
                  (pc) => pc.id === c.id && pc.status === "ACTIVE"
                )
            );

            // Show toast for each newly completed challenge
            if (newlyCompleted.length > 0) {
              // Show only the first one to avoid overwhelming
              const completed = newlyCompleted[0];
              const xpAwarded = completed.definition?.recompenseXP || 50;
              const educationalTip = completed.definition?.educationalTip;
              const relatedGlossaryTerms = completed.definition?.relatedGlossaryTerms || [];
              showToast(
                completed.definition?.nom || "Défi terminé",
                xpAwarded,
                educationalTip,
                relatedGlossaryTerms
              );
            }

            setPreviousChallenges(allChallenges);
            setActiveChallenges(active);
          }
        } catch (error) {
          console.error("[Journal] Error refreshing gamification data:", error);
        }
      };
      refreshGamificationData();
    }
  }, [journal.entries.length]);

  // Calculate yearly aggregation for charts
  const yearlyAgg = getCurrentYearAggregation(journal.entries);

  // Estimate daily services value (simplified: annual services / 365)
  const estimatedDailyServices = 30;

  const handleFreezeClick = () => {
    if (!streak || streak.freezeTokens <= 0) return;
    setShowFreezeModal(true);
  };

  const handleFreezeConfirm = async () => {
    if (!streak || streak.freezeTokens <= 0) return;

    try {
      const res = await fetch("/api/gamification/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "use_freeze_token" }),
      });

      if (res.ok) {
        const data = await res.json();
        setStreak(data.streak);
      }
    } catch (error) {
      console.error("[Journal] Error using freeze token:", error);
    }
  };

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

  const handleAddEntry = async (entryData: any) => {
    try {
      await journal.addEntry(entryData);
      setViewMode("timeline");
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Journal fiscal</h1>
        <p className="text-gray-600 mt-2">
          Suivez vos dépenses quotidiennes et visualisez les taxes que vous payez
        </p>
      </div>

      {/* Streak Banner */}
      {streak && (
        <div className="mb-6">
          <StreakBanner streak={streak} onFreezeClick={handleFreezeClick} />
        </div>
      )}

      {/* Active Challenges Carousel */}
      {activeChallenges.length > 0 && (
        <div className="mb-6">
          <ChallengesCarousel challenges={activeChallenges} />
        </div>
      )}

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

      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          isOpen={true}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEdit}
          isSubmitting={journal.isLoading}
        />
      )}

      {/* Freeze Modal */}
      {streak && (
        <FreezeModal
          isOpen={showFreezeModal}
          onClose={() => setShowFreezeModal(false)}
          onConfirm={handleFreezeConfirm}
          freezeTokens={streak.freezeTokens}
        />
      )}

      {/* Challenge Completion Toast */}
      <ChallengeCompletionToast
        show={toast.show}
        challengeName={toast.challengeName}
        xpAwarded={toast.xpAwarded}
        educationalTip={toast.educationalTip}
        relatedGlossaryTerms={toast.relatedGlossaryTerms}
        onClose={hideToast}
      />
    </div>
  );
}
