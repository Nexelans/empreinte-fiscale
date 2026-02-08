"use client";

import { Award, TrendingUp, AlertCircle } from "lucide-react";
import type { Milestone } from "@/modules/score/trends";

interface MilestoneMarkerProps {
  milestone: Milestone;
  onClick?: (milestone: Milestone) => void;
}

export function MilestoneMarker({ milestone, onClick }: MilestoneMarkerProps) {
  const getIcon = () => {
    switch (milestone.type) {
      case "status_change":
        return <TrendingUp className="w-4 h-4" />;
      case "confidence_threshold":
        return <Award className="w-4 h-4" />;
      case "large_change":
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    switch (milestone.type) {
      case "status_change":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "confidence_threshold":
        return "bg-green-500 text-white hover:bg-green-600";
      case "large_change":
        return "bg-orange-500 text-white hover:bg-orange-600";
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split("-");
    if (!year || !month) return dateStr;
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <button
      onClick={() => onClick?.(milestone)}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${getColor()}`}
      title={milestone.description}
    >
      {getIcon()}
      <span className="hidden sm:inline">{milestone.title}</span>
      <span className="text-xs opacity-90">{formatDate(milestone.date)}</span>
    </button>
  );
}

/**
 * Timeline view of all milestones
 */
interface MilestoneTimelineProps {
  milestones: Milestone[];
  onMilestoneClick?: (milestone: Milestone) => void;
}

export function MilestoneTimeline({
  milestones,
  onMilestoneClick,
}: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Aucun jalon détecté pour le moment</p>
        <p className="text-xs mt-1">
          Les jalons apparaîtront lorsque votre situation évoluera significativement
        </p>
      </div>
    );
  }

  // Group by type
  const grouped = milestones.reduce(
    (acc, m) => {
      if (!acc[m.type]) acc[m.type] = [];
      acc[m.type]!.push(m);
      return acc;
    },
    {} as Record<string, Milestone[]>
  );

  const typeLabels: Record<string, string> = {
    status_change: "Changements de statut",
    confidence_threshold: "Seuils de confiance",
    large_change: "Changements majeurs",
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {typeLabels[type] || type}
          </h3>
          <div className="space-y-3">
            {items.map((milestone) => (
              <div
                key={milestone.id}
                className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => onMilestoneClick?.(milestone)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MilestoneMarker milestone={milestone} />
                    </div>
                    <p className="text-sm text-gray-700">{milestone.description}</p>
                  </div>
                  {milestone.newValue !== undefined && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {milestone.newValue > 0 ? "+" : ""}
                        {Math.round(milestone.newValue).toLocaleString("fr-FR")} €
                      </p>
                      {milestone.previousValue !== undefined && (
                        <p className="text-xs text-gray-500">
                          était{" "}
                          {Math.round(milestone.previousValue).toLocaleString("fr-FR")} €
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
