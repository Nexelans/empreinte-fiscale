/**
 * Système d'événements pour la gamification
 * Event-driven architecture pour découpler la logique métier et les récompenses
 */

import type { GameEvent, GameEventType } from "./types";

type EventHandler = (event: GameEvent) => Promise<void>;

class GameEventEmitter {
  private handlers: Map<GameEventType, EventHandler[]> = new Map();

  /**
   * Enregistre un handler pour un type d'événement
   */
  on(eventType: GameEventType, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Émet un événement et exécute tous les handlers associés
   */
  async emit(event: GameEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    // Execute all handlers in parallel
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`[GameEvent] Error in handler for ${event.type}:`, error);
          // Don't throw - we want other handlers to continue
        }
      })
    );
  }

  /**
   * Supprime tous les handlers pour un type d'événement
   */
  removeAllListeners(eventType: GameEventType): void {
    this.handlers.delete(eventType);
  }
}

// Singleton instance
export const gameEventEmitter = new GameEventEmitter();

/**
 * Helper pour créer et émettre un événement
 */
export async function emitGameEvent(
  type: GameEventType,
  userId: string,
  payload: Record<string, any> = {}
): Promise<void> {
  const event: GameEvent = {
    type,
    userId,
    timestamp: new Date(),
    payload,
  };

  await gameEventEmitter.emit(event);
}

/**
 * Enregistre les handlers par défaut pour la gamification
 */
export function registerDefaultHandlers(): void {
  // Import handlers (lazy to avoid circular dependencies)
  import("./badges").then(({ handleBadgeCheck }) => {
    gameEventEmitter.on("DOCUMENT_UPLOADED", handleBadgeCheck);
    gameEventEmitter.on("JOURNAL_ENTRY_CREATED", handleBadgeCheck);
    gameEventEmitter.on("SCORE_CALCULATED", handleBadgeCheck);
    gameEventEmitter.on("STREAK_UPDATED", handleBadgeCheck);
    gameEventEmitter.on("QUIZ_COMPLETED", handleBadgeCheck);
    gameEventEmitter.on("SIMULATION_CREATED", handleBadgeCheck);
  });

  import("./challenges").then(({ handleChallengeProgress }) => {
    gameEventEmitter.on("DOCUMENT_UPLOADED", handleChallengeProgress);
    gameEventEmitter.on("JOURNAL_ENTRY_CREATED", handleChallengeProgress);
    gameEventEmitter.on("QUIZ_COMPLETED", handleChallengeProgress);
    gameEventEmitter.on("SIMULATION_CREATED", handleChallengeProgress);
  });

  import("./xp").then(({ handleXPAward }) => {
    gameEventEmitter.on("DOCUMENT_UPLOADED", handleXPAward);
    gameEventEmitter.on("JOURNAL_ENTRY_CREATED", handleXPAward);
    gameEventEmitter.on("QUIZ_COMPLETED", handleXPAward);
    gameEventEmitter.on("BADGE_EARNED", handleXPAward);
    gameEventEmitter.on("CHALLENGE_COMPLETED", handleXPAward);
  });
}
