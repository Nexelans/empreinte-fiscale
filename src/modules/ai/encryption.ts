/**
 * Module de chiffrement pour les clés API utilisateur
 * Phase 4 - Module AI
 *
 * Utilise AES-256-CBC pour chiffrer les clés API des utilisateurs
 * La clé de chiffrement principale est stockée dans ENCRYPTION_KEY env var
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // Pour AES, l'IV fait toujours 16 bytes
const KEY_LENGTH = 32; // 256 bits

/**
 * Dérive une clé de 32 bytes à partir de la clé d'environnement
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Si la clé est déjà en hex et fait 32 bytes, l'utiliser directement
  if (key.length === KEY_LENGTH * 2) {
    return Buffer.from(key, 'hex');
  }

  // Sinon, dériver une clé de 32 bytes avec SHA-256
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Chiffre une clé API avec AES-256-CBC
 *
 * @param plaintext - La clé API en clair
 * @returns La clé chiffrée au format: iv:encrypted (hex:hex)
 *
 * @example
 * const encrypted = encryptKey('sk-proj-abc123...');
 * // Returns: "5f8a9b3c...16bytes:7d4e2f1a...encrypteddata"
 */
export function encryptKey(plaintext: string): string {
  if (!plaintext || plaintext.trim() === '') {
    throw new Error('Cannot encrypt empty string');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Format: iv:encrypted (les deux en hex)
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Déchiffre une clé API
 *
 * @param encryptedData - La clé chiffrée au format iv:encrypted
 * @returns La clé API en clair
 *
 * @example
 * const decrypted = decryptKey('5f8a9b3c...16bytes:7d4e2f1a...');
 * // Returns: "sk-proj-abc123..."
 */
export function decryptKey(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(':')) {
    throw new Error('Invalid encrypted data format. Expected format: iv:encrypted');
  }

  const key = getEncryptionKey();
  const [ivHex, encryptedHex] = encryptedData.split(':');

  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(ivHex, 'hex');

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length. Expected ${IV_LENGTH} bytes, got ${iv.length}`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Teste si une clé peut être déchiffrée correctement
 * Utile pour valider qu'une clé stockée n'est pas corrompue
 */
export function testEncryption(encryptedData: string): boolean {
  try {
    decryptKey(encryptedData);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Change la clé de chiffrement pour une clé API
 * Utilisé lors de la rotation de ENCRYPTION_KEY
 *
 * @param encryptedData - Données chiffrées avec l'ancienne clé
 * @param oldEncryptionKey - Ancienne clé de chiffrement
 * @returns Données rechiffrées avec la nouvelle clé
 */
export function reEncryptKey(
  encryptedData: string,
  oldEncryptionKey: string
): string {
  // Sauvegarder la clé actuelle
  const currentKey = process.env.ENCRYPTION_KEY;

  try {
    // Utiliser temporairement l'ancienne clé pour déchiffrer
    process.env.ENCRYPTION_KEY = oldEncryptionKey;
    const plaintext = decryptKey(encryptedData);

    // Restaurer la nouvelle clé et rechiffrer
    process.env.ENCRYPTION_KEY = currentKey;
    return encryptKey(plaintext);
  } finally {
    // S'assurer de toujours restaurer la clé
    process.env.ENCRYPTION_KEY = currentKey;
  }
}
