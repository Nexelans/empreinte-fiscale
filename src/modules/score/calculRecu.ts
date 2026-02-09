import { ProfilFiscalComplete } from "@/modules/profil/types";
import { getCoutEducation, getBudgetPLF, getStatsINSEE, getReferentiel } from "@/modules/referentiel";
import { DetailRecu } from "./types";

/**
 * Calcule la prime d'activité
 *
 * La prime d'activité est un complément de revenu pour les travailleurs modestes.
 * Formule simplifiée : Prime = Montant forfaitaire + Bonifications - Ressources du foyer
 *
 * Conditions :
 * - Revenu d'activité (salarié ou indépendant)
 * - Revenus < ~1.3 SMIC pour une personne seule
 *
 * Source : CAF - Prime d'activité 2026
 */
export async function calculPrimeActivite(
  salaireBrut: number,
  salaireNet: number,
  nombreEnfants: number,
  millesime: string
): Promise<number> {
  // Pas de prime si pas de salaire
  if (salaireBrut === 0) return 0;

  const montantForfaitaire = await getReferentiel<number>(
    millesime,
    "PRESTATIONS_CAF",
    "prime_activite_montant_forfaitaire"
  );
  const bonificationMax = await getReferentiel<number>(
    millesime,
    "PRESTATIONS_CAF",
    "prime_activite_bonification_max"
  );
  const seuilRevenu = await getReferentiel<number>(
    millesime,
    "PRESTATIONS_CAF",
    "prime_activite_seuil_revenu"
  );

  // Récupérer le SMIC annuel depuis le Référentiel RGDU
  const paramsRGDU = await getReferentiel<any>(millesime, "COTISATIONS", "rgdu");
  const smicAnnuel = paramsRGDU.valeur.smicAnnuel;

  // Vérifier l'éligibilité : salaire < seuil (1.3 SMIC)
  if (salaireBrut > seuilRevenu.valeur * smicAnnuel) {
    return 0; // Au-dessus du plafond, pas de prime
  }

  // Montant forfaitaire mensuel (base)
  const montantBase = montantForfaitaire.valeur;

  // Bonification individuelle : décroît linéairement entre 0.5 SMIC et 1.3 SMIC
  // Au SMIC : bonification maximale
  // À 1.3 SMIC : bonification = 0
  const rapportSmic = salaireBrut / smicAnnuel;
  let bonification = 0;
  if (rapportSmic <= 1.0) {
    bonification = bonificationMax.valeur;
  } else if (rapportSmic < seuilRevenu.valeur) {
    // Décroissance linéaire de 1 SMIC à 1.3 SMIC
    const facteur = (seuilRevenu.valeur - rapportSmic) / (seuilRevenu.valeur - 1.0);
    bonification = bonificationMax.valeur * facteur;
  }

  // Majoration pour enfants (simplifié : +50% du montant forfaitaire par enfant)
  const majoration = nombreEnfants * montantBase * 0.5;

  // Ressources du foyer (salaire net mensuel moyen)
  const salaireNetMensuel = salaireNet / 12;

  // Abattement forfaitaire : 62% du salaire net (pour tenir compte des frais professionnels)
  const abattement = salaireNetMensuel * 0.62;

  // Calcul de la prime mensuelle
  const primeMensuelle = Math.max(
    0,
    montantBase + bonification + majoration - (salaireNetMensuel - abattement)
  );

  // Prime annuelle
  return Math.round(primeMensuelle * 12);
}

/**
 * Calcule les allocations familiales
 *
 * Les allocations familiales sont versées à partir de 2 enfants.
 * Elles sont modulées selon les ressources du foyer (3 tranches).
 *
 * Barème 2026 CAF :
 * - 2 enfants : 148.52€/mois = 1,782€/an (taux plein)
 * - 3 enfants : ~338€/mois = 4,056€/an (taux plein)
 * - Par enfant supplémentaire : ~189€/mois
 *
 * Modulation selon revenus (couple 2 enfants) :
 * - < 74,884€ : taux plein (100%)
 * - 74,884€ - 99,845€ : taux réduit (50%)
 * - > 99,845€ : taux réduit (25%)
 *
 * Source : CAF - Allocations familiales 2026
 */
