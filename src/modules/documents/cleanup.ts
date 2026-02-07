/**
 * Utilitaires de nettoyage des fichiers uploadés (RGPD compliance)
 */

import fs from "fs/promises";
import path from "path";

/**
 * Supprime un fichier uploadé
 * @param filePath Chemin absolu du fichier à supprimer
 */
export async function deleteUploadedFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    console.log(`[Cleanup] File deleted: ${filePath}`);
  } catch (error) {
    // Ne pas throw si le fichier n'existe pas déjà
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`[Cleanup] Error deleting file ${filePath}:`, error);
      throw error;
    }
  }
}

/**
 * Nettoie tous les fichiers d'un répertoire plus anciens qu'une durée donnée
 * @param dirPath Chemin du répertoire à nettoyer
 * @param maxAgeHours Âge maximal en heures (défaut: 24h)
 */
export async function cleanupOldFiles(
  dirPath: string,
  maxAgeHours: number = 24
): Promise<number> {
  try {
    const files = await fs.readdir(dirPath);
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);

      // Vérifier si le fichier est plus ancien que maxAge
      if (stats.isFile() && now - stats.mtimeMs > maxAgeMs) {
        await deleteUploadedFile(filePath);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Cleanup] Deleted ${deletedCount} old files from ${dirPath}`);
    }

    return deletedCount;
  } catch (error) {
    console.error(`[Cleanup] Error cleaning directory ${dirPath}:`, error);
    throw error;
  }
}

/**
 * Vérifie la taille du répertoire d'uploads
 * @param dirPath Chemin du répertoire à vérifier
 * @returns Taille en bytes
 */
export async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    const files = await fs.readdir(dirPath);
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error(`[Cleanup] Error getting directory size ${dirPath}:`, error);
    return 0;
  }
}

/**
 * Monitore la taille du répertoire et nettoie si nécessaire
 * @param dirPath Chemin du répertoire à monitorer
 * @param maxSizeMB Taille maximale en MB (défaut: 100MB)
 */
export async function monitorDirectorySize(
  dirPath: string,
  maxSizeMB: number = 100
): Promise<boolean> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const currentSize = await getDirectorySize(dirPath);

  if (currentSize > maxSizeBytes) {
    console.warn(
      `[Cleanup] Directory ${dirPath} exceeds ${maxSizeMB}MB (current: ${(currentSize / 1024 / 1024).toFixed(2)}MB)`
    );
    // Nettoyer les fichiers > 1h
    await cleanupOldFiles(dirPath, 1);
    return true;
  }

  return false;
}

/**
 * Configuration du cron job de nettoyage (à appeler dans un script séparé)
 * Exemple d'utilisation avec node-cron:
 *
 * import cron from 'node-cron';
 *
 * cron.schedule('0 * * * *', async () => {
 *   await cleanupOldFiles('/tmp/uploads', 24);
 * });
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "/tmp/uploads";
