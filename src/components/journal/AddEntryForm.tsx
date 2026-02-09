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
import { SpendingCategory, SPENDING_CATEGORY_LABELS } from "@/modules/journal/types";
import { JournalEntryInput } from "@/modules/journal/service";

interface AddEntryFormProps {
  onSubmit: (entryData: JournalEntryInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AddEntryForm({ onSubmit, onCancel, isSubmitting = false }: AddEntryFormProps) {
  const [formData, setFormData] = useState<Partial<JournalEntryInput>>({
    date: new Date(),
    category: "alimentation",
    montantTTC: 0,
  });

  const handleChange = (field: keyof JournalEntryInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.montantTTC && formData.montantTTC > 0) {
      onSubmit(formData as JournalEntryInput);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-1">
          Ajouter une dépense manuellement
        </h3>
        <p className="text-sm text-blue-700">
          Renseignez les détails de votre dépense pour calculer les taxes associées
        </p>
      </div>

      {/* Enseigne */}
      <div>
        <Label htmlFor="enseigne">Enseigne ou commerce</Label>
        <Input
          id="enseigne"
          type="text"
          value={formData.enseigne || ""}
          onChange={(e) => handleChange("enseigne", e.target.value)}
          placeholder="Ex: Carrefour, Restaurant Le Bon Coin..."
        />
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date">Date de la dépense</Label>
        <Input
          id="date"
          type="date"
          value={
            formData.date
              ? (() => {
                  const date = new Date(formData.date);
                  return isNaN(date.getTime())
                    ? new Date().toISOString().split("T")[0]
                    : date.toISOString().split("T")[0];
                })()
              : new Date().toISOString().split("T")[0]
          }
          onChange={(e) => handleChange("date", e.target.value ? new Date(e.target.value) : new Date())}
          required
        />
      </div>

      {/* Montant TTC */}
      <div>
        <Label htmlFor="montantTTC">
          Montant TTC <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="montantTTC"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.montantTTC || ""}
            onChange={(e) => handleChange("montantTTC", parseFloat(e.target.value))}
            placeholder="0.00"
            required
          />
          <span className="text-sm text-gray-500">€</span>
        </div>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">
          Catégorie <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.category || "autre"}
          onValueChange={(value) => handleChange("category", value as SpendingCategory)}
          required
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
        <p className="text-xs text-gray-500 mt-1">
          La catégorie permet de calculer le taux de TVA approprié
        </p>
      </div>

      {/* Montant TVA (optional) */}
      <div>
        <Label htmlFor="montantTVA">Montant TVA (optionnel)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="montantTVA"
            type="number"
            step="0.01"
            min="0"
            value={formData.montantTVA || ""}
            onChange={(e) =>
              handleChange("montantTVA", e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="Laissez vide pour calcul automatique"
          />
          <span className="text-sm text-gray-500">€</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.montantTTC}>
          {isSubmitting ? "Enregistrement..." : "Ajouter la dépense"}
        </Button>
      </div>
    </form>
  );
}
