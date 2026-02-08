"use client";

import { UserChallenge, ChallengeDefinition } from "@/modules/gamification/types";
import { motion } from "framer-motion";
import { Trophy, Clock, CheckCircle2, XCircle } from "lucide-react";

interface ChallengeCardProps {
  challenge: UserChallenge & {
    definition?: ChallengeDefinition;
  };
  onClick?: () => void;
}

export function ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
  const progressPercent = Math.round((challenge.progress / challenge.target) * 100);
  const isCompleted = challenge.status === "COMPLETED";
  const isExpired = challenge.status === "EXPIRED";
  const isActive = challenge.status === "ACTIVE";

  // Calculate time remaining
  let timeRemaining = "";
  if (challenge.expiresAt && isActive) {
    const now = new Date();
    const expires = new Date(challenge.expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      timeRemaining = `${days}j ${hours}h restantes`;
    } else if (hours > 0) {
      timeRemaining = `${hours}h restantes`;
    } else {
      timeRemaining = "Expire bientôt";
    }
  }

  const borderColor = isCompleted
    ? "border-green-300"
    : isExpired
    ? "border-red-300"
    : "border-blue-300";

  const bgColor = isCompleted
    ? "bg-green-50"
    : isExpired
    ? "bg-red-50"
    : "bg-blue-50";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${borderColor} ${bgColor}
      `}
    >
      {/* Header with Icon and Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl">
            {isCompleted ? <Trophy className="w-6 h-6 text-green-600" /> : "🎯"}
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {challenge.definition?.nom || "Challenge"}
            </h3>
            {isCompleted && (
              <span className="text-xs text-green-600 font-medium">Terminé ✓</span>
            )}
            {isExpired && (
              <span className="text-xs text-red-600 font-medium">Expiré</span>
            )}
          </div>
        </div>

        {/* XP Reward Badge */}
        {challenge.definition?.recompenseXP && (
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
            <span className="text-xs font-semibold text-purple-700">
              +{challenge.definition.recompenseXP} XP
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-700 mb-3">
        {challenge.definition?.description}
      </p>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>
            {challenge.progress} / {challenge.target}
          </span>
          <span className="font-medium">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercent, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full ${
              isCompleted
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : isExpired
                ? "bg-gray-400"
                : "bg-gradient-to-r from-blue-500 to-purple-500"
            }`}
          />
        </div>
      </div>

      {/* Time Remaining */}
      {timeRemaining && isActive && (
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-600">
          <Clock className="w-3 h-3" />
          <span>{timeRemaining}</span>
        </div>
      )}

      {/* Completion Date */}
      {isCompleted && challenge.completedAt && (
        <div className="mt-3 text-xs text-green-700">
          Terminé le {new Date(challenge.completedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      )}
    </motion.div>
  );
}
