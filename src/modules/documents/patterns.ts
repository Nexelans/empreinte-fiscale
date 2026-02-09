/**
 * Regex patterns pour l'extraction de données depuis les documents fiscaux français
 */

import { DocumentType, ExtractedData } from "./types";

// Utilitaire pour parser les nombres français (avec espaces et virgules)
export function parseNumber(str: string): number | undefined {
  if (!str) return undefined;
  // Enlever les espaces et remplacer la virgule par un point
  const cleaned = str.replace(/\s/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

// Patterns pour bulletin de paie
export const BULLETIN_PAIE_PATTERNS = {
  salaireBrut: [
    // Format moderne : "Total rémunération brute"
    /Total\s+rémunération\s+brute\s*:?\s*([\d\s,]+)/i,
    /Rémunération\s+brute\s*:?\s*([\d\s,]+)/i,
    // Formats classiques
    /Salaire\s+brut\s*:?\s*([\d\s,]+)/i,
    /Brut\s*:?\s*([\d\s,]+)/i,
    /SALAIRE\s+BRUT\s*:?\s*([\d\s,]+)/i,
    // Avec beaucoup d'espaces (format tableau)
    /(?:Total\s+)?(?:rémunération|salaire)\s+brute?\s+[\s\.]*\s*([\d\s,]+)/i,
  ],
  salaireNet: [
    // Format moderne : "Net à payer"
    /Net\s+à\s+payer\s*:?\s*([\d\s,]+)/i,
    /Net\s+payé\s*:?\s*([\d\s,]+)/i,
    // Net imposable
    /Salaire\s+net\s+imposable\s*:?\s*([\d\s,]+)/i,
    /Net\s+imposable\s*:?\s*([\d\s,]+)/i,
    // Formats classiques
    /Salaire\s+net\s+(?:à\s+payer)?\s*:?\s*([\d\s,]+)/i,
    /NET\s+A\s+PAYER\s*:?\s*([\d\s,]+)/i,
    // Avec beaucoup d'espaces
    /Net\s+(?:à\s+payer|imposable)?\s+[\s\.]*\s*([\d\s,]+)/i,
  ],
  csg: [
    // CSG totale ou détaillée
    /CSG[^:]*:?\s*([\d\s,]+)/i,
    /C\.S\.G\.\s*:?\s*([\d\s,]+)/i,
    /Contribution\s+Sociale\s+Généralisée\s*:?\s*([\d\s,]+)/i,
    // CSG déductible + non déductible (on prend le total si visible)
    /CSG\s+(?:déductible|non\s+déductible)?\s*[\s\.]*\s*([\d\s,]+)/i,
  ],
  cotisationsSalariales: [
    /Total\s+(?:des\s+)?cotisations\s+salariales\s*:?\s*([\d\s,]+)/i,
    /Cotisations\s+salariales\s*:?\s*([\d\s,]+)/i,
    /Total\s+salarié\s*:?\s*([\d\s,]+)/i,
    // Avec espaces
    /(?:Total\s+)?cotisations?\s+salariales?\s+[\s\.]*\s*([\d\s,]+)/i,
  ],
  cotisationsPatronales: [
    /Total\s+(?:des\s+)?cotisations\s+patronales\s*:?\s*([\d\s,]+)/i,
    /Cotisations\s+patronales\s*:?\s*([\d\s,]+)/i,
    /Total\s+employeur\s*:?\s*([\d\s,]+)/i,
    // Avec espaces
    /(?:Total\s+)?cotisations?\s+patronales?\s+[\s\.]*\s*([\d\s,]+)/i,
  ],
};

// Patterns pour avis d'imposition
export const AVIS_IMPOSITION_PATTERNS = {
  revenuNetImposable: [
    /Revenu\s+net\s+imposable\s*:?\s*([\d\s]+)/i,
    /Revenu\s+imposable\s*:?\s*([\d\s]+)/i,
  ],
  impotRevenu: [
    /Montant\s+de\s+(?:votre\s+)?impôt\s*:?\s*([\d\s]+)/i,
    /Impôt\s+sur\s+le\s+revenu\s*:?\s*([\d\s]+)/i,
    /Montant\s+net\s+à\s+payer\s*:?\s*([\d\s]+)/i,
  ],
  nombreParts: [
    /Nombre\s+de\s+parts?\s*:?\s*([\d,]+)/i,
    /Parts?\s+fiscales?\s*:?\s*([\d,]+)/i,
  ],
  revenusFonciers: [
    /Revenus?\s+fonciers?\s*:?\s*([\d\s]+)/i,
  ],
  revenusCapitaux: [
    /Revenus?\s+(?:de\s+)?capitaux\s+mobiliers\s*:?\s*([\d\s]+)/i,
    /Revenus?\s+mobiliers\s*:?\s*([\d\s]+)/i,
  ],
};

// Patterns pour avis de taxe foncière
export const TAXE_FONCIERE_PATTERNS = {
  taxeFonciere: [
    /Montant\s+(?:total\s+)?(?:à\s+payer|de\s+la\s+taxe)\s*:?\s*([\d\s]+)/i,
    /Taxe\s+foncière\s*:?\s*([\d\s]+)/i,
  ],
  valeurLocative: [
    /Valeur\s+locative\s+cadastrale\s*:?\s*([\d\s]+)/i,
    /Valeur\s+locative\s*:?\s*([\d\s]+)/i,
  ],
  commune: [
    /Commune\s+de\s+:?\s*([A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ][a-zàâäéèêëïîôöùûüÿç\s\-']+)/i,
  ],
};

// Patterns pour relevé CAF
export const RELEVE_CAF_PATTERNS = {
  allocations: [
    /Allocations?\s+familiales?\s*:?\s*([\d\s,]+)/i,
    /AF\s*:?\s*([\d\s,]+)/i,
  ],
  apl: [
    /(?:APL|Aide\s+au\s+logement)\s*:?\s*([\d\s,]+)/i,
  ],
  autresAides: [
    /(?:Autres?\s+)?(?:aides?|prestations?)\s*:?\s*([\d\s,]+)/i,
  ],
};

// Fonction principale d'extraction par type de document
export function extractDataFromText(
  documentType: DocumentType,
  text: string
): Partial<ExtractedData> {
  const patterns = getPatterns(documentType);
  const extracted: Partial<ExtractedData> = {};

  for (const [field, fieldPatterns] of Object.entries(patterns)) {
    for (const pattern of fieldPatterns as RegExp[]) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Pour les champs texte (commune), ne pas parser en nombre
        if (field === "commune") {
          extracted[field as keyof ExtractedData] = match[1].trim() as any;
        } else {
          const value = parseNumber(match[1]);
          if (value !== undefined) {
            extracted[field as keyof ExtractedData] = value as any;
            break; // Premier pattern qui match
          }
        }
      }
    }
  }

  return extracted;
}

function getPatterns(documentType: DocumentType): Record<string, RegExp[]> {
  switch (documentType) {
    case "bulletin_paie":
      return BULLETIN_PAIE_PATTERNS;
    case "avis_imposition":
      return AVIS_IMPOSITION_PATTERNS;
    case "taxe_fonciere":
      return TAXE_FONCIERE_PATTERNS;
    case "releve_caf":
      return RELEVE_CAF_PATTERNS;
    default:
      return {};
  }
}

// Calcul du score de confiance basé sur le nombre de champs extraits
export function calculateConfidence(
  documentType: DocumentType,
  extractedData: Partial<ExtractedData>
): number {
  const expectedFields = getExpectedFields(documentType);
  const extractedFields = Object.keys(extractedData).filter(
    (key) => extractedData[key as keyof ExtractedData] !== undefined
  );

  if (expectedFields.length === 0) return 0;

  const ratio = extractedFields.length / expectedFields.length;
  return Math.round(ratio * 100);
}

function getExpectedFields(documentType: DocumentType): string[] {
  switch (documentType) {
    case "bulletin_paie":
      return ["salaireBrut", "salaireNet", "csg"];
    case "avis_imposition":
      return ["revenuNetImposable", "impotRevenu", "nombreParts"];
    case "taxe_fonciere":
      return ["taxeFonciere", "commune"];
    case "releve_caf":
      return ["allocations"];
    default:
      return [];
  }
}
