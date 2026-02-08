/**
 * Rate limiting pour les requêtes IA
 * Phase 4 - Module AI
 *
 * Protège contre les abus et gère les quotas utilisateur
 */

import { checkRateLimit, RateLimitResult } from '@/lib/rateLimit';

/**
 * Configuration des limites par type d'opération
 */
export const AI_RATE_LIMITS = {
  // Requêtes de chat standard
  CHAT: {
    limit: 100,
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
  },
  // OCR avec vision AI (plus coûteux)
  OCR: {
    limit: 50,
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
  },
  // Tests de connexion
  TEST: {
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 heure
  },
  // Configuration (changements de config)
  CONFIG: {
    limit: 20,
    windowMs: 60 * 60 * 1000, // 1 heure
  },
};

/**
 * Vérifie la limite de rate pour les requêtes de chat
 */
export function checkChatRateLimit(userId: string): RateLimitResult {
  return checkRateLimit({
    key: `ai:chat:${userId}`,
    limit: AI_RATE_LIMITS.CHAT.limit,
    windowMs: AI_RATE_LIMITS.CHAT.windowMs,
  });
}

/**
 * Vérifie la limite de rate pour les requêtes OCR
 */
export function checkOCRRateLimit(userId: string): RateLimitResult {
  return checkRateLimit({
    key: `ai:ocr:${userId}`,
    limit: AI_RATE_LIMITS.OCR.limit,
    windowMs: AI_RATE_LIMITS.OCR.windowMs,
  });
}

/**
 * Vérifie la limite de rate pour les tests de connexion
 */
export function checkTestRateLimit(userId: string): RateLimitResult {
  return checkRateLimit({
    key: `ai:test:${userId}`,
    limit: AI_RATE_LIMITS.TEST.limit,
    windowMs: AI_RATE_LIMITS.TEST.windowMs,
  });
}

/**
 * Vérifie la limite de rate pour les modifications de configuration
 */
export function checkConfigRateLimit(userId: string): RateLimitResult {
  return checkRateLimit({
    key: `ai:config:${userId}`,
    limit: AI_RATE_LIMITS.CONFIG.limit,
    windowMs: AI_RATE_LIMITS.CONFIG.windowMs,
  });
}

/**
 * Récupère le statut de toutes les limites pour un utilisateur
 */
export function getAllRateLimitStatus(userId: string): {
  chat: RateLimitResult;
  ocr: RateLimitResult;
  test: RateLimitResult;
  config: RateLimitResult;
} {
  return {
    chat: checkChatRateLimit(userId),
    ocr: checkOCRRateLimit(userId),
    test: checkTestRateLimit(userId),
    config: checkConfigRateLimit(userId),
  };
}

/**
 * Formate un message d'erreur de rate limit user-friendly
 */
export function formatRateLimitError(result: RateLimitResult): string {
  if (result.allowed) {
    return '';
  }

  const resetDate = new Date(result.resetAt);
  const now = new Date();
  const minutesUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / 60000);

  if (minutesUntilReset < 60) {
    return `Limite de requêtes atteinte. Réessayez dans ${minutesUntilReset} minute${minutesUntilReset > 1 ? 's' : ''}.`;
  }

  const hoursUntilReset = Math.ceil(minutesUntilReset / 60);
  return `Limite de requêtes atteinte. Réessayez dans ${hoursUntilReset} heure${hoursUntilReset > 1 ? 's' : ''}.`;
}

/**
 * Vérifie si une opération peut être effectuée (rate limit + circuit breaker)
 */
export interface AIOperationCheck {
  allowed: boolean;
  reason?: string;
  retryAfter?: Date;
}

export function checkAIOperation(
  userId: string,
  operation: 'chat' | 'ocr' | 'test' | 'config'
): AIOperationCheck {
  // Vérifier le rate limit
  let rateLimitResult: RateLimitResult;

  switch (operation) {
    case 'chat':
      rateLimitResult = checkChatRateLimit(userId);
      break;
    case 'ocr':
      rateLimitResult = checkOCRRateLimit(userId);
      break;
    case 'test':
      rateLimitResult = checkTestRateLimit(userId);
      break;
    case 'config':
      rateLimitResult = checkConfigRateLimit(userId);
      break;
  }

  if (!rateLimitResult.allowed) {
    return {
      allowed: false,
      reason: formatRateLimitError(rateLimitResult),
      retryAfter: new Date(rateLimitResult.resetAt),
    };
  }

  // Vérifier le circuit breaker
  const circuitBreakerStatus = getCircuitBreakerStatus(userId);

  if (circuitBreakerStatus.isOpen) {
    return {
      allowed: false,
      reason: `Service temporairement indisponible en raison d'un taux d'erreur élevé. Réessayez dans quelques minutes.`,
      retryAfter: circuitBreakerStatus.resetAt,
    };
  }

  return {
    allowed: true,
  };
}

