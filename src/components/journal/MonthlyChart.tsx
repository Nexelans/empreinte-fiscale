"use client";

import { MonthlyAggregation } from "@/modules/journal/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MonthlyChartProps {
  monthlyData: MonthlyAggregation[];
}

const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
];

export function MonthlyChart({ monthlyData }: MonthlyChartProps) {
  // Transform data for Recharts
  const chartData = monthlyData.map((month) => ({
    name: MONTH_LABELS[month.month - 1],
    "Total dépensé": month.totalSpent,
    "Total taxes": month.totalTaxes,
  }));

  if (monthlyData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune donnée à afficher</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Évolution mensuelle
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: number | undefined) => value ? `${value.toFixed(2)} €` : "0.00 €"}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Bar dataKey="Total dépensé" fill="#3b82f6" />
          <Bar dataKey="Total taxes" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-blue-600 font-medium">Total dépensé sur l'année</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {monthlyData.reduce((sum, m) => sum + m.totalSpent, 0).toFixed(2)} €
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-red-600 font-medium">Total taxes payées</div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            {monthlyData.reduce((sum, m) => sum + m.totalTaxes, 0).toFixed(2)} €
          </div>
        </div>
      </div>
    </div>
  );
}
