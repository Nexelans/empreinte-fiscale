/**
 * Prompt d'extraction pour relevés CAF
 * Phase 4 - Module AI / OCR
 */

export const CAF_EXTRACTION_PROMPT = `Tu es un expert en extraction de données de relevés CAF (Caisse d'Allocations Familiales).

Analyse ce relevé CAF et extrais TOUTES les informations suivantes au format JSON strict.

**Instructions importantes :**
- Extrais les montants EXACTS
- Les montants doivent être en euros (nombre décimal)
- Si un champ n'est pas trouvé, mets null
- Respecte le format JSON exact demandé

**Format de sortie attendu :**
\`\`\`json
{
  "periode": {
    "mois": "Janvier",
    "annee": 2026
  },
  "numeroAllocataire": "1234567",
  "beneficiaire": {
    "nom": "NOM Prénom",
    "adresse": "12 Rue de la République, 75001 PARIS"
  },
  "foyer": {
    "nombreEnfants": 2,
    "situationFamiliale": "En couple"
  },
  "allocations": {
    "allocFamiliales": {
      "montant": 142.70,
      "nombreEnfants": 2
    },
    "complementFamilial": {
      "montant": 0
    },
    "allocationSoutienFamilial": {
      "montant": 0
    },
    "primeNaissance": {
      "montant": 0
    },
    "allocationRentreeScolaire": {
      "montant": 0
    },
    "aideLogement": {
      "type": "APL",
      "montant": 285.00,
      "loyerReference": 650.00
    },
    "primeActivite": {
      "montant": 0
    },
    "rsa": {
      "montant": 0
    },
    "aah": {
      "montant": 0
    }
  },
  "montantTotal": 427.70,
  "dateVersement": "2026-02-05",
  "modeVersement": "VIREMENT",
  "iban": "FR76 XXXX XXXX XXXX XXXX XXXX X89"
}
\`\`\`

**Allocations CAF courantes :**
- Allocations familiales (AF) : à partir de 2 enfants
- Complément familial (CF) : 3 enfants ou plus
- Allocation de soutien familial (ASF) : parent isolé
- Prime de naissance/adoption (PAJE)
- Allocation de rentrée scolaire (ARS)
- Aide personnalisée au logement (APL)
- Allocation de logement familiale (ALF)
- Allocation de logement sociale (ALS)
- Prime d'activité
- RSA (Revenu de solidarité active)
- AAH (Allocation adulte handicapé)

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

export interface CAFExtraction {
  periode: {
    mois: string;
    annee: number;
  };
  numeroAllocataire: string | null;
  beneficiaire: {
    nom: string | null;
    adresse: string | null;
  };
  foyer: {
    nombreEnfants: number | null;
    situationFamiliale: string | null;
  };
  allocations: {
    allocFamiliales: {
      montant: number | null;
      nombreEnfants: number | null;
    };
    complementFamilial: {
      montant: number | null;
    };
    allocationSoutienFamilial: {
      montant: number | null;
    };
    primeNaissance: {
      montant: number | null;
    };
    allocationRentreeScolaire: {
      montant: number | null;
    };
    aideLogement: {
      type: string | null;
      montant: number | null;
      loyerReference: number | null;
    } | null;
    primeActivite: {
      montant: number | null;
    };
    rsa: {
      montant: number | null;
    };
    aah: {
      montant: number | null;
    };
  };
  montantTotal: number | null;
  dateVersement: string | null;
  modeVersement: string | null;
  iban: string | null;
}
