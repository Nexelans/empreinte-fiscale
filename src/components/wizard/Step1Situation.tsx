import { SituationPersonnelle } from "@/modules/profil/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step1SituationProps {
  data: SituationPersonnelle;
  onChange: (data: SituationPersonnelle) => void;
}

export function Step1Situation({ data, onChange }: Step1SituationProps) {
  const updateField = <K extends keyof SituationPersonnelle>(
    field: K,
    value: SituationPersonnelle[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  // Auto-calculate nombre de parts based on statut
  const handleStatutChange = (statut: SituationPersonnelle["statut"]) => {
    let defaultParts = 1;
    if (statut === "marie_pacse") {
      defaultParts = 2;
    } else if (statut === "divorce" || statut === "veuf" || statut === "celibataire") {
      defaultParts = 1;
    }
    onChange({ ...data, statut, nombreParts: defaultParts });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Étape 1 : Situation personnelle
        </h2>
        <p className="text-gray-600">
          Ces informations nous permettent de calculer votre quotient familial et vos droits.
        </p>
      </div>

      <div className="space-y-4">
        {/* Statut */}
        <div>
          <Label htmlFor="statut">Statut *</Label>
          <Select
            value={data.statut || undefined}
            onValueChange={(value) => handleStatutChange(value as any)}
          >
            <SelectTrigger id="statut">
              <SelectValue placeholder="Sélectionnez votre statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="celibataire">Célibataire</SelectItem>
              <SelectItem value="marie_pacse">Marié(e) / Pacsé(e)</SelectItem>
              <SelectItem value="divorce">Divorcé(e)</SelectItem>
              <SelectItem value="veuf">Veuf(ve)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nombre de parts */}
        <div>
          <Label htmlFor="nombreParts">Nombre de parts fiscales *</Label>
          <Input
            id="nombreParts"
            type="number"
            step="0.5"
            min="1"
            max="10"
            value={data.nombreParts ?? ""}
            onChange={(e) => updateField("nombreParts", parseFloat(e.target.value) || null)}
            placeholder="Ex: 1, 1.5, 2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Calculé automatiquement selon votre statut. Ajustez si vous avez des enfants (0.5 part
            par enfant pour les 2 premiers, 1 part à partir du 3ème).
          </p>
        </div>

        {/* Commune */}
        <div>
          <Label htmlFor="commune">Commune de résidence *</Label>
          <Input
            id="commune"
            type="text"
            value={data.commune ?? ""}
            onChange={(e) => updateField("commune", e.target.value || null)}
            placeholder="Ex: Paris, Lyon, Marseille"
          />
          <p className="text-sm text-gray-500 mt-1">
            Utilisé pour estimer vos services publics locaux et votre taxe foncière si applicable.
          </p>
        </div>

        {/* Âge */}
        <div>
          <Label htmlFor="age">Âge *</Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="120"
            value={data.age ?? ""}
            onChange={(e) => updateField("age", parseInt(e.target.value) || null)}
            placeholder="Ex: 35"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Astuce :</strong> Toutes les données saisies sont sauvegardées automatiquement.
          Vous pouvez quitter et revenir à tout moment.
        </p>
      </div>
    </div>
  );
}
