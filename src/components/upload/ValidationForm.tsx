"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentType, ExtractedData, ParseResult } from "@/modules/documents/types";

interface ValidationFormProps {
  parseResult: ParseResult;
  documentType: DocumentType;
  onConfirm: (correctedData: Partial<ExtractedData>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ValidationForm({
  parseResult,
  documentType,
  onConfirm,
  onCancel,
  isSubmitting,
}: ValidationFormProps) {
  const [formData, setFormData] = useState<Partial<ExtractedData>>(
    parseResult.extractedData
  );

  const handleChange = (field: keyof ExtractedData, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value.replace(",", "."));
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(numValue!) ? value : numValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  // Déterminer quels champs afficher selon le type de document
  const getFieldsToDisplay = (): Array<{
    key: keyof ExtractedData;
    label: string;
    unit?: string;
  }> => {
    switch (documentType) {
      case "bulletin_paie":
        return [
          { key: "salaireBrut", label: "Salaire brut", unit: "€" },
          { key: "salaireNet", label: "Salaire net", unit: "€" },
          { key: "csg", label: "CSG", unit: "€" },
          { key: "cotisationsSalariales", label: "Cotisations salariales", unit: "€" },
          { key: "cotisationsPatronales", label: "Cotisations patronales", unit: "€" },
        ];
      case "avis_imposition":
        return [
          { key: "revenuNetImposable", label: "Revenu net imposable", unit: "€" },
          { key: "impotRevenu", label: "Impôt sur le revenu", unit: "€" },
          { key: "nombreParts", label: "Nombre de parts" },
          { key: "revenusFonciers", label: "Revenus fonciers", unit: "€" },
          { key: "revenusCapitaux", label: "Revenus de capitaux", unit: "€" },
        ];
      case "taxe_fonciere":
        return [
          { key: "taxeFonciere", label: "Taxe foncière", unit: "€" },
          { key: "valeurLocative", label: "Valeur locative cadastrale", unit: "€" },
          { key: "commune", label: "Commune" },
        ];
      case "releve_caf":
        return [
          { key: "allocations", label: "Allocations familiales", unit: "€" },
          { key: "apl", label: "APL", unit: "€" },
          { key: "autresAides", label: "Autres aides", unit: "€" },
        ];
      default:
        return [];
    }
  };

  const fields = getFieldsToDisplay();
  const confidence = parseResult.confidence;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête avec score de confiance */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Données extraites
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Vérifiez et corrigez si nécessaire les valeurs détectées
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-500">Confiance</div>
            <div
              className={`text-2xl font-bold ${
                confidence >= 80
                  ? "text-green-600"
                  : confidence >= 50
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {confidence}%
            </div>
          </div>
        </div>

        {parseResult.warnings && parseResult.warnings.length > 0 && (
          <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            {parseResult.warnings.map((warning, i) => (
              <p key={i}>⚠️ {warning}</p>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire de validation */}
      <div className="space-y-4">
        {fields.map(({ key, label, unit }) => {
          const value = formData[key];
          const wasDetected = parseResult.extractedData[key] !== undefined;

          return (
            <div key={key}>
              <Label htmlFor={key} className="flex items-center gap-2">
                {label}
                {wasDetected ? (
                  <span className="text-xs text-green-600">✓ Détecté</span>
                ) : (
                  <span className="text-xs text-gray-400">Non détecté</span>
                )}
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id={key}
                  type={key === "commune" ? "text" : "number"}
                  step={key === "nombreParts" ? "0.5" : "0.01"}
                  value={value ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={wasDetected ? undefined : "Non détecté"}
                  className={wasDetected ? "bg-white" : "bg-gray-50"}
                />
                {unit && <span className="text-sm text-gray-500">{unit}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Validation en cours..." : "Confirmer et intégrer"}
        </Button>
      </div>
    </form>
  );
}
