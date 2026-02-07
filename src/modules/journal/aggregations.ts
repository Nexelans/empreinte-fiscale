import { JournalEntryData, MonthlyAggregation, AnnualAggregation } from "./types";
import { SpendingCategory } from "../tickets/types";
import { getEntryTotalTax } from "./service";

/**
 * Initialize empty category aggregation
 */
function initCategoryAggregation(): Record<SpendingCategory, {
  totalSpent: number;
  totalTaxes: number;
  count: number;
}> {
  const categories: SpendingCategory[] = [
    "alimentation",
    "restaurant",
    "transport",
    "carburant",
    "energie",
    "telecom",
    "loisirs",
    "sante",
    "logement",
    "autre",
  ];

  return categories.reduce((acc, cat) => {
    acc[cat] = { totalSpent: 0, totalTaxes: 0, count: 0 };
    return acc;
  }, {} as any);
}

/**
 * Aggregate journal entries by month
 *
 * @param entries - Journal entries to aggregate
 * @param year - Year to filter (optional)
 * @param month - Month to filter (1-12, optional)
 * @returns Monthly aggregation
 */
export function aggregateByMonth(
  entries: JournalEntryData[],
  year?: number,
  month?: number
): MonthlyAggregation | null {
  // Filter entries for the specified month/year
  let filtered = entries;
  if (year !== undefined && month !== undefined) {
    filtered = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month;
    });
  }

  if (filtered.length === 0) {
    return null;
  }

  // Use first entry's date for year/month if not specified
  const firstDate = new Date(filtered[0]!.date);
  const aggregateYear = year ?? firstDate.getFullYear();
  const aggregateMonth = month ?? firstDate.getMonth() + 1;

  // Initialize aggregation
  const byCategory = initCategoryAggregation();
  let totalSpent = 0;
  let totalTaxes = 0;

  // Aggregate entries
  for (const entry of filtered) {
    const entryTaxes = getEntryTotalTax(entry);

    totalSpent += entry.montantTTC;
    totalTaxes += entryTaxes;

    byCategory[entry.category].totalSpent += entry.montantTTC;
    byCategory[entry.category].totalTaxes += entryTaxes;
    byCategory[entry.category].count++;
  }

  return {
    year: aggregateYear,
    month: aggregateMonth,
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    totalTaxes: parseFloat(totalTaxes.toFixed(2)),
    entriesCount: filtered.length,
    byCategory,
  };
}

/**
 * Aggregate journal entries by year
 *
 * @param entries - Journal entries to aggregate
 * @param year - Year to filter (optional)
 * @returns Annual aggregation with monthly breakdowns
 */
export function aggregateByYear(
  entries: JournalEntryData[],
  year?: number
): AnnualAggregation | null {
  // Filter entries for the specified year
  let filtered = entries;
  if (year !== undefined) {
    filtered = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year;
    });
  }

  if (filtered.length === 0) {
    return null;
  }

  // Use first entry's date for year if not specified
  const firstDate = new Date(filtered[0]!.date);
  const aggregateYear = year ?? firstDate.getFullYear();

  // Initialize aggregation
  const byCategory = initCategoryAggregation();
  let totalSpent = 0;
  let totalTaxes = 0;

  // Aggregate all entries
  for (const entry of filtered) {
    const entryTaxes = getEntryTotalTax(entry);

    totalSpent += entry.montantTTC;
    totalTaxes += entryTaxes;

    byCategory[entry.category].totalSpent += entry.montantTTC;
    byCategory[entry.category].totalTaxes += entryTaxes;
    byCategory[entry.category].count++;
  }

  // Generate monthly breakdowns
  const byMonth: MonthlyAggregation[] = [];
  for (let month = 1; month <= 12; month++) {
    const monthAgg = aggregateByMonth(filtered, aggregateYear, month);
    if (monthAgg) {
      byMonth.push(monthAgg);
    }
  }

  return {
    year: aggregateYear,
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    totalTaxes: parseFloat(totalTaxes.toFixed(2)),
    entriesCount: filtered.length,
    byCategory,
    byMonth,
  };
}

/**
 * Get aggregation for current month
 */
export function getCurrentMonthAggregation(
  entries: JournalEntryData[]
): MonthlyAggregation | null {
  const now = new Date();
  return aggregateByMonth(entries, now.getFullYear(), now.getMonth() + 1);
}

/**
 * Get aggregation for current year
 */
export function getCurrentYearAggregation(
  entries: JournalEntryData[]
): AnnualAggregation | null {
  const now = new Date();
  return aggregateByYear(entries, now.getFullYear());
}

/**
 * Group entries by day for timeline view
 *
 * @param entries - Journal entries
 * @returns Map of date string (YYYY-MM-DD) to entries
 */
export function groupEntriesByDay(
  entries: JournalEntryData[]
): Map<string, JournalEntryData[]> {
  const grouped = new Map<string, JournalEntryData[]>();

  for (const entry of entries) {
    const date = new Date(entry.date);
    const dateKey = date.toISOString().split("T")[0]!; // YYYY-MM-DD

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(entry);
  }

  return grouped;
}

/**
 * Calculate daily tax totals for a date
 *
 * @param entries - Entries for the day
 * @returns Total taxes paid that day
 */
export function getDailyTaxTotal(entries: JournalEntryData[]): number {
  return entries.reduce((total, entry) => total + getEntryTotalTax(entry), 0);
}
