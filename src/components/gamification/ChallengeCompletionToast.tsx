"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trophy, X, Sparkles, BookOpen } from "lucide-react";

interface ChallengeCompletionToastProps {
  show: boolean;
  challengeName?: string;
  xpAwarded?: number;
  educationalTip?: string;
  relatedGlossaryTerms?: string[];
  onClose: () => void;
}

export function ChallengeCompletionToast({
  show,
  challengeName = "Défi",
  xpAwarded = 0,
  educationalTip,
  relatedGlossaryTerms = [],
  onClose,
}: ChallengeCompletionToastProps) {
  useEffect(() => {
    if (show) {
      // Auto-dismiss after 8 seconds (longer if there's educational content)
      const timer = setTimeout(() => {
        onClose();
      }, educationalTip ? 8000 : 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose, educationalTip]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-5 border-2 border-green-400">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Floating sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i / 8) * Math.PI * 2) * 60,
                    y: Math.sin((i / 8) * Math.PI * 2) * 60,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                  className="absolute left-1/2 top-1/2"
                >
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </motion.div>
              ))}
            </div>

            <div className="flex items-start gap-3">
              {/* Icon */}
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: 2,
                  ease: "easeInOut",
                }}
                className="flex-shrink-0"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-300" />
                  <h3 className="text-sm font-semibold text-white">
                    Défi terminé !
                  </h3>
                </div>

                <p className="text-white/95 font-medium text-sm mb-2">
                  {challengeName}
                </p>

                {xpAwarded > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span className="text-xs font-bold text-white">
                        +{xpAwarded} XP
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Educational Tip (Task 28.2) */}
            {educationalTip && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white/90 mb-1">
                      💡 Le saviez-vous ?
                    </p>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {educationalTip}
                    </p>
                  </div>
                </div>

                {/* Related glossary terms */}
                {relatedGlossaryTerms.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {relatedGlossaryTerms.map((term) => (
                      <a
                        key={term}
                        href={`/glossaire#${term}`}
                        className="text-[10px] px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {term.replace(/-/g, " ")}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Progress bar animation */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: educationalTip ? 8 : 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-white/30 origin-left"
              style={{ width: "100%", borderBottomLeftRadius: "1rem", borderBottomRightRadius: "1rem" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook pour gérer l'affichage des toasts de completion de challenges
 */
export function useChallengeCompletionToast() {
  const [toast, setToast] = useState<{
    show: boolean;
    challengeName?: string;
    xpAwarded?: number;
    educationalTip?: string;
    relatedGlossaryTerms?: string[];
  }>({
    show: false,
  });

  const showToast = (
    challengeName: string,
    xpAwarded: number = 0,
    educationalTip?: string,
    relatedGlossaryTerms?: string[]
  ) => {
    setToast({
      show: true,
      challengeName,
      xpAwarded,
      educationalTip,
      relatedGlossaryTerms,
    });
  };

  const hideToast = () => {
    setToast({ show: false });
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}
