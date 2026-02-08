/**
 * Intégration API INSEE pour l'automation du Référentiel
 * Phase 4 - Referentiel Automation
 *
 * Récupère les statistiques INSEE (salaires moyens, inflation, etc.)
 */

import { DataSource, ExtractionResult, PollResult } from '../types';

const INSEE_API_BASE = 'https://api.insee.fr/donnees-locales/V0.1';

/**
 * Indicateurs INSEE suivis
 */
const INSEE_INDICATORS = [
  {
    code: 'TCHOALIM',
    name: 'Prix consommation alimentaire',
    categorie: 'STATS_INSEE',
  },
  {
    code: 'SAL-MOYEN',
    name: 'Salaire moyen',
    categorie: 'STATS_INSEE',
  },
  {
    code: 'IPC',
    name: 'Indice des prix à la consommation',
    categorie: 'STATS_INSEE',
  },
];

/**
 * Poll l'API INSEE pour des mises à jour
 */
export async function pollINSEE(source: DataSource): Promise<PollResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let updatesDetected = 0;

  try {
    // Vérifier si les credentials sont disponibles
    if (!source.credentials?.apiKey) {
      throw new Error('INSEE API key not configured');
    }

    // Pour chaque indicateur suivi
    for (const indicator of INSEE_INDICATORS) {
      try {
        const result = await fetchIndicator(indicator.code, source.credentials.apiKey);

        if (result.success) {
          updatesDetected += result.data.length;
        } else {
          errors.push(...result.errors);
        }
      } catch (error: any) {
        errors.push(`Indicator ${indicator.name}: ${error.message}`);
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
 * Récupère un indicateur depuis l'API INSEE
 */
async function fetchIndicator(
  indicatorCode: string,
  apiKey: string
): Promise<ExtractionResult> {
  try {
    // Note: L'API INSEE réelle nécessite une authentification OAuth2
    // Cette implémentation est simplifiée pour l'exemple
    const response = await fetch(
      `${INSEE_API_BASE}/donnees/flux/${indicatorCode}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    const extractedData: ExtractionResult['data'] = [];

    // Parser la réponse INSEE (structure SDMX-JSON)
    if (data.observations) {
      for (const obs of data.observations) {
        const transformed = transformINSEEObservation(obs, indicatorCode);
        if (transformed) {
          extractedData.push(transformed);
        }
      }
    }

    return {
      success: true,
      data: extractedData,
      errors: [],
      warnings: [],
      metadata: {
        extractedAt: new Date(),
        sourceUrl: `${INSEE_API_BASE}/donnees/flux/${indicatorCode}`,
        recordCount: extractedData.length,
        method: 'insee-api',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      errors: [error.message || 'Failed to fetch indicator'],
      warnings: [],
      metadata: {
        extractedAt: new Date(),
        sourceUrl: `${INSEE_API_BASE}/donnees/flux/${indicatorCode}`,
        recordCount: 0,
        method: 'insee-api',
      },
    };
  }
}

/**
 * Transforme une observation INSEE en entrée Référentiel
 */
function transformINSEEObservation(
  obs: any,
  indicatorCode: string
): ExtractionResult['data'][0] | null {
  if (!obs.value || !obs.period) {
    return null;
  }

  // Extraire l'année du period (format: "2025-Q1" ou "2025-01")
  const year = obs.period.substring(0, 4);

  return {
    millesime: year,
    categorie: 'STATS_INSEE',
    cle: `insee.${indicatorCode.toLowerCase()}`,
    valeur: parseFloat(obs.value),
    unite: obs.unit || 'indice',
    source: 'INSEE - Institut national de la statistique',
    urlSource: `https://www.insee.fr/fr/statistiques/${indicatorCode}`,
    datePublication: new Date(obs.published || Date.now()),
    notes: `Indicateur: ${indicatorCode}, Période: ${obs.period}`,
  };
}

/**
 * Vérifie la santé de l'API INSEE
 */
export async function checkINSEEHealth(apiKey?: string): Promise<{
  available: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // Ping endpoint simple
    const response = await fetch(`${INSEE_API_BASE}/`, {
      headers: apiKey
        ? {
            Authorization: `Bearer ${apiKey}`,
          }
        : {},
    });

    // L'API INSEE peut retourner 401 si pas de token, mais elle est disponible
    const available = response.ok || response.status === 401;

    return {
      available,
      latency: Date.now() - startTime,
      error: !available ? `HTTP ${response.status}` : undefined,
    };
  } catch (error: any) {
    return {
      available: false,
      latency: Date.now() - startTime,
      error: error.message || 'Unknown error',
    };
  }
}
