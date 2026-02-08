"use client";

import { motion } from "framer-motion";
import type { Scene, AnimationConfig } from "@/modules/animations/types";

interface CoffeeSceneProps {
  scene: Scene;
  config: AnimationConfig;
  isPlaying: boolean;
}

export function CoffeeScene({ scene, config, isPlaying }: CoffeeSceneProps) {
  const staggerDelay = (scene.animation.stagger / 1000) / config.speed;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Time */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-gray-600 text-sm mb-2"
      >
        {scene.time}
      </motion.div>

      {/* Emoji */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 10,
          delay: 0.2,
        }}
        className="text-8xl mb-4"
      >
        {scene.emoji}
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-3xl font-bold text-gray-900 mb-2"
      >
        {scene.title}
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-gray-600 mb-8"
      >
        {scene.description}
      </motion.p>

      {/* Total spent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white rounded-lg p-4 mb-6 shadow-md"
      >
        <p className="text-sm text-gray-600 mb-1">Dépense</p>
        <p className="text-2xl font-bold text-gray-900">
          {scene.totalSpent?.toFixed(2)} €
        </p>
      </motion.div>

      {/* Taxes */}
      <div className="space-y-3 w-full max-w-md">
        {scene.taxes.map((tax, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1 + index * staggerDelay }}
            className="bg-white rounded-lg p-4 shadow-md border-l-4"
            style={{ borderColor: tax.color }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{tax.type}</p>
                <p className="text-sm text-gray-600">{tax.label}</p>
              </div>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  delay: 1.2 + index * staggerDelay,
                }}
                className="text-xl font-bold"
                style={{ color: tax.color }}
              >
                {tax.amount.toFixed(2)} €
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Services received */}
      {scene.servicesReceived && scene.servicesReceived.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2 }}
          className="mt-6 w-full max-w-md"
        >
          <p className="text-sm text-gray-600 mb-2">En retour, vous recevez :</p>
          {scene.servicesReceived.map((service, index) => (
            <div
              key={index}
              className="bg-green-50 rounded-lg p-3 border-l-4 border-green-500"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{service.label}</span>
                <span className="text-sm font-semibold text-green-700">
                  {service.value.toFixed(2)} €
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
