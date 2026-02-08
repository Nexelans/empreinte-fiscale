/**
 * Types pour le bilan annuel "Wrapped"
 * Phase 4 - Module Wrapped
 */

export enum WrappedTheme {
  CLASSIC = 'classic',
  VIBRANT = 'vibrant',
  MINIMALIST = 'minimalist',
  FISCAL = 'fiscal',
}

export enum WrappedSceneType {
  INTRO = 'intro',
  TOTAL_PAYE = 'total_paye',
  TOTAL_RECU = 'total_recu',
  SOLDE_NET = 'solde_net',
  MONTHLY_BREAKDOWN = 'monthly_breakdown',
  TOP_INSIGHT = 'top_insight',
  EVOLUTION = 'evolution',
  OUTRO = 'outro',
}

export interface WrappedScene {
  type: WrappedSceneType;
  title: string;
  subtitle?: string;
  data: any;
  order: number;
}

export interface WrappedData {
  year: number;
  userId: string;
  userName: string;

  // Données fiscales annuelles
  totalPaye: number;
  totalRecu: number;
  soldeNet: number;
  ratio: number;
  scoreConfiance: number;

  // Breakdown mensuel
  monthlyData: {
    month: number;
    soldeNet: number;
    totalPaye: number;
    totalRecu: number;
  }[];

  // Top insights
  topInsights: {
    label: string;
    value: string;
    icon?: string;
  }[];

  // Évolution par rapport à l'année précédente
  evolution?: {
    totalPayeDelta: number;
    totalRecuDelta: number;
    soldeNetDelta: number;
    ratioDelta: number;
  };

  // Comparaisons (anonymisées)
  nationalPercentile?: number;
  friendsRank?: number;
  friendsTotal?: number;

  // Métadonnées
  theme: WrappedTheme;
  scenes: WrappedScene[];
  generatedAt: Date;
}

export interface WrappedExportOptions {
  format: 'png' | 'mp4';
  theme: WrappedTheme;
  resolution: 'instagram-story' | 'square' | 'landscape';
}

export interface WrappedShareLink {
  id: string;
  userId: string;
  year: number;
  token: string;
  expiresAt: Date;
  viewCount: number;
  createdAt: Date;
}
