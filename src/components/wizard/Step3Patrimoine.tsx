import { useState } from "react";
import { Patrimoine, Vehicule } from "@/modules/profil/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step3PatrimoineProps {
  data: Patrimoine;
  onChange: (data: Patrimoine) => void;
}

export function Step3Patrimoine({ data, onChange }: Step3PatrimoineProps) {
  const [newVehicule, setNewVehicule] = useState<Vehicule>({
    type: "thermique",
    kmAnnuels: 10000,
  });

  const updateField = <K extends keyof Patrimoine>(field: K, value: Patrimoine[K]) => {
    onChange({ ...data, [field]: value });
  };

  const addVehicule = () => {
    onChange({
      ...data,
      vehicules: [...data.vehicules, { ...newVehicule }],
    });
    setNewVehicule({ type: "thermique", kmAnnuels: 10000 });
  };

  const removeVehicule = (index: number) => {
    onChange({
      ...data,
      vehicules: data.vehicules.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Étape 3 : Patrimoine</h2>
        <p className="text-gray-600">
          Votre patrimoine nous permet de calculer vos taxes locales et impôts sur le patrimoine.
        </p>
      </div>

      <div className="space-y-4">
        {/* Propriétaire / Locataire */}
        <div>
          <Label>Statut de logement *</Label>
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => updateField("proprietaire", true)}
              className={`
                flex-1 p-4 rounded-lg border-2 transition-all
                ${
                  data.proprietaire === true
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-semibold">Propriétaire</div>
            </button>
            <button
              type="button"
              onClick={() => updateField("proprietaire", false)}
              className={`
                flex-1 p-4 rounded-lg border-2 transition-all
                ${
                  data.proprietaire === false
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
            >
              <div className="text-2xl mb-2">🔑</div>
              <div className="font-semibold">Locataire</div>
            </button>
          </div>
        </div>

        {/* Si propriétaire */}
        {data.proprietaire === true && (
          <>
            <div>
              <Label htmlFor="valeurLocative">Valeur locative cadastrale annuelle (€)</Label>
              <Input
                id="valeurLocative"
                type="number"
                min="0"
                step="100"
                value={data.valeurLocative ?? ""}
                onChange={(e) =>
                  updateField("valeurLocative", parseFloat(e.target.value) || null)
                }
                placeholder="Ex: 8000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Visible sur votre avis de taxe foncière. Sert de base au calcul de la taxe.
              </p>
            </div>

            <div>
              <Label htmlFor="taxeFonciere">Montant de la taxe foncière annuelle (€)</Label>
              <Input
                id="taxeFonciere"
                type="number"
                min="0"
                step="100"
                value={data.taxeFonciere ?? ""}
                onChange={(e) => updateField("taxeFonciere", parseFloat(e.target.value) || null)}
                placeholder="Ex: 1200"
              />
            </div>
          </>
        )}

        {/* Véhicules */}
        <div>
          <Label>Véhicules</Label>
          <p className="text-sm text-gray-500 mb-3">
            Ajoutez vos véhicules pour calculer la TICPE (taxe intérieure sur la consommation de
            produits énergétiques) que vous payez.
          </p>

          {/* Liste des véhicules */}
          {data.vehicules.length > 0 && (
            <div className="space-y-2 mb-4">
              {data.vehicules.map((vehicule, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium capitalize">{vehicule.type}</span>
                    <span className="text-gray-600 ml-2">
                      • {vehicule.kmAnnuels.toLocaleString()} km/an
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVehicule(index)}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Ajouter un véhicule */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="vehiculeType">Type</Label>
                <Select
                  value={newVehicule.type}
                  onValueChange={(value) =>
                    setNewVehicule({ ...newVehicule, type: value as Vehicule["type"] })
                  }
                >
                  <SelectTrigger id="vehiculeType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thermique">Essence</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                    <SelectItem value="electrique">Électrique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vehiculeKm">Km par an</Label>
                <Input
                  id="vehiculeKm"
                  type="number"
                  min="0"
                  step="1000"
                  value={newVehicule.kmAnnuels}
                  onChange={(e) =>
                    setNewVehicule({
                      ...newVehicule,
                      kmAnnuels: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={addVehicule}
            >
              + Ajouter ce véhicule
            </Button>
          </div>
        </div>

        {/* Patrimoine IFI */}
        <div>
          <Label htmlFor="patrimoineIFI">Patrimoine immobilier net taxable IFI (€)</Label>
          <Input
            id="patrimoineIFI"
            type="number"
            min="0"
            step="10000"
            value={data.patrimoineIFI ?? ""}
            onChange={(e) => updateField("patrimoineIFI", parseFloat(e.target.value) || null)}
            placeholder="Ex: 2500000"
          />
          <p className="text-sm text-gray-500 mt-1">
            Seulement si votre patrimoine immobilier dépasse 1,3 million d'euros. Patrimoine brut
            moins dettes.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          ⚠️ <strong>Important :</strong> Ces informations sont utilisées uniquement pour calculer
          vos taxes et impôts locaux. Elles restent strictement confidentielles.
        </p>
      </div>
    </div>
  );
}