/**
 * Circuit Breaker - Stockage en mémoire
 * TODO: Migrer vers Redis pour partage entre instances
 */
interface CircuitBreakerState {
  userId: string;
  isOpen: boolean;
  consecutiveErrors: number;
  totalRequests: number;
  lastErrorAt?: Date;
  resetAt?: Date;
}

const circuitBreakerStore = new Map<string, CircuitBreakerState>();

/**
 * Enregistre le succès d'une requête
 */
export function recordSuccess(userId: string): void {
  const state = circuitBreakerStore.get(userId);

  if (!state) {
    circuitBreakerStore.set(userId, {
      userId,
      isOpen: false,
      consecutiveErrors: 0,
      totalRequests: 1,
    });
    return;
  }

  // Réinitialiser les erreurs consécutives
  state.consecutiveErrors = 0;
  state.totalRequests++;

  // Fermer le circuit breaker si ouvert et assez de temps écoulé
  if (state.isOpen && state.resetAt && new Date() >= state.resetAt) {
    state.isOpen = false;
    state.resetAt = undefined;
  }

  circuitBreakerStore.set(userId, state);
}

/**
 * Enregistre une erreur de requête
 */
export function recordError(userId: string): void {
  const state = circuitBreakerStore.get(userId);

  if (!state) {
    circuitBreakerStore.set(userId, {
      userId,
      isOpen: false,
      consecutiveErrors: 1,
      totalRequests: 1,
      lastErrorAt: new Date(),
    });
    return;
  }

  state.consecutiveErrors++;
  state.totalRequests++;
  state.lastErrorAt = new Date();

  // Ouvrir le circuit breaker si trop d'erreurs consécutives (10)
  if (state.consecutiveErrors >= 10) {
    state.isOpen = true;
    // Réinitialiser après 5 minutes
    state.resetAt = new Date(Date.now() + 5 * 60 * 1000);
  }

  // Ouvrir aussi si taux d'erreur > 50% sur les 20 dernières requêtes
  if (state.totalRequests >= 20) {
    const errorRate = state.consecutiveErrors / 20;
    if (errorRate >= 0.5) {
      state.isOpen = true;
      state.resetAt = new Date(Date.now() + 5 * 60 * 1000);
    }
    // Réinitialiser le compteur total pour ne pas garder un historique trop long
    state.totalRequests = 10;
  }

  circuitBreakerStore.set(userId, state);
}

/**
 * Récupère le statut du circuit breaker
 */
export function getCircuitBreakerStatus(userId: string): {
  isOpen: boolean;
  consecutiveErrors: number;
  resetAt?: Date;
} {
  const state = circuitBreakerStore.get(userId);

  if (!state) {
    return {
      isOpen: false,
      consecutiveErrors: 0,
    };
  }

  // Vérifier si le circuit breaker doit être fermé
  if (state.isOpen && state.resetAt && new Date() >= state.resetAt) {
    state.isOpen = false;
    state.consecutiveErrors = 0;
    state.resetAt = undefined;
    circuitBreakerStore.set(userId, state);
  }

  return {
    isOpen: state.isOpen,
    consecutiveErrors: state.consecutiveErrors,
    resetAt: state.resetAt,
  };
}

/**
 * Réinitialise le circuit breaker manuellement (admin)
 */
export function resetCircuitBreaker(userId: string): void {
  circuitBreakerStore.delete(userId);
}

/**
 * Récupère les statistiques globales des circuit breakers (admin)
 */
export function getCircuitBreakerStats(): {
  totalUsers: number;
  openCircuits: number;
  usersWithErrors: number;
} {
  let openCircuits = 0;
  let usersWithErrors = 0;

  for (const state of Array.from(circuitBreakerStore.values())) {
    if (state.isOpen) {
      openCircuits++;
    }
    if (state.consecutiveErrors > 0) {
      usersWithErrors++;
    }
  }

  return {
    totalUsers: circuitBreakerStore.size,
    openCircuits,
    usersWithErrors,
  };
}
