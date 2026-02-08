"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvailableYear {
  year: string;
  label: string;
  isCurrent: boolean;
}

interface HistoricalReplayProps {
  onSelectYear?: (year: string, label: string) => void;
}

export function HistoricalReplay({ onSelectYear }: HistoricalReplayProps) {
  const [availableYears, setAvailableYears] = useState<AvailableYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailableYears() {
      try {
        const res = await fetch("/api/simulations/historical");
        if (res.ok) {
          const data = await res.json();
          setAvailableYears(data.availableYears || []);
        }
      } catch (error) {
        console.error("Error fetching available years:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAvailableYears();
  }, []);

  const handleYearClick = (year: AvailableYear) => {
    if (year.isCurrent) {
      alert("Vous utilisez déjà les barèmes actuels !");
      return;
    }

    setSelectedYear(year.year);

    if (onSelectYear) {
      onSelectYear(year.year, year.label);
    } else {
      // Fallback: display info
      alert(
        `Simulation historique : ${year.label}\n\nVotre profil actuel sera recalculé avec les barèmes de ${year.year}.`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Clock className="w-6 h-6 text-purple-600 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">Remonter le temps</h3>
          <p className="text-gray-600 mt-1">
            Recalculez votre score fiscal avec les barèmes d'une année passée
          </p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-purple-800">
          Cette fonctionnalité applique les barèmes fiscaux historiques à votre profil actuel. C'est
          une approximation : les règles peuvent avoir changé au-delà des simples taux.
        </p>
      </div>

      {/* Years Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-purple-200 via-purple-300 to-purple-400 rounded-full"></div>

        {/* Year buttons */}
        <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {availableYears.map((year, index) => (
            <motion.button
              key={year.year}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: year.isCurrent ? 1 : 1.05, y: -4 }}
              whileTap={{ scale: year.isCurrent ? 1 : 0.95 }}
              onClick={() => handleYearClick(year)}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${
                  year.isCurrent
                    ? "bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-600 text-white cursor-default"
                    : selectedYear === year.year
                    ? "bg-purple-100 border-purple-400 text-purple-900 shadow-md"
                    : "bg-white border-gray-200 hover:border-purple-400 hover:shadow-md text-gray-900"
                }
              `}
              disabled={year.isCurrent}
            >
              {/* Year */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-2xl font-bold">{year.year}</span>
              </div>

              {/* Status */}
              {year.isCurrent && (
                <div className="text-xs font-semibold">Barèmes actuels</div>
              )}

              {/* Timeline dot */}
              <div
                className={`
                  absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2
                  ${
                    year.isCurrent
                      ? "bg-purple-500 border-white"
                      : selectedYear === year.year
                      ? "bg-purple-400 border-purple-600"
                      : "bg-white border-purple-300"
                  }
                `}
              ></div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Example use case */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Exemple d'utilisation
        </h4>
        <p className="text-gray-700 text-sm mb-3">
          Vous gagnez 45 000€/an aujourd'hui. En recalculant avec les barèmes de 2020, vous verrez
          comment votre situation fiscale aurait été différente il y a 6 ans.
        </p>
        <ul className="text-gray-600 text-xs space-y-1">
          <li>• Tranches d'imposition et taux différents</li>
          <li>• Cotisations sociales historiques</li>
          <li>• Allocations et transferts de l'époque</li>
          <li>• Coûts des services publics recalculés</li>
        </ul>
      </div>
    </div>
  );
}
