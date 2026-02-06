import { useState } from "react";
import { FamilleServices, Enfant, FrequenceServices, Aides } from "@/modules/profil/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step5FamilleServicesProps {
  data: FamilleServices;
  onChange: (data: FamilleServices) => void;
}

export function Step5FamilleServices({ data, onChange }: Step5FamilleServicesProps) {
  const [newEnfant, setNewEnfant] = useState<Enfant>({
    age: 10,
    niveauScolaire: "primaire",
  });

  const updateNombreEnfants = (nombre: number) => {
    onChange({ ...data, nombreEnfants: nombre });
  };

  const addEnfant = () => {
    onChange({
      ...data,
      enfants: [...data.enfants, { ...newEnfant }],
    });
    setNewEnfant({ age: 10, niveauScolaire: "primaire" });
  };

  const removeEnfant = (index: number) => {
    onChange({
      ...data,
      enfants: data.enfants.filter((_, i) => i !== index),
    });
  };

  const updateFrequenceServices = <K extends keyof FrequenceServices>(
    field: K,
    value: FrequenceServices[K]
  ) => {
    onChange({
      ...data,
      frequenceServices: {
        ...data.frequenceServices,
        [field]: value,
      },
    });
  };

  const updateAide = (field: keyof Aides, value: boolean | number) => {
    onChange({
      ...data,
      aides: {
        ...data.aides,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Étape 5 : Famille & Services publics
        </h2>
        <p className="text-gray-600">
          Ces informations nous permettent de valoriser les services publics que vous utilisez.
        </p>
      </div>

      <div className="space-y-4">
        {/* Nombre d'enfants */}
        <div>
          <Label htmlFor="nombreEnfants">Nombre d'enfants à charge</Label>
          <Input
            id="nombreEnfants"
            type="number"
            min="0"
            max="15"
            value={data.nombreEnfants}
            onChange={(e) => updateNombreEnfants(parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Détail des enfants */}
        {data.nombreEnfants > 0 && (
          <div>
            <Label>Détail des enfants (pour estimer le coût éducation)</Label>
            <p className="text-sm text-gray-500 mb-3">
              Ajoutez l'âge et le niveau scolaire de chaque enfant pour un calcul précis.
            </p>

            {/* Liste des enfants */}
            {data.enfants.length > 0 && (
              <div className="space-y-2 mb-4">
                {data.enfants.map((enfant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{enfant.age} ans</span>
                      <span className="text-gray-600 ml-2">
                        • {enfant.niveauScolaire.replace("_", " ")}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeEnfant(index)}>
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Ajouter un enfant */}
            {data.enfants.length < data.nombreEnfants && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="enfantAge">Âge</Label>
                    <Input
                      id="enfantAge"
                      type="number"
                      min="0"
                      max="30"
                      value={newEnfant.age}
                      onChange={(e) =>
                        setNewEnfant({
                          ...newEnfant,
                          age: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="enfantNiveau">Niveau scolaire</Label>
                    <Select
                      value={newEnfant.niveauScolaire}
                      onValueChange={(value) =>
                        setNewEnfant({
                          ...newEnfant,
                          niveauScolaire: value as Enfant["niveauScolaire"],
                        })
                      }
                    >
                      <SelectTrigger id="enfantNiveau">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maternelle">Maternelle</SelectItem>
                        <SelectItem value="primaire">Primaire</SelectItem>
                        <SelectItem value="college">Collège</SelectItem>
                        <SelectItem value="lycee_general">Lycée général</SelectItem>
                        <SelectItem value="lycee_professionnel">Lycée professionnel</SelectItem>
                        <SelectItem value="superieur_public">Supérieur public</SelectItem>
                        <SelectItem value="superieur_prive">Supérieur privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={addEnfant}>
                  + Ajouter cet enfant
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Fréquence d'utilisation des services */}
        <div className="border-t pt-6">
          <Label>Fréquence d'utilisation des services publics</Label>
          <p className="text-sm text-gray-500 mb-4">
            Ces informations nous permettent d'ajuster la valorisation des services publics à votre
            usage réel.
          </p>

          <div className="space-y-3">
            <div>
              <Label htmlFor="transportsCommun" className="text-sm">
                Transports en commun
              </Label>
              <Select
                value={data.frequenceServices.transportsCommun}
                onValueChange={(value) =>
                  updateFrequenceServices(
                    "transportsCommun",
                    value as FrequenceServices["transportsCommun"]
                  )
                }
              >
                <SelectTrigger id="transportsCommun">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamais">Jamais</SelectItem>
                  <SelectItem value="occasionnelle">Occasionnelle</SelectItem>
                  <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                  <SelectItem value="quotidienne">Quotidienne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hopitalMedecin" className="text-sm">
                Hôpital / Médecin
              </Label>
              <Select
                value={data.frequenceServices.hopitalMedecin}
                onValueChange={(value) =>
                  updateFrequenceServices(
                    "hopitalMedecin",
                    value as FrequenceServices["hopitalMedecin"]
                  )
                }
              >
                <SelectTrigger id="hopitalMedecin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamais">Jamais</SelectItem>
                  <SelectItem value="annuelle">Annuelle</SelectItem>
                  <SelectItem value="mensuelle">Mensuelle</SelectItem>
                  <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bibliotheque" className="text-sm">
                Bibliothèque
              </Label>
              <Select
                value={data.frequenceServices.bibliotheque}
                onValueChange={(value) =>
                  updateFrequenceServices(
                    "bibliotheque",
                    value as FrequenceServices["bibliotheque"]
                  )
                }
              >
                <SelectTrigger id="bibliotheque">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamais">Jamais</SelectItem>
                  <SelectItem value="occasionnelle">Occasionnelle</SelectItem>
                  <SelectItem value="mensuelle">Mensuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="equipementsSportifs" className="text-sm">
                Équipements sportifs municipaux
              </Label>
              <Select
                value={data.frequenceServices.equipementsSportifs}
                onValueChange={(value) =>
                  updateFrequenceServices(
                    "equipementsSportifs",
                    value as FrequenceServices["equipementsSportifs"]
                  )
                }
              >
                <SelectTrigger id="equipementsSportifs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamais">Jamais</SelectItem>
                  <SelectItem value="occasionnelle">Occasionnelle</SelectItem>
                  <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Aides sociales */}
        <div className="border-t pt-6">
          <Label>Aides et transferts sociaux</Label>
          <p className="text-sm text-gray-500 mb-4">
            Cochez les aides que vous recevez et indiquez le montant annuel si connu.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="caf"
                checked={data.aides.caf}
                onCheckedChange={(checked) => updateAide("caf", !!checked)}
              />
              <div className="flex-1">
                <Label htmlFor="caf" className="cursor-pointer">
                  Allocations familiales (CAF)
                </Label>
                {data.aides.caf && (
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    className="mt-2"
                    value={data.aides.montantCAF ?? ""}
                    onChange={(e) =>
                      updateAide("montantCAF", ((parseFloat(e.target.value) || undefined) as any) as any)
                    }
                    placeholder="Montant annuel (€)"
                  />
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="apl"
                checked={data.aides.apl}
                onCheckedChange={(checked) => updateAide("apl", !!checked)}
              />
              <div className="flex-1">
                <Label htmlFor="apl" className="cursor-pointer">
                  APL (Aide Personnalisée au Logement)
                </Label>
                {data.aides.apl && (
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    className="mt-2"
                    value={data.aides.montantAPL ?? ""}
                    onChange={(e) =>
                      updateAide("montantAPL", ((parseFloat(e.target.value) || undefined) as any) as any)
                    }
                    placeholder="Montant annuel (€)"
                  />
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="rsa"
                checked={data.aides.rsa}
                onCheckedChange={(checked) => updateAide("rsa", !!checked)}
              />
              <div className="flex-1">
                <Label htmlFor="rsa" className="cursor-pointer">
                  RSA (Revenu de Solidarité Active)
                </Label>
                {data.aides.rsa && (
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    className="mt-2"
                    value={data.aides.montantRSA ?? ""}
                    onChange={(e) =>
                      updateAide("montantRSA", (parseFloat(e.target.value) || undefined) as any)
                    }
                    placeholder="Montant annuel (€)"
                  />
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="bourses"
                checked={data.aides.bourses}
                onCheckedChange={(checked) => updateAide("bourses", !!checked)}
              />
              <div className="flex-1">
                <Label htmlFor="bourses" className="cursor-pointer">
                  Bourses étudiantes
                </Label>
                {data.aides.bourses && (
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    className="mt-2"
                    value={data.aides.montantBourses ?? ""}
                    onChange={(e) =>
                      updateAide("montantBourses", (parseFloat(e.target.value) || undefined) as any)
                    }
                    placeholder="Montant annuel (€)"
                  />
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="chomage"
                checked={data.aides.chomage}
                onCheckedChange={(checked) => updateAide("chomage", !!checked)}
              />
              <div className="flex-1">
                <Label htmlFor="chomage" className="cursor-pointer">
                  Indemnités chômage
                </Label>
                {data.aides.chomage && (
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    className="mt-2"
                    value={data.aides.montantChomage ?? ""}
                    onChange={(e) =>
                      updateAide("montantChomage", (parseFloat(e.target.value) || undefined) as any)
                    }
                    placeholder="Montant annuel (€)"
                  />
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="cmuc"
                checked={data.aides.cmuc}
                onCheckedChange={(checked) => updateAide("cmuc", !!checked)}
              />
              <div className="flex-1">
                <Label htmlFor="cmuc" className="cursor-pointer">
                  CMU-C / C2S (Complémentaire Santé Solidaire)
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          ✅ <strong>Vous avez presque terminé !</strong> Une fois validé, vous pourrez visualiser
          votre score fiscal complet et comprendre votre relation financière avec l'État.
        </p>
      </div>
    </div>
  );
}
