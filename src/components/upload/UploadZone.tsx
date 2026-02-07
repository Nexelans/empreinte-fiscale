"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { DocumentType } from "@/modules/documents/types";

interface UploadZoneProps {
  onFileSelect: (file: File, documentType: DocumentType) => void;
  isLoading?: boolean;
}

export function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (!selectedType) {
        alert("Veuillez d'abord sélectionner le type de document");
        return;
      }

      const files = Array.from(e.dataTransfer.files);
      const pdfFile = files.find((f) => f.type === "application/pdf");

      if (!pdfFile) {
        alert("Veuillez déposer un fichier PDF");
        return;
      }

      onFileSelect(pdfFile, selectedType);
    },
    [selectedType, onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedType) {
        alert("Veuillez d'abord sélectionner le type de document");
        return;
      }

      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file, selectedType);
      }
    },
    [selectedType, onFileSelect]
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
    </div>
  );
}
