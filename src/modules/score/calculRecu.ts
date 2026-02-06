import { ProfilFiscalComplete } from "@/modules/profil/types";
import { getCoutEducation, getBudgetPLF, getStatsINSEE } from "@/modules/referentiel";
import { DetailRecu } from "./types";

/**
 * Calcule les allocations familiales
 */
export async function calculAllocations(
  nombreEnfants: number,
  revenuAnnuel: number
): Promise<number> {
  if (nombreEnfants === 0) return 0;

  // Montant de base par enfant (à affiner selon barème réel)
  const montantBase = nombreEnfants === 1 ? 0 : nombreEnfants === 2 ? 1500 : 2000 + (nombreEnfants - 2) * 800;

  // Plafonnement selon revenus (simplifié)
  if (revenuAnnuel > 100000) {
    return Math.round(montantBase * 0.5);
  }

  return Math.round(montantBase);
}

/**
 * Calcule le coût éducation total
 */
export async function calculCoutEducation(
  enfants: ProfilFiscalComplete["familleServices"]["enfants"],
  millesime: string
): Promise<number> {
  let total = 0;

  for (const enfant of enfants) {
    const cout = await getCoutEducation(millesime, enfant.niveauScolaire as any);
    total += cout;
  }

  return Math.round(total);
}

/**
 * Calcule les services mutualisés
 */
export async function calculServicesMutualises(
  nombreEnfants: number,
  millesime: string
): Promise<{
  education: number;
  sante: number;
  securite: number;
  infrastructure: number;
  culture: number;
  administration: number;
  chargesDette: number;
}> {
  const population = await getStatsINSEE<number>(millesime, "population_france");

  // Budgets en millions d'euros
  const budgetDefense = await getBudgetPLF(millesime, "defense");
  const budgetJustice = await getBudgetPLF(millesime, "justice");
  const budgetPolice = await getBudgetPLF(millesime, "police");
  const budgetInfrastructure = await getBudgetPLF(millesime, "infrastructure");
  const budgetCulture = await getBudgetPLF(millesime, "culture");
  const budgetAdministration = await getBudgetPLF(millesime, "administration");
  const budgetDette = await getBudgetPLF(millesime, "charge_dette");

  // Part par habitant (budget en millions / population)
  const securite = Math.round(
    ((budgetDefense + budgetJustice + budgetPolice) * 1000000) / population
  );
  const infrastructure = Math.round((budgetInfrastructure * 1000000) / population);
  const culture = Math.round((budgetCulture * 1000000) / population);
  const administration = Math.round((budgetAdministration * 1000000) / population);
  const chargesDette = Math.round((budgetDette * 1000000) / population);

  return {
    education: 0, // Calculé séparément par enfant
    sante: 2000, // Estimation (à affiner selon profil)
    securite,
    infrastructure,
    culture,
    administration,
    chargesDette,
  };
}

/**
 * Calcule le total "Ce que je reçois"
 */
export async function calculTotalRecu(
  profil: Partial<ProfilFiscalComplete>,
  coutEducation: number,
  millesime: string
): Promise<DetailRecu> {
  const nombreEnfants = profil.familleServices?.nombreEnfants || 0;
  const revenuAnnuel = (profil.revenus?.salaireBrut || 0) + (profil.revenus?.revenusFonciers || 0);

  const allocations = await calculAllocations(nombreEnfants, revenuAnnuel);
  const servicesMutualises = await calculServicesMutualises(nombreEnfants, millesime);

  return {
    transfertsDirects: {
      allocations,
      apl: 0, // TODO: implémenter le calcul APL
      remboursementsSante: Math.round(servicesMutualises.sante * 0.3), // Estimation
      autres: 0,
    },
    servicesMutualises: {
      education: coutEducation,
      sante: servicesMutualises.sante,
      securite: servicesMutualises.securite,
      infrastructure: servicesMutualises.infrastructure,
      culture: servicesMutualises.culture,
      administration: servicesMutualises.administration,
      chargesDette: servicesMutualises.chargesDette,
    },
  };
}
