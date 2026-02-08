/**
 * Animated Fiscal Day - Type Definitions
 * Defines the structure for animated scenes showing a typical day with taxes revealed
 */

export type SceneType =
  | "coffee"
  | "commute"
  | "lunch"
  | "work"
  | "shopping"
  | "summary";

export interface AnimationConfig {
  duration: number; // Scene duration in seconds
  theme: "moderne" | "vintage" | "minimaliste" | "colore";
  speed: number; // Playback speed multiplier (0.5, 1, 1.5)
  enableMusic: boolean;
  autoPlay: boolean;
}

export interface TaxDetail {
  type: string; // "TVA 20%", "TICPE", "CSG", etc.
  amount: number;
  label: string;
  color: string;
  icon?: string;
}

export interface Scene {
  id: string;
  type: SceneType;
  title: string;
  description: string;
  time: string; // "08:00", "12:30", etc.
  emoji: string;
  duration: number; // Default duration in seconds
  totalSpent?: number; // Total amount spent in this scene
  taxes: TaxDetail[];
  servicesReceived?: ServiceDetail[];
  backgroundImage?: string;
  animation: SceneAnimation;
}

export interface ServiceDetail {
  type: string; // "Éducation", "Santé", "Sécurité", etc.
  label: string;
  value: number;
  color: string;
  icon?: string;
}

export interface SceneAnimation {
  entrance: "fade" | "slide" | "zoom" | "bounce";
  exit: "fade" | "slide" | "zoom";
  stagger: number; // Delay between revealing each tax (in ms)
  highlightTaxes: boolean; // Whether to highlight taxes as they appear
}

export interface FiscalDayData {
  userId: string;
  date: string; // YYYY-MM-DD
  dataSource: "real" | "estimated";
  scenes: Scene[];
  summary: DaySummary;
  userProfile: {
    hasCar: boolean;
    hasChildren: boolean;
    isWorking: boolean;
    eatsOut: boolean;
  };
}

export interface DaySummary {
  totalSpent: number;
  totalTaxes: number;
  totalServicesReceived: number;
  netContribution: number;
  taxBreakdown: Record<string, number>; // "TVA": 12.50, "TICPE": 8.20, etc.
  servicesBreakdown: Record<string, number>; // "Éducation": 15.40, etc.
}

export interface AnimationExportOptions {
  format: "png" | "webm" | "mp4";
  quality: "low" | "medium" | "high";
  dimensions: {
    width: number;
    height: number;
  };
  fps?: number; // For video formats
}

export interface ShareableAnimationLink {
  id: string;
  url: string;
  expiresAt: Date;
  isAnonymous: boolean;
  viewCount: number;
}
