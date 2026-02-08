/**
 * Intégration data.gouv.fr pour l'automation du Référentiel
 * Phase 4 - Referentiel Automation
 *
 * Poll les datasets fiscaux sur data.gouv.fr
 */

import { DataSource, ExtractionResult, PollResult } from '../types';

const DATAGOUV_BASE_URL = 'https://www.data.gouv.fr/api/1';

/**
 * Datasets fiscaux suivis sur data.gouv.fr
 */
const FISCAL_DATASETS = [
  {
    id: '53d2923ca3a7292c64e45ff9',
    name: 'Budget de l\'État',
    categorie: 'BUDGET_PLF',
  },
  {
    id: '5c4ae55a634f4117716d5656',
    name: 'Données fiscales des collectivités',
    categorie: 'BUDGET_LOCAL',
  },
];

/**
 * Poll data.gouv.fr pour des mises à jour
 */
export async function pollDataGouv(source: DataSource): Promise<PollResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let updatesDetected = 0;

  try {
    // Pour chaque dataset suivi
    for (const dataset of FISCAL_DATASETS) {
      try {
        const result = await fetchDataset(dataset.id);

        if (result.success) {
          updatesDetected += result.data.length;
        } else {
          errors.push(...result.errors);
        }
      } catch (error: any) {
        errors.push(`Dataset ${dataset.name}: ${error.message}`);
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
 * Récupère un dataset depuis data.gouv.fr
 */
async function fetchDataset(datasetId: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(`${DATAGOUV_BASE_URL}/datasets/${datasetId}/`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const dataset = await response.json();

    // Récupérer les ressources (fichiers CSV/JSON)
    const resources = dataset.resources || [];

    const extractedData: ExtractionResult['data'] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const resource of resources) {
      // Ne traiter que les CSV et JSON récents (< 1 an)
      const resourceDate = new Date(resource.published || resource.created_at);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (resourceDate < oneYearAgo) {
        continue;
      }

      const format = resource.format?.toLowerCase();

      if (format === 'csv') {
        try {
          const csvData = await fetchAndParseCSV(resource.url);
          extractedData.push(...csvData);
        } catch (error: any) {
          errors.push(`CSV parsing error: ${error.message}`);
        }
      } else if (format === 'json') {
        try {
          const jsonData = await fetchAndParseJSON(resource.url);
          extractedData.push(...jsonData);
        } catch (error: any) {
          errors.push(`JSON parsing error: ${error.message}`);
        }
      }
    }

    return {
      success: errors.length === 0,
      data: extractedData,
      errors,
      warnings,
      metadata: {
        extractedAt: new Date(),
        sourceUrl: `${DATAGOUV_BASE_URL}/datasets/${datasetId}/`,
        recordCount: extractedData.length,
        method: 'datagouv-api',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      errors: [error.message || 'Failed to fetch dataset'],
      warnings: [],
      metadata: {
        extractedAt: new Date(),
        sourceUrl: `${DATAGOUV_BASE_URL}/datasets/${datasetId}/`,
        recordCount: 0,
        method: 'datagouv-api',
      },
    };
  }
}

/**
 * Télécharge et parse un fichier CSV
 */
async function fetchAndParseCSV(url: string): Promise<ExtractionResult['data']> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status}`);
  }

  const text = await response.text();

  // Parse basique CSV
  // Dans une implémentation complète, utiliser une librairie comme papaparse
  const lines = text.split('\n').filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0]!.split(';').map((h) => h.trim());
  const data: ExtractionResult['data'] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]!.split(';').map((v) => v.trim());

    if (values.length !== headers.length) {
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Transformer en format Référentiel
    // (logique spécifique selon la structure du CSV)
    const transformed = transformDataGouvRow(row);
    if (transformed) {
      data.push(transformed);
    }
  }

  return data;
}

/**
 * Télécharge et parse un fichier JSON
 */
async function fetchAndParseJSON(url: string): Promise<ExtractionResult['data']> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch JSON: ${response.status}`);
  }

  const json = await response.json();

  // Transformer en format Référentiel
  const data: ExtractionResult['data'] = [];

  if (Array.isArray(json)) {
    for (const item of json) {
      const transformed = transformDataGouvRow(item);
      if (transformed) {
        data.push(transformed);
      }
    }
  }

  return data;
}

/**
 * Transforme une ligne data.gouv.fr en entrée Référentiel
 */
function transformDataGouvRow(row: Record<string, any>): ExtractionResult['data'][0] | null {
  // Cette fonction doit être adaptée selon la structure des données
  // Pour l'instant, retourne null (pas de transformation)
  // Dans une implémentation complète, mapper les champs selon la catégorie

  // Exemple pour le budget de l'État:
  if (row.mission && row.programme && row.montant) {
    return {
      millesime: row.annee || new Date().getFullYear().toString(),
      categorie: 'BUDGET_PLF',
      cle: `budget.${row.mission}.${row.programme}`.toLowerCase().replace(/\s+/g, '_'),
      valeur: parseFloat(row.montant),
      unite: 'euros',
      source: 'data.gouv.fr - Budget de l\'État',
      urlSource: 'https://www.data.gouv.fr/fr/datasets/budget-de-letat/',
      datePublication: new Date(row.date_publication || Date.now()),
      notes: `Mission: ${row.mission}, Programme: ${row.programme}`,
    };
  }

  return null;
}

/**
 * Vérifie la santé de la source data.gouv.fr
 */
export async function checkDataGouvHealth(): Promise<{
  available: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${DATAGOUV_BASE_URL}/site/`);

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
