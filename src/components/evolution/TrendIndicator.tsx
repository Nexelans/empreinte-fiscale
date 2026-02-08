"use client";

import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import type { TrendAnalysis } from "@/modules/score/trends";

interface TrendIndicatorProps {
  analysis: TrendAnalysis;
  showDetails?: boolean;
}

export function TrendIndicator({ analysis, showDetails = false }: TrendIndicatorProps) {
  const { direction, patterns, averageMonthlyChange, lastMonthChange, volatilityScore } =
    analysis;

  // Get icon and color based on direction
  const getDirectionDisplay = () => {
    switch (direction) {
      case "increasing":
        return {
          icon: <TrendingUp className="w-5 h-5" />,
          color: "text-orange-600 bg-orange-100",
          label: "En hausse",
          description: "Votre contribution nette augmente",
        };
      case "decreasing":
        return {
          icon: <TrendingDown className="w-5 h-5" />,
          color: "text-green-600 bg-green-100",
          label: "En baisse",
          description: "Votre contribution nette diminue",
        };
      case "volatile":
        return {
          icon: <Activity className="w-5 h-5" />,
          color: "text-purple-600 bg-purple-100",
          label: "Volatil",
          description: "Votre situation varie beaucoup",
        };
      case "stable":
        return {
          icon: <Minus className="w-5 h-5" />,
          color: "text-blue-600 bg-blue-100",
          label: "Stable",
          description: "Votre situation est constante",
        };
    }
  };

  const display = getDirectionDisplay();

  // Get pattern descriptions
  const getPatternLabel = (pattern: string) => {
    switch (pattern) {
      case "increasing_contributor":
        return "Contributeur croissant";
      case "decreasing_contributor":
        return "Contribution en baisse";
      case "high_volatility":
        return "Forte volatilité";
      case "stable":
        return "Situation stable";
      default:
        return pattern;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main trend indicator */}
      <div
        className={`flex items-center gap-3 p-4 rounded-lg ${display.color} transition-colors`}
      >
        <div className="flex-shrink-0">{display.icon}</div>
        <div className="flex-1">
          <p className="font-bold text-gray-900">{display.label}</p>
          <p className="text-sm opacity-90">{display.description}</p>
        </div>
      </div>

      {/* Details section */}
      {showDetails && (
        <div className="space-y-3">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Variation moyenne</p>
              <p className="text-lg font-bold text-gray-900">
                {averageMonthlyChange > 0 ? "+" : ""}
                {averageMonthlyChange.toLocaleString("fr-FR")} €
              </p>
              <p className="text-xs text-gray-500">par mois</p>
            </div>

            <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Dernier mois</p>
              <p className="text-lg font-bold text-gray-900">
                {lastMonthChange > 0 ? "+" : ""}
                {lastMonthChange.toLocaleString("fr-FR")} €
              </p>
              <p className="text-xs text-gray-500">variation</p>
            </div>

            <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Volatilité</p>
              <p className="text-lg font-bold text-gray-900">{volatilityScore}</p>
              <p className="text-xs text-gray-500">
                {volatilityScore < 30
                  ? "faible"
                  : volatilityScore < 60
                    ? "modérée"
                    : "élevée"}
              </p>
            </div>
          </div>

          {/* Patterns detected */}
          {patterns.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Tendances détectées :
              </p>
              <div className="flex flex-wrap gap-2">
                {patterns.map((pattern) => (
                  <span
                    key={pattern}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                  >
                    {getPatternLabel(pattern)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Confidence trend */}
          <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Score de confiance
                </p>
                <p className="text-xs text-blue-700">
                  {analysis.confidenceTrend.direction === "improving"
                    ? "En amélioration"
                    : analysis.confidenceTrend.direction === "declining"
                      ? "En baisse"
                      : "Stable"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  {analysis.confidenceTrend.currentValue}%
                </p>
                <p className="text-xs text-blue-700">
                  {analysis.confidenceTrend.changeFromStart > 0 ? "+" : ""}
                  {analysis.confidenceTrend.changeFromStart} pts
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