export async function calculAllocations(
  nombreEnfants: number,
  revenuAnnuel: number,
  millesime: string
): Promise<number> {
  // Les allocations familiales ne sont versées qu'à partir de 2 enfants
  if (nombreEnfants < 2) return 0;

  // Récupérer le montant de base depuis le Référentiel CAF
  const montantBaseEntry = await getReferentiel<number>(
    millesime,
    "PRESTATIONS_CAF",
    "allocations_familiales_montant_base"
  );
  const montantBaseMensuel = montantBaseEntry.valeur;

  // Récupérer le plafond de ressources pour le taux plein
  const plafondEntry = await getReferentiel<number>(
    millesime,
    "PRESTATIONS_CAF",
    "allocations_familiales_plafond_taux_plein"
  );
  const plafondTauxPlein = plafondEntry.valeur;

  // Calcul du montant brut annuel selon nombre d'enfants
  let montantBrutAnnuel: number;

  if (nombreEnfants === 2) {
    // 2 enfants : 148.52€/mois × 2 × 12 = 1,782€/an
    montantBrutAnnuel = montantBaseMensuel * 2 * 12;
  } else if (nombreEnfants === 3) {
    // 3 enfants : montant de base × 2 + majoration (environ 41€/mois)
    // Simplifié : 338€/mois × 12 = 4,056€/an
    montantBrutAnnuel = (montantBaseMensuel * 2 + 41) * 12;
  } else {
    // 4 enfants et + : base 3 enfants + 189€/mois par enfant supplémentaire
    const base3Enfants = (montantBaseMensuel * 2 + 41) * 12;
    const parEnfantSupplementaire = 189 * 12;
    montantBrutAnnuel = base3Enfants + (nombreEnfants - 3) * parEnfantSupplementaire;
  }

  // Application de la modulation selon revenus
  // Plafonds approximatifs pour un couple avec 2 enfants :
  // - Taux plein : < 74,884€
  // - Taux réduit 50% : 74,884€ - 99,845€
  // - Taux réduit 25% : > 99,845€
  const plafondTauxReduit50 = plafondTauxPlein * 1.33; // ~99,845€
  let tauxModulation = 1.0;

  if (revenuAnnuel > plafondTauxReduit50) {
    tauxModulation = 0.25; // Taux réduit 25%
  } else if (revenuAnnuel > plafondTauxPlein) {
    tauxModulation = 0.5; // Taux réduit 50%
  }
  // Sinon : taux plein (1.0)

  return Math.round(montantBrutAnnuel * tauxModulation);
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
  const salaireBrut = profil.revenus?.salaireBrut || 0;
  const salaireNet = profil.revenus?.salaireNet || 0;
  const revenuAnnuel = salaireBrut + (profil.revenus?.revenusFonciers || 0);

  // Calcul du nombre de personnes dans le foyer
  // Adultes : célibataire = 1, couple (marié/pacsé) = 2
  const situation = profil.situation?.statut || "celibataire";
  const nombreAdultes = situation === "marie_pacse" ? 2 : 1;
  const nombrePersonnesFoyer = nombreAdultes + nombreEnfants;

  const primeActivite = await calculPrimeActivite(salaireBrut, salaireNet, nombreEnfants, millesime);
  const allocations = await calculAllocations(nombreEnfants, revenuAnnuel, millesime);
  const remboursementsSante = await calculRemboursementsSante(nombrePersonnesFoyer, millesime);
  const servicesMutualises = await calculServicesMutualises(nombrePersonnesFoyer, millesime);

  return {
    transfertsDirects: {
      allocations,
      apl: 0, // TODO: implémenter le calcul APL
      remboursementsSante,
      autres: primeActivite,
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
