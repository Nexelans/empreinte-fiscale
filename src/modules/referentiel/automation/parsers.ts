/**
 * Parsers pour l'automation du Référentiel
 * Phase 4 - Referentiel Automation
 *
 * Parse CSV et JSON pour extraire les données fiscales
 */

import { ExtractionResult, ValidationSchema } from './types';

/**
 * Parse un fichier CSV et extrait les données
 */
export function parseCSV(
  csvText: string,
  config: {
    delimiter?: string;
    hasHeader?: boolean;
    columnMapping?: Record<string, string>;
  } = {}
): ExtractionResult {
  const { delimiter = ',', hasHeader = true, columnMapping = {} } = config;

  try {
    const lines = csvText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return {
        success: false,
        data: [],
        errors: ['CSV file is empty'],
        warnings: [],
        metadata: {
          extractedAt: new Date(),
          sourceUrl: 'csv-file',
          recordCount: 0,
          method: 'csv-parser',
        },
      };
    }

    let headers: string[] = [];
    let dataStartIndex = 0;

    if (hasHeader) {
      headers = lines[0]!.split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
      dataStartIndex = 1;
    } else {
      // Générer des noms de colonnes automatiques
      const firstLine = lines[0]!.split(delimiter);
      headers = firstLine.map((_, i) => `col${i}`);
      dataStartIndex = 0;
    }

    const data: ExtractionResult['data'] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = dataStartIndex; i < lines.length; i++) {
      const values = lines[i]!
        .split(delimiter)
        .map((v) => v.trim().replace(/^"|"$/g, ''));

      if (values.length !== headers.length) {
        warnings.push(`Line ${i + 1}: column count mismatch`);
        continue;
      }

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        const mappedHeader = columnMapping[header] || header;
        row[mappedHeader] = values[index] || '';
      });

      // Transformer en format Référentiel
      const transformed = transformCSVRow(row);
      if (transformed) {
        data.push(transformed);
      }
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      warnings,
      metadata: {
        extractedAt: new Date(),
        sourceUrl: 'csv-file',
        recordCount: data.length,
        method: 'csv-parser',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      errors: [error.message || 'Failed to parse CSV'],
      warnings: [],
      metadata: {
        extractedAt: new Date(),
        sourceUrl: 'csv-file',
        recordCount: 0,
        method: 'csv-parser',
      },
    };
  }
}

/**
 * Parse un fichier JSON et extrait les données
 */
export function parseJSON(
  jsonText: string,
  config: {
    dataPath?: string; // JSONPath pour accéder aux données (ex: "data.items")
    fieldMapping?: Record<string, string>;
  } = {}
): ExtractionResult {
  const { dataPath, fieldMapping = {} } = config;

  try {
    const json = JSON.parse(jsonText);

    // Naviguer vers les données si un path est fourni
    let dataArray = json;
    if (dataPath) {
      const parts = dataPath.split('.');
      for (const part of parts) {
        dataArray = dataArray[part];
        if (!dataArray) {
          throw new Error(`Invalid data path: ${dataPath}`);
        }
      }
    }

    if (!Array.isArray(dataArray)) {
      // Si c'est un objet unique, le mettre dans un tableau
      dataArray = [dataArray];
    }

    const data: ExtractionResult['data'] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < dataArray.length; i++) {
      const item = dataArray[i];

      // Appliquer le field mapping
      const mappedItem: Record<string, any> = {};
      for (const [key, value] of Object.entries(item)) {
        const mappedKey = fieldMapping[key] || key;
        mappedItem[mappedKey] = value;
      }

      // Transformer en format Référentiel
      const transformed = transformJSONItem(mappedItem);
      if (transformed) {
        data.push(transformed);
      } else {
        warnings.push(`Item ${i}: could not transform to Référentiel format`);
      }
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      warnings,
      metadata: {
        extractedAt: new Date(),
        sourceUrl: 'json-file',
        recordCount: data.length,
        method: 'json-parser',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      errors: [error.message || 'Failed to parse JSON'],
      warnings: [],
      metadata: {
        extractedAt: new Date(),
        sourceUrl: 'json-file',
        recordCount: 0,
        method: 'json-parser',
      },
    };
  }
}

/**
 * Transforme une ligne CSV en entrée Référentiel
 */
function transformCSVRow(row: Record<string, string>): ExtractionResult['data'][0] | null {
  // Cette fonction doit être adaptée selon la structure des données
  // Pour l'instant, on essaie de détecter des colonnes standard

  const millesime = row.millesime || row.annee || row.year || new Date().getFullYear().toString();
  const categorie = row.categorie || row.category || 'UNKNOWN';
  const cle = row.cle || row.key || row.code || `csv.${Date.now()}`;
  const valeur = row.valeur || row.value || row.montant || null;
  const unite = row.unite || row.unit || 'unspecified';
  const source = row.source || 'CSV file';
  const urlSource = row.urlSource || row.url || '';

  if (!valeur) {
    return null;
  }

  return {
    millesime,
    categorie,
    cle,
    valeur: isNaN(parseFloat(valeur)) ? valeur : parseFloat(valeur),
    unite,
    source,
    urlSource,
    datePublication: new Date(),
    notes: 'Imported from CSV',
  };
}

