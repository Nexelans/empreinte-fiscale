import { ProfilFiscalComplete } from "@/modules/profil/types";
import { getCoutEducation, getBudgetPLF, getStatsINSEE, getReferentiel } from "@/modules/referentiel";
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
 * Calcule les remboursements santé Sécurité Sociale
 *
 * Basé sur les données DREES (Direction de la Recherche, des Études, de l'Évaluation et des Statistiques)
 * Montant moyen remboursé par personne × nombre de personnes du foyer
 *
 * Source : DREES - Les dépenses de santé 2025
 */
export async function calculRemboursementsSante(
  nombrePersonnesFoyer: number,
  millesime: string
): Promise<number> {
  const entry = await getReferentiel<number>(
    millesime,
    "STATS_DREES",
    "remboursement_sante_moyen_par_personne"
  );
  const remboursementParPersonne = entry.valeur;

  return Math.round(remboursementParPersonne * nombrePersonnesFoyer);
}

/**
 * Calcule les services mutualisés
 *
 * IMPORTANT : Les services mutualisés sont calculés PAR HABITANT puis multipliés par le nombre
 * de personnes du foyer. Un foyer de 4 personnes bénéficie de 4× plus de services qu'un célibataire.
 *
 * Source : PLF 2026 + DREES pour la santé
 */
export async function calculServicesMutualises(
  nombrePersonnesFoyer: number,
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

  // Santé publique par habitant (données DREES)
  const santeEntry = await getReferentiel<number>(
    millesime,
    "STATS_DREES",
    "sante_publique_par_habitant"
  );
  const santeParHabitant = santeEntry.valeur;

  // Part par habitant (budget en millions / population), puis × nombre de personnes
  const securiteParHabitant = Math.round(
    ((budgetDefense + budgetJustice + budgetPolice) * 1000000) / population
  );
  const infrastructureParHabitant = Math.round((budgetInfrastructure * 1000000) / population);
  const cultureParHabitant = Math.round((budgetCulture * 1000000) / population);
  const administrationParHabitant = Math.round((budgetAdministration * 1000000) / population);
  const chargesDetteParHabitant = Math.round((budgetDette * 1000000) / population);

  return {
    education: 0, // Calculé séparément par enfant
    sante: Math.round(santeParHabitant * nombrePersonnesFoyer),
    securite: Math.round(securiteParHabitant * nombrePersonnesFoyer),
    infrastructure: Math.round(infrastructureParHabitant * nombrePersonnesFoyer),
    culture: Math.round(cultureParHabitant * nombrePersonnesFoyer),
    administration: Math.round(administrationParHabitant * nombrePersonnesFoyer),
    chargesDette: Math.round(chargesDetteParHabitant * nombrePersonnesFoyer),
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

  // Calcul du nombre de personnes dans le foyer
  // Adultes : célibataire = 1, couple (marié/pacsé) = 2
  const situation = profil.situation?.statut || "celibataire";
  const nombreAdultes = situation === "marie_pacse" ? 2 : 1;
  const nombrePersonnesFoyer = nombreAdultes + nombreEnfants;

  const allocations = await calculAllocations(nombreEnfants, revenuAnnuel);
  const remboursementsSante = await calculRemboursementsSante(nombrePersonnesFoyer, millesime);
  const servicesMutualises = await calculServicesMutualises(nombrePersonnesFoyer, millesime);

  return {
    transfertsDirects: {
      allocations,
      apl: 0, // TODO: implémenter le calcul APL
      remboursementsSante,
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
