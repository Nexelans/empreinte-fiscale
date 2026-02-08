"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProfilFiscalData } from "@/modules/profil/types";

// Flattened modification interface for form fields
interface FlatModifications {
  salaireBrut?: number;
  salaireNet?: number;
  typeContrat?: string;
  autresRevenus?: number;
  proprietaire?: boolean;
  taxeFonciere?: number;
  patrimoineIFI?: number;
  nombreParts?: number;
  statut?: string;
  commune?: string;
}

interface CustomSimulationFormProps {
  baseProfile: ProfilFiscalData;
  onSubmit: (modifications: Partial<ProfilFiscalData>, label: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CustomSimulationForm({
  baseProfile,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CustomSimulationFormProps) {
  const [label, setLabel] = useState("");
  const [modifications, setModifications] = useState<FlatModifications>({});

  const handleFieldChange = (field: keyof FlatModifications, value: any) => {
    setModifications((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation basique
    if (!label.trim()) {
      alert("Veuillez saisir un nom pour votre simulation");
      return;
    }

    if (Object.keys(modifications).length === 0) {
      alert("Veuillez modifier au moins un champ");
      return;
    }

    // Convert flat modifications to nested structure
    const nestedModifications: Partial<ProfilFiscalData> = {};

    if (modifications.salaireBrut !== undefined || modifications.salaireNet !== undefined ||
        modifications.typeContrat !== undefined || modifications.autresRevenus !== undefined) {
      nestedModifications.revenus = {
        ...(modifications.salaireBrut !== undefined && { salaireBrut: modifications.salaireBrut }),
        ...(modifications.salaireNet !== undefined && { salaireNet: modifications.salaireNet }),
        ...(modifications.typeContrat !== undefined && { typeContrat: modifications.typeContrat as any }),
        ...(modifications.autresRevenus !== undefined && { autresRevenus: modifications.autresRevenus }),
      } as any;
    }

    if (modifications.proprietaire !== undefined || modifications.taxeFonciere !== undefined ||
        modifications.patrimoineIFI !== undefined) {
      nestedModifications.patrimoine = {
        ...(modifications.proprietaire !== undefined && { proprietaire: modifications.proprietaire }),
        ...(modifications.taxeFonciere !== undefined && { taxeFonciere: modifications.taxeFonciere }),
        ...(modifications.patrimoineIFI !== undefined && { patrimoineIFI: modifications.patrimoineIFI }),
      } as any;
    }

    if (modifications.nombreParts !== undefined || modifications.statut !== undefined ||
        modifications.commune !== undefined) {
      nestedModifications.situation = {
        ...(modifications.nombreParts !== undefined && { nombreParts: modifications.nombreParts }),
        ...(modifications.statut !== undefined && { statut: modifications.statut as any }),
        ...(modifications.commune !== undefined && { commune: modifications.commune }),
      } as any;
    }

    onSubmit(nestedModifications, label);
  };

  const getCurrentValue = (field: keyof FlatModifications): any => {
    if (modifications[field] !== undefined) {
      return modifications[field];
    }

    // Get from nested baseProfile
    switch (field) {
      case "salaireBrut": return baseProfile.revenus?.salaireBrut;
      case "salaireNet": return baseProfile.revenus?.salaireNet;
      case "typeContrat": return baseProfile.revenus?.typeContrat;
      case "autresRevenus": return baseProfile.revenus?.autresRevenus;
      case "proprietaire": return baseProfile.patrimoine?.proprietaire;
      case "taxeFonciere": return baseProfile.patrimoine?.taxeFonciere;
      case "patrimoineIFI": return baseProfile.patrimoine?.patrimoineIFI;
      case "nombreParts": return baseProfile.situation?.nombreParts;
      case "statut": return baseProfile.situation?.statut;
      case "commune": return baseProfile.situation?.commune;
      default: return undefined;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de la simulation *
        </label>
        <Input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Et si je gagnais 10% de plus ?"
          required
        />
      </div>

      {/* Revenus */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenus</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salaire brut annuel (€)
            </label>
            <Input
              type="number"
              value={getCurrentValue("salaireBrut") || ""}
              onChange={(e) =>
                handleFieldChange("salaireBrut", parseFloat(e.target.value) || undefined)
              }
              placeholder={baseProfile.revenus?.salaireBrut?.toString() || "Non renseigné"}
              min="0"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Actuel: {baseProfile.revenus?.salaireBrut?.toLocaleString() || "Non renseigné"} €
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salaire net imposable annuel (€)
            </label>
            <Input
              type="number"
              value={getCurrentValue("salaireNet") || ""}
              onChange={(e) =>
                handleFieldChange("salaireNet", parseFloat(e.target.value) || undefined)
              }
              placeholder={baseProfile.revenus?.salaireNet?.toString() || "Non renseigné"}
              min="0"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Actuel: {baseProfile.revenus?.salaireNet?.toLocaleString() || "Non renseigné"} €
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de contrat
            </label>
            <Select
              value={getCurrentValue("typeContrat") || ""}
              onValueChange={(value) => handleFieldChange("typeContrat", value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder={baseProfile.revenus?.typeContrat || "Sélectionner"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
                <SelectItem value="FONCTIONNAIRE">Fonctionnaire</SelectItem>
                <SelectItem value="INDEPENDANT">Indépendant</SelectItem>
                <SelectItem value="AUTO_ENTREPRENEUR">Auto-entrepreneur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Autres revenus annuels (€)
            </label>
            <Input
              type="number"
              value={getCurrentValue("autresRevenus") || ""}
              onChange={(e) =>
                handleFieldChange("autresRevenus", parseFloat(e.target.value) || undefined)
              }
              placeholder={baseProfile.revenus?.autresRevenus?.toString() || "0"}
              min="0"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pension, rentes, etc.
            </p>
          </div>
        </div>
      </div>

      {/* Patrimoine */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Patrimoine</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <Select
              value={getCurrentValue("proprietaire")?.toString() || ""}
              onValueChange={(value) =>
                handleFieldChange("proprietaire", value === "true")
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    baseProfile.patrimoine?.proprietaire ? "Propriétaire" : "Locataire"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Propriétaire</SelectItem>
                <SelectItem value="false">Locataire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taxe foncière annuelle (€)
            </label>
            <Input
              type="number"
              value={getCurrentValue("taxeFonciere") || ""}
              onChange={(e) =>
                handleFieldChange("taxeFonciere", parseFloat(e.target.value) || undefined)
              }
              placeholder={baseProfile.patrimoine?.taxeFonciere?.toString() || "0"}
              min="0"
              step="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Actuel: {baseProfile.patrimoine?.taxeFonciere?.toLocaleString() || "0"} €
            </p>
          </div>
        </div>
      </div>

      {/* Famille */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Famille</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Situation familiale
            </label>
            <Select
              value={getCurrentValue("statut") || ""}
              onValueChange={(value) =>
                handleFieldChange("statut", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={baseProfile.situation?.statut} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CELIBATAIRE">Célibataire</SelectItem>
                <SelectItem value="MARIE">Marié(e)</SelectItem>
                <SelectItem value="PACSE">Pacsé(e)</SelectItem>
                <SelectItem value="DIVORCE">Divorcé(e)</SelectItem>
                <SelectItem value="VEUF">Veuf(ve)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de parts fiscales
            </label>
            <Input
              type="number"
              value={getCurrentValue("nombreParts") || ""}
              onChange={(e) =>
                handleFieldChange("nombreParts", parseFloat(e.target.value) || 1)
              }
              placeholder={baseProfile.situation?.nombreParts?.toString() || "1"}
              min="1"
              max="10"
              step="0.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              Actuel: {baseProfile.situation?.nombreParts}
            </p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Localisation</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commune de résidence
          </label>
          <Input
            type="text"
            value={getCurrentValue("commune") || ""}
            onChange={(e) => handleFieldChange("commune", e.target.value || undefined)}
            placeholder={baseProfile.situation?.commune || "Non renseigné"}
          />
          <p className="text-xs text-gray-500 mt-1">
            Actuel: {baseProfile.situation?.commune || "Non renseigné"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Calcul en cours..." : "Lancer la simulation"}
        </Button>
      </div>
    </form>
  );
}
