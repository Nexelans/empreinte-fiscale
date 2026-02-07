import {
  TicketData,
  SpendingCategory,
  OCRResult,
  TicketScanResult,
  DEFAULT_TVA_RATES,
} from "./types";

/**
 * Common merchant/enseigne patterns
 * Ordered by specificity to match most specific patterns first
 */
const ENSEIGNE_PATTERNS = [
  // Supermarkets
  /(?:CARREFOUR|LECLERC|AUCHAN|INTERMARCHE|CASINO|MONOPRIX|FRANPRIX|LIDL|ALDI)/i,
  // Restaurants / Fast food
  /(?:MCDONALD|QUICK|KFC|BURGER KING|SUBWAY|PAUL|STARBUCKS|COSTA)/i,
  // Gas stations
  /(?:TOTAL|ESSO|BP|SHELL|AGIP)/i,
  // Pharmacies
  /(?:PHARMACIE|PARA[+]?)/i,
  // Generic patterns
  /^([A-Z][A-Za-z\s&-]{3,30})\s*(?:S\.?A\.?S?|SARL|SAS|EURL)?/m,
];

/**
 * Date patterns (French formats)
 */
const DATE_PATTERNS = [
  // DD/MM/YYYY or DD-MM-YYYY
  /(?:DATE|Le)\s*:?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
  // DD/MM/YY HH:MM
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\s+(\d{1,2}):(\d{2})/,
  // Standalone date
  /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/,
];

/**
 * Amount patterns (euros)
 */
const MONTANT_PATTERNS = [
  // Total / TOTAL / Total TTC
  /(?:TOTAL|MONTANT|A PAYER|NET A PAYER|CARTE BANCAIRE)\s*(?:TTC)?\s*:?\s*([\d\s]+)[,.](\d{2})\s*€?/i,
  // Generic amount with € symbol
  /(?:^|\s)([\d\s]+)[,.](\d{2})\s*€/gm,
];

/**
 * TVA patterns
 */
const TVA_PATTERNS = [
  // TVA 20% : 12.34
  /TVA\s*([\d,.]+)\s*%?\s*:?\s*([\d\s]+)[,.](\d{2})/gi,
  // T.V.A or T V A
  /T\.?\s*V\.?\s*A\.?\s*([\d,.]+)\s*%?\s*:?\s*([\d\s]+)[,.](\d{2})/gi,
];

/**
 * SIRET pattern
 */
const SIRET_PATTERN = /SIRET\s*:?\s*(\d{3}\s?\d{3}\s?\d{3}\s?\d{5})/i;

/**
 * Parse a French date string to Date object
 */
function parseDate(day: string, month: string, year: string): Date | undefined {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10) - 1; // Month is 0-indexed
  let y = parseInt(year, 10);

  // Handle 2-digit years
  if (y < 100) {
    y += y < 50 ? 2000 : 1900;
  }

  const date = new Date(y, m, d);

  // Validate date
  if (date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) {
    return date;
  }

  return undefined;
}

/**
 * Clean and parse amount string to number
 */
function parseAmount(integerPart: string, decimalPart: string): number {
  const cleanInteger = integerPart.replace(/\s/g, "");
  const amountStr = `${cleanInteger}.${decimalPart}`;
  return parseFloat(amountStr);
}

/**
 * Extract enseigne (merchant name) from OCR text
 */
function extractEnseigne(text: string): string | undefined {
  for (const pattern of ENSEIGNE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  return undefined;
}

/**
 * Extract date from OCR text
 */
function extractDate(text: string): Date | undefined {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const [, day, month, year] = match;
      const date = parseDate(day!, month!, year!);
      if (date) {
        return date;
      }
    }
  }
  return undefined;
}

/**
 * Extract montant TTC (total amount) from OCR text
 */
function extractMontantTTC(text: string): number | undefined {
  // Try specific patterns first (TOTAL, MONTANT, etc.)
  const specificMatch = text.match(MONTANT_PATTERNS[0]!);
  if (specificMatch) {
    const [, integerPart, decimalPart] = specificMatch;
    return parseAmount(integerPart!, decimalPart!);
  }

  // Fallback: find all amounts and take the largest (likely the total)
  const amounts: number[] = [];
  let match;
  const genericPattern = new RegExp(MONTANT_PATTERNS[1]!.source, MONTANT_PATTERNS[1]!.flags);

  while ((match = genericPattern.exec(text)) !== null) {
    const [, integerPart, decimalPart] = match;
    const amount = parseAmount(integerPart!, decimalPart!);
    if (amount > 0 && amount < 10000) {
      // Sanity check: reasonable ticket amount
      amounts.push(amount);
    }
  }

  return amounts.length > 0 ? Math.max(...amounts) : undefined;
}

/**
 * Extract TVA amount from OCR text
 */
