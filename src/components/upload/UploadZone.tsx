"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AIWarningModal } from "@/components/ai/AIWarningModal";
import { DocumentType } from "@/modules/documents/types";
import { Sparkles, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File, documentType: DocumentType, useAIocr?: boolean) => void;
  isLoading?: boolean;
}

export function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [useAIOcr, setUseAIOcr] = useState(false);
  const [showAIWarning, setShowAIWarning] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loadingAIConfig, setLoadingAIConfig] = useState(true);

  // Check if user has AI configured
  useEffect(() => {
    const checkAIConfig = async () => {
      try {
        const response = await fetch('/api/ai/config');
        if (response.ok) {
          const data = await response.json();
          setAiAvailable(!!data.config);
        }
      } catch (error) {
        console.error('Failed to check AI config:', error);
      } finally {
        setLoadingAIConfig(false);
      }
    };

    checkAIConfig();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelection = useCallback(
    (file: File) => {
      if (!selectedType) {
        alert("Veuillez d'abord sélectionner le type de document");
        return;
      }

      // If AI OCR is enabled, show warning modal first
      if (useAIOcr && aiAvailable) {
        setPendingFile(file);
        setShowAIWarning(true);
      } else {
        onFileSelect(file, selectedType, false);
      }
    },
    [selectedType, useAIOcr, aiAvailable, onFileSelect]
  );

  const handleAIWarningConfirm = useCallback(() => {
    if (pendingFile && selectedType) {
      onFileSelect(pendingFile, selectedType, true);
      setPendingFile(null);
      setShowAIWarning(false);
    }
  }, [pendingFile, selectedType, onFileSelect]);

  const handleAIWarningCancel = useCallback(() => {
    setPendingFile(null);
    setShowAIWarning(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const pdfFile = files.find((f) => f.type === "application/pdf");

      if (!pdfFile) {
        alert("Veuillez déposer un fichier PDF");
        return;
      }

      handleFileSelection(pdfFile);
    },
    [handleFileSelection]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelection(file);
      }
    },
    [handleFileSelection]
  );

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: "bulletin_paie", label: "Bulletin de paie" },
    { value: "avis_imposition", label: "Avis d'imposition" },
    { value: "taxe_fonciere", label: "Avis de taxe foncière" },
    { value: "releve_caf", label: "Relevé CAF" },
  ];

  return (
    <div className="space-y-4">
      {/* Sélection du type de document */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de document
        </label>
        <div className="grid grid-cols-2 gap-2">
          {documentTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSelectedType(type.value)}
              disabled={isLoading}
              className={`
                px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors
                ${
                  selectedType === type.value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }
                ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zone de drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-50"}
          ${!selectedType ? "opacity-50" : ""}
        `}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          disabled={isLoading || !selectedType}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="file-upload"
        />

        <div className="space-y-2">
          <div className="text-4xl">📄</div>
          <div className="text-lg font-medium text-gray-900">
            {isDragging ? "Déposez le fichier ici" : "Glissez-déposez votre PDF ici"}
          </div>
          <div className="text-sm text-gray-600">ou</div>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || !selectedType}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            Choisir un fichier
          </Button>
          <div className="text-xs text-gray-500 mt-2">
            PDF uniquement • Max 10 MB
          </div>
        </div>
      </div>

      {!selectedType && (
        <p className="text-sm text-amber-600 text-center">
          ⚠️ Sélectionnez d'abord le type de document ci-dessus
        </p>
      )}

      {/* AI OCR Option */}
      {!loadingAIConfig && aiAvailable && selectedType && (
        <div className="border-t pt-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">OCR amélioré par IA</h4>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  Utiliser votre IA personnelle pour une extraction de données plus précise
                </p>
                <div className="flex items-center gap-4 text-xs text-blue-700">
                  <span>Coût estimé: ~0.02€ / document</span>
                  <span>•</span>
                  <span>Précision: +15-20%</span>
                </div>
                {useAIOcr && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Le document sera envoyé à votre fournisseur d'IA. Un avertissement sera
                      affiché avant l'envoi.
                    </span>
                  </div>
                )}
              </div>
              <Switch
                checked={useAIOcr}
                onCheckedChange={setUseAIOcr}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Warning Modal */}
      <AIWarningModal
        open={showAIWarning}
        onOpenChange={(open) => !open && handleAIWarningCancel()}
        onConfirm={handleAIWarningConfirm}
        dataDescription="Le contenu du document PDF sera envoyé à votre IA pour extraction automatique des données fiscales (revenus, impôts, cotisations, etc.)"
      />
    </div>
  );
}
