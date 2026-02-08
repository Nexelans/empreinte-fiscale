/**
 * Export module for Wrapped Fiscal
 * Generates PNG and MP4 exports of the annual fiscal wrapped
 * Phase 4 - Social Features
 */

import puppeteer from 'puppeteer';

export interface WrappedData {
  year: number;
  totalPaye: number;
  totalRecu: number;
  soldeNet: number;
  ratio: number;
  topCategories: {
    paye: Array<{ category: string; amount: number }>;
    recu: Array<{ category: string; amount: number }>;
  };
  badges: Array<{ id: string; name: string; emoji: string }>;
  comparisonVsPrevious?: {
    payeDiff: number;
    recuDiff: number;
    soldeDiff: number;
  };
}

/**
 * Génère une image PNG du Wrapped fiscal
 * Utilise Puppeteer pour rendre un composant React en image
 *
 * @param wrappedData - Données du wrapped à exporter
 * @param shareId - ID unique pour le partage
 * @returns Buffer contenant l'image PNG
 */
export async function generatePNG(
  wrappedData: WrappedData,
  shareId: string
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Définir la taille de l'image (format story Instagram/X)
    await page.setViewport({
      width: 1080,
      height: 1920,
      deviceScaleFactor: 2, // Haute résolution
    });

    // Charger la page de wrapped avec le shareId
    const url = `${process.env.NEXTAUTH_URL}/wrapped/share/${shareId}?export=png`;
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Attendre que l'animation soit complète
    await page.waitForSelector('[data-export-ready="true"]', {
      timeout: 10000,
    });

    // Prendre le screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false, // Utiliser seulement le viewport
    });

    return screenshot as Buffer;
  } finally {
    await browser.close();
  }
}

/**
 * Génère une vidéo MP4 du Wrapped fiscal avec animations
 * Utilise Puppeteer pour enregistrer la page pendant l'animation
 *
 * NOTE: Cette fonction nécessite ffmpeg installé sur le serveur
 * Alternative: Utiliser un service tiers (Remotion, Bannerbear) pour la prod
 *
 * @param wrappedData - Données du wrapped à exporter
 * @param shareId - ID unique pour le partage
 * @returns Buffer contenant la vidéo MP4
 */
export async function generateMP4(
  wrappedData: WrappedData,
  shareId: string
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1080,
      height: 1920,
      deviceScaleFactor: 1,
    });

    // Charger la page avec le mode export vidéo
    const url = `${process.env.NEXTAUTH_URL}/wrapped/share/${shareId}?export=mp4`;
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Démarrer l'enregistrement vidéo
    // NOTE: Puppeteer ne supporte pas nativement l'enregistrement vidéo
    // Cette implémentation est un placeholder

    // Solution simplifiée: Capturer plusieurs frames et les assembler avec ffmpeg
    const frames: Buffer[] = [];
    const frameDuration = 100; // ms entre chaque frame
    const totalDuration = 15000; // 15 secondes d'animation
    const frameCount = totalDuration / frameDuration;

    for (let i = 0; i < frameCount; i++) {
      const frame = await page.screenshot({
        type: 'png',
      });
      frames.push(frame as Buffer);

      // Attendre avant la prochaine frame
      await new Promise(resolve => setTimeout(resolve, frameDuration));
    }

    // TODO: Utiliser ffmpeg pour assembler les frames en vidéo
    // Pour le MVP, retourner la première frame comme placeholder
    // En production, utiliser un service comme Remotion ou Bannerbear

    console.warn('MP4 generation not fully implemented - returning PNG instead');
    return frames[0]!;
  } finally {
    await browser.close();
  }
}

/**
 * Génère une URL de partage publique pour le wrapped
 * @param shareId - ID unique du wrapped
 * @returns URL publique
 */
export function getShareURL(shareId: string): string {
  return `${process.env.NEXTAUTH_URL}/wrapped/share/${shareId}`;
}

/**
 * Génère un shareId unique et sécurisé
 * @returns shareId (UUID v4)
 */
export function generateShareId(): string {
  return crypto.randomUUID();
}

/**
 * Formate les données wrapped pour l'affichage
 * Arrondit les valeurs et prépare les textes
 */
export function formatWrappedForDisplay(data: WrappedData) {
  return {
    year: data.year,
    totalPaye: Math.round(data.totalPaye),
    totalRecu: Math.round(data.totalRecu),
    soldeNet: Math.round(data.soldeNet),
    ratio: Math.round(data.ratio * 10) / 10, // 1 décimale

    topPaye: data.topCategories.paye.map((c) => ({
      ...c,
      amount: Math.round(c.amount),
      percentage: Math.round((c.amount / data.totalPaye) * 100),
    })),

    topRecu: data.topCategories.recu.map((c) => ({
      ...c,
      amount: Math.round(c.amount),
      percentage: Math.round((c.amount / data.totalRecu) * 100),
    })),

    badges: data.badges,

    comparison: data.comparisonVsPrevious
      ? {
          payeDiff: Math.round(data.comparisonVsPrevious.payeDiff),
          recuDiff: Math.round(data.comparisonVsPrevious.recuDiff),
          soldeDiff: Math.round(data.comparisonVsPrevious.soldeDiff),
          payeEvolution: Math.round(
            (data.comparisonVsPrevious.payeDiff / (data.totalPaye - data.comparisonVsPrevious.payeDiff)) * 100
          ),
          recuEvolution: Math.round(
            (data.comparisonVsPrevious.recuDiff / (data.totalRecu - data.comparisonVsPrevious.recuDiff)) * 100
          ),
        }
      : null,
  };
}
