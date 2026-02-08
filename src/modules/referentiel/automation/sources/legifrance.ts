/**
 * Intégration Legifrance RSS pour l'automation du Référentiel
 * Phase 4 - Referentiel Automation
 *
 * Parse les flux RSS Legifrance pour détecter les changements législatifs
 */

import { DataSource, ExtractionResult, PollResult } from '../types';

const LEGIFRANCE_RSS_FEEDS = [
  {
    url: 'https://www.legifrance.gouv.fr/rss/jo.xml',
    name: 'Journal Officiel',
    categorie: 'LEGISLATION',
  },
  {
    url: 'https://www.legifrance.gouv.fr/rss/lois.xml',
    name: 'Lois et règlements',
    categorie: 'LEGISLATION',
  },
];

/**
 * Mots-clés fiscaux à surveiller
 */
const FISCAL_KEYWORDS = [
  'impôt',
  'taxe',
  'cotisation',
  'bareme',
  'taux',
  'fiscal',
  'TVA',
  'CSG',
  'CRDS',
  'prélèvement',
  'contribution',
];

/**
 * Poll les flux RSS Legifrance pour des mises à jour
 */
export async function pollLegifrance(source: DataSource): Promise<PollResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let updatesDetected = 0;

  try {
    // Pour chaque flux RSS
    for (const feed of LEGIFRANCE_RSS_FEEDS) {
      try {
        const result = await fetchRSSFeed(feed.url, feed.categorie);

        if (result.success) {
          updatesDetected += result.data.length;
        } else {
          errors.push(...result.errors);
        }
      } catch (error: any) {
        errors.push(`Feed ${feed.name}: ${error.message}`);
      }
    }

    const latency = Date.now() - startTime;

    return {
      sourceId: source.id,
      success: errors.length === 0,
      updatesDetected,
      errors,
      latency,
      timestamp: new Date(),
    };
  } catch (error: any) {
    return {
      sourceId: source.id,
      success: false,
      updatesDetected: 0,
      errors: [error.message || 'Unknown error'],
      latency: Date.now() - startTime,
      timestamp: new Date(),
    };
  }
}

/**
 * Récupère et parse un flux RSS
 */
async function fetchRSSFeed(
  url: string,
  categorie: string
): Promise<ExtractionResult> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();

    // Parse XML basique
    // Dans une implémentation complète, utiliser une librairie comme xml2js
    const items = extractRSSItems(xmlText);

    const extractedData: ExtractionResult['data'] = [];
    const warnings: string[] = [];

    for (const item of items) {
      // Filtrer uniquement les items contenant des mots-clés fiscaux
      const text = `${item.title} ${item.description}`.toLowerCase();
      const isFiscal = FISCAL_KEYWORDS.some((keyword) =>
        text.includes(keyword.toLowerCase())
      );

      if (isFiscal) {
        const transformed = transformRSSItem(item, categorie);
        if (transformed) {
          extractedData.push(transformed);
        }
      } else {
        warnings.push(`Item filtered out (no fiscal keywords): ${item.title}`);
      }
    }

    return {
      success: true,
      data: extractedData,
      errors: [],
      warnings,
      metadata: {
        extractedAt: new Date(),
        sourceUrl: url,
        recordCount: extractedData.length,
        method: 'rss-parser',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      errors: [error.message || 'Failed to fetch RSS feed'],
      warnings: [],
      metadata: {
        extractedAt: new Date(),
        sourceUrl: url,
        recordCount: 0,
        method: 'rss-parser',
      },
    };
  }
}

/**
 * Extrait les items d'un flux RSS (parse XML basique)
 */
function extractRSSItems(xmlText: string): Array<{
  title: string;
  link: string;
  description: string;
  pubDate: string;
}> {
  const items: Array<{
    title: string;
    link: string;
    description: string;
    pubDate: string;
  }> = [];

  // Parse très basique avec regex (pour production, utiliser un parser XML)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const matches = xmlText.matchAll(itemRegex);

  for (const match of Array.from(matches)) {
    const itemContent = match[1]!;

    const title = extractTag(itemContent, 'title');
    const link = extractTag(itemContent, 'link');
    const description = extractTag(itemContent, 'description');
    const pubDate = extractTag(itemContent, 'pubDate');

    if (title && link) {
      items.push({ title, link, description, pubDate });
    }
  }

  return items;
}

/**
 * Extrait le contenu d'un tag XML
 */
function extractTag(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1]!.trim() : '';
}

/**
 * Transforme un item RSS en entrée Référentiel
 */
function transformRSSItem(
  item: { title: string; link: string; description: string; pubDate: string },
  categorie: string
): ExtractionResult['data'][0] | null {
  // Extraire l'année de publication
  const pubDate = new Date(item.pubDate || Date.now());
  const year = pubDate.getFullYear().toString();

  // Générer une clé unique basée sur le titre
  const cle = `legislation.${item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .substring(0, 50)}`;

  return {
    millesime: year,
    categorie: 'LEGISLATION',
    cle,
    valeur: {
      title: item.title,
      description: item.description,
      url: item.link,
      pubDate: pubDate.toISOString(),
    },
    unite: 'texte',
    source: 'Legifrance - Journal Officiel',
    urlSource: item.link,
    datePublication: pubDate,
    notes: `Détecté automatiquement via RSS. Nécessite une revue manuelle.`,
  };
}

/**
 * Vérifie la santé des flux RSS Legifrance
 */
export async function checkLegifranceHealth(): Promise<{
  available: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // Tester le premier flux RSS
    const response = await fetch(LEGIFRANCE_RSS_FEEDS[0]!.url);

    if (!response.ok) {
      return {
        available: false,
        latency: Date.now() - startTime,
        error: `HTTP ${response.status}`,
      };
    }

    return {
      available: true,
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      available: false,
      latency: Date.now() - startTime,
      error: error.message || 'Unknown error',
    };
  }
}
