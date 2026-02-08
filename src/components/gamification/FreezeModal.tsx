"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Snowflake, X, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FreezeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  freezeTokens: number;
}

export function FreezeModal({
  isOpen,
  onClose,
  onConfirm,
  freezeTokens,
}: FreezeModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header with animated icon */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="inline-block mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <Snowflake className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Utiliser un gel de série
                </h2>
                <p className="text-gray-600 text-sm">
                  Protégez votre série actuelle pendant 24 heures
                </p>
              </div>

              {/* Token count */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Gels disponibles
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-700">
                    {freezeTokens}
                  </span>
                </div>
              </div>

              {/* Info cards */}
              <div className="space-y-3 mb-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      Période de grâce de 24h
                    </h3>
                    <p className="text-xs text-gray-600">
                      Vous aurez 24 heures supplémentaires pour logger une activité
                      sans perdre votre série en cours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      Protection automatique
                    </h3>
                    <p className="text-xs text-gray-600">
                      Votre série sera protégée même si vous oubliez de logger
                      aujourd'hui. Idéal pour les week-ends ou les jours chargés.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Attention :</strong> Un gel sera consommé immédiatement.
                  Assurez-vous d'en avoir vraiment besoin.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={freezeTokens <= 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Snowflake className="w-4 h-4 mr-2" />
                  Utiliser un gel
                </Button>
              </div>

              {/* Tokens remaining note */}
              {freezeTokens > 1 && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  Il vous restera {freezeTokens - 1} gel{freezeTokens - 1 > 1 ? "s" : ""} après utilisation
                </p>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
