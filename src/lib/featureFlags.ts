import React from "react";

/**
 * Feature flags for Phase 3 features
 * Allows graceful rollout and rollback of new features
 */

export const FEATURE_FLAGS = {
  /**
   * Enable gamification features (badges, challenges, streaks, XP)
   */
  GAMIFICATION: process.env.NEXT_PUBLIC_ENABLE_GAMIFICATION !== "false",

  /**
   * Enable smart notifications system
   */
  NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false",

  /**
   * Enable what-if simulation engine
   */
  SIMULATIONS: process.env.NEXT_PUBLIC_ENABLE_SIMULATIONS !== "false",

  /**
   * Enable temporal evolution features (history, trends, charts)
   */
  TEMPORAL_EVOLUTION:
    process.env.NEXT_PUBLIC_ENABLE_TEMPORAL_EVOLUTION !== "false",

  /**
   * Enable animated fiscal day feature
   */
  ANIMATIONS: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS !== "false",

  /**
   * Enable quiz personalization and challenges
   */
  QUIZ_FEATURES: process.env.NEXT_PUBLIC_ENABLE_QUIZ_FEATURES !== "false",

  /**
   * Enable social features (friends, leaderboard, sharing)
   */
  SOCIAL: process.env.NEXT_PUBLIC_ENABLE_SOCIAL !== "false",
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
}

/**
 * Get all disabled features
 */
export function getDisabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => !enabled)
    .map(([feature]) => feature);
}

/**
 * HOC to conditionally render component based on feature flag
 */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  feature: keyof typeof FEATURE_FLAGS,
  fallback?: React.ReactNode
) {
  return function WithFeatureFlag(props: P) {
    if (!isFeatureEnabled(feature)) {
      return fallback || null;
    }
    return React.createElement(Component, props);
  };
}
