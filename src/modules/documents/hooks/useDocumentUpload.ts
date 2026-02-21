"use client";

import { useState, useCallback } from "react";
import { DocumentType, ExtractedData, ParseResult } from "../types";

type UploadStep = "idle" | "consent" | "uploading" | "validating" | "submitting" | "success" | "error";

interface UseDocumentUploadReturn {
  // State
  step: UploadStep;
  file: File | null;
  documentType: DocumentType | null;
  parseResult: ParseResult | null;
  error: string | null;
  isLoading: boolean;

  // Actions
  selectFile: (file: File, documentType: DocumentType, useAIOcr?: boolean) => void;
  acceptConsent: () => Promise<void>;
  declineConsent: () => void;
  confirmValidation: (correctedData: Partial<ExtractedData>) => Promise<void>;
  cancelValidation: () => void;
  reset: () => void;
}

export function useDocumentUpload(): UseDocumentUploadReturn {
  const [step, setStep] = useState<UploadStep>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [useAIOcr, setUseAIOcr] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = ["uploading", "submitting"].includes(step);

  // Step 1: Sélection du fichier → afficher consentement
  const selectFile = useCallback((selectedFile: File, selectedType: DocumentType, useAI?: boolean) => {
    setFile(selectedFile);
    setDocumentType(selectedType);
    setUseAIOcr(useAI || false);
    setStep("consent");
    setError(null);
  }, []);

  // Step 2: Accepter le consentement → uploader et parser
  const acceptConsent = useCallback(async () => {
    if (!file || !documentType) {
      setError("Fichier ou type de document manquant");
      return;
    }

    setStep("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      formData.append("useAIOcr", useAIOcr.toString());

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      if (data.parseResult.status === "FAILED") {
        setError(
          data.parseResult.errors?.[0] ||
            "Aucune donnée n'a pu être extraite de ce document"
        );
        setStep("error");
        return;
      }

      setParseResult(data.parseResult);
      setStep("validating");
    } catch (err) {
      console.error("[useDocumentUpload] Error:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
      setStep("error");
    }
  }, [file, documentType, useAIOcr]);

  // Step 2 alt: Refuser le consentement → reset
  const declineConsent = useCallback(() => {
    reset();
  }, []);

  // Step 3: Confirmer la validation → injecter dans ProfilFiscal
  const confirmValidation = useCallback(
    async (correctedData: Partial<ExtractedData>) => {
      if (!documentType || !parseResult) {
        setError("Données manquantes pour la validation");
        return;
      }

      setStep("submitting");
      setError(null);

      try {
        const response = await fetch("/api/documents/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType,
            extractedData: parseResult.extractedData,
            userCorrections: correctedData,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors de la validation");
        }

        setStep("success");
      } catch (err) {
        console.error("[useDocumentUpload] Validation error:", err);
        setError(err instanceof Error ? err.message : "Erreur lors de la validation");
        setStep("error");
      }
    },
    [documentType, parseResult]
  );

  // Step 3 alt: Annuler la validation → reset
  const cancelValidation = useCallback(() => {
    reset();
  }, []);

  // Reset complet
  const reset = useCallback(() => {
    setStep("idle");
    setFile(null);
    setDocumentType(null);
    setParseResult(null);
    setError(null);
  }, []);

  return {
    step,
    file,
    documentType,
    parseResult,
    error,
    isLoading,
    selectFile,
    acceptConsent,
    declineConsent,
    confirmValidation,
    cancelValidation,
    reset,
  };
}
