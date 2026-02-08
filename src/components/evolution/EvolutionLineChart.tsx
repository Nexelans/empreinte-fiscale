"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import type { ScoreHistoryEntry } from "@/modules/score/history";
import type { Milestone } from "@/modules/score/trends";

interface EvolutionLineChartProps {
  history: ScoreHistoryEntry[];
  milestones?: Milestone[];
  onPointClick?: (entry: ScoreHistoryEntry) => void;
  highlightedMonth?: string; // YYYY-MM
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  totalPaye: number;
  totalRecu: number;
  soldeNet: number;
  confidenceScore: number;
  originalEntry: ScoreHistoryEntry;
  hasMilestone?: boolean;
}

export function EvolutionLineChart({
  history,
  milestones = [],
  onPointClick,
  highlightedMonth,
}: EvolutionLineChartProps) {
  // Transform history into chart data
  const chartData: ChartDataPoint[] = history.map((entry) => {
    const date = `${entry.year}-${String(entry.month).padStart(2, "0")}`;
    const dateLabel = new Date(entry.year, entry.month - 1).toLocaleDateString("fr-FR", {
      month: "short",
      year: "2-digit",
    });

    const hasMilestone = milestones.some((m) => m.date === date);

    return {
      date,
      dateLabel,
      totalPaye: entry.scoreFiscalData.totalPaye,
      totalRecu: entry.scoreFiscalData.totalRecu,
      soldeNet: entry.scoreFiscalData.soldeNet,
      confidenceScore: entry.confidenceScore,
      originalEntry: entry,
      hasMilestone,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Aucune donnée d'historique</p>
          <p className="text-sm text-gray-500">
            Calculez votre score pour commencer à suivre votre évolution
          </p>
        </div>
      </div>
    );
  }

  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const point = data.activePayload[0].payload as ChartDataPoint;
      onPointClick?.(point.originalEntry);
    }
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onClick={handleClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="dateLabel"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />

          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `${Math.round(value / 1000)}k€`}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#9ca3af", strokeWidth: 1, strokeDasharray: "5 5" }}
          />

          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
          />

          {/* Reference line at zero */}
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />

          {/* Lines */}
          <Line
            type="monotone"
            dataKey="totalPaye"
            name="Ce que je paie"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 4 }}
            activeDot={{ r: 6, onClick: handleClick, cursor: "pointer" }}
          />

          <Line
            type="monotone"
            dataKey="totalRecu"
            name="Ce que je reçois"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6, onClick: handleClick, cursor: "pointer" }}
          />

          <Line
            type="monotone"
            dataKey="soldeNet"
            name="Solde net"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 5 }}
            activeDot={{ r: 7, onClick: handleClick, cursor: "pointer" }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend explanation */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Impôts + cotisations + taxes indirectes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Transferts directs + services publics valorisés</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Solde net (payé - reçu)</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom tooltip for the chart
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload as ChartDataPoint;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
      <p className="font-bold text-gray-900 mb-2">{data.date}</p>

      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-red-600">Ce que je paie :</span>
          <span className="font-semibold">{data.totalPaye.toLocaleString("fr-FR")} €</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-green-600">Ce que je reçois :</span>
          <span className="font-semibold">{data.totalRecu.toLocaleString("fr-FR")} €</span>
        </div>

        <div className="border-t border-gray-200 my-2"></div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-blue-600 font-semibold">Solde net :</span>
          <span className="font-bold">
            {data.soldeNet > 0 ? "+" : ""}
            {data.soldeNet.toLocaleString("fr-FR")} €
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600">Confiance :</span>
          <span className="font-semibold">{Math.round(data.confidenceScore)}%</span>
        </div>
      </div>

      {data.hasMilestone && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-orange-600 font-semibold">🏆 Jalon important</p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">Cliquer pour voir le détail</p>
    </div>
  );
}
