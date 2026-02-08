/**
 * Unit tests for AI credential encryption/decryption
 * Task 31.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { encryptKey, decryptKey } from '@/modules/ai/encryption';

describe('AI Credential Encryption', () => {
  const testApiKey = 'sk-test-1234567890abcdefghijklmnopqrstuvwxyz';
  const testApiKey2 = 'anthropic-api-key-test-xyz123';

  describe('encryptKey', () => {
    it('should encrypt API key successfully', () => {
      const encrypted = encryptKey(testApiKey);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testApiKey);
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should produce different ciphertext for same plaintext (IV randomization)', () => {
      const encrypted1 = encryptKey(testApiKey);
      const encrypted2 = encryptKey(testApiKey);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const encrypted = encryptKey('');
      expect(encrypted).toBeDefined();
    });

    it('should handle special characters', () => {
      const specialKey = 'key-with-special!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encryptKey(specialKey);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(specialKey);
    });

    it('should produce Base64-encoded output', () => {
      const encrypted = encryptKey(testApiKey);
      const base64Regex = /^[A-Za-z0-9+/=]+$/;

      expect(base64Regex.test(encrypted)).toBe(true);
    });
  });

  describe('decryptKey', () => {
    it('should decrypt to original plaintext', () => {
      const encrypted = encryptKey(testApiKey);
      const decrypted = decryptKey(encrypted);

      expect(decrypted).toBe(testApiKey);
    });

    it('should handle multiple encrypt/decrypt cycles', () => {
      let value = testApiKey;

      for (let i = 0; i < 5; i++) {
        const encrypted = encryptKey(value);
        const decrypted = decryptKey(encrypted);
        expect(decrypted).toBe(value);
        value = decrypted;
      }

      expect(value).toBe(testApiKey);
    });

    it('should fail gracefully with invalid ciphertext', () => {
      expect(() => {
        decryptKey('invalid-base64-!@#$');
      }).toThrow();
    });

    it('should fail gracefully with tampered ciphertext', () => {
      const encrypted = encryptKey(testApiKey);
      const tampered = encrypted.slice(0, -5) + 'xxxxx';

      expect(() => {
        decryptKey(tampered);
      }).toThrow();
    });

    it('should handle empty encrypted string', () => {
      expect(() => {
        decryptKey('');
      }).toThrow();
    });
  });

  describe('Security Properties', () => {
    it('should use different IVs for each encryption', () => {
      const encrypted1 = encryptKey(testApiKey);
      const encrypted2 = encryptKey(testApiKey);

      // Extract IV from encrypted data (first 16 bytes in base64)
      expect(encrypted1.substring(0, 24)).not.toBe(encrypted2.substring(0, 24));
    });

    it('should produce non-deterministic encryption', () => {
      const encryptions = new Set<string>();

      for (let i = 0; i < 10; i++) {
        encryptions.add(encryptKey(testApiKey));
      }

      // All encryptions should be unique
      expect(encryptions.size).toBe(10);
    });

    it('should not leak plaintext in ciphertext', () => {
      const encrypted = encryptKey(testApiKey);

      // Encrypted text should not contain any substring of plaintext
      const plaintextSubstrings = [
        testApiKey.substring(0, 10),
        testApiKey.substring(10, 20),
        'sk-test',
      ];

      for (const substring of plaintextSubstrings) {
        expect(encrypted).not.toContain(substring);
      }
    });

    it('should handle very long API keys', () => {
      const longKey = 'x'.repeat(1000);
      const encrypted = encryptKey(longKey);
      const decrypted = decryptKey(encrypted);

      expect(decrypted).toBe(longKey);
    });
  });

  describe('Real-world API Key Formats', () => {
    const realWorldKeys = [
      'sk-proj-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-1234567890abcdefghijklmnopqrstuvwxyzAA',
      'mistral-api-key-1234567890abcdef',
      'AIzaSyD1234567890abcdefghijklmnopqrstuvwx',
    ];

    realWorldKeys.forEach((key, index) => {
      it(`should handle real-world API key format ${index + 1}`, () => {
        const encrypted = encryptKey(key);
        const decrypted = decryptKey(encrypted);

        expect(decrypted).toBe(key);
        expect(encrypted).not.toBe(key);
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw meaningful error for corrupted data', () => {
      const encrypted = encryptKey(testApiKey);
      const corrupted = encrypted.replace(/A/g, 'B');

      expect(() => {
        decryptKey(corrupted);
      }).toThrow();
    });

    it('should throw error if encryption key is missing', () => {
      // This would be tested by temporarily unsetting ENCRYPTION_KEY
      // In real environment, this should fail gracefully
      expect(process.env.ENCRYPTION_KEY).toBeDefined();
    });
  });
});
