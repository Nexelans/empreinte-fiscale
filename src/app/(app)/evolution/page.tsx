"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { EvolutionLineChart } from "@/components/evolution/EvolutionLineChart";
import { TimeRangeSelector, TimeRange, TimeRangeFilter } from "@/components/evolution/TimeRangeSelector";
import { TrendIndicator } from "@/components/evolution/TrendIndicator";
import { MilestoneTimeline } from "@/components/evolution/MilestoneMarker";
import { DrillDownPanel } from "@/components/evolution/DrillDownPanel";
import { ExportButton } from "@/components/evolution/ExportButton";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Calendar, Download, Lightbulb } from "lucide-react";
import type { ScoreHistoryEntry } from "@/modules/score/history";
import type { TrendAnalysis, Milestone } from "@/modules/score/trends";

export default function EvolutionPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ScoreHistoryEntry | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("last_12");
  const [currentFilter, setCurrentFilter] = useState<TimeRangeFilter | undefined>();
  const [showProjection, setShowProjection] = useState(false);
  const [projectionData, setProjectionData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [currentFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (currentFilter?.startYear) params.set("startYear", currentFilter.startYear.toString());
      if (currentFilter?.startMonth) params.set("startMonth", currentFilter.startMonth.toString());
      if (currentFilter?.endYear) params.set("endYear", currentFilter.endYear.toString());
      if (currentFilter?.endMonth) params.set("endMonth", currentFilter.endMonth.toString());

      // Fetch history
      const historyRes = await fetch(`/api/score/history?${params.toString()}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.data || []);
      } else {
        setHistory([]);
      }

      // Fetch trends with milestones
      const trendsParams = new URLSearchParams(params);
      trendsParams.set("includeMilestones", "true");
      const trendsRes = await fetch(`/api/score/history/trends?${trendsParams.toString()}`);
      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setTrendAnalysis(trendsData.analysis);
        setMilestones(trendsData.milestones || []);
      } else {
        setTrendAnalysis(null);
        setMilestones([]);
      }
    } catch (error) {
      console.error("Error fetching evolution data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjection = async () => {
    try {
      const res = await fetch("/api/score/history/projection?months=6&method=linear");
      if (res.ok) {
        const data = await res.json();
        setProjectionData(data.projection || []);
      }
    } catch (error) {
      console.error("Error fetching projection:", error);
    }
  };

  const handleRangeChange = (range: TimeRange, filter?: TimeRangeFilter) => {
    setSelectedRange(range);
    setCurrentFilter(filter);
  };

  const handlePointClick = (entry: ScoreHistoryEntry) => {
    setSelectedEntry(entry);
  };

  const handleToggleProjection = async () => {
    if (!showProjection && projectionData.length === 0) {
      await fetchProjection();
    }
    setShowProjection(!showProjection);
  };

  // Calculate annual summary
  const calculateAnnualSummary = () => {
    if (history.length === 0) return null;

    const currentYear = new Date().getFullYear();
    const yearData = history.filter((h) => h.year === currentYear);

    if (yearData.length === 0) return null;

    const totalPaye = yearData.reduce((sum, h) => sum + h.scoreFiscalData.totalPaye, 0);
    const totalRecu = yearData.reduce((sum, h) => sum + h.scoreFiscalData.totalRecu, 0);
    const soldeNet = totalPaye - totalRecu;
    const avgConfidence =
      yearData.reduce((sum, h) => sum + h.confidenceScore, 0) / yearData.length;

    return {
      year: currentYear,
      months: yearData.length,
      totalPaye: Math.round(totalPaye),
      totalRecu: Math.round(totalRecu),
      soldeNet: Math.round(soldeNet),
      avgConfidence: Math.round(avgConfidence),
    };
  };

  const annualSummary = calculateAnnualSummary();

  // Find previous entry for comparison in drill-down
  const getPreviousEntry = (entry: ScoreHistoryEntry): ScoreHistoryEntry | undefined => {
    const index = history.findIndex((h) => h.id === entry.id);
    return index > 0 ? history[index - 1] : undefined;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Évolution fiscale</h1>
          <p className="text-gray-600 mb-8">Suivez l'évolution de votre situation fiscale dans le temps</p>

          <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun historique disponible</h2>
            <p className="text-gray-600 mb-6">
              Votre score fiscal est automatiquement enregistré chaque mois. Revenez bientôt pour voir votre évolution !
            </p>
            <Button onClick={() => (window.location.href = "/dashboard")}>
              Retour au dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Évolution fiscale</h1>
              <p className="text-gray-600">
                {history.length} mois de données
                {history.length > 0 && (
                  <> • Période {history[0]!.year}-{String(history[0]!.month).padStart(2, "0")} à {history[history.length - 1]!.year}-{String(history[history.length - 1]!.month).padStart(2, "0")}</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton
                startYear={currentFilter?.startYear}
                startMonth={currentFilter?.startMonth}
                endYear={currentFilter?.endYear}
                endMonth={currentFilter?.endMonth}
              />
              <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>

        {/* Time range selector */}
        <div className="mb-8">
          <TimeRangeSelector
            selectedRange={selectedRange}
            onRangeChange={handleRangeChange}
            availableMonths={history.length}
          />
        </div>

        {/* Main chart */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Graphique d'évolution
            </h2>
            <Button
              onClick={handleToggleProjection}
              variant={showProjection ? "default" : "outline"}
              size="sm"
              disabled={history.length < 3}
            >
              {showProjection ? "Masquer" : "Afficher"} projection
            </Button>
          </div>

          <EvolutionLineChart
            history={history}
            milestones={milestones}
            onPointClick={handlePointClick}
          />

          {showProjection && projectionData.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Projection sur 6 mois</p>
                  <p className="text-sm text-blue-800">
                    Cette projection est basée sur vos données historiques. Elle ne prend pas en compte les changements futurs de votre situation ni les évolutions des barèmes fiscaux.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trend analysis */}
        {trendAnalysis && (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Analyse des tendances</h2>
            <TrendIndicator analysis={trendAnalysis} showDetails={true} />
          </div>
        )}

        {/* Annual summary */}
        {annualSummary && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Résumé annuel {annualSummary.year}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Mois de données</p>
                <p className="text-2xl font-bold text-gray-900">{annualSummary.months}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total payé</p>
                <p className="text-2xl font-bold text-red-600">
                  {annualSummary.totalPaye.toLocaleString("fr-FR")} €
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total reçu</p>
                <p className="text-2xl font-bold text-green-600">
                  {annualSummary.totalRecu.toLocaleString("fr-FR")} €
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Solde net</p>
                <p className="text-2xl font-bold text-blue-900">
                  {annualSummary.soldeNet > 0 ? "+" : ""}
                  {annualSummary.soldeNet.toLocaleString("fr-FR")} €
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Confiance moyenne</span>
                <span className="text-lg font-bold text-purple-900">
                  {annualSummary.avgConfidence}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Milestones timeline */}
        {milestones.length > 0 && (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Jalons importants</h2>
            <MilestoneTimeline milestones={milestones} onMilestoneClick={(m) => {
              // Find entry for this milestone
              const entry = history.find(
                (h) => `${h.year}-${String(h.month).padStart(2, "0")}` === m.date
              );
              if (entry) setSelectedEntry(entry);
            }} />
          </div>
        )}

        {/* Insights section */}
        {trendAnalysis && trendAnalysis.insights.length > 0 && (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Insights détectés</h2>
            <div className="space-y-3">
              {trendAnalysis.insights.map((insight, idx) => {
                const severityColors = {
                  info: "bg-blue-50 border-blue-200 text-blue-900",
                  warning: "bg-orange-50 border-orange-200 text-orange-900",
                  success: "bg-green-50 border-green-200 text-green-900",
                };

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${severityColors[insight.severity]}`}
                  >
                    <p className="font-semibold mb-1">{insight.title}</p>
                    <p className="text-sm opacity-90">{insight.description}</p>
                    {insight.since && (
                      <p className="text-xs mt-2 opacity-75">Depuis {insight.since}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Drill-down panel */}
      <DrillDownPanel
        entry={selectedEntry}
        previousEntry={selectedEntry ? getPreviousEntry(selectedEntry) : undefined}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
}
