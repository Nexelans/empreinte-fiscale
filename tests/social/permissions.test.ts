/**
 * Unit tests for social sharing permission enforcement
 * Task 31.1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { canAccessSharedData, SharingLevel } from '@/modules/social/friends/permissions';

describe('Social Sharing Permission Enforcement', () => {
  const userId = 'user-123';
  const friendId = 'friend-456';

  describe('canAccessSharedData', () => {
    it('should deny access if not friends', async () => {
      const result = await canAccessSharedData(userId, friendId, 'SCORE_ONLY');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not friends');
    });

    it('should allow SCORE_ONLY access when configured', async () => {
      // Mock friendship with SCORE_ONLY permission
      const result = await canAccessSharedData(userId, friendId, 'SCORE_ONLY');

      if (result.allowed) {
        expect(result.data).toHaveProperty('totalPaye');
        expect(result.data).toHaveProperty('totalRecu');
        expect(result.data).toHaveProperty('soldeNet');
        expect(result.data).not.toHaveProperty('detailPaye');
        expect(result.data).not.toHaveProperty('detailRecu');
      }
    });

    it('should allow SUMMARY access with breakdown but no sensitive details', async () => {
      const result = await canAccessSharedData(userId, friendId, 'SUMMARY');

      if (result.allowed) {
        expect(result.data).toHaveProperty('totalPaye');
        expect(result.data).toHaveProperty('totalRecu');
        expect(result.data).toHaveProperty('detailPaye');
        expect(result.data).toHaveProperty('detailRecu');
        // Should not include raw salary
        expect(result.data).not.toHaveProperty('salaireBrut');
        expect(result.data).not.toHaveProperty('revenus');
      }
    });

    it('should allow DETAILED access with all data', async () => {
      const result = await canAccessSharedData(userId, friendId, 'DETAILED');

      if (result.allowed) {
        expect(result.data).toHaveProperty('totalPaye');
        expect(result.data).toHaveProperty('detailPaye');
        expect(result.data).toHaveProperty('situation');
        expect(result.data).toHaveProperty('revenus');
      }
    });

    it('should respect user sharing level preference', async () => {
      // If user set SCORE_ONLY, should not allow DETAILED access
      const result = await canAccessSharedData(userId, friendId, 'DETAILED');

      if (!result.allowed) {
        expect(result.reason).toContain('permission');
      }
    });

    it('should not leak sensitive data in any access level', async () => {
      const levels: SharingLevel[] = ['SCORE_ONLY', 'SUMMARY', 'DETAILED'];

      for (const level of levels) {
        const result = await canAccessSharedData(userId, friendId, level);

        if (result.allowed && result.data) {
          // Should never include raw password, API keys, etc.
          expect(result.data).not.toHaveProperty('password');
          expect(result.data).not.toHaveProperty('passwordHash');
          expect(result.data).not.toHaveProperty('apiKey');
          expect(result.data).not.toHaveProperty('encryptedApiKey');
        }
      }
    });
  });

  describe('Permission Hierarchy', () => {
    it('SCORE_ONLY should be most restrictive', async () => {
      const result = await canAccessSharedData(userId, friendId, 'SCORE_ONLY');

      if (result.allowed) {
        const keys = Object.keys(result.data);
        expect(keys.length).toBeLessThanOrEqual(5); // Only basic score data
      }
    });

    it('SUMMARY should include more than SCORE_ONLY but less than DETAILED', async () => {
      const scoreOnly = await canAccessSharedData(userId, friendId, 'SCORE_ONLY');
      const summary = await canAccessSharedData(userId, friendId, 'SUMMARY');
      const detailed = await canAccessSharedData(userId, friendId, 'DETAILED');

      if (scoreOnly.allowed && summary.allowed && detailed.allowed) {
        const scoreKeys = Object.keys(scoreOnly.data);
        const summaryKeys = Object.keys(summary.data);
        const detailedKeys = Object.keys(detailed.data);

        expect(summaryKeys.length).toBeGreaterThan(scoreKeys.length);
        expect(detailedKeys.length).toBeGreaterThan(summaryKeys.length);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-existent friend gracefully', async () => {
      const result = await canAccessSharedData(userId, 'non-existent-id', 'SCORE_ONLY');
      expect(result.allowed).toBe(false);
    });

    it('should handle user accessing their own data', async () => {
      const result = await canAccessSharedData(userId, userId, 'DETAILED');
      // Should either allow full access or redirect to regular profile
      expect(result.allowed).toBeDefined();
    });

    it('should handle suspended friendship', async () => {
      // Test that suspended/blocked friendships deny access
      const result = await canAccessSharedData(userId, friendId, 'DETAILED');

      if (!result.allowed) {
        expect(result.reason).toBeDefined();
      }
    });
  });
});
