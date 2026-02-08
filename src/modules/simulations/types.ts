import type { ScoreFiscal } from "@/modules/score/types";
import type { ProfilFiscalData } from "@/modules/profil/types";

/**
 * Type de scénario de simulation
 */
export type ScenarioType =
  | "new_child"
  | "job_change"
  | "relocation"
  | "retirement"
  | "salary_change"
  | "custom";

/**
 * Données d'entrée pour une simulation
 */
export interface SimulationInput {
  scenarioType: ScenarioType;
  label?: string; // Label personnalisé pour la simulation
  modifications: Partial<ProfilFiscalData>; // Modifications à appliquer au profil
  metadata?: Record<string, any>; // Métadonnées supplémentaires (ex: pourcentage d'augmentation)
}

/**
 * Résultat d'une simulation
 */
export interface SimulationResult {
  id: string;
  userId: string;
  scenarioType: ScenarioType;
  label: string;
  createdAt: Date;

  // Profil de référence (avant)
  baseProfile: ProfilFiscalData;
  baseScore: ScoreFiscal;

  // Profil simulé (après)
  simulatedProfile: ProfilFiscalData;
  simulatedScore: ScoreFiscal;

  // Delta (différences)
  delta: SimulationDelta;

  // Métadonnées
  metadata?: Record<string, any>;
}

/**
 * Delta entre deux scores fiscaux
 */
export interface SimulationDelta {
  totalPaye: DeltaValue;
  totalRecu: DeltaValue;
  soldeNet: DeltaValue;
  ratio: DeltaValue;

  // Détails des changements
  detailPaye: {
    impotRevenu: DeltaValue;
    csg_crds: DeltaValue;
    cotisationsSalariales: DeltaValue;
    cotisationsPatronales: DeltaValue;
    tva: DeltaValue;
    ticpe: DeltaValue;
    taxeFonciere: DeltaValue;
    ifi: DeltaValue;
    autresTaxes: DeltaValue;
  };

  detailRecu: {
    transfertsDirects: DeltaValue;
    servicesMutualises: DeltaValue;
  };
}

/**
 * Valeur avec delta
 */
export interface DeltaValue {
  before: number;
  after: number;
  delta: number;
  percentChange: number;
}

/**
 * Template de scénario pré-configuré
 */
export interface ScenarioTemplate {
  type: ScenarioType;
  name: string;
  description: string;
  icon: string;
  category: "family" | "work" | "location" | "lifestyle";

  // Fonction pour générer les modifications
  generateModifications: (
    baseProfile: ProfilFiscalData,
    params?: Record<string, any>
  ) => Partial<ProfilFiscalData>;

  // Paramètres configurables (optionnel)
  configurableParams?: {
    name: string;
    type: "number" | "text" | "select";
    label: string;
    defaultValue?: any;
    options?: { value: any; label: string }[];
    min?: number;
    max?: number;
    step?: number;
  }[];
}

/**
 * Données stockées en base pour une simulation
 */
export interface SimulationData {
  id: string;
  userId: string;
  scenarioType: string;
  label: string;
  inputData: any; // JSON
  outputScore: any; // JSON - ScoreFiscal
  createdAt: Date;
}
