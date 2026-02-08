import type { ProfilFiscalData, Enfant } from "@/modules/profil/types";
import type { ScenarioTemplate } from "./types";

/**
 * Template: Nouveau-né / Enfant supplémentaire
 */
export const newChildScenario: ScenarioTemplate = {
  type: "new_child",
  name: "Nouveau-né",
  description: "Simulez l'impact fiscal d'un enfant supplémentaire",
  icon: "👶",
  category: "family",

  generateModifications: (baseProfile: ProfilFiscalData, params?: Record<string, any>) => {
    const newChild: Enfant = {
      age: 0,
      niveauScolaire: "maternelle",
    };

    const updatedEnfants = [...(baseProfile.familleServices?.enfants || []), newChild];

    // Calcul des parts fiscales avec le nouvel enfant
    let newNombreParts = baseProfile.situation?.nombreParts || 1;
    const nbEnfants = updatedEnfants.length;

    const statut = baseProfile.situation?.statut;
    if (statut === "marie_pacse") {
      if (nbEnfants === 1) newNombreParts = 2.5;
      else if (nbEnfants === 2) newNombreParts = 3;
      else newNombreParts = 3 + (nbEnfants - 2);
    } else {
      // Célibataire, divorcé, veuf
      if (nbEnfants === 1) newNombreParts = 1.5;
      else if (nbEnfants === 2) newNombreParts = 2;
      else newNombreParts = 2 + (nbEnfants - 2);
    }

    return {
      familleServices: {
        enfants: updatedEnfants,
        nombreEnfants: updatedEnfants.length,
      },
      situation: {
        nombreParts: newNombreParts,
      },
    } as Partial<ProfilFiscalData>;
  },
};

/**
 * Template: Changement de métier / salaire
 */
export const jobChangeScenario: ScenarioTemplate = {
  type: "job_change",
  name: "Changement de métier",
  description: "Simulez un nouveau salaire et type de contrat",
  icon: "💼",
  category: "work",

  configurableParams: [
    {
      name: "newSalaireBrut",
      type: "number",
      label: "Nouveau salaire brut annuel (€)",
      defaultValue: 35000,
      min: 0,
      max: 200000,
      step: 1000,
    },
    {
      name: "newTypeContrat",
      type: "select",
      label: "Type de contrat",
      defaultValue: "cdi",
      options: [
        { value: "cdi", label: "CDI" },
        { value: "cdd", label: "CDD" },
        { value: "fonctionnaire", label: "Fonctionnaire" },
        { value: "independant", label: "Indépendant" },
        { value: "auto_entrepreneur", label: "Auto-entrepreneur" },
      ],
    },
    {
      name: "newJobTitle",
      type: "text",
      label: "Intitulé du poste (optionnel)",
    },
  ],

  generateModifications: (baseProfile: ProfilFiscalData, params?: Record<string, any>) => {
    const newSalaireBrut = params?.newSalaireBrut || 35000;
    const newTypeContrat = params?.newTypeContrat || "cdi";

    // Estimation du salaire net (environ 78% du brut pour un salarié)
    const newSalaireNet = Math.round(newSalaireBrut * 0.78);

    return {
      revenus: {
        salaireBrut: newSalaireBrut,
        salaireNet: newSalaireNet,
        typeContrat: newTypeContrat as any,
      },
    } as Partial<ProfilFiscalData>;
  },
};

/**
 * Template: Déménagement
 */
export const relocationScenario: ScenarioTemplate = {
  type: "relocation",
  name: "Déménagement",
  description: "Simulez un changement de commune (impact sur taxe foncière et services locaux)",
  icon: "🏘️",
  category: "location",

  configurableParams: [
    {
      name: "newCommune",
      type: "text",
      label: "Nouvelle commune",
      defaultValue: "",
    },
    {
      name: "newProprietaire",
      type: "select",
      label: "Statut",
      defaultValue: "false",
      options: [
        { value: "true", label: "Propriétaire" },
        { value: "false", label: "Locataire" },
      ],
    },
    {
      name: "newTaxeFonciere",
      type: "number",
      label: "Taxe foncière annuelle (€) si propriétaire",
      defaultValue: 1200,
      min: 0,
      max: 10000,
      step: 100,
    },
  ],

  generateModifications: (baseProfile: ProfilFiscalData, params?: Record<string, any>) => {
    const newCommune = params?.newCommune || "Paris";
    const newProprietaire = params?.newProprietaire === "true";
    const newTaxeFonciere = newProprietaire ? (params?.newTaxeFonciere || 1200) : 0;

    return {
      situation: {
        commune: newCommune,
      },
      patrimoine: {
        proprietaire: newProprietaire,
        taxeFonciere: newTaxeFonciere,
      },
    } as Partial<ProfilFiscalData>;
  },
};

/**
 * Template: Départ à la retraite
 */
export const retirementScenario: ScenarioTemplate = {
  type: "retirement",
  name: "Départ à la retraite",
  description: "Simulez votre situation à la retraite",
  icon: "🏖️",
  category: "lifestyle",

  configurableParams: [
    {
      name: "pensionRate",
      type: "number",
      label: "Taux de remplacement (% du dernier salaire net)",
      defaultValue: 70,
      min: 30,
      max: 100,
      step: 5,
    },
  ],

  generateModifications: (baseProfile: ProfilFiscalData, params?: Record<string, any>) => {
    const pensionRate = (params?.pensionRate || 70) / 100;

    // Calcul de la pension basée sur le dernier salaire net
    const pension = Math.round((baseProfile.revenus?.salaireNet || 0) * pensionRate);

    return {
      revenus: {
        salaireBrut: 0,
        salaireNet: 0,
        typeContrat: null,
        autresRevenus: pension, // Pension de retraite dans "autres revenus"
      },
    } as Partial<ProfilFiscalData>;
  },
};

/**
 * Template: Changement de salaire (augmentation/diminution)
 */
export const salaryChangeScenario: ScenarioTemplate = {
  type: "salary_change",
  name: "Changement de salaire",
  description: "Simulez une augmentation ou diminution de salaire",
  icon: "💰",
  category: "work",

  configurableParams: [
    {
      name: "percentChange",
      type: "number",
      label: "Variation de salaire (%)",
      defaultValue: 10,
      min: -50,
      max: 100,
      step: 5,
    },
  ],

  generateModifications: (baseProfile: ProfilFiscalData, params?: Record<string, any>) => {
    const percentChange = params?.percentChange || 10;
    const multiplier = 1 + percentChange / 100;

    const newSalaireBrut = Math.round((baseProfile.revenus?.salaireBrut || 0) * multiplier);
    const newSalaireNet = Math.round((baseProfile.revenus?.salaireNet || 0) * multiplier);

    return {
      revenus: {
        salaireBrut: newSalaireBrut,
        salaireNet: newSalaireNet,
      },
    } as Partial<ProfilFiscalData>;
  },
};

/**
 * Liste de tous les templates de scénarios
 */
export const scenarioTemplates: ScenarioTemplate[] = [
  newChildScenario,
  jobChangeScenario,
  relocationScenario,
  retirementScenario,
  salaryChangeScenario,
];

/**
 * Récupère un template par type
 */
export function getScenarioTemplate(type: string): ScenarioTemplate | undefined {
  return scenarioTemplates.find((t) => t.type === type);
}
