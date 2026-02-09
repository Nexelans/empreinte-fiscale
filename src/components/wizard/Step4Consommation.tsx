import { Consommation, ModeConsommation } from "@/modules/profil/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Step4ConsommationProps {
  data: Consommation;
  onChange: (data: Consommation) => void;
}

export function Step4Consommation({ data, onChange }: Step4ConsommationProps) {
  const updateMode = (mode: ModeConsommation) => {
    onChange({ ...data, mode });
  };

  const updateProfilType = (profilType: "sobre" | "moyen" | "eleve") => {
    onChange({ ...data, profilType });
  };

  const updateBudgetMensuel = (field: string, value: number) => {
    onChange({
      ...data,
      budgetMensuel: {
        ...data.budgetMensuel,
        courses: data.budgetMensuel?.courses || 0,
        restaurants: data.budgetMensuel?.restaurants || 0,
        carburant: data.budgetMensuel?.carburant || 0,
        loisirs: data.budgetMensuel?.loisirs || 0,
        [field]: value,
      },
    });
  };

  const updateDetailCategorie = (field: string, value: number) => {
    onChange({
      ...data,
      detailCategories: {
        ...data.detailCategories,
        alimentation_tva_55: data.detailCategories?.alimentation_tva_55 || 0,
        alimentation_tva_20: data.detailCategories?.alimentation_tva_20 || 0,
        restaurants: data.detailCategories?.restaurants || 0,
        transport: data.detailCategories?.transport || 0,
        logement: data.detailCategories?.logement || 0,
        sante: data.detailCategories?.sante || 0,
        loisirs: data.detailCategories?.loisirs || 0,
        equipement: data.detailCategories?.equipement || 0,
        autres: data.detailCategories?.autres || 0,
        [field]: value,
      },
    });
  };

  const updateAlcoolTabac = (field: "alcool" | "tabac", value: number) => {
    onChange({
      ...data,
      alcoolTabac: {
        alcool: data.alcoolTabac?.alcool || 0,
        tabac: data.alcoolTabac?.tabac || 0,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Étape 4 : Consommation</h2>
        <p className="text-gray-600">
          Votre consommation nous permet d'estimer les taxes indirectes que vous payez (TVA,
          TICPE...).
        </p>
      </div>

      {/* Mode selection */}
      <div>
        <Label>Choisissez votre mode de saisie *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <button
            type="button"
            onClick={() => updateMode("profil_type")}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                data.mode === "profil_type"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
          >
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold mb-1">Profil type</div>
            <div className="text-sm text-gray-600">Rapide, basé sur les moyennes INSEE</div>
          </button>

          <button
            type="button"
            onClick={() => updateMode("estimation_rapide")}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                data.mode === "estimation_rapide"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold mb-1">Estimation rapide</div>
            <div className="text-sm text-gray-600">Budget mensuel par catégorie</div>
          </button>

          <button
            type="button"
            onClick={() => updateMode("detaille")}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                data.mode === "detaille"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
          >
            <div className="text-2xl mb-2">🔬</div>
            <div className="font-semibold mb-1">Mode détaillé</div>
            <div className="text-sm text-gray-600">Catégories fines avec taux de TVA</div>
          </button>
        </div>
      </div>

      {/* Profil type */}
      {data.mode === "profil_type" && (
        <div className="space-y-4">
          <Label>Votre profil de consommation</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => updateProfilType("sobre")}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${
                  data.profilType === "sobre"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
            >
              <div className="font-semibold">Sobre</div>
              <div className="text-sm text-gray-600 mt-1">Consommation réduite</div>
            </button>

            <button
              type="button"
              onClick={() => updateProfilType("moyen")}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${
                  data.profilType === "moyen"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
            >
              <div className="font-semibold">Moyen</div>
              <div className="text-sm text-gray-600 mt-1">Moyenne nationale</div>
            </button>

            <button
              type="button"
              onClick={() => updateProfilType("eleve")}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${
                  data.profilType === "eleve"
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
            >
              <div className="font-semibold">Élevé</div>
              <div className="text-sm text-gray-600 mt-1">Consommation importante</div>
            </button>
          </div>
        </div>
      )}

      {/* Estimation rapide */}
      {data.mode === "estimation_rapide" && (
        <div className="space-y-4">
          <Label>Budget mensuel estimé</Label>

          <div>
            <Label htmlFor="courses">Courses alimentaires (€/mois)</Label>
            <Input
              id="courses"
              type="number"
              min="0"
              step="50"
              value={data.budgetMensuel?.courses ?? ""}
              onChange={(e) =>
                updateBudgetMensuel("courses", parseFloat(e.target.value) || 0)
              }
              placeholder="Ex: 400"
            />
          </div>

          <div>
            <Label htmlFor="restaurants">Restaurants & sorties (€/mois)</Label>
            <Input
              id="restaurants"
              type="number"
              min="0"
              step="50"
              value={data.budgetMensuel?.restaurants ?? ""}
              onChange={(e) =>
                updateBudgetMensuel("restaurants", parseFloat(e.target.value) || 0)
              }
              placeholder="Ex: 150"
            />
          </div>

          <div>
            <Label htmlFor="carburant">Carburant (€/mois)</Label>
            <Input
              id="carburant"
              type="number"
              min="0"
              step="50"
              value={data.budgetMensuel?.carburant ?? ""}
              onChange={(e) =>
                updateBudgetMensuel("carburant", parseFloat(e.target.value) || 0)
              }
              placeholder="Ex: 200"
            />
          </div>

          <div>
            <Label htmlFor="loisirs">Loisirs & culture (€/mois)</Label>
            <Input
              id="loisirs"
              type="number"
              min="0"
              step="50"
              value={data.budgetMensuel?.loisirs ?? ""}
              onChange={(e) =>
                updateBudgetMensuel("loisirs", parseFloat(e.target.value) || 0)
              }
              placeholder="Ex: 100"
            />
          </div>
        </div>
      )}

      {/* Mode détaillé */}
      {data.mode === "detaille" && (
        <div className="space-y-4">
          <Label>Dépenses annuelles par catégorie</Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alimentation_55">Alimentation de base (TVA 5.5%)</Label>
              <Input
                id="alimentation_55"
                type="number"
                min="0"
                step="100"
                value={data.detailCategories?.alimentation_tva_55 ?? ""}
                onChange={(e) =>
                  updateDetailCategorie("alimentation_tva_55", parseFloat(e.target.value) || 0)
                }
                placeholder="Ex: 3000"
              />
            </div>

            <div>
              <Label htmlFor="alimentation_20">Alimentation non-base (TVA 20%)</Label>
              <Input
                id="alimentation_20"
                type="number"
                min="0"
                step="100"
                value={data.detailCategories?.alimentation_tva_20 ?? ""}
                onChange={(e) =>
                  updateDetailCategorie("alimentation_tva_20", parseFloat(e.target.value) || 0)
                }
                placeholder="Ex: 1500"
              />
            </div>

            <div>
              <Label htmlFor="restaurants_detail">Restaurants (TVA 10%)</Label>
              <Input
                id="restaurants_detail"
                type="number"
                min="0"
                step="100"
                value={data.detailCategories?.restaurants ?? ""}
                onChange={(e) =>
                  updateDetailCategorie("restaurants", parseFloat(e.target.value) || 0)
                }
                placeholder="Ex: 1800"
              />
            </div>

            <div>
              <Label htmlFor="transport_detail">Transport (TVA 20%)</Label>
              <Input
                id="transport_detail"
                type="number"
                min="0"
                step="100"
                value={data.detailCategories?.transport ?? ""}
                onChange={(e) =>
                  updateDetailCategorie("transport", parseFloat(e.target.value) || 0)
                }
                placeholder="Ex: 2400"
              />
            </div>

            <div>
              <Label htmlFor="logement_detail">Logement & énergie (TVA 5.5-20%)</Label>
              <Input
                id="logement_detail"
                type="number"
                min="0"
                step="100"
                value={data.detailCategories?.logement ?? ""}
                onChange={(e) =>
                  updateDetailCategorie("logement", parseFloat(e.target.value) || 0)
                }
                placeholder="Ex: 6000"
              />
            </div>

            <div>
              <Label htmlFor="sante_detail">Santé (TVA 2.1%)</Label>
              <Input
                id="sante_detail"
                type="number"
                min="0"
                step="100"
                value={data.detailCategories?.sante ?? ""}
                onChange={(e) =>
                  updateDetailCategorie("sante", parseFloat(e.target.value) || 0)
                }
                placeholder="Ex: 800"
              />
            </div>

            <div>
              <Label htmlFor="loisirs_detail">Loisirs & culture (TVA 5.5-20%)</Label>
              <Input
                id="loisirs_detail"
                type="number"
                min="0"
                step="100"
                value={data.detailCategories?.loisirs ?? ""}
                onChange={(e) =>
                  updateDetailCategorie("loisirs", parseFloat(e.target.value) || 0)
                }
                placeholder="Ex: 1200"
              />
            </div>

            <div>
              <Label htmlFor="equipement_detail">Équipement maison (TVA 20%)</Label>
              <Input
                id="equipement_detail"
                type="number"
                min="0"
                step="100"
                value={data.detailCategories?.equipement ?? ""}
                onChange={(e) =>
                  updateDetailCategorie("equipement", parseFloat(e.target.value) || 0)
                }
                placeholder="Ex: 2000"
              />
            </div>
          </div>
        </div>
      )}

      {/* Alcool & Tabac (optionnel) */}
      <div className="border-t pt-6">
        <Label>Alcool & Tabac (optionnel, pour accises)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <div>
            <Label htmlFor="alcool">Dépenses alcool annuelles (€)</Label>
            <Input
              id="alcool"
              type="number"
              min="0"
              step="50"
              value={data.alcoolTabac?.alcool ?? ""}
              onChange={(e) => updateAlcoolTabac("alcool", parseFloat(e.target.value) || 0)}
              placeholder="Ex: 600"
            />
          </div>

          <div>
            <Label htmlFor="tabac">Dépenses tabac annuelles (€)</Label>
            <Input
              id="tabac"
              type="number"
              min="0"
              step="50"
              value={data.alcoolTabac?.tabac ?? ""}
              onChange={(e) => updateAlcoolTabac("tabac", parseFloat(e.target.value) || 0)}
              placeholder="Ex: 1200"
            />
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-900">
          💡 <strong>Astuce :</strong> Plus votre estimation est précise, plus votre score de TVA
          sera juste. Vous pourrez utiliser le journal fiscal pour affiner vos dépenses réelles.
        </p>
      </div>
    </div>
  );
}
