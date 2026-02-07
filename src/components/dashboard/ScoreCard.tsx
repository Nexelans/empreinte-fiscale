import { ReactNode } from "react";

interface ScoreCardProps {
  title: string | ReactNode;
  value: number;
  subtitle: string;
  color: "red" | "green" | "blue";
  icon?: string;
}

export function ScoreCard({ title, value, subtitle, color, icon }: ScoreCardProps) {
  const borderColors = {
    red: "border-red-500",
    green: "border-green-500",
    blue: "border-blue-500",
  };

  const textColors = {
    red: "text-red-600",
    green: "text-green-600",
    blue: "text-blue-600",
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${borderColors[color]}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${textColors[color]}`}>
        {value.toLocaleString()} €
      </p>
      <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
    </div>
  );
}
