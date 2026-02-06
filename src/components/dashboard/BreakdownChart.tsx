"use client";

import { useState } from "react";

interface BreakdownItem {
  label: string;
  value: number;
  color: string;
}

interface BreakdownChartProps {
  title: string;
  items: BreakdownItem[];
  total: number;
}

export function BreakdownChart({ title, items, total }: BreakdownChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {/* Progress bars */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              className="space-y-1"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex justify-between text-sm">
                <span className={`font-medium ${isHovered ? "text-gray-900" : "text-gray-700"}`}>
                  {item.label}
                </span>
                <span className={`${isHovered ? "text-gray-900 font-semibold" : "text-gray-600"}`}>
                  {item.value.toLocaleString()} € ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                    isHovered ? "opacity-100" : "opacity-90"
                  }`}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                    transform: isHovered ? "scaleY(1.2)" : "scaleY(1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between font-semibold">
        <span>Total</span>
        <span>{total.toLocaleString()} €</span>
      </div>
    </div>
  );
}
