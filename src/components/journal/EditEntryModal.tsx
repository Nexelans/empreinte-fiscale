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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JournalEntryData } from "@/modules/journal/types";
import { SpendingCategory, SPENDING_CATEGORY_LABELS } from "@/modules/journal/types";

interface EditEntryModalProps {
  entry: JournalEntryData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<JournalEntryData>) => void;
  isSubmitting?: boolean;
}

export function EditEntryModal({
  entry,
  isOpen,
  onClose,
  onSave,
  isSubmitting = false,
}: EditEntryModalProps) {
  const [formData, setFormData] = useState<Partial<JournalEntryData>>({
    enseigne: entry.enseigne,
    date: entry.date,
    category: entry.category,
    montantTTC: entry.montantTTC,
    montantHT: entry.montantHT,
    notes: entry.notes,
  });

  const handleChange = (field: keyof JournalEntryData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la dépense</DialogTitle>
          <DialogDescription>
            Modifiez les informations de cette dépense. Les taxes seront recalculées automatiquement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Enseigne */}
          <div>
            <Label htmlFor="edit-enseigne">Enseigne</Label>
            <Input
              id="edit-enseigne"
              type="text"
              value={formData.enseigne || ""}
              onChange={(e) => handleChange("enseigne", e.target.value)}
              placeholder="Nom du commerce"
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={
                formData.date
                  ? (() => {
                      const date = new Date(formData.date);
                      return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
                    })()
                  : ""
              }
              onChange={(e) => handleChange("date", e.target.value ? new Date(e.target.value) : new Date())}
              required
            />
          </div>

          {/* Montant TTC */}
          <div>
            <Label htmlFor="edit-montantTTC">Montant TTC</Label>
            <div className="flex items-center gap-2">
              <Input
                id="edit-montantTTC"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.montantTTC || ""}
                onChange={(e) => handleChange("montantTTC", parseFloat(e.target.value))}
                required
              />
              <span className="text-sm text-gray-500">€</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="edit-category">Catégorie</Label>
            <Select
              value={formData.category || "autre"}
              onValueChange={(value) => handleChange("category", value as SpendingCategory)}
            >
              <SelectTrigger>
                <SelectValue />
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

          {/* Notes */}
          <div>
            <Label htmlFor="edit-notes">Notes (optionnel)</Label>
            <Input
              id="edit-notes"
              type="text"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Commentaire libre"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
