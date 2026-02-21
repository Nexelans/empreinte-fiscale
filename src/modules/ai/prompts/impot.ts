/**
 * Prompt d'extraction pour avis d'imposition
 * Phase 4 - Module AI / OCR
 */

export const IMPOT_EXTRACTION_PROMPT = `Tu es un expert en extraction de données d'avis d'imposition français.

Analyse cet avis d'imposition et extrais TOUTES les informations suivantes au format JSON strict.

**Instructions importantes :**
- Extrais les montants EXACTS (pas d'estimations)
- Les montants doivent être en euros (nombre décimal)
- Si un champ n'est pas trouvé, mets null
- Respecte le format JSON exact demandé

**Format de sortie attendu :**
\`\`\`json
{
  "anneeRevenus": 2025,
  "anneeImposition": 2026,
  "numeroFiscal": "1234567890123",
  "referenceAvis": "2026 1234567890",
  "foyer": {
    "declarant1": {
      "nom": "NOM Prénom",
      "dateNaissance": "01/01/1985"
    },
    "declarant2": {
      "nom": "NOM Prénom",
      "dateNaissance": "01/01/1987"
    },
    "nombreParts": 2.5,
    "nombrePersonnesCharge": 2,
    "situationFamille": "Marié"
  },
  "revenus": {
    "revenuBrutGlobal": 45000.00,
    "revenuImposable": 42000.00,
    "revenuFiscalReference": 43500.00,
    "detail": {
      "salairesTraitements": 40000.00,
      "pensionsRetraite": 0,
      "revenusFonciers": 3000.00,
      "revenusCapitaux": 2000.00,
      "bic": 0,
      "bnc": 0,
      "ba": 0
    }
  },
  "charges": {
    "total": 3000.00,
    "pensionsAlimentaires": 0,
    "epargneRetraite": 1500.00,
    "donsAssociations": 500.00,
    "emploiDomicile": 1000.00
  },
  "impot": {
    "revenuImposable": 42000.00,
    "montantAvantCorrections": 4200.00,
    "decote": 0,
    "plafonnementQF": 0,
    "contributionExceptionnelleHautsRevenus": 0,
    "montantNet": 4100.00,
    "prelevementsSource": 3900.00,
    "resteAPayer": 200.00,
    "creditImpot": 0
  },
  "tauxMarginal": 30.0,
  "tauxMoyenImposition": 9.76
}
\`\`\`

**Correspondances de termes :**
- "Revenu brut global" → revenuBrutGlobal
- "Revenu imposable" ou "Revenu net imposable" → revenuImposable
- "Revenu fiscal de référence" ou "RFR" → revenuFiscalReference
- "Montant de l'impôt" → montantNet
- "Prélèvements à la source" ou "Montant déjà payé" → prelevementsSource
- "Reste à payer" ou "Solde à payer" → resteAPayer
- "Crédit d'impôt" → creditImpot

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

export interface ImpotExtraction {
  anneeRevenus: number | null;
  anneeImposition: number | null;
  numeroFiscal: string | null;
  referenceAvis: string | null;
  foyer: {
    declarant1: {
      nom: string | null;
      dateNaissance: string | null;
    };
    declarant2: {
      nom: string | null;
      dateNaissance: string | null;
    } | null;
    nombreParts: number | null;
    nombrePersonnesCharge: number | null;
    situationFamille: string | null;
  };
  revenus: {
    revenuBrutGlobal: number | null;
    revenuImposable: number | null;
    revenuFiscalReference: number | null;
    detail: {
      salairesTraitements: number | null;
      pensionsRetraite: number | null;
      revenusFonciers: number | null;
      revenusCapitaux: number | null;
      bic: number | null;
      bnc: number | null;
      ba: number | null;
    };
  };
  charges: {
    total: number | null;
    pensionsAlimentaires: number | null;
    epargneRetraite: number | null;
    donsAssociations: number | null;
    emploiDomicile: number | null;
  } | null;
  impot: {
    revenuImposable: number | null;
    montantAvantCorrections: number | null;
    decote: number | null;
    plafonnementQF: number | null;
    contributionExceptionnelleHautsRevenus: number | null;
    montantNet: number | null;
    prelevementsSource: number | null;
    resteAPayer: number | null;
    creditImpot: number | null;
  };
  tauxMarginal: number | null;
  tauxMoyenImposition: number | null;
}
