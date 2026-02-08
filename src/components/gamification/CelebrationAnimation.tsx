"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, Star, Sparkles } from "lucide-react";

interface CelebrationAnimationProps {
  show: boolean;
  onComplete?: () => void;
  title?: string;
  message?: string;
  icon?: string;
  type?: "badge" | "challenge" | "level_up" | "streak";
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

export function CelebrationAnimation({
  show,
  onComplete,
  title = "Félicitations !",
  message = "Vous avez débloqué un badge",
  icon = "🏆",
  type = "badge",
}: CelebrationAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      // Generate random particles for confetti effect
      const newParticles: Particle[] = [];
      const colors =
        type === "badge"
          ? ["#f59e0b", "#eab308", "#facc15"] // gold/yellow
          : type === "challenge"
          ? ["#3b82f6", "#8b5cf6", "#06b6d4"] // blue/purple
          : type === "level_up"
          ? ["#10b981", "#14b8a6", "#22c55e"] // green
          : ["#f97316", "#ef4444", "#f59e0b"]; // orange/red for streaks

      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100 - 50,
          y: Math.random() * 100 - 50,
          rotation: Math.random() * 360,
          scale: Math.random() * 0.5 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)] || "#f59e0b",
          delay: Math.random() * 0.3,
        });
      }
      setParticles(newParticles);

      // Auto-complete after animation duration
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, type, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Particle system */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  x: "50vw",
                  y: "50vh",
                  opacity: 0,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `calc(50vw + ${particle.x}vw)`,
                  y: `calc(50vh + ${particle.y}vh)`,
                  opacity: [0, 1, 1, 0],
                  scale: [0, particle.scale, particle.scale, 0],
                  rotate: particle.rotation,
                }}
                transition={{
                  duration: 2,
                  delay: particle.delay,
                  ease: "easeOut",
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{ backgroundColor: particle.color }}
              />
            ))}
          </div>

          {/* Stars decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
                className="absolute"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${10 + (i % 2) * 70}%`,
                }}
              >
                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              </motion.div>
            ))}
          </div>

          {/* Main celebration card */}
          <motion.div
            initial={{ scale: 0, rotate: -180, y: -100 }}
            animate={{
              scale: [0, 1.1, 1],
              rotate: [- 180, 10, 0],
              y: [- 100, 0],
            }}
            exit={{ scale: 0, rotate: 180, y: 100 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4"
          >
            {/* Sparkles decoration */}
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-4 -right-4"
            >
              <Sparkles className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </motion.div>

            {/* Icon */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="text-7xl text-center mb-4"
            >
              {icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-center text-gray-900 mb-2"
            >
              {title}
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center text-gray-600 mb-6"
            >
              {message}
            </motion.p>

            {/* Trophy icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="flex justify-center"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Tap to continue hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-center text-xs text-gray-400 mt-6"
            >
              Toucher pour continuer
            </motion.p>
          </motion.div>

          {/* Rays animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.3, 0],
                  scale: [0, 2],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
                className="absolute left-1/2 top-1/2 w-1 h-32 bg-gradient-to-t from-yellow-400/50 to-transparent origin-bottom"
                style={{
                  transform: `rotate(${i * 30}deg)`,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
