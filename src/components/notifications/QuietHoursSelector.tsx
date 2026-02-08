"use client";

import { useState } from "react";
import { Moon, Sun, Clock } from "lucide-react";

interface QuietHoursSelectorProps {
  startHour: number;
  endHour: number;
  onChange: (startHour: number, endHour: number) => void;
}

export function QuietHoursSelector({
  startHour,
  endHour,
  onChange,
}: QuietHoursSelectorProps) {
  const [tempStart, setTempStart] = useState(startHour);
  const [tempEnd, setTempEnd] = useState(endHour);

  const handleStartChange = (hour: number) => {
    setTempStart(hour);
    onChange(hour, tempEnd);
  };

  const handleEndChange = (hour: number) => {
    setTempEnd(hour);
    onChange(tempStart, hour);
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  const getDuration = () => {
    if (tempStart < tempEnd) {
      return tempEnd - tempStart;
    } else {
      return 24 - tempStart + tempEnd;
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Clock */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6">
        <div className="flex items-center justify-center mb-6">
          <ClockVisualization startHour={tempStart} endHour={tempEnd} />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Heures de silence actives
          </p>
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
            <Moon className="w-6 h-6 text-indigo-600" />
            <span>{formatHour(tempStart)}</span>
            <span className="text-gray-400">→</span>
            <span>{formatHour(tempEnd)}</span>
            <Sun className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Durée : {getDuration()} heure{getDuration() > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Time Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Time */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <Moon className="w-4 h-4 inline mr-2 text-indigo-600" />
            Début
          </label>
          <select
            value={tempStart}
            onChange={(e) => handleStartChange(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {formatHour(i)}
              </option>
            ))}
          </select>
        </div>

        {/* End Time */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <Sun className="w-4 h-4 inline mr-2 text-yellow-500" />
            Fin
          </label>
          <select
            value={tempEnd}
            onChange={(e) => handleEndChange(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {formatHour(i)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Préréglages rapides
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <PresetButton
            label="Nuit complète"
            description="22h - 8h"
            onClick={() => {
              handleStartChange(22);
              handleEndChange(8);
            }}
            isActive={tempStart === 22 && tempEnd === 8}
          />
          <PresetButton
            label="Nuit courte"
            description="23h - 7h"
            onClick={() => {
              handleStartChange(23);
              handleEndChange(7);
            }}
            isActive={tempStart === 23 && tempEnd === 7}
          />
          <PresetButton
            label="Soirée"
            description="20h - 23h"
            onClick={() => {
              handleStartChange(20);
              handleEndChange(23);
            }}
            isActive={tempStart === 20 && tempEnd === 23}
          />
          <PresetButton
            label="Week-end"
            description="9h - 12h"
            onClick={() => {
              handleStartChange(9);
              handleEndChange(12);
            }}
            isActive={tempStart === 9 && tempEnd === 12}
          />
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Comment ça fonctionne ?</p>
          <p>
            Pendant les heures de silence, vous ne recevrez pas de notifications par email ou push.
            Les notifications in-app seront toujours disponibles mais sans alerte sonore.
          </p>
        </div>
      </div>
    </div>
  );
}

interface ClockVisualizationProps {
  startHour: number;
  endHour: number;
}

function ClockVisualization({ startHour, endHour }: ClockVisualizationProps) {
  const size = 200;
  const center = size / 2;
  const radius = 80;

  // Calculate angles (0 = top, clockwise)
  const hourToAngle = (hour: number) => (hour / 24) * 360 - 90;

  const startAngle = hourToAngle(startHour);
  const endAngle = hourToAngle(endHour);

  // Calculate arc path
  const createArcPath = () => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const startX = center + radius * Math.cos(startRad);
    const startY = center + radius * Math.sin(startRad);
    const endX = center + radius * Math.cos(endRad);
    const endY = center + radius * Math.sin(endRad);

    // Determine if we should use the large arc flag
    let angleDiff = endAngle - startAngle;
    if (angleDiff < 0) angleDiff += 360;
    const largeArc = angleDiff > 180 ? 1 : 0;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  };

  return (
    <svg width={size} height={size} className="transform rotate-0">
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="20"
      />

      {/* Quiet hours arc */}
      <path
        d={createArcPath()}
        fill="none"
        stroke="url(#quietGradient)"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* Gradient definition */}
      <defs>
        <linearGradient id="quietGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {/* Hour markers */}
      {[0, 6, 12, 18].map((hour) => {
        const angle = hourToAngle(hour);
        const rad = (angle * Math.PI) / 180;
        const x = center + (radius + 30) * Math.cos(rad);
        const y = center + (radius + 30) * Math.sin(rad);

        return (
          <text
            key={hour}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-semibold fill-gray-600"
          >
            {hour}h
          </text>
        );
      })}

      {/* Center dot */}
      <circle cx={center} cy={center} r="4" fill="#6366f1" />
    </svg>
  );
}

interface PresetButtonProps {
  label: string;
  description: string;
  onClick: () => void;
  isActive: boolean;
}

function PresetButton({ label, description, onClick, isActive }: PresetButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        p-3 rounded-lg border-2 transition-all text-left
        ${
          isActive
            ? "bg-blue-100 border-blue-500 text-blue-900"
            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
        }
      `}
    >
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-xs opacity-75 mt-0.5">{description}</div>
    </button>
  );
}