function extractMontantTVA(text: string): number | undefined {
  let totalTVA = 0;
  let foundAny = false;

  for (const pattern of TVA_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [, , integerPart, decimalPart] = match;
      const tvaAmount = parseAmount(integerPart!, decimalPart!);
      if (tvaAmount > 0) {
        totalTVA += tvaAmount;
        foundAny = true;
      }
    }
  }

  return foundAny ? totalTVA : undefined;
}

/**
 * Extract SIRET number from OCR text
 */
function extractSIRET(text: string): string | undefined {
  const match = text.match(SIRET_PATTERN);
  if (match) {
    return match[1]!.replace(/\s/g, "");
  }
  return undefined;
}

/**
 * Guess spending category based on enseigne and text content
 */
function guessCategory(enseigne?: string, text?: string): SpendingCategory {
  const combined = `${enseigne || ""} ${text || ""}`.toLowerCase();

  if (/carrefour|leclerc|auchan|intermarche|casino|monoprix|franprix|lidl|aldi|supermarch/i.test(combined)) {
    return "alimentation";
  }
  if (/mcdonald|quick|kfc|burger|subway|restaurant|cafe|brasserie/i.test(combined)) {
    return "restaurant";
  }
  if (/total|esso|bp|shell|agip|carburant|essence|diesel|gasoil/i.test(combined)) {
    return "carburant";
  }
  if (/sncf|ratp|transilien|metro|bus|train|taxi|uber/i.test(combined)) {
    return "transport";
  }
  if (/pharmacie|para\+/i.test(combined)) {
    return "sante";
  }
  if (/edf|engie|gaz|electricite|energie/i.test(combined)) {
    return "energie";
  }
  if (/orange|sfr|bouygues|free|mobile|internet|telecom/i.test(combined)) {
    return "telecom";
  }
  if (/cinema|theatre|concert|musee|loisirs|fnac/i.test(combined)) {
    return "loisirs";
  }

  return "autre";
}

/**
 * Calculate confidence score based on extracted fields
 */
function calculateConfidence(ticketData: Partial<TicketData>): number {
  let score = 0;
  let maxScore = 0;

  // montantTTC is required (highest weight)
  maxScore += 50;
  if (ticketData.montantTTC !== undefined && ticketData.montantTTC > 0) {
    score += 50;
  }

  // Date
  maxScore += 20;
  if (ticketData.date) {
    score += 20;
  }

  // Enseigne
  maxScore += 15;
  if (ticketData.enseigne) {
    score += 15;
  }

  // TVA
  maxScore += 10;
  if (ticketData.montantTVA !== undefined && ticketData.montantTVA > 0) {
    score += 10;
  }

  // SIRET
  maxScore += 5;
  if (ticketData.siret) {
    score += 5;
  }

  return Math.round((score / maxScore) * 100);
}

/**
 * Extract structured ticket data from OCR text
 *
 * @param ocrResult - Result from OCR processing
 * @returns TicketScanResult with extracted data
 */
export function extractTicketData(ocrResult: OCRResult): TicketScanResult {
  const warnings: string[] = [];

  // If OCR failed completely, return early
  if (ocrResult.status === "FAILED" || !ocrResult.rawText.trim()) {
    return {
      success: false,
      ocrResult,
      errors: ["L'OCR n'a pas pu extraire de texte de l'image"],
    };
  }

  const text = ocrResult.rawText;

  // Extract fields
  const enseigne = extractEnseigne(text);
  const date = extractDate(text);
  const montantTTC = extractMontantTTC(text);
  const montantTVA = extractMontantTVA(text);
  const siret = extractSIRET(text);

  // montantTTC is required
  if (montantTTC === undefined) {
    return {
      success: false,
      ocrResult,
      errors: [
        "Impossible de détecter le montant total du ticket",
        "Veuillez le saisir manuellement",
      ],
    };
  }

  // Calculate montantHT if we have TVA
  const montantHT =
    montantTVA !== undefined ? parseFloat((montantTTC - montantTVA).toFixed(2)) : undefined;

  // Guess category
  const category = guessCategory(enseigne, text);

  // Build ticket data
  const ticketData: TicketData = {
    enseigne,
    siret,
    date,
    montantTTC,
    montantHT,
    montantTVA,
    category,
    sourceType: "SCAN",
    confidence: 0, // Will be calculated below
  };

  // Calculate confidence
  ticketData.confidence = calculateConfidence(ticketData);

  // Add warnings
  if (!enseigne) {
    warnings.push("Enseigne non détectée - catégorisée comme 'Autre'");
  }
  if (!date) {
    warnings.push("Date non détectée - utilisera la date du jour");
  }
  if (!montantTVA) {
    warnings.push(
      `Montant TVA non détecté - estimation basée sur catégorie (${DEFAULT_TVA_RATES[category]}%)`
    );
  }

  if (warnings.length > 0) {
    ticketData.warnings = warnings;
  }

  return {
    success: true,
    ticketData,
    ocrResult,
    warnings,
  };
}
