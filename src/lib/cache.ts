/**
 * Caching layer for social data
 * Phase 4 - Performance Optimization
 *
 * Uses Vercel KV (Redis) in production, in-memory fallback for development
 */

import { kv } from '@vercel/kv';

// In-memory cache fallback for development
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

// Cache configuration
const CACHE_CONFIG = {
  SHARED_SCORE_TTL: 5 * 60, // 5 minutes
  LEADERBOARD_TTL: 10 * 60, // 10 minutes
  USER_PROFILE_TTL: 15 * 60, // 15 minutes
} as const;

// Cache metrics (in-memory for simplicity)
interface CacheMetrics {
  hits: number;
  misses: number;
  writes: number;
  invalidations: number;
}

const metrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  writes: 0,
  invalidations: 0,
};

/**
 * Check if Redis is available
 */
function isRedisAvailable(): boolean {
  return process.env.KV_REST_API_URL !== undefined;
}

/**
 * Generate cache key for shared score data
 */
export function getSharedScoreKey(userId: string, friendId: string): string {
  return `shared:${userId}:${friendId}`;
}

/**
 * Generate cache key for leaderboard
 */
export function getLeaderboardKey(
  type: 'friends' | 'group' | 'national',
  id?: string
): string {
  if (type === 'friends' || type === 'national') {
    return `leaderboard:${type}`;
  }
  return `leaderboard:group:${id}`;
}

/**
 * Generate cache key for user profile summary
 */
export function getUserProfileKey(userId: string): string {
  return `user:profile:${userId}`;
}

/**
 * Get value from cache
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    if (isRedisAvailable()) {
      // Use Redis
      const value = await kv.get<T>(key);
      if (value !== null) {
        metrics.hits++;
        return value;
      }
    } else {
      // Use in-memory cache
      const cached = memoryCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        metrics.hits++;
        return cached.value as T;
      } else if (cached) {
        // Expired, remove it
        memoryCache.delete(key);
      }
    }

    metrics.misses++;
    return null;
  } catch (error) {
    console.error('[Cache] Error getting cached value:', error);
    metrics.misses++;
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  try {
    if (isRedisAvailable()) {
      // Use Redis
      await kv.setex(key, ttlSeconds, JSON.stringify(value));
    } else {
      // Use in-memory cache
      const expiresAt = Date.now() + ttlSeconds * 1000;
      memoryCache.set(key, { value, expiresAt });
    }
    metrics.writes++;
  } catch (error) {
    console.error('[Cache] Error setting cached value:', error);
  }
}

/**
 * Delete value from cache
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    if (isRedisAvailable()) {
      await kv.del(key);
    } else {
      memoryCache.delete(key);
    }
    metrics.invalidations++;
  } catch (error) {
    console.error('[Cache] Error deleting cached value:', error);
  }
}

/**
 * Invalidate all cache entries matching a pattern
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    if (isRedisAvailable()) {
      // Redis: use SCAN to find matching keys
      const keys: string[] = [];
      let cursor = 0;

      do {
        // @ts-ignore - Vercel KV may not have scan in types
        const result = await kv.scan(cursor, { match: pattern, count: 100 });
        cursor = typeof result[0] === 'string' ? parseInt(result[0], 10) : result[0];
        keys.push(...result[1]);
      } while (cursor !== 0);

      if (keys.length > 0) {
        await kv.del(...keys);
        metrics.invalidations += keys.length;
      }
    } else {
      // In-memory: filter and delete matching keys
      const regex = new RegExp(
        '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
      );
      const keysToDelete: string[] = [];

      for (const key of Array.from(memoryCache.keys())) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => memoryCache.delete(key));
      metrics.invalidations += keysToDelete.length;
    }
  } catch (error) {
    console.error('[Cache] Error invalidating pattern:', error);
  }
}

/**
 * Cache shared score data (after permission check)
 */
export async function cacheSharedScore(
  userId: string,
  friendId: string,
  data: any
): Promise<void> {
  const key = getSharedScoreKey(userId, friendId);
  await setCached(key, data, CACHE_CONFIG.SHARED_SCORE_TTL);
}

/**
 * Get cached shared score data
 */
export async function getCachedSharedScore(
  userId: string,
  friendId: string
): Promise<any | null> {
  const key = getSharedScoreKey(userId, friendId);
  return getCached(key);
}

/**
 * Invalidate user's shared data after score recalculation
 */
export async function invalidateUserSharedData(userId: string): Promise<void> {
  // Invalidate all shared score entries for this user
  await invalidatePattern(`shared:${userId}:*`);
  await invalidatePattern(`shared:*:${userId}`);

  // Invalidate user profile cache
  await deleteCached(getUserProfileKey(userId));

  // Invalidate leaderboards (user's position may have changed)
  await invalidatePattern('leaderboard:*');
}

/**
 * Get cache metrics for monitoring
 */
export function getCacheMetrics(): CacheMetrics & {
  hitRate: number;
  backend: 'redis' | 'memory';
} {
  const total = metrics.hits + metrics.misses;
  const hitRate = total > 0 ? (metrics.hits / total) * 100 : 0;

  return {
    ...metrics,
    hitRate,
    backend: isRedisAvailable() ? 'redis' : 'memory',
  };
}

/**
 * Reset cache metrics (for testing)
 */
export function resetCacheMetrics(): void {
  metrics.hits = 0;
  metrics.misses = 0;
  metrics.writes = 0;
  metrics.invalidations = 0;
}

/**
 * Clear all cache (development/testing only)
 */
export async function clearAllCache(): Promise<void> {
  if (isRedisAvailable()) {
    await kv.flushdb();
  } else {
    memoryCache.clear();
  }
  console.log('[Cache] All cache cleared');
}
