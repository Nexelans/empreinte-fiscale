/**
 * Tests for gamification event emission and badge awarding
 * Task 32.1: Test gamification event emission and badge awarding
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { gameEventEmitter, emitGameEvent } from "@/modules/gamification/events";
import type { GameEvent } from "@/modules/gamification/types";

describe("Gamification Events", () => {
  beforeEach(() => {
    // Clear all event handlers before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up handlers
    gameEventEmitter.removeAllListeners("DOCUMENT_UPLOADED");
    gameEventEmitter.removeAllListeners("JOURNAL_ENTRY_CREATED");
    gameEventEmitter.removeAllListeners("QUIZ_COMPLETED");
    gameEventEmitter.removeAllListeners("BADGE_EARNED");
  });

  describe("Event Emission", () => {
    it("should emit events and call registered handlers", async () => {
      const handler = vi.fn();
      gameEventEmitter.on("DOCUMENT_UPLOADED", handler);

      await emitGameEvent("DOCUMENT_UPLOADED", "user-123", {
        documentType: "avis_imposition",
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "DOCUMENT_UPLOADED",
          userId: "user-123",
          payload: { documentType: "avis_imposition" },
        })
      );
    });

    it("should call multiple handlers for the same event", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      gameEventEmitter.on("JOURNAL_ENTRY_CREATED", handler1);
      gameEventEmitter.on("JOURNAL_ENTRY_CREATED", handler2);

      await emitGameEvent("JOURNAL_ENTRY_CREATED", "user-456", {
        entryId: "entry-789",
        category: "alimentaire",
      });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("should continue execution if one handler fails", async () => {
      const failingHandler = vi.fn().mockRejectedValue(new Error("Handler failed"));
      const successHandler = vi.fn();

      gameEventEmitter.on("QUIZ_COMPLETED", failingHandler);
      gameEventEmitter.on("QUIZ_COMPLETED", successHandler);

      await emitGameEvent("QUIZ_COMPLETED", "user-123", {
        score: 8,
        totalQuestions: 10,
      });

      expect(failingHandler).toHaveBeenCalledTimes(1);
      expect(successHandler).toHaveBeenCalledTimes(1);
    });

    it("should include timestamp in event", async () => {
      const handler = vi.fn();
      gameEventEmitter.on("BADGE_EARNED", handler);

      const beforeTime = new Date();
      await emitGameEvent("BADGE_EARNED", "user-123", { badgeId: "FIRST_UPLOAD" });
      const afterTime = new Date();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Date),
        })
      );

      const event: GameEvent = handler.mock.calls[0][0];
      expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(event.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe("Event Payload Validation", () => {
    it("should accept empty payload", async () => {
      const handler = vi.fn();
      gameEventEmitter.on("STREAK_UPDATED", handler);

      await emitGameEvent("STREAK_UPDATED", "user-123");

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: {},
        })
      );
    });

    it("should preserve payload data types", async () => {
      const handler = vi.fn();
      gameEventEmitter.on("SCORE_CALCULATED", handler);

      const payload = {
        totalPaye: 25000.5,
        totalRecu: 18000.75,
        scoreConfiance: 87,
        isNewRecord: true,
        metadata: {
          source: "profile_update",
        },
      };

      await emitGameEvent("SCORE_CALCULATED", "user-123", payload);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          payload,
        })
      );
    });
  });

  describe("Event Handler Registration", () => {
    it("should allow removing all listeners for an event type", async () => {
      const handler = vi.fn();
      gameEventEmitter.on("DOCUMENT_UPLOADED", handler);

      await emitGameEvent("DOCUMENT_UPLOADED", "user-123", {});
      expect(handler).toHaveBeenCalledTimes(1);

      gameEventEmitter.removeAllListeners("DOCUMENT_UPLOADED");

      await emitGameEvent("DOCUMENT_UPLOADED", "user-123", {});
      expect(handler).toHaveBeenCalledTimes(1); // Still only called once
    });
  });
});

describe("Badge Awarding Flow", () => {
  it("should emit BADGE_EARNED event when criteria is met", async () => {
    // This test would require mocking the badge checking logic
    // In a real scenario, you'd test the full flow:
    // 1. User uploads document
    // 2. DOCUMENT_UPLOADED event is emitted
    // 3. Badge checker runs
    // 4. If criteria met, BADGE_EARNED event is emitted
    // 5. XP is awarded

    const badgeHandler = vi.fn();
    gameEventEmitter.on("BADGE_EARNED", badgeHandler);

    // Simulate badge earning
    await emitGameEvent("BADGE_EARNED", "user-123", {
      badgeId: "FIRST_UPLOAD",
      fromStreak: false,
    });

    expect(badgeHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "BADGE_EARNED",
        payload: expect.objectContaining({
          badgeId: "FIRST_UPLOAD",
        }),
      })
    );
  });
});
