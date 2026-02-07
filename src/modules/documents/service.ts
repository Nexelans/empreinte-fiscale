/**
 * Service de parsing et extraction de documents fiscaux
 */

import * as pdfParse from "pdf-parse";
import { DocumentType, ExtractedData, ParseResult, ExtractionStatus } from "./types";
import { extractDataFromText, calculateConfidence } from "./patterns";

/**
 * Parse un document PDF et extrait les données structurées
 */
export async function parseDocument(
  fileBuffer: Buffer,
  documentType: DocumentType
): Promise<ParseResult> {
  try {
    // Extraire le texte du PDF avec pdf-parse
    const pdf = (pdfParse as any).default || pdfParse;
    const pdfData = await pdf(fileBuffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      return {
        status: "FAILED",
        confidence: 0,
        extractedData: {},
        errors: ["Le document ne contient pas de texte extractible. Veuillez vérifier qu'il ne s'agit pas d'un PDF scanné."],
        rawText: "",
      };
    }

    // Extraire les données avec les patterns regex
    const extractedData = extractDataFromText(documentType, rawText);

    // Calculer le score de confiance
    const confidence = calculateConfidence(documentType, extractedData);

    // Déterminer le statut
    let status: ExtractionStatus;
    const extractedFieldsCount = Object.keys(extractedData).length;

    if (extractedFieldsCount === 0) {
      status = "FAILED";
    } else if (confidence < 50) {
      status = "PARTIAL";
    } else {
      status = "SUCCESS";
    }

    // Warnings pour champs manquants
    const warnings: string[] = [];
    if (status === "PARTIAL") {
      warnings.push(
        "Certains champs n'ont pas pu être détectés. Vous pourrez les corriger manuellement."
      );
    }

    return {
      status,
      confidence,
      extractedData,
      warnings: warnings.length > 0 ? warnings : undefined,
      rawText: process.env.NODE_ENV === "development" ? rawText : undefined, // Debug only
    };
  } catch (error) {
    console.error("[parseDocument] Error:", error);
    return {
      status: "FAILED",
      confidence: 0,
      extractedData: {},
      errors: [
        error instanceof Error
          ? error.message
          : "Erreur lors de l'analyse du document. Veuillez vérifier que le fichier est un PDF valide.",
      ],
    };
  }
}

/**
 * Valide les données extraites et applique les corrections utilisateur
 */
export function validateExtraction(
  extractedData: ExtractedData,
  userCorrections?: Partial<ExtractedData>
): ExtractedData {
  // Merge des données extraites avec les corrections utilisateur
  const validated: ExtractedData = {
    ...extractedData,
    ...userCorrections,
  };

  // Validation des valeurs numériques
  const numericFields: (keyof ExtractedData)[] = [
    "salaireBrut",
    "salaireNet",
    "csg",
    "cotisationsSalariales",
    "cotisationsPatronales",
    "revenuNetImposable",
    "impotRevenu",
    "nombreParts",
    "revenusFonciers",
    "revenusCapitaux",
    "taxeFonciere",
    "valeurLocative",
    "allocations",
    "apl",
    "autresAides",
  ];

  for (const field of numericFields) {
    const value = validated[field];
    if (value !== undefined && value !== null) {
      // Convertir en nombre si c'est une chaîne
      if (typeof value === "string") {
        const parsed = parseFloat(value.replace(",", "."));
        validated[field] = isNaN(parsed) ? undefined : (parsed as any);
      }
      // Vérifier que c'est positif
      if (typeof validated[field] === "number" && (validated[field] as number) < 0) {
        validated[field] = undefined;
      }
    }
  }

  // Validation spécifique pour certains champs
  if (validated.salaireBrut && validated.salaireNet) {
    if (validated.salaireNet > validated.salaireBrut) {
      // Incohérence : le net ne peut pas être > brut
      console.warn(
        "[validateExtraction] Incohérence : salaireNet > salaireBrut, on invalide le net"
      );
      validated.salaireNet = undefined;
    }
  }

  return validated;
}

/**
 * Extrait les données d'un document (fonction wrapper pour usage externe)
 */
export async function extractData(
  fileBuffer: Buffer,
  documentType: DocumentType
): Promise<ParseResult> {
  return parseDocument(fileBuffer, documentType);
}

/**
 * Détermine le type de document à partir du nom de fichier
 * Utilitaire pour auto-détection (optionnel)
 */
export function detectDocumentType(filename: string): DocumentType | null {
  const lower = filename.toLowerCase();

  if (lower.includes("bulletin") || lower.includes("paie") || lower.includes("salaire")) {
    return "bulletin_paie";
  }
  if (lower.includes("impot") || lower.includes("imposition") || lower.includes("fiscal")) {
    return "avis_imposition";
  }
  if (lower.includes("foncier") || lower.includes("fonciere")) {
    return "taxe_fonciere";
  }
  if (lower.includes("caf") || lower.includes("allocations")) {
    return "releve_caf";
  }

  return null; // Type inconnu, l'utilisateur devra choisir
}
