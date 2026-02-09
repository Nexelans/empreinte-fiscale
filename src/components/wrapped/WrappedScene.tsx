/**
 * Scène individuelle du Wrapped avec animation
 * Phase 4 - Module Wrapped - UI
 */

'use client';

import { motion } from 'framer-motion';
import { WrappedScene, WrappedSceneType, WrappedTheme } from '@/modules/wrapped/types';
import { TrendingUp, TrendingDown, Calendar, School } from 'lucide-react';

interface WrappedSceneProps {
  scene: WrappedScene;
  theme: WrappedTheme;
  isActive: boolean;
}

export function WrappedSceneComponent({ scene, theme, isActive }: WrappedSceneProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getThemeColors = (theme: WrappedTheme) => {
    switch (theme) {
      case WrappedTheme.CLASSIC:
        return {
          bg: 'bg-gradient-to-br from-slate-900 to-slate-800',
          text: 'text-white',
          accent: 'text-blue-400',
        };
      case WrappedTheme.VIBRANT:
        return {
          bg: 'bg-gradient-to-br from-purple-600 to-pink-600',
          text: 'text-white',
          accent: 'text-yellow-300',
        };
      case WrappedTheme.MINIMALIST:
        return {
          bg: 'bg-white',
          text: 'text-gray-900',
          accent: 'text-gray-600',
        };
      case WrappedTheme.FISCAL:
        return {
          bg: 'bg-gradient-to-br from-blue-900 to-indigo-900',
          text: 'text-white',
          accent: 'text-green-400',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-900 to-slate-800',
          text: 'text-white',
          accent: 'text-blue-400',
        };
    }
  };

  const colors = getThemeColors(theme);

  const renderSceneContent = () => {
    switch (scene.type) {
      case WrappedSceneType.INTRO:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className={`text-6xl font-bold mb-4 ${colors.text}`}>
              {scene.title}
            </h1>
            {scene.subtitle && (
              <p className={`text-2xl ${colors.accent}`}>{scene.subtitle}</p>
            )}
          </motion.div>
        );

      case WrappedSceneType.TOTAL_PAYE:
        return (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className={`text-3xl mb-6 ${colors.text}`}>{scene.title}</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={isActive ? { scale: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
              className={`text-7xl font-bold ${colors.accent}`}
            >
              {formatCurrency(scene.data.amount)}
            </motion.p>
            <p className={`text-xl mt-4 ${colors.text} opacity-70`}>
              en impôts et cotisations
            </p>
          </motion.div>
        );

      case WrappedSceneType.TOTAL_RECU:
        return (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className={`text-3xl mb-6 ${colors.text}`}>{scene.title}</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={isActive ? { scale: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
              className={`text-7xl font-bold ${colors.accent}`}
            >
              {formatCurrency(scene.data.amount)}
            </motion.p>
            <p className={`text-xl mt-4 ${colors.text} opacity-70`}>
              en services publics et transferts
            </p>
          </motion.div>
        );

      case WrappedSceneType.SOLDE_NET:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className={`text-3xl mb-6 ${colors.text}`}>{scene.title}</p>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={isActive ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className={`text-7xl font-bold mb-4 ${colors.accent}`}>
                {formatCurrency(scene.data.amount)}
              </p>
              <div className={`text-xl ${colors.text} opacity-70`}>
                Ratio: {scene.data.ratio.toFixed(2)}
                {scene.data.ratio > 1 ? (
                  <span className="ml-2">📤 Vous payez plus que vous ne recevez</span>
                ) : (
                  <span className="ml-2">📥 Vous recevez plus que vous ne payez</span>
                )}
              </div>
            </motion.div>
          </motion.div>
        );

      case WrappedSceneType.TOP_INSIGHT:
        return (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isActive ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={isActive ? { scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-8"
            >
              <Calendar className={`w-20 h-20 mx-auto ${colors.accent}`} />
            </motion.div>
            <p className={`text-2xl mb-4 ${colors.text} opacity-80`}>
              {scene.title}
            </p>
            <p className={`text-5xl font-bold ${colors.accent}`}>
              {scene.subtitle}
            </p>
          </motion.div>
        );

      case WrappedSceneType.EVOLUTION:
        const evolution = scene.data.evolution;
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className={`text-3xl mb-8 ${colors.text}`}>{scene.title}</p>
            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={isActive ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
                className={`p-6 rounded-lg ${
                  theme === WrappedTheme.MINIMALIST ? 'bg-gray-100' : 'bg-white/10'
                }`}
              >
                <p className={`text-sm mb-2 ${colors.text} opacity-70`}>Total payé</p>
                <div className="flex items-center justify-center gap-2">
                  {evolution.totalPayeDelta > 0 ? (
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-green-400" />
                  )}
                  <p className={`text-3xl font-bold ${colors.accent}`}>
                    {evolution.totalPayeDelta > 0 ? '+' : ''}
                    {evolution.totalPayeDelta.toFixed(1)}%
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={isActive ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.4, duration: 0.5 }}
                className={`p-6 rounded-lg ${
                  theme === WrappedTheme.MINIMALIST ? 'bg-gray-100' : 'bg-white/10'
                }`}
              >
                <p className={`text-sm mb-2 ${colors.text} opacity-70`}>Total reçu</p>
                <div className="flex items-center justify-center gap-2">
                  {evolution.totalRecuDelta > 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  )}
                  <p className={`text-3xl font-bold ${colors.accent}`}>
                    {evolution.totalRecuDelta > 0 ? '+' : ''}
                    {evolution.totalRecuDelta.toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );

      case WrappedSceneType.OUTRO:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isActive ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className={`text-5xl font-bold mb-4 ${colors.text}`}>
              {scene.title}
            </h1>
            <p className={`text-3xl ${colors.accent}`}>{scene.subtitle}</p>
            <p className={`text-lg mt-8 ${colors.text} opacity-60`}>
              Partagez votre bilan fiscal avec vos amis
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full h-full flex items-center justify-center p-12 ${colors.bg}`}>
      {renderSceneContent()}
    </div>
  );
}
