/**
 * Prompt d'extraction pour avis de taxe foncière
 * Phase 4 - Module AI / OCR
 */

export const FONCIERE_EXTRACTION_PROMPT = `Tu es un expert en extraction de données d'avis de taxe foncière français.

Analyse cet avis de taxe foncière et extrais TOUTES les informations suivantes au format JSON strict.

**Instructions importantes :**
- Extrais les montants EXACTS
- Les montants doivent être en euros (nombre décimal)
- Si un champ n'est pas trouvé, mets null
- Respecte le format JSON exact demandé

**Format de sortie attendu :**
\`\`\`json
{
  "annee": 2026,
  "numeroFiscal": "1234567890123",
  "referenceBien": "75 123 A 0001",
  "proprietaire": {
    "nom": "NOM Prénom",
    "adresse": "12 Rue de la République, 75001 PARIS"
  },
  "bien": {
    "adresse": "12 Rue de la République, 75001 PARIS",
    "nature": "APPARTEMENT",
    "surface": 65,
    "nombrePieces": 3
  },
  "valeurLocative": {
    "cadastrale": 4500.00,
    "brute": 4500.00,
    "nette": 4275.00
  },
  "taxeFonciereBati": {
    "partCommunale": 680.50,
    "partDepartementale": 425.30,
    "partRegionale": 0,
    "taxeSpeciale": 0,
    "taxeEnlevementOM": 125.20,
    "total": 1231.00
  },
  "taxeFonciereNonBati": {
    "total": 0
  },
  "montantTotal": 1231.00,
  "echeances": [
    {
      "date": "2026-10-15",
      "montant": 1231.00
    }
  ]
}
\`\`\`

**Correspondances de termes :**
- "Valeur locative cadastrale" → valeurLocative.cadastrale
- "Valeur locative brute" → valeurLocative.brute
- "Valeur locative nette" → valeurLocative.nette
- "Part communale" → partCommunale
- "Part départementale" → partDepartementale
- "TEOM" ou "Taxe enlèvement ordures ménagères" → taxeEnlevementOM
- "Total à payer" ou "Montant à payer" → montantTotal

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

export interface FonciereExtraction {
  annee: number | null;
  numeroFiscal: string | null;
  referenceBien: string | null;
  proprietaire: {
    nom: string | null;
    adresse: string | null;
  };
  bien: {
    adresse: string | null;
    nature: string | null;
    surface: number | null;
    nombrePieces: number | null;
  };
  valeurLocative: {
    cadastrale: number | null;
    brute: number | null;
    nette: number | null;
  };
  taxeFonciereBati: {
    partCommunale: number | null;
    partDepartementale: number | null;
    partRegionale: number | null;
    taxeSpeciale: number | null;
    taxeEnlevementOM: number | null;
    total: number | null;
  };
  taxeFonciereNonBati: {
    total: number | null;
  };
  montantTotal: number | null;
  echeances: Array<{
    date: string;
    montant: number;
  }>;
}
