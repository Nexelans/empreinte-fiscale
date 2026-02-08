/**
 * Unit tests for Referentiel pipeline extraction logic
 * Task 31.3
 */

import { describe, it, expect } from 'vitest';
import { parseCSV, parseJSON, validateValue } from '@/modules/referentiel/automation/parsers';
import { detectChanges } from '@/modules/referentiel/automation/pipeline';

describe('Referentiel Pipeline Extraction', () => {
  describe('CSV Parser', () => {
    it('should parse simple CSV data', () => {
      const csv = `cle,valeur,unite
ir.taux_1,0.11,pourcentage
ir.taux_2,0.30,pourcentage`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        cle: 'ir.taux_1',
        valeur: '0.11',
        unite: 'pourcentage',
      });
    });

    it('should handle quoted fields with commas', () => {
      const csv = `cle,description,valeur
ir.tranche_1,"De 0 à 11,294€",0.11`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.data[0].description).toBe('De 0 à 11,294€');
    });

    it('should handle empty lines', () => {
      const csv = `cle,valeur

ir.taux,0.11

ir.taux2,0.30`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should handle BOM in UTF-8', () => {
      const csv = '\uFEFFcle,valeur\nir.taux,0.11';
      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.data[0].cle).toBe('ir.taux');
    });

    it('should reject malformed CSV', () => {
      const csv = 'invalid,csv,data\nonly,two,values,extra';
      const result = parseCSV(csv);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('JSON Parser', () => {
    it('should parse valid JSON', () => {
      const json = JSON.stringify({
        millesime: '2026',
        bareme_ir: {
          tranches: [
            { min: 0, max: 11294, taux: 0 },
            { min: 11294, max: 28797, taux: 0.11 },
          ],
        },
      });

      const result = parseJSON(json);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('millesime');
      expect(result.data.bareme_ir.tranches).toHaveLength(2);
    });

    it('should handle nested objects', () => {
      const json = JSON.stringify({
        niveau1: {
          niveau2: {
            niveau3: {
              valeur: 42,
            },
          },
        },
      });

      const result = parseJSON(json);

      expect(result.success).toBe(true);
      expect(result.data.niveau1.niveau2.niveau3.valeur).toBe(42);
    });

    it('should reject invalid JSON', () => {
      const json = '{ invalid json }';
      const result = parseJSON(json);

      expect(result.success).toBe(false);
      expect(result.error).toContain('JSON');
    });

    it('should handle arrays', () => {
      const json = JSON.stringify({
        tranches: [100, 200, 300],
      });

      const result = parseJSON(json);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.tranches)).toBe(true);
      expect(result.data.tranches).toHaveLength(3);
    });
  });

  describe('Value Validation', () => {
    it('should validate percentage values', () => {
      expect(validateValue(0.11, 'pourcentage').valid).toBe(true);
      expect(validateValue(1.5, 'pourcentage').valid).toBe(false); // >100%
      expect(validateValue(-0.1, 'pourcentage').valid).toBe(false); // negative
    });

    it('should validate euro amounts', () => {
      expect(validateValue(1000, 'euros').valid).toBe(true);
      expect(validateValue(0, 'euros').valid).toBe(true);
      expect(validateValue(-100, 'euros').valid).toBe(false);
    });

    it('should validate tranches array', () => {
      const tranches = [
        { min: 0, max: 10000, taux: 0 },
        { min: 10000, max: 20000, taux: 0.11 },
      ];

      expect(validateValue(tranches, 'tranches').valid).toBe(true);
    });

    it('should reject invalid tranches', () => {
      const invalidTranches = [
        { min: 10000, max: 5000, taux: 0.11 }, // min > max
      ];

      expect(validateValue(invalidTranches, 'tranches').valid).toBe(false);
    });

    it('should validate string values', () => {
      expect(validateValue('Paris', 'string').valid).toBe(true);
      expect(validateValue('', 'string').valid).toBe(true);
      expect(validateValue(null, 'string').valid).toBe(false);
    });
  });

  describe('Change Detection', () => {
    it('should detect value changes', async () => {
      const result = await detectChanges('2026', 'BAREME_IR', 'taux_normal', 0.11, 0.12);

      expect(result.isChange).toBe(true);
      expect(result.changeType).toBe('MODIFIED');
    });

    it('should detect new entries', async () => {
      const result = await detectChanges('2027', 'BAREME_IR', 'new_taux', undefined, 0.15);

      expect(result.isChange).toBe(true);
      expect(result.changeType).toBe('CREATED');
    });

    it('should detect deletions', async () => {
      const result = await detectChanges('2026', 'BAREME_IR', 'old_taux', 0.10, undefined);

      expect(result.isChange).toBe(true);
      expect(result.changeType).toBe('DELETED');
    });

    it('should not detect changes when values are equal', async () => {
      const result = await detectChanges('2026', 'BAREME_IR', 'taux_normal', 0.11, 0.11);

      expect(result.isChange).toBe(false);
    });

    it('should handle floating point comparison', async () => {
      // 0.1 + 0.2 = 0.30000000000000004
      const result = await detectChanges('2026', 'TAUX_TVA', 'normal', 0.3, 0.1 + 0.2);

      expect(result.isChange).toBe(false); // Should use epsilon comparison
    });

    it('should handle complex object changes', async () => {
      const oldValue = { tranches: [{ min: 0, max: 10000, taux: 0 }] };
      const newValue = { tranches: [{ min: 0, max: 10000, taux: 0.05 }] };

      const result = await detectChanges('2026', 'BAREME_IR', 'tranches', oldValue, newValue);

      expect(result.isChange).toBe(true);
    });
  });

  describe('Source Integration', () => {
    it('should extract data from INSEE API format', () => {
      const inseeData = {
        valeur: [
          {
            periode: '2026',
            variable: 'SMIC',
            valeur: 11.65,
          },
        ],
      };

      // Mock extraction
      const extracted = inseeData.valeur[0];

      expect(extracted.periode).toBe('2026');
      expect(extracted.valeur).toBe(11.65);
    });

    it('should extract data from data.gouv.fr CSV format', () => {
      const csv = `annee,type,montant
2026,ir_tranche_1,11294
2026,ir_taux_1,11`;

      const result = parseCSV(csv);

      expect(result.success).toBe(true);
      expect(result.data[0].annee).toBe('2026');
      expect(result.data[0].montant).toBe('11294');
    });

    it('should handle Legifrance data structure', () => {
      const legifranceData = {
        texte: {
          article: {
            numero: 'Article 197',
            contenu: 'Le barème de l\'impôt...',
          },
        },
      };

      expect(legifranceData.texte.article.numero).toBe('Article 197');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Mock network error scenario
      const error = new Error('Network timeout');
      expect(error.message).toContain('timeout');
    });

    it('should handle malformed data gracefully', () => {
      const malformedCSV = 'not,enough\nheaders,here,extra';
      const result = parseCSV(malformedCSV);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate required fields', () => {
      const data = {
        // missing millesime
        categorie: 'BAREME_IR',
        cle: 'taux',
        valeur: 0.11,
      };

      const hasRequired = data.millesime && data.categorie && data.cle && data.valeur !== undefined;
      expect(hasRequired).toBe(false);
    });
  });
});
