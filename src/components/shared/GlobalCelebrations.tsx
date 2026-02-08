"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, TrendingUp, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

type CelebrationType = "BADGE_EARNED" | "CHALLENGE_COMPLETED" | "LEVEL_UP";

interface CelebrationEvent {
  type: CelebrationType;
  title: string;
  message: string;
  icon?: string;
}

/**
 * Global celebration animations component
 * Displays celebration overlays for major achievements
 */
export function GlobalCelebrations() {
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for custom celebration events
    const handleCelebration = (event: CustomEvent<CelebrationEvent>) => {
      setCelebration(event.detail);
      setIsVisible(true);

      // Trigger confetti
      triggerConfetti(event.detail.type);

      // Auto-hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setCelebration(null), 500);
      }, 4000);
    };

    window.addEventListener("celebrate" as any, handleCelebration);
    return () => {
      window.removeEventListener("celebrate" as any, handleCelebration);
    };
  }, []);

  if (!celebration) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md pointer-events-auto"
          >
            {/* Icon */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="flex justify-center mb-6"
            >
              {getIcon(celebration.type, celebration.icon)}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-center text-gray-900 mb-3"
            >
              {celebration.title}
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-700 text-lg"
            >
              {celebration.message}
            </motion.p>

            {/* Sparkles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: "50%",
                    y: "50%",
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: `${50 + Math.cos((i / 12) * Math.PI * 2) * 100}%`,
                    y: `${50 + Math.sin((i / 12) * Math.PI * 2) * 100}%`,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                  className="absolute"
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Get icon based on celebration type
 */
function getIcon(type: CelebrationType, customIcon?: string) {
  if (customIcon) {
    return <div className="text-8xl">{customIcon}</div>;
  }

  const iconProps = { className: "w-24 h-24" };

  switch (type) {
    case "BADGE_EARNED":
      return <Trophy {...iconProps} className="w-24 h-24 text-yellow-500" />;
    case "CHALLENGE_COMPLETED":
      return <Star {...iconProps} className="w-24 h-24 text-blue-500" />;
    case "LEVEL_UP":
      return <TrendingUp {...iconProps} className="w-24 h-24 text-green-500" />;
    default:
      return <Trophy {...iconProps} className="w-24 h-24 text-yellow-500" />;
  }
}

/**
 * Trigger confetti animation
 */
function triggerConfetti(type: CelebrationType) {
  const colors = {
    BADGE_EARNED: ["#FFD700", "#FFA500", "#FF6347"],
    CHALLENGE_COMPLETED: ["#4169E1", "#1E90FF", "#87CEEB"],
    LEVEL_UP: ["#32CD32", "#00FF00", "#90EE90"],
  };

  const particleColors = colors[type];

  // Center burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: particleColors,
  });

  // Side bursts
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: particleColors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: particleColors,
    });
  }, 200);
}

/**
 * Helper function to trigger celebration from anywhere in the app
 */
export function triggerCelebration(event: CelebrationEvent) {
  window.dispatchEvent(
    new CustomEvent("celebrate", {
      detail: event,
    })
  );
}
