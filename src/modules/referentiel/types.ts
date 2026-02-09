// Types pour le module Référentiel

export interface ReferentielEntry<T = unknown> {
  id: string;
  millesime: string;
  categorie: string;
  cle: string;
  valeur: T;
  unite?: string;
  source: string;
  urlSource: string;
  datePublication: Date;
  dateIntegration: Date;
  statut: "OFFICIEL" | "PROVISOIRE" | "ESTIME";
  notes?: string;
}

export interface TrancheIR {
  min: number;
  max: number;
  taux: number;
}

export interface DecoteIR {
  montantMaxCelibataire: number;
  montantMaxCouple: number;
  seuilCelibataire: number;
  seuilCouple: number;
  coefficient: number;
}

export interface PlafondQuotientFamilial {
  parDemiPart: number;
  premieresDemiParts: number;
}

export interface TauxCotisation {
  maladie?: number;
  vieillesse_plafonnee?: number;
  vieillesse_deplafonnee?: number;
  chomage?: number;
  retraite_complementaire_tranche1?: number;
  retraite_complementaire_tranche2?: number;
  csg_crds?: number;
  maladie_maternite?: number;
  allocations_familiales?: number;
  accidents_travail?: number;
  agff?: number;
  fnal?: number;
  contribution_solidarite?: number;
}

export interface ParametresRGDU {
  coefficientMaximal: number;
  seuilMin: number;
  seuilMax: number;
  smicAnnuel: number;
}

export interface ConsommationMoyenne {
  total_annuel: number;
  alimentation: number;
  logement: number;
  transport: number;
  loisirs: number;
  autres: number;
}

export interface ConsommationVehicule {
  essence: number;
  diesel: number;
  hybride: number;
  electrique: number;
}

export type NiveauScolaire =
  | "maternelle"
  | "primaire"
  | "college"
  | "lycee_general"
  | "lycee_professionnel"
  | "superieur_public";

export type FonctionBudgetaire =
  | "defense"
  | "education"
  | "enseignement_superieur"
  | "sante"
  | "justice"
  | "police"
  | "infrastructure"
  | "culture"
  | "administration"
  | "charge_dette";

export interface StatINSEE {
  indicateur: string;
  valeur: unknown;
  unite: string;
  source: string;
  datePublication: Date;
}

// Type pour les erreurs du Référentiel
export class ReferentielError extends Error {
  constructor(
    message: string,
    public millesime: string,
    public categorie: string,
    public cle: string
  ) {
    super(message);
    this.name = "ReferentielError";
  }
}
