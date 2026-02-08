// Types pour le module Profil Fiscal

export type DataStatus = "VERIFIE" | "DECLARE" | "ESTIME";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

// Étape 1: Situation personnelle
export interface SituationPersonnelle {
  statut: "celibataire" | "marie_pacse" | "divorce" | "veuf" | null;
  nombreParts: number | null;
  commune: string | null;
  age: number | null;
}

// Étape 2: Revenus
export interface Revenus {
  salaireBrut: number | null;
  salaireNet: number | null;
  typeContrat: "CDI" | "CDD" | "fonctionnaire" | "independant" | "auto_entrepreneur" | null;
  revenusFonciers: number | null;
  revenusCapitaux: number | null;
  autresRevenus: number | null;
}

// Étape 3: Patrimoine
export interface Vehicule {
  type: "thermique" | "diesel" | "hybride" | "electrique";
  kmAnnuels: number;
}

export interface Patrimoine {
  proprietaire: boolean | null;
  valeurLocative: number | null;
  taxeFonciere: number | null;
  vehicules: Vehicule[];
  patrimoineIFI: number | null;
}

// Étape 4: Consommation
export type ModeConsommation = "profil_type" | "estimation_rapide" | "detaille";

export interface BudgetMensuel {
  courses: number;
  restaurants: number;
  carburant: number;
  loisirs: number;
}

export interface ConsommationDetaillee {
  alimentation_tva_55: number;
  alimentation_tva_20: number;
  restaurants: number;
  transport: number;
  logement: number;
  sante: number;
  loisirs: number;
  equipement: number;
  autres: number;
}

export interface Consommation {
  mode: ModeConsommation | null;
  profilType?: "sobre" | "moyen" | "eleve";
  budgetMensuel?: BudgetMensuel;
  detailCategories?: ConsommationDetaillee;
  alcoolTabac?: {
    alcool: number;
    tabac: number;
  };
}

// Étape 5: Famille & Services
export interface Enfant {
  age: number;
  niveauScolaire:
    | "maternelle"
    | "primaire"
    | "college"
    | "lycee_general"
    | "lycee_professionnel"
    | "superieur_public"
    | "superieur_prive";
}

export interface FrequenceServices {
  transportsCommun: "jamais" | "occasionnelle" | "hebdomadaire" | "quotidienne";
  hopitalMedecin: "jamais" | "annuelle" | "mensuelle" | "hebdomadaire";
  bibliotheque: "jamais" | "occasionnelle" | "mensuelle";
  equipementsSportifs: "jamais" | "occasionnelle" | "hebdomadaire";
}

export interface Aides {
  caf: boolean;
  montantCAF?: number;
  apl: boolean;
  montantAPL?: number;
  rsa: boolean;
  montantRSA?: number;
  bourses: boolean;
  montantBourses?: number;
  chomage: boolean;
  montantChomage?: number;
  cmuc: boolean;
}

export interface FamilleServices {
  nombreEnfants: number;
  enfants: Enfant[];
  frequenceServices: FrequenceServices;
  aides: Aides;
}

// Profil fiscal complet
export interface ProfilFiscalComplete {
  id: string;
  userId: string;

  // Progression
  wizardStep: WizardStep;
  isComplete: boolean;
  lastCompletedAt: Date | null;

  // Données des 5 étapes
  situation: SituationPersonnelle;
  revenus: Revenus;
  patrimoine: Patrimoine;
  consommation: Consommation;
  familleServices: FamilleServices;

  // Statut des données
  statusData: Record<string, DataStatus>;

  createdAt: Date;
  updatedAt: Date;
}

// Type alias for backwards compatibility
export type ProfilFiscalData = Partial<ProfilFiscalComplete>;

// Poids des données pour le score de confiance
export const DATA_WEIGHTS: Record<string, number> = {
  salaireBrut: 10,
  salaireNet: 10,
  revenusFonciers: 8,
  revenusCapitaux: 8,
  patrimoineIFI: 8,
  taxeFonciere: 6,
  nombreEnfants: 6,
  consommationDetaillee: 8,
  budgetMensuel: 6,
  vehicules: 4,
  aides: 5,
  frequenceServices: 2,
  alcoolTabac: 3,
};

// Coefficients de statut pour le score de confiance
export const STATUS_COEFFICIENTS: Record<DataStatus, number> = {
  VERIFIE: 1.0,
  DECLARE: 0.7,
  ESTIME: 0.3,
};
