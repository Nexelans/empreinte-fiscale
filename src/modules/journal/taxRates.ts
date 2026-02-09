import { SpendingCategory, DEFAULT_TVA_RATES, TaxBreakdown } from "./types";
import { getReferentiel } from "../referentiel/service";

/**
 * Get TVA rates from Référentiel or use defaults
 */
async function getTVARates(): Promise<{
  normal: number;
  intermediaire: number;
  reduit: number;
  superReduit: number;
}> {
  try {
    const millesime = "2026"; // TODO: Get from getMillesimeActif()

    const [normal, intermediaire, reduit, superReduit] = await Promise.all([
      getReferentiel(millesime, "TAUX_TVA", "normal"),
      getReferentiel(millesime, "TAUX_TVA", "intermediaire"),
      getReferentiel(millesime, "TAUX_TVA", "reduit"),
      getReferentiel(millesime, "TAUX_TVA", "super_reduit"),
    ]);

    return {
      normal: (normal?.valeur as number) || 20,
      intermediaire: (intermediaire?.valeur as number) || 10,
      reduit: (reduit?.valeur as number) || 5.5,
      superReduit: (superReduit?.valeur as number) || 2.1,
    };
  } catch (error) {
    console.warn("[getTVARates] Failed to fetch from Référentiel, using defaults", error);
    return {
      normal: 20,
      intermediaire: 10,
      reduit: 5.5,
      superReduit: 2.1,
    };
  }
}

/**
 * Get the appropriate TVA rate for a spending category
 * Uses Référentiel when available, falls back to defaults
 *
 * @param category - Spending category
 * @returns TVA rate as percentage
 */
export async function getTVARateForCategory(category: SpendingCategory): Promise<number> {
  const rates = await getTVARates();

  switch (category) {
    case "alimentation":
      return rates.reduit; // 5.5% for most food items
    case "restaurant":
      return rates.intermediaire; // 10% for restaurant service
    case "transport":
      return rates.intermediaire; // 10% for transport
    case "carburant":
      return rates.normal; // 20% for fuel
    case "energie":
      return rates.reduit; // 5.5% for energy
    case "telecom":
      return rates.normal; // 20% for telecom
    case "loisirs":
      return rates.normal; // 20% for leisure
    case "sante":
      return rates.reduit; // 5.5% for most health products
    case "logement":
      return rates.normal; // 20% for housing-related purchases
    case "autre":
    default:
      return rates.normal; // 20% default
  }
}

/**
 * Calculate TICPE (fuel tax) for carburant category
 * Based on average fuel consumption
 *
 * @param montantTTC - Total amount paid
 * @returns TICPE amount in euros
 */
function calculateTICPE(montantTTC: number): number {
  // TICPE 2026: ~0.69€/L for diesel, ~0.66€/L for gasoline
  // Average price: ~1.80€/L
  // TICPE represents ~38% of fuel price
  const ticpeRate = 0.38;
  return parseFloat((montantTTC * ticpeRate).toFixed(2));
}

/**
 * Calculate tax breakdown for a spending entry
 *
 * @param category - Spending category
 * @param montantTTC - Total amount paid (TTC = including tax)
 * @param montantTVA - Optional: TVA amount if known from ticket
 * @returns Tax breakdown with TVA and other taxes
 */
export async function calculateTaxBreakdown(
  category: SpendingCategory,
  montantTTC: number,
  montantTVA?: number
): Promise<TaxBreakdown> {
  // Get TVA rate for category
  const tauxTVA = await getTVARateForCategory(category);

  // Calculate TVA amount if not provided
  let tva: number;
  if (montantTVA !== undefined) {
    tva = montantTVA;
  } else {
    // Calculate from TTC: TVA = TTC - (TTC / (1 + taux/100))
    const montantHT = montantTTC / (1 + tauxTVA / 100);
    tva = parseFloat((montantTTC - montantHT).toFixed(2));
  }

  const breakdown: TaxBreakdown = {
    tva,
    tauxTVA,
  };

  // Add TICPE for fuel
  if (category === "carburant") {
    breakdown.ticpe = calculateTICPE(montantTTC);
  }

  // Add other indirect taxes (simplified - could be expanded)
  // For example, alcohol/tobacco have specific excise taxes
  // Insurance has a specific tax rate, etc.
  // For MVP, we'll keep it simple with just TVA and TICPE

  return breakdown;
}

/**
 * Get total tax amount from a tax breakdown
 */
export function getTotalTax(breakdown: TaxBreakdown): number {
  let total = breakdown.tva;
  if (breakdown.ticpe) total += breakdown.ticpe;
  if (breakdown.autresTaxes) total += breakdown.autresTaxes;
  return parseFloat(total.toFixed(2));
}
