"use client";

import { useState, useCallback } from "react";
import { TicketData, TicketScanResult } from "../types";

type ScanStep = "idle" | "scanning" | "validating" | "submitting" | "success" | "error";

interface UseTicketScanReturn {
  // State
  step: ScanStep;
  file: File | null;
  scanResult: TicketScanResult | null;
  error: string | null;
  isLoading: boolean;
  estimatedTimeMs: number;

  // Actions
  startScan: (file: File) => Promise<void>;
  confirmValidation: (ticketData: TicketData) => Promise<void>;
  cancelValidation: () => void;
  reset: () => void;
}

export function useTicketScan(): UseTicketScanReturn {
  const [step, setStep] = useState<ScanStep>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<TicketScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTimeMs, setEstimatedTimeMs] = useState(3000);

  const isLoading = ["scanning", "submitting"].includes(step);

  // Step 1: Start scan → upload and perform OCR
  const startScan = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setStep("scanning");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/tickets/scan", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du scan");
      }

      // Store estimated time for progress bar
      if (data.estimatedMs) {
        setEstimatedTimeMs(data.estimatedMs);
      }

      // Check scan result
      if (!data.success || !data.scanResult.success) {
        setError(
          data.scanResult.errors?.[0] || "Impossible d'extraire les données du ticket"
        );
        setStep("error");
        return;
      }

      setScanResult(data.scanResult);
      setStep("validating");
    } catch (err) {
      console.error("[useTicketScan] Error:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du scan");
      setStep("error");
    }
  }, []);

  // Step 2: Confirm validation → save to journal
  const confirmValidation = useCallback(
    async (ticketData: TicketData) => {
      setStep("submitting");
      setError(null);

      try {
        const response = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketData,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors de l'enregistrement");
        }

        setStep("success");
      } catch (err) {
        console.error("[useTicketScan] Validation error:", err);
        setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
        setStep("error");
      }
    },
    []
  );

  // Step 2 alt: Cancel validation → reset
  const cancelValidation = useCallback(() => {
    reset();
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setStep("idle");
    setFile(null);
    setScanResult(null);
    setError(null);
    setEstimatedTimeMs(3000);
  }, []);

  return {
    step,
    file,
    scanResult,
    error,
    isLoading,
    estimatedTimeMs,
    startScan,
    confirmValidation,
    cancelValidation,
    reset,
  };
}
