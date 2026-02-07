"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TicketData,
  TicketScanResult,
  SpendingCategory,
  SPENDING_CATEGORY_LABELS,
} from "@/modules/tickets/types";

interface TicketValidationProps {
  scanResult: TicketScanResult;
  onConfirm: (ticketData: TicketData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TicketValidation({
  scanResult,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: TicketValidationProps) {
  const [formData, setFormData] = useState<TicketData>(
    scanResult.ticketData || {
      montantTTC: 0,
      sourceType: "SCAN",
      confidence: 0,
    }
  );

  const handleChange = (field: keyof TicketData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  const confidence = scanResult.ticketData?.confidence || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Saisissez les informations du ticket</h3>
          <p className="text-sm text-gray-600 mt-1">
            Référez-vous à votre ticket pour remplir les informations ci-dessous
          </p>
        </div>

        {scanResult.warnings && scanResult.warnings.length > 0 && (
          <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            {scanResult.warnings.map((warning, i) => (
              <p key={i}>💡 {warning}</p>
            ))}
          </div>
        )}
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {/* Enseigne */}
        <div>
          <Label htmlFor="enseigne">
            Enseigne <span className="text-xs text-gray-500">(optionnel)</span>
          </Label>
          <Input
            id="enseigne"
            type="text"
            value={formData.enseigne || ""}
            onChange={(e) => handleChange("enseigne", e.target.value)}
            placeholder="Ex: Carrefour, Auchan, Total..."
          />
        </div>

        {/* Date */}
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={
              formData.date
                ? new Date(formData.date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0]
            }
            onChange={(e) => handleChange("date", new Date(e.target.value))}
          />
        </div>

        {/* Montant TTC (required) */}
        <div>
          <Label htmlFor="montantTTC">
            Montant TTC <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="montantTTC"
              type="number"
              step="0.01"
              min="0"
              value={formData.montantTTC || ""}
              onChange={(e) => handleChange("montantTTC", parseFloat(e.target.value))}
              placeholder="0.00"
              required
            />
            <span className="text-sm text-gray-500">€</span>
          </div>
        </div>

        {/* Montant TVA */}
        <div>
          <Label htmlFor="montantTVA">
            Montant TVA <span className="text-xs text-gray-500">(optionnel)</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="montantTVA"
              type="number"
              step="0.01"
              min="0"
              value={formData.montantTVA || ""}
              onChange={(e) =>
                handleChange(
                  "montantTVA",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder="Si indiqué sur le ticket"
            />
            <span className="text-sm text-gray-500">€</span>
          </div>
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Select
            value={formData.category || "autre"}
            onValueChange={(value) => handleChange("category", value as SpendingCategory)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SPENDING_CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.montantTTC}>
          {isSubmitting ? "Enregistrement..." : "Confirmer et enregistrer"}
        </Button>
      </div>
    </form>
  );
}
