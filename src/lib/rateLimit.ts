/**
 * Rate limiting utility
 * Phase 4 - Infrastructure
 *
 * TODO: Migrer vers Redis (Task 30.1) pour la production
 * Pour le moment, utilise un cache en mémoire (non-persistent, single-instance)
 */

interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

// Cache en mémoire (sera remplacé par Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Nettoyage périodique des entrées expirées
setInterval(() => {
  const now = new Date();
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Nettoyage toutes les minutes

export interface RateLimitConfig {
  key: string;        // Clé unique (ex: "invite:userId")
  limit: number;      // Nombre max de requêtes
  windowMs: number;   // Fenêtre de temps en ms
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Vérifie si une action est autorisée selon les limites de taux
 * @param config - Configuration du rate limit
 * @returns Résultat avec allowed, remaining, resetAt
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { key, limit, windowMs } = config;
  const now = new Date();

  let entry = rateLimitStore.get(key);

  // Première requête ou fenêtre expirée
  if (!entry || entry.resetAt < now) {
    const resetAt = new Date(now.getTime() + windowMs);
    entry = {
      count: 1,
      resetAt,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
    };
  }

  // Incrémenter le compteur
  entry.count++;

  // Vérifier si la limite est atteinte
  const allowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limiter pour les invitations d'amis
 * Max 10 invitations par jour par utilisateur
 */
export function checkInvitationRateLimit(userId: string): RateLimitResult {
  return checkRateLimit({
    key: `invite:${userId}`,
    limit: 10,
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
  });
}

/**
 * Rate limiter pour les requêtes d'IA
 * Max 100 requêtes par 24 heures par utilisateur
 */
export function checkAIRateLimit(userId: string): RateLimitResult {
  return checkRateLimit({
    key: `ai:${userId}`,
    limit: 100,
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
  });
}

/**
 * Réinitialise le rate limit pour une clé donnée
 * Utile pour les tests ou pour donner des crédits supplémentaires
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}
