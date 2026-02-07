/**
 * Types pour le module de gestion des documents fiscaux
 */

export type DocumentType =
  | "bulletin_paie"
  | "avis_imposition"
  | "taxe_fonciere"
  | "releve_caf";

export type ExtractionStatus = "PENDING" | "SUCCESS" | "PARTIAL" | "FAILED";

export type DataStatus = "VERIFIE" | "DECLARE" | "ESTIME";

export interface ExtractedData {
  // Bulletin de paie
  salaireBrut?: number;
  salaireNet?: number;
  csg?: number;
  cotisationsSalariales?: number;
  cotisationsPatronales?: number;

  // Avis d'imposition
  revenuNetImposable?: number;
  impotRevenu?: number;
  nombreParts?: number;
  revenusFonciers?: number;
  revenusCapitaux?: number;

  // Taxe foncière
  taxeFonciere?: number;
  valeurLocative?: number;
  commune?: string;

  // Relevé CAF
  allocations?: number;
  apl?: number;
  autresAides?: number;
}

export interface ParseResult {
  status: ExtractionStatus;
  confidence: number; // 0-100
  extractedData: ExtractedData;
  errors?: string[];
  warnings?: string[];
  rawText?: string; // For debugging
}

export interface ValidationInput {
  documentType: DocumentType;
  extractedData: ExtractedData;
  userCorrections?: Partial<ExtractedData>;
}

export interface DocumentUploadMetadata {
  id: string;
  type: DocumentType;
  uploadedAt: Date;
  status: "VALIDATED" | "FAILED";
  extractedData?: ExtractedData;
  errorMessage?: string;
}
