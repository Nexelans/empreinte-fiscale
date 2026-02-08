"use client";

import { BadgeDefinition } from "@/modules/gamification/types";
import { motion } from "framer-motion";
import { Lock, CheckCircle2 } from "lucide-react";

interface BadgeCardProps {
  badge: BadgeDefinition & {
    earned: boolean;
    earnedAt: Date | null;
    progress: number;
  };
  onClick?: () => void;
}

const categoryColors = {
  onboarding: "bg-blue-100 text-blue-800 border-blue-300",
  fiscal_contribution: "bg-green-100 text-green-800 border-green-300",
  fiscal_services: "bg-purple-100 text-purple-800 border-purple-300",
  data_quality: "bg-yellow-100 text-yellow-800 border-yellow-300",
  engagement: "bg-orange-100 text-orange-800 border-orange-300",
  pedagogical: "bg-pink-100 text-pink-800 border-pink-300",
};

export function BadgeCard({ badge, onClick }: BadgeCardProps) {
  const colorClass = categoryColors[badge.categorie] || "bg-gray-100 text-gray-800 border-gray-300";
  const isLocked = !badge.earned;

  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.05, y: isLocked ? 0 : -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${isLocked ? "bg-gray-50 border-gray-200 opacity-60" : `${colorClass}`}
      `}
    >
      {/* Badge Icon */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-4xl">
          {isLocked ? "🔒" : badge.nom.split(" ")[0]}
        </div>
        {badge.earned && (
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        )}
      </div>

      {/* Badge Name */}
      <h3 className={`font-semibold text-sm mb-1 ${isLocked ? "text-gray-600" : ""}`}>
        {badge.nom.split(" ").slice(1).join(" ")}
      </h3>

      {/* Badge Description with Glossary Links (Task 28.1) */}
      <div className={`text-xs mb-3 ${isLocked ? "text-gray-500" : "text-gray-700"}`}>
        <p>{badge.description}</p>
        {badge.relatedGlossaryTerms && badge.relatedGlossaryTerms.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {badge.relatedGlossaryTerms.map((term) => (
              <a
                key={term}
                href={`/glossaire#${term}`}
                className="text-blue-600 hover:text-blue-800 underline text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {term.replace(/-/g, " ")}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar (if not earned) */}
      {!badge.earned && badge.progress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Progression</span>
            <span>{Math.round(badge.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${badge.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>
      )}

      {/* Earned Date */}
      {badge.earned && badge.earnedAt && (
        <div className="mt-2 text-xs text-gray-600">
          Obtenu le {new Date(badge.earnedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      )}

      {/* Category Tag */}
      <div className="absolute top-2 right-2">
        <span className="text-xs px-2 py-1 rounded-full bg-white/50 backdrop-blur-sm">
          {badge.categorie.replace("_", " ")}
        </span>
      </div>
    </motion.div>
  );
}
