"use client";

import { motion } from "framer-motion";
import { TrendingUp, Star, Zap } from "lucide-react";

interface LevelDisplayProps {
  level: number;
  currentXP: number;
  totalXP: number;
  xpForNextLevel: number;
}

export function LevelDisplay({
  level,
  currentXP,
  totalXP,
  xpForNextLevel,
}: LevelDisplayProps) {
  const progressPercent = Math.round((currentXP / xpForNextLevel) * 100);
  const xpRemaining = xpForNextLevel - currentXP;

  // Calculate level tier for styling
  const tier =
    level >= 50
      ? "legendary"
      : level >= 30
      ? "epic"
      : level >= 15
      ? "rare"
      : level >= 5
      ? "uncommon"
      : "common";

  const tierColors = {
    common: {
      bg: "bg-gradient-to-r from-gray-50 to-gray-100",
      border: "border-gray-300",
      text: "text-gray-700",
      badge: "bg-gray-200 text-gray-700",
      progress: "from-gray-400 to-gray-500",
    },
    uncommon: {
      bg: "bg-gradient-to-r from-green-50 to-emerald-50",
      border: "border-green-300",
      text: "text-green-700",
      badge: "bg-green-200 text-green-700",
      progress: "from-green-500 to-emerald-500",
    },
    rare: {
      bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
      border: "border-blue-300",
      text: "text-blue-700",
      badge: "bg-blue-200 text-blue-700",
      progress: "from-blue-500 to-cyan-500",
    },
    epic: {
      bg: "bg-gradient-to-r from-purple-50 to-pink-50",
      border: "border-purple-300",
      text: "text-purple-700",
      badge: "bg-purple-200 text-purple-700",
      progress: "from-purple-500 to-pink-500",
    },
    legendary: {
      bg: "bg-gradient-to-r from-yellow-50 to-orange-50",
      border: "border-yellow-400",
      text: "text-yellow-700",
      badge: "bg-yellow-200 text-yellow-700",
      progress: "from-yellow-500 to-orange-500",
    },
  };

  const colors = tierColors[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 rounded-xl border-2 ${colors.bg} ${colors.border} overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-10">
        <Star className="w-32 h-32 text-gray-900" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            Niveau actuel
          </p>
          <div className="flex items-baseline gap-2">
            <motion.span
              key={level}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`text-5xl font-bold ${colors.text}`}
            >
              {level}
            </motion.span>
            <span className="text-sm text-gray-600 mb-2">
              / {level + 1}
            </span>
          </div>
        </div>

        {/* Tier badge */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}
        >
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </motion.div>
      </div>

      {/* XP Progress */}
      <div className="relative z-10 space-y-2">
        {/* Stats row */}
        <div className="flex justify-between items-baseline text-sm">
          <div className="flex items-center gap-1 text-gray-700">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold">{currentXP}</span>
            <span className="text-gray-500">/ {xpForNextLevel} XP</span>
          </div>
          <div className={`font-semibold ${colors.text}`}>
            {progressPercent}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercent, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${colors.progress} shadow-lg`}
          >
            {/* Shine effect */}
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* XP remaining */}
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <TrendingUp className="w-3 h-3" />
          <span>
            Encore <span className="font-semibold">{xpRemaining} XP</span> pour
            passer au niveau {level + 1}
          </span>
        </div>
      </div>

      {/* Total XP earned (footer) */}
      <div className="relative z-10 mt-4 pt-3 border-t border-gray-300/50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>XP total gagné</span>
          <span className="font-semibold text-gray-700">{totalXP} XP</span>
        </div>
      </div>

      {/* Milestone indicators */}
      {level > 0 && level % 5 === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-1 text-xs font-bold shadow-lg border-2 border-yellow-600"
        >
          🎯 Palier !
        </motion.div>
      )}
    </motion.div>
  );
}
