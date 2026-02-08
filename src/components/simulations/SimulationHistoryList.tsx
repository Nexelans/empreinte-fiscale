"use client";

import { motion } from "framer-motion";
import { Trash2, ExternalLink, Share2, Calendar } from "lucide-react";
import type { SimulationResult } from "@/modules/simulations/types";

interface SimulationHistoryListProps {
  simulations: SimulationResult[];
  onView: (simulation: SimulationResult) => void;
  onDelete: (simulationId: string) => void;
  onShare?: (simulationId: string) => void;
  isLoading?: boolean;
}

const scenarioIcons: Record<string, string> = {
  new_child: "👶",
  job_change: "💼",
  relocation: "🏘️",
  retirement: "🏖️",
  salary_change: "💰",
  custom: "⚙️",
};

const scenarioColors: Record<string, string> = {
  new_child: "from-pink-500 to-rose-500",
  job_change: "from-blue-500 to-cyan-500",
  relocation: "from-green-500 to-emerald-500",
  retirement: "from-purple-500 to-violet-500",
  salary_change: "from-yellow-500 to-orange-500",
  custom: "from-gray-500 to-slate-500",
};

export function SimulationHistoryList({
  simulations,
  onView,
  onDelete,
  onShare,
  isLoading = false,
}: SimulationHistoryListProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (simulations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune simulation pour le moment
        </h3>
        <p className="text-gray-600">
          Créez votre première simulation pour visualiser l'impact d'un changement de vie
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {simulations.map((simulation, index) => {
        const icon = scenarioIcons[simulation.scenarioType] || "📊";
        const gradient = scenarioColors[simulation.scenarioType] || scenarioColors.custom;
        const score = simulation.simulatedScore;

        return (
          <motion.div
            key={simulation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all overflow-hidden group"
          >
            <div className="flex items-stretch">
              {/* Icon sidebar */}
              <div
                className={`w-20 flex items-center justify-center bg-gradient-to-br ${gradient}`}
              >
                <span className="text-4xl">{icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Label */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {simulation.label}
                    </h3>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(simulation.createdAt)}</span>
                    </div>

                    {/* Key metrics */}
                    {score && (
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total payé: </span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(score.totalPaye)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total reçu: </span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(score.totalRecu)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Solde net: </span>
                          <span
                            className={`font-semibold ${
                              score.soldeNet >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {formatCurrency(score.soldeNet)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* View button */}
                    <button
                      onClick={() => onView(simulation)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <ExternalLink className="w-5 h-5 text-blue-600" />
                    </button>

                    {/* Share button */}
                    {onShare && (
                      <button
                        onClick={() => onShare(simulation.id)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                        title="Partager"
                      >
                        <Share2 className="w-5 h-5 text-green-600" />
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Êtes-vous sûr de vouloir supprimer la simulation "${simulation.label}" ?`
                          )
                        ) {
                          onDelete(simulation.id);
                        }
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
