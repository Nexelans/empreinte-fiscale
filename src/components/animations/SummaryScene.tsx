"use client";

import { motion } from "framer-motion";
import type { Scene, AnimationConfig, DaySummary } from "@/modules/animations/types";

interface SummarySceneProps {
  scene: Scene;
  config: AnimationConfig;
  isPlaying: boolean;
  summary: DaySummary;
}

export function SummaryScene({ scene, config, summary }: SummarySceneProps) {
  const staggerDelay = (scene.animation.stagger / 1000) / config.speed;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-600 text-sm mb-2"
      >
        {scene.time}
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 12,
          delay: 0.2,
        }}
        className="text-8xl mb-4"
      >
        {scene.emoji}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-bold text-gray-900 mb-2"
      >
        {scene.title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-gray-600 mb-8"
      >
        {scene.description}
      </motion.p>

      {/* Main totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-red-100 rounded-lg p-4 text-center border-2 border-red-300"
        >
          <p className="text-sm text-red-800 mb-1">Total payé</p>
          <p className="text-3xl font-bold text-red-900">
            {summary.totalTaxes.toFixed(2)} €
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-green-100 rounded-lg p-4 text-center border-2 border-green-300"
        >
          <p className="text-sm text-green-800 mb-1">Total reçu</p>
          <p className="text-3xl font-bold text-green-900">
            {summary.totalServicesReceived.toFixed(2)} €
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className={`${
            summary.netContribution > 0
              ? "bg-blue-100 border-blue-300"
              : "bg-purple-100 border-purple-300"
          } rounded-lg p-4 text-center border-2`}
        >
          <p className={`text-sm mb-1 ${
            summary.netContribution > 0 ? "text-blue-800" : "text-purple-800"
          }`}>
            Solde net
          </p>
          <p className={`text-3xl font-bold ${
            summary.netContribution > 0 ? "text-blue-900" : "text-purple-900"
          }`}>
            {summary.netContribution > 0 ? "+" : ""}
            {summary.netContribution.toFixed(2)} €
          </p>
        </motion.div>
      </div>

      {/* Tax breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="w-full max-w-3xl mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Détail des taxes payées
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(summary.taxBreakdown).map(([type, amount], index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 + index * staggerDelay }}
              className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-red-400"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{type}</span>
                <span className="text-lg font-bold text-red-600">
                  {amount.toFixed(2)} €
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Services breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="w-full max-w-3xl"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Détail des services reçus
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(summary.servicesBreakdown).map(([type, value], index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.4 + index * staggerDelay }}
              className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-400"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{type}</span>
                <span className="text-lg font-bold text-green-600">
                  {value.toFixed(2)} €
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Final message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 150,
          delay: 3,
        }}
        className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6 max-w-2xl text-center"
      >
        <p className="text-xl font-bold mb-2">
          {summary.netContribution > 0
            ? "Vous payez plus que vous ne recevez aujourd'hui !"
            : "Vous recevez plus que vous ne payez aujourd'hui !"}
        </p>
        <p className="text-sm opacity-90">
          {summary.netContribution > 0
            ? "Votre contribution aide à financer les services publics pour tous."
            : "Vous bénéficiez aujourd'hui de plus de services que ce que vous payez en taxes."}
        </p>
      </motion.div>
    </div>
  );
}
