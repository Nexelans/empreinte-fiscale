/**
 * Types pour l'automation du Référentiel
 * Phase 4 - Referentiel Automation
 *
 * Définit les sources de données et les enregistrements de mises à jour
 */

/**
 * Type de source de données
 */
export enum DataSourceType {
  API = 'api',
  RSS = 'rss',
  CSV = 'csv',
  JSON = 'json',
  MANUAL = 'manual',
}

/**
 * Statut d'une source de données
 */
export enum DataSourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
}

/**
 * Configuration d'une source de données
 */
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  url: string;
  status: DataSourceStatus;
  pollIntervalHours: number;
  lastPollAt?: Date;
  lastSuccessAt?: Date;
  lastErrorAt?: Date;
  lastError?: string;
  uptime: number; // Pourcentage de disponibilité
  credentials?: {
    apiKey?: string;
    username?: string;
    password?: string;
  };
  config: Record<string, any>; // Configuration spécifique à la source
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Statut d'une mise à jour du Référentiel
 */
export enum UpdateStatus {
  DETECTED = 'detected',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  APPLIED = 'applied',
}

/**
 * Enregistrement d'une mise à jour détectée
 */
export interface UpdateRecord {
  id: string;
  sourceId: string;
  millesime: string;
  categorie: string;
  cle: string;
  oldValue: any;
  newValue: any;
  source: string; // URL ou nom de la source officielle
  status: UpdateStatus;
  detectedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  appliedAt?: Date;
  rejectionReason?: string;
  confidence: number; // 0-1, confiance dans l'extraction
  metadata: {
    sourceType: DataSourceType;
    extractionMethod: string;
    rawData?: any;
    validationErrors?: string[];
  };
}

/**
 * Résultat d'une extraction de données
 */
export interface ExtractionResult {
  success: boolean;
  data: Array<{
    millesime: string;
    categorie: string;
    cle: string;
    valeur: any;
    unite: string;
    source: string;
    urlSource: string;
    datePublication: Date;
    notes?: string;
  }>;
  errors: string[];
  warnings: string[];
  metadata: {
    extractedAt: Date;
    sourceUrl: string;
    recordCount: number;
    method: string;
  };
}

/**
 * Schéma de validation pour une catégorie de données
 */
export interface ValidationSchema {
  categorie: string;
  requiredFields: string[];
  fieldTypes: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>;
  fieldRanges?: Record<string, { min?: number; max?: number }>;
  customValidators?: Record<string, (value: any) => boolean>;
}

/**
 * Configuration d'un extracteur
 */
export interface ExtractorConfig {
  sourceType: DataSourceType;
  categorie: string;
  parser: (data: any) => ExtractionResult;
  validator: ValidationSchema;
  transformer?: (data: any) => any;
}

/**
 * Statistiques de santé d'une source
 */
export interface SourceHealth {
  sourceId: string;
  sourceName: string;
  status: DataSourceStatus;
  uptime: number;
  lastPollAt?: Date;
  lastSuccessAt?: Date;
  lastErrorAt?: Date;
  lastError?: string;
  successRate: number; // Sur les 30 derniers jours
  averageLatency: number; // ms
  totalUpdatesDetected: number;
  pendingReviews: number;
}

/**
 * Résultat d'un poll
 */
export interface PollResult {
  sourceId: string;
  success: boolean;
  updatesDetected: number;
  errors: string[];
  latency: number;
  timestamp: Date;
}
