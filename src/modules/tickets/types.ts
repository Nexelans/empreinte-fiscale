/**
 * Types for ticket scanning and OCR extraction
 */

/**
 * Categories of spending for fiscal journal
 */
export type SpendingCategory =
  | "alimentation"
  | "restaurant"
  | "transport"
  | "carburant"
  | "energie"
  | "telecom"
  | "loisirs"
  | "sante"
  | "logement"
  | "autre";

/**
 * OCR extraction status
 */
export type OCRStatus = "PENDING" | "SUCCESS" | "PARTIAL" | "FAILED";

/**
 * Raw OCR result from tesseract.js or AI provider
 */
export interface OCRResult {
  status: OCRStatus;
  confidence: number; // 0-100
  rawText: string;
  processingTimeMs: number;
  error?: string;
}

/**
 * Structured ticket data extracted from OCR
 */
export interface TicketData {
  // Merchant info
  enseigne?: string;
  siret?: string;
  adresse?: string;

  // Transaction info
  date?: Date;
  montantTTC: number; // Total amount including tax (required)
  montantHT?: number; // Amount before tax
  montantTVA?: number; // VAT amount

  // Line items (optional detailed extraction)
  lignes?: TicketLineItem[];

  // Metadata
  category?: SpendingCategory;
  paymentMethod?: "CB" | "ESPECES" | "CHEQUE" | "AUTRE";

  // Source info
  sourceType: "SCAN" | "MANUAL";
  confidence: number; // Overall confidence of extraction (0-100)
  warnings?: string[];
}

/**
 * Individual line item from ticket
 */
export interface TicketLineItem {
  description: string;
  quantite?: number;
  prixUnitaire?: number;
  montantTotal: number;
  tauxTVA?: number; // VAT rate as percentage (20, 10, 5.5, 2.1)
}

/**
 * Result of ticket scan and extraction process
 */
export interface TicketScanResult {
  success: boolean;
  ticketData?: TicketData;
  ocrResult: OCRResult;
  errors?: string[];
  warnings?: string[];
}

/**
 * Spending category labels for UI
 */
export const SPENDING_CATEGORY_LABELS: Record<SpendingCategory, string> = {
  alimentation: "Alimentation",
  restaurant: "Restaurant / Café",
  transport: "Transport",
  carburant: "Carburant",
  energie: "Énergie (gaz, électricité)",
  telecom: "Télécom (internet, mobile)",
  loisirs: "Loisirs / Culture",
  sante: "Santé",
  logement: "Logement",
  autre: "Autre",
};

/**
 * Default TVA rates by category (simplified)
 */
export const DEFAULT_TVA_RATES: Record<SpendingCategory, number> = {
  alimentation: 5.5, // Most food items at reduced rate
  restaurant: 10, // Restaurant service
  transport: 10,
  carburant: 20,
  energie: 5.5,
  telecom: 20,
  loisirs: 20,
  sante: 5.5, // Most health products at reduced rate
  logement: 20,
  autre: 20,
};
