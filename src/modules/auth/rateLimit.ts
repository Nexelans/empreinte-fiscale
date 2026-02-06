// Simple in-memory rate limiter for login attempts
// In production, this should use Redis or a database

interface LoginAttempt {
  count: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Check if an email is currently locked out
 */
export function isLocked(email: string): boolean {
  const attempt = loginAttempts.get(email);
  if (!attempt || !attempt.lockedUntil) return false;

  if (Date.now() < attempt.lockedUntil) {
    return true;
  }

  // Lock expired, reset
  loginAttempts.delete(email);
  return false;
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(email: string): void {
  const attempt = loginAttempts.get(email) || { count: 0 };
  attempt.count++;

  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = Date.now() + LOCK_DURATION;
  }

  loginAttempts.set(email, attempt);
}

/**
 * Reset login attempts on successful login
 */
export function resetAttempts(email: string): void {
  loginAttempts.delete(email);
}

/**
 * Get remaining attempts before lockout
 */
export function getRemainingAttempts(email: string): number {
  const attempt = loginAttempts.get(email);
  if (!attempt) return MAX_ATTEMPTS;
  return Math.max(0, MAX_ATTEMPTS - attempt.count);
}
