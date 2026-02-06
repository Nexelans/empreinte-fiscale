// Types pour le module Score Fiscal

export interface DetailPaye {
  impotRevenu: number;
  csg_crds: number;
  cotisationsSalariales: number;
  cotisationsPatronales: number;
  tva: number;
  ticpe: number;
  taxeFonciere: number;
  ifi: number;
  autresTaxes: number;
}

export interface TransfertsDirects {
  allocations: number;
  apl: number;
  remboursementsSante: number;
  autres: number;
}

export interface ServicesMutualises {
  education: number;
  sante: number;
  securite: number;
  infrastructure: number;
  culture: number;
  administration: number;
  chargesDette: number;
}

export interface DetailRecu {
  transfertsDirects: TransfertsDirects;
  servicesMutualises: ServicesMutualises;
}

export interface Source {
  categorie: string;
  cle: string;
  source: string;
  urlSource: string;
}

export interface ScoreFiscal {
  annee: number;
  millesime: string;

  totalPaye: number;
  detailPaye: DetailPaye;

  totalRecu: number;
  detailRecu: DetailRecu;

  soldeNet: number; // totalPaye - totalRecu
  ratio: number; // totalPaye / totalRecu
  scoreConfiance: number;

  metadata: {
    sourcesUtilisees: Source[];
    hypotheses: string[];
    margeErreurEstimee: number;
  };
}
