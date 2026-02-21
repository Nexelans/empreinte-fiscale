/**
 * Prompt d'extraction pour bulletins de paie
 * Phase 4 - Module AI / OCR
 */

export const PAIE_EXTRACTION_PROMPT = `Tu es un expert en extraction de données de bulletins de paie français.

Analyse ce bulletin de paie et extrais TOUTES les informations suivantes au format JSON strict.

**Instructions importantes :**
- Extrais les montants EXACTS (pas d'estimations)
- Les montants doivent être en euros (nombre décimal, ex: 3450.50)
- Si un champ n'est pas trouvé, mets null
- Ne déduis rien, extrais uniquement ce qui est écrit
- Respecte le format JSON exact demandé

**Format de sortie attendu :**
\`\`\`json
{
  "periode": {
    "mois": "Janvier",
    "annee": 2026
  },
  "identification": {
    "employe": {
      "nom": "NOM Prénom",
      "numeroSecuriteSociale": "1 85 01 75 000 000 00"
    },
    "employeur": {
      "nom": "ENTREPRISE SAS",
      "siret": "123 456 789 00010"
    }
  },
  "salaire": {
    "base": {
      "salaireBase": 3200.00,
      "tauxHoraire": 20.00,
      "heuresTravaillees": 151.67
    },
    "brut": 3450.50,
    "netAvantImpot": 2740.30,
    "netAPayer": 2650.00,
    "imposable": 2800.00
  },
  "cotisationsSalariales": {
    "total": 710.20,
    "detail": {
      "secu": {
        "maladie": 34.50,
        "vieillesse": 285.60
      },
      "chomage": 86.25,
      "retraiteComplementaire": 213.45,
      "csg": {
        "total": 238.20,
        "deductible": 218.40,
        "nonDeductible": 19.80
      },
      "crds": 23.20
    }
  },
  "cotisationsPatronales": {
    "total": 1520.30,
    "detail": {
      "secu": {
        "maladie": 450.60,
        "vieillesse": 580.20,
        "allocFamiliales": 138.00
      },
      "chomage": 138.00,
      "retraiteComplementaire": 213.50
    }
  },
  "prelevementSource": {
    "taux": 3.50,
    "montant": 90.30
  },
  "congesPayes": {
    "acquis": 2.08,
    "pris": 0,
    "solde": 25.0
  }
}
\`\`\`

**Correspondances de termes :**
- "Salaire de base" ou "Salaire mensuel" → salaireBase
- "Salaire brut" ou "Total brut" → brut
- "Net à payer" ou "Net payé" → netAPayer
- "Net imposable" → imposable
- "CSG déductible" → csg.deductible
- "CSG non déductible" → csg.nonDeductible
- "Part salariale" → cotisationsSalariales
- "Part patronale" → cotisationsPatronales
- "Prélèvement à la source" ou "PAS" → prelevementSource

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

export interface PaieExtraction {
  periode: {
    mois: string;
    annee: number;
  };
  identification: {
    employe: {
      nom: string | null;
      numeroSecuriteSociale: string | null;
    };
    employeur: {
      nom: string | null;
      siret: string | null;
    };
  };
  salaire: {
    base: {
      salaireBase: number | null;
      tauxHoraire: number | null;
      heuresTravaillees: number | null;
    };
    brut: number | null;
    netAvantImpot: number | null;
    netAPayer: number | null;
    imposable: number | null;
  };
  cotisationsSalariales: {
    total: number | null;
    detail: {
      secu: {
        maladie: number | null;
        vieillesse: number | null;
      };
      chomage: number | null;
      retraiteComplementaire: number | null;
      csg: {
        total: number | null;
        deductible: number | null;
        nonDeductible: number | null;
      };
      crds: number | null;
    };
  };
  cotisationsPatronales: {
    total: number | null;
    detail: {
      secu: {
        maladie: number | null;
        vieillesse: number | null;
        allocFamiliales: number | null;
      };
      chomage: number | null;
      retraiteComplementaire: number | null;
    };
  };
  prelevementSource: {
    taux: number | null;
    montant: number | null;
  } | null;
  congesPayes: {
    acquis: number | null;
    pris: number | null;
    solde: number | null;
  } | null;
}
