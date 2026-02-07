import { SpendingCategory } from "../tickets/types";

/**
 * Status of data source for journal entry
 */
export type DataStatus = "VERIFIE" | "DECLARE" | "ESTIME";

/**
 * Tax breakdown for a journal entry
 */
export interface TaxBreakdown {
  tva: number; // TVA amount
  tauxTVA: number; // TVA rate as percentage (20, 10, 5.5, 2.1)
  ticpe?: number; // TICPE for fuel
  autresTaxes?: number; // Other indirect taxes
}

/**
 * Journal entry data (what gets stored in the database)
 */
export interface JournalEntryData {
  id?: string;
  userId: string;
  date: Date;

  // Transaction info
  enseigne?: string;
  category: SpendingCategory;
  montantTTC: number; // Total amount paid
  montantHT?: number; // Amount before tax

  // Tax calculation
  taxBreakdown: TaxBreakdown;

  // Metadata
  status: DataStatus; // VERIFIE if from scan, DECLARE if manual
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Monthly aggregation of journal entries
 */
export interface MonthlyAggregation {
  year: number;
  month: number; // 1-12
  totalSpent: number;
  totalTaxes: number;
  entriesCount: number;
  byCategory: Record<SpendingCategory, {
    totalSpent: number;
    totalTaxes: number;
    count: number;
  }>;
}

/**
 * Annual aggregation of journal entries
 */
export interface AnnualAggregation {
  year: number;
  totalSpent: number;
  totalTaxes: number;
  entriesCount: number;
  byCategory: Record<SpendingCategory, {
    totalSpent: number;
    totalTaxes: number;
    count: number;
  }>;
  byMonth: MonthlyAggregation[];
}

/**
 * Daily fiscal impact (taxes paid + services received)
 */
export interface DailyImpact {
  date: Date;
  totalTaxesPaid: number; // From journal entries
  estimatedServicesValue: number; // Pro-rated from annual services
  netImpact: number; // totalTaxesPaid - estimatedServicesValue
}

/**
 * Filter options for journal queries
 */
export interface JournalFilters {
  startDate?: Date;
  endDate?: Date;
  categories?: SpendingCategory[];
  minAmount?: number;
  maxAmount?: number;
  enseigne?: string;
  status?: DataStatus[];
}
