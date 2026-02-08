"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";

export type TimeRange = "last_3" | "last_6" | "last_12" | "all_time" | "custom";

export interface TimeRangeFilter {
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
}

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange, filter?: TimeRangeFilter) => void;
  availableMonths?: number; // Total months of data available
}

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
  availableMonths = 0,
}: TimeRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState({
    year: new Date().getFullYear(),
    month: 1,
  });
  const [customEnd, setCustomEnd] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const ranges: Array<{
    id: TimeRange;
    label: string;
    disabled?: boolean;
  }> = [
    { id: "last_3", label: "3 derniers mois", disabled: availableMonths < 3 },
    { id: "last_6", label: "6 derniers mois", disabled: availableMonths < 6 },
    { id: "last_12", label: "12 derniers mois", disabled: availableMonths < 12 },
    { id: "all_time", label: "Tout l'historique" },
    { id: "custom", label: "Période personnalisée" },
  ];

  const handleRangeClick = (rangeId: TimeRange) => {
    if (rangeId === "custom") {
      setShowCustom(true);
      return;
    }

    setShowCustom(false);

    // Calculate filter based on range
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let filter: TimeRangeFilter | undefined;

    if (rangeId === "last_3") {
      const startDate = new Date(currentYear, currentMonth - 4, 1);
      filter = {
        startYear: startDate.getFullYear(),
        startMonth: startDate.getMonth() + 1,
        endYear: currentYear,
        endMonth: currentMonth,
      };
    } else if (rangeId === "last_6") {
      const startDate = new Date(currentYear, currentMonth - 7, 1);
      filter = {
        startYear: startDate.getFullYear(),
        startMonth: startDate.getMonth() + 1,
        endYear: currentYear,
        endMonth: currentMonth,
      };
    } else if (rangeId === "last_12") {
      const startDate = new Date(currentYear, currentMonth - 13, 1);
      filter = {
        startYear: startDate.getFullYear(),
        startMonth: startDate.getMonth() + 1,
        endYear: currentYear,
        endMonth: currentMonth,
      };
    }
    // all_time has no filter

    onRangeChange(rangeId, filter);
  };

  const handleCustomApply = () => {
    const filter: TimeRangeFilter = {
      startYear: customStart.year,
      startMonth: customStart.month,
      endYear: customEnd.year,
      endMonth: customEnd.month,
    };

    onRangeChange("custom", filter);
    setShowCustom(false);
  };

  const currentYearRange = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="space-y-4">
      {/* Quick range buttons */}
      <div className="flex flex-wrap gap-2">
        {ranges.map((range) => (
          <Button
            key={range.id}
            onClick={() => handleRangeClick(range.id)}
            variant={selectedRange === range.id ? "default" : "outline"}
            disabled={range.disabled}
            className="flex items-center gap-2"
          >
            {range.id === "custom" && <Calendar className="w-4 h-4" />}
            {range.label}
            {range.disabled && (
              <span className="text-xs opacity-70">(indisponible)</span>
            )}
          </Button>
        ))}
      </div>

      {/* Custom range selector */}
      {showCustom && (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <p className="font-semibold text-gray-900 mb-3">Période personnalisée</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Début
              </label>
              <div className="flex gap-2">
                <select
                  value={customStart.month}
                  onChange={(e) =>
                    setCustomStart({ ...customStart, month: parseInt(e.target.value) })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleDateString("fr-FR", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>

                <select
                  value={customStart.year}
                  onChange={(e) =>
                    setCustomStart({ ...customStart, year: parseInt(e.target.value) })
                  }
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currentYearRange.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* End date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fin
              </label>
              <div className="flex gap-2">
                <select
                  value={customEnd.month}
                  onChange={(e) =>
                    setCustomEnd({ ...customEnd, month: parseInt(e.target.value) })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleDateString("fr-FR", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>

                <select
                  value={customEnd.year}
                  onChange={(e) =>
                    setCustomEnd({ ...customEnd, year: parseInt(e.target.value) })
                  }
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currentYearRange.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleCustomApply} className="flex-1">
              Appliquer
            </Button>
            <Button
              onClick={() => setShowCustom(false)}
              variant="outline"
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Info */}
      {availableMonths > 0 && (
        <p className="text-sm text-gray-600">
          {availableMonths} mois de données disponibles
        </p>
      )}
    </div>
  );
}
