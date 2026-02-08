"use client";

import { StreakData } from "@/modules/gamification/types";
import { motion } from "framer-motion";
import { Flame, Trophy, Snowflake } from "lucide-react";
import { useState } from "react";

interface StreakBannerProps {
  streak: StreakData;
  onFreezeClick?: () => void;
}

export function StreakBanner({ streak, onFreezeClick }: StreakBannerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const isActive = streak.currentStreak > 0;
  const hasFreeze = streak.freezeTokens > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Main Banner */}
      <div
        className={`
        p-4 rounded-lg border-2
        ${
          isActive
            ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-300"
            : "bg-gray-50 border-gray-200"
        }
      `}
      >
        <div className="flex items-center justify-between">
          {/* Current Streak */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={
                isActive
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, -5, 5, 0],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="text-4xl"
            >
              {isActive ? (
                <Flame className="w-10 h-10 text-orange-500" />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center text-gray-400">
                  🔥
                </div>
              )}
            </motion.div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {streak.currentStreak}
                </span>
                <span className="text-sm text-gray-600">
                  {streak.currentStreak <= 1 ? "jour" : "jours"}
                </span>
              </div>
              <p className="text-xs text-gray-600">Série actuelle</p>
            </div>
          </div>

          {/* Record */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-xl font-semibold text-gray-900">
                  {streak.longestStreak}
                </span>
              </div>
              <p className="text-xs text-gray-600">Record personnel</p>
            </div>

            {/* Freeze Tokens */}
            {hasFreeze && (
              <div
                onClick={onFreezeClick}
                className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg border border-blue-300 hover:bg-blue-200 transition-colors"
              >
                <Snowflake className="w-4 h-4 text-blue-600" />
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-700">
                    {streak.freezeTokens}
                  </div>
                  <div className="text-xs text-blue-600">Gel{streak.freezeTokens > 1 ? "s" : ""}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grace Period Notice */}
        {streak.gracePeriodEnds && new Date(streak.gracePeriodEnds) > new Date() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 p-2 bg-blue-50 rounded border border-blue-200"
          >
            <p className="text-xs text-blue-700">
              <Snowflake className="w-3 h-3 inline mr-1" />
              Gel actif : vous avez jusqu'à{" "}
              {new Date(streak.gracePeriodEnds).toLocaleString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              pour logger une dépense
            </p>
          </motion.div>
        )}

        {/* Last Logged */}
        {streak.lastLoggedDate && (
          <div className="mt-3 text-xs text-gray-500">
            Dernière activité :{" "}
            {new Date(streak.lastLoggedDate).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        )}
      </div>

      {/* Streak Milestones */}
      {isActive && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {[7, 14, 30, 50, 100].map((milestone) => {
            const reached = streak.currentStreak >= milestone;
            const isNext =
              streak.currentStreak < milestone &&
              (milestone === 7 || streak.currentStreak >= ([7, 14, 30, 50, 100][
                [7, 14, 30, 50, 100].indexOf(milestone) - 1
              ] ?? 0));

            return (
              <div
                key={milestone}
                className={`
                  flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border
                  ${
                    reached
                      ? "bg-green-100 border-green-300 text-green-700"
                      : isNext
                      ? "bg-orange-100 border-orange-300 text-orange-700"
                      : "bg-gray-100 border-gray-200 text-gray-500"
                  }
                `}
              >
                {reached ? "✓" : ""} {milestone}j
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
