"use client";

import { DataStatus } from "@/modules/journal/types";

interface StatusBadgeProps {
  status: DataStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<DataStatus, { label: string; icon: string; className: string }> = {
  VERIFIE: {
    label: "Vérifié",
    icon: "🟢",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  DECLARE: {
    label: "Déclaré",
    icon: "🟡",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  ESTIME: {
    label: "Estimé",
    icon: "🔴",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.className} ${sizeClass}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
