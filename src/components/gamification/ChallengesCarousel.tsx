"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import { ChallengeCard } from "./ChallengeCard";
import type { UserChallenge } from "@/modules/gamification/types";

interface ChallengesCarouselProps {
  challenges: UserChallenge[];
  onChallengeClick?: (challenge: UserChallenge) => void;
}

export function ChallengesCarousel({
  challenges,
  onChallengeClick,
}: ChallengesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    if (challenges.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [currentIndex, challenges.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % challenges.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + challenges.length) % challenges.length);
  };

  if (challenges.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-gray-500">
          <Target className="w-5 h-5" />
          <p className="text-sm">
            Aucun défi actif pour le moment. Continuez à logger vos dépenses !
          </p>
        </div>
      </div>
    );
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Défis actifs ({challenges.length})
          </h3>
        </div>

        {/* Navigation dots */}
        {challenges.length > 1 && (
          <div className="flex items-center gap-2">
            {challenges.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${
                    index === currentIndex
                      ? "bg-purple-600 w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {challenges[currentIndex] && (
              <ChallengeCard
                challenge={challenges[currentIndex]}
                onClick={() => onChallengeClick?.(challenges[currentIndex]!)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {challenges.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="
                absolute left-2 top-1/2 -translate-y-1/2
                w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full
                flex items-center justify-center
                border border-gray-200 shadow-lg
                hover:bg-white hover:scale-110
                transition-all
                z-10
              "
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={handleNext}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full
                flex items-center justify-center
                border border-gray-200 shadow-lg
                hover:bg-white hover:scale-110
                transition-all
                z-10
              "
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Progress indicator */}
      {challenges.length > 1 && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">
            {currentIndex + 1} / {challenges.length}
          </span>
        </div>
      )}
    </div>
  );
}
