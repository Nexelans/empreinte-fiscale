"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Flame } from "lucide-react";
import { useMemo } from "react";

interface StreakCalendarProps {
  loggedDates: Date[]; // Array of dates when user logged activity
  currentStreak: number;
}

interface CalendarDay {
  date: Date;
  isLogged: boolean;
  isToday: boolean;
  isInCurrentStreak: boolean;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  dayOfMonth: number;
}

export function StreakCalendar({ loggedDates, currentStreak }: StreakCalendarProps) {
  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate last 30 days
    const days: CalendarDay[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const isLogged = loggedDates.some(
        (loggedDate) => {
          const ld = new Date(loggedDate);
          ld.setHours(0, 0, 0, 0);
          return ld.getTime() === date.getTime();
        }
      );

      const isToday = i === 0;

      // Check if this date is part of current streak
      // Current streak means consecutive days from most recent logged day
      const isInCurrentStreak = i < currentStreak;

      days.push({
        date,
        isLogged,
        isToday,
        isInCurrentStreak,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
      });
    }

    return days;
  }, [loggedDates, currentStreak]);

  const weekDays = ["D", "L", "M", "M", "J", "V", "S"];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Historique des 30 derniers jours
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Flame className="w-3 h-3 text-orange-500" />
          <span>{currentStreak} jour{currentStreak > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Week day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((day, index) => {
          const cellColor = day.isLogged
            ? day.isInCurrentStreak
              ? "bg-orange-100 border-orange-400"
              : "bg-green-100 border-green-400"
            : day.isToday
            ? "bg-blue-50 border-blue-300"
            : "bg-gray-50 border-gray-200";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`
                relative aspect-square rounded-lg border-2
                flex flex-col items-center justify-center
                ${cellColor}
                ${day.isToday ? "ring-2 ring-blue-400" : ""}
              `}
            >
              {/* Day number */}
              <span
                className={`text-xs font-medium ${
                  day.isLogged
                    ? day.isInCurrentStreak
                      ? "text-orange-700"
                      : "text-green-700"
                    : day.isToday
                    ? "text-blue-700"
                    : "text-gray-600"
                }`}
              >
                {day.dayOfMonth}
              </span>

              {/* Status indicator */}
              {day.isLogged ? (
                <CheckCircle2
                  className={`w-3 h-3 mt-0.5 ${
                    day.isInCurrentStreak
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                />
              ) : day.isToday ? (
                <Circle className="w-3 h-3 mt-0.5 text-blue-600" />
              ) : null}

              {/* Today badge */}
              {day.isToday && (
                <div className="absolute -top-1 -right-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-100 border-2 border-orange-400 rounded" />
          <span>Série actuelle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border-2 border-green-400 rounded" />
          <span>Journée loggée</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-50 border-2 border-blue-300 rounded" />
          <span>Aujourd'hui</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-50 border-2 border-gray-200 rounded" />
          <span>Pas d'activité</span>
        </div>
      </div>
    </div>
  );
}