/**
 * Transforme un item JSON en entrée Référentiel
 */
function transformJSONItem(item: Record<string, any>): ExtractionResult['data'][0] | null {
  // Cette fonction doit être adaptée selon la structure des données

  const millesime = item.millesime || item.annee || item.year || new Date().getFullYear().toString();
  const categorie = item.categorie || item.category || 'UNKNOWN';
  const cle = item.cle || item.key || item.code || `json.${Date.now()}`;
  const valeur = item.valeur || item.value || item.montant || null;
  const unite = item.unite || item.unit || 'unspecified';
  const source = item.source || 'JSON file';
  const urlSource = item.urlSource || item.url || '';

  if (!valeur) {
    return null;
  }

  return {
    millesime,
    categorie,
    cle,
    valeur: typeof valeur === 'string' && !isNaN(parseFloat(valeur)) ? parseFloat(valeur) : valeur,
    unite,
    source,
    urlSource,
    datePublication: new Date(item.datePublication || Date.now()),
    notes: item.notes || 'Imported from JSON',
  };
}

/**
 * Valide des données extraites selon un schéma
 */
export function validateData(
  data: ExtractionResult['data'],
  schema: ValidationSchema
): {
  valid: ExtractionResult['data'];
  invalid: Array<{
    item: ExtractionResult['data'][0];
    errors: string[];
  }>;
} {
  const valid: ExtractionResult['data'] = [];
  const invalid: Array<{
    item: ExtractionResult['data'][0];
    errors: string[];
  }> = [];

  for (const item of data) {
    const errors: string[] = [];

    // Vérifier les champs requis
    for (const field of schema.requiredFields) {
      if (!(field in item) || item[field as keyof typeof item] === null || item[field as keyof typeof item] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Vérifier les types
    for (const [field, expectedType] of Object.entries(schema.fieldTypes)) {
      if (field in item) {
        const value = item[field as keyof typeof item];
        const actualType = Array.isArray(value)
          ? 'array'
          : typeof value === 'object'
            ? 'object'
            : typeof value;

        if (actualType !== expectedType && value !== null) {
          errors.push(`Field ${field}: expected ${expectedType}, got ${actualType}`);
        }
      }
    }

    // Vérifier les ranges
    if (schema.fieldRanges) {
      for (const [field, range] of Object.entries(schema.fieldRanges)) {
        if (field in item) {
          const value = item[field as keyof typeof item];
          if (typeof value === 'number') {
            if (range.min !== undefined && value < range.min) {
              errors.push(`Field ${field}: value ${value} is below minimum ${range.min}`);
            }
            if (range.max !== undefined && value > range.max) {
              errors.push(`Field ${field}: value ${value} is above maximum ${range.max}`);
            }
          }
        }
      }
    }

    // Custom validators
    if (schema.customValidators) {
      for (const [field, validator] of Object.entries(schema.customValidators)) {
        if (field in item) {
          const value = item[field as keyof typeof item];
          if (!validator(value)) {
            errors.push(`Field ${field}: custom validation failed`);
          }
        }
      }
    }

    if (errors.length === 0) {
      valid.push(item);
    } else {
      invalid.push({ item, errors });
    }
  }

  return { valid, invalid };
}

/**
 * Schémas de validation prédéfinis
 */
export const VALIDATION_SCHEMAS: Record<string, ValidationSchema> = {
  BAREME_IR: {
    categorie: 'BAREME_IR',
    requiredFields: ['millesime', 'categorie', 'cle', 'valeur', 'unite', 'source'],
    fieldTypes: {
      millesime: 'string',
      categorie: 'string',
      cle: 'string',
      valeur: 'object',
      unite: 'string',
      source: 'string',
    },
  },
  TAUX_TVA: {
    categorie: 'TAUX_TVA',
    requiredFields: ['millesime', 'categorie', 'cle', 'valeur', 'unite', 'source'],
    fieldTypes: {
      millesime: 'string',
      categorie: 'string',
      cle: 'string',
      valeur: 'number',
      unite: 'string',
      source: 'string',
    },
    fieldRanges: {
      valeur: { min: 0, max: 1 },
    },
  },
  COTISATIONS: {
    categorie: 'COTISATIONS',
    requiredFields: ['millesime', 'categorie', 'cle', 'valeur', 'unite', 'source'],
    fieldTypes: {
      millesime: 'string',
      categorie: 'string',
      cle: 'string',
      valeur: 'number',
      unite: 'string',
      source: 'string',
    },
    fieldRanges: {
      valeur: { min: 0, max: 1 },
    },
  },
};
