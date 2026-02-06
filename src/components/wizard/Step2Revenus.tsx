import { Revenus } from "@/modules/profil/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step2RevenusProps {
  data: Revenus;
  onChange: (data: Revenus) => void;
}

export function Step2Revenus({ data, onChange }: Step2RevenusProps) {
  const updateField = <K extends keyof Revenus>(field: K, value: Revenus[K]) => {
    onChange({ ...data, [field]: value });
  };

  // Auto-estimate salaire net from brut (approximately 78%)
  const handleSalaireBrutChange = (brut: number | null) => {
    if (brut && !data.salaireNet) {
      const estimatedNet = Math.round(brut * 0.78);
      onChange({ ...data, salaireBrut: brut, salaireNet: estimatedNet });
    } else {
      updateField("salaireBrut", brut);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Étape 2 : Revenus</h2>
        <p className="text-gray-600">
          Vos revenus nous permettent de calculer avec précision vos impôts et cotisations.
        </p>
      </div>

      <div className="space-y-4">
        {/* Type de contrat */}
        <div>
          <Label htmlFor="typeContrat">Type de contrat *</Label>
          <Select
            value={data.typeContrat || undefined}
            onValueChange={(value) =>
              updateField("typeContrat", value as Revenus["typeContrat"])
            }
          >
            <SelectTrigger id="typeContrat">
              <SelectValue placeholder="Sélectionnez votre type de contrat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CDI">CDI</SelectItem>
              <SelectItem value="CDD">CDD</SelectItem>
              <SelectItem value="fonctionnaire">Fonctionnaire</SelectItem>
              <SelectItem value="independant">Indépendant</SelectItem>
              <SelectItem value="auto_entrepreneur">Auto-entrepreneur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Salaire brut annuel */}
        <div>
          <Label htmlFor="salaireBrut">Salaire brut annuel (€) *</Label>
          <Input
            id="salaireBrut"
            type="number"
            min="0"
            step="1000"
            value={data.salaireBrut ?? ""}
            onChange={(e) => handleSalaireBrutChange(parseFloat(e.target.value) || null)}
            placeholder="Ex: 45000"
          />
          <p className="text-sm text-gray-500 mt-1">
            Le salaire brut est essentiel pour calculer vos cotisations patronales (invisible sur
            votre fiche de paie mais qui font partie du coût du travail).
          </p>
        </div>

        {/* Salaire net imposable */}
        <div>
          <Label htmlFor="salaireNet">Salaire net imposable annuel (€) *</Label>
          <Input
            id="salaireNet"
            type="number"
            min="0"
            step="1000"
            value={data.salaireNet ?? ""}
            onChange={(e) => updateField("salaireNet", parseFloat(e.target.value) || null)}
            placeholder="Ex: 35000"
          />
          <p className="text-sm text-gray-500 mt-1">
            Visible sur votre avis d'imposition. Estimé automatiquement à 78% du brut si non renseigné.
          </p>
        </div>

        {/* Revenus fonciers */}
        <div>
          <Label htmlFor="revenusFonciers">Revenus fonciers annuels (€)</Label>
          <Input
            id="revenusFonciers"
            type="number"
            min="0"
            step="1000"
            value={data.revenusFonciers ?? ""}
            onChange={(e) => updateField("revenusFonciers", parseFloat(e.target.value) || null)}
            placeholder="Ex: 12000"
          />
          <p className="text-sm text-gray-500 mt-1">
            Loyers perçus si vous êtes propriétaire bailleur.
          </p>
        </div>

        {/* Revenus de capitaux */}
        <div>
          <Label htmlFor="revenusCapitaux">Revenus de capitaux annuels (€)</Label>
          <Input
            id="revenusCapitaux"
            type="number"
            min="0"
            step="1000"
            value={data.revenusCapitaux ?? ""}
            onChange={(e) => updateField("revenusCapitaux", parseFloat(e.target.value) || null)}
            placeholder="Ex: 3000"
          />
          <p className="text-sm text-gray-500 mt-1">
            Dividendes, intérêts, plus-values mobilières.
          </p>
        </div>

        {/* Autres revenus */}
        <div>
          <Label htmlFor="autresRevenus">Autres revenus annuels (€)</Label>
          <Input
            id="autresRevenus"
            type="number"
            min="0"
            step="1000"
            value={data.autresRevenus ?? ""}
            onChange={(e) => updateField("autresRevenus", parseFloat(e.target.value) || null)}
            placeholder="Ex: 5000"
          />
          <p className="text-sm text-gray-500 mt-1">
            Pensions alimentaires, rentes, revenus exceptionnels.
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          🟢 <strong>Donnée vérifiée :</strong> Uploadez votre bulletin de paie ou votre avis
          d'imposition pour passer en mode "vérifié" et améliorer votre score de confiance.
        </p>
      </div>
    </div>
  );
}
