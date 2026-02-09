import { ProfilFiscalComplete } from "@/modules/profil/types";
import {
  getBaremeIR,
  getTauxCotisations,
  getTauxTVA,
  getPlafondSS,
  getParametresRGDU,
  getTauxCSG_CRDS_Patrimoine,
  getParametresIFI,
  getDepensesAnnuellesDefaut,
} from "@/modules/referentiel";
import { DetailPaye } from "./types";
import { getJournalEntries } from "../journal/service";
import { getCurrentYearAggregation } from "../journal/aggregations";

/**
 * Calcule l'impôt sur le revenu avec quotient familial
 */
export async function calculImpotRevenu(
  revenuNetImposable: number,
  nombreParts: number,
  millesime: string
): Promise<number> {
  const bareme = await getBaremeIR(millesime);

  // Calcul du quotient familial
  const quotient = revenuNetImposable / nombreParts;

  // Calcul de l'impôt par tranche
  let impotParPart = 0;
  for (const tranche of bareme.tranches) {
    if (quotient > tranche.min) {
      const baseImposable = Math.min(quotient, tranche.max) - tranche.min;
      impotParPart += baseImposable * tranche.taux;
    }
  }

  let impot = impotParPart * nombreParts;

  // Application de la décote si applicable (Article 197-I-4 du CGI)
  // La décote s'applique si l'impôt brut est inférieur au seuil
  // Décote = montant forfaitaire - (impôt brut × coefficient 45,25%)
  // Formules différenciées célibataire/couple depuis 2026
  const isImpositionIndividuelle = nombreParts <= 1.5; // Célibataire, divorcé, veuf sans enfant
  const seuilDecote = isImpositionIndividuelle
    ? bareme.decote.seuilCelibataire
    : bareme.decote.seuilCouple;
  const montantForfaitaire = isImpositionIndividuelle
    ? bareme.decote.montantMaxCelibataire
    : bareme.decote.montantMaxCouple;
  const coefficient = bareme.decote.coefficient || 0.4525;

  if (impot > 0 && impot < seuilDecote) {
    const decote = montantForfaitaire - impot * coefficient;
    impot = Math.max(0, impot - Math.max(0, decote));
  }

  return Math.max(0, Math.round(impot));
}

/**
 * Calcule la CSG/CRDS
 */
export async function calculCSG_CRDS(
  salaireBrut: number,
  revenusPatrimoine: number,
  millesime: string
): Promise<number> {
  const taux = await getTauxCotisations(millesime, "salariales");
  const tauxPatrimoine = await getTauxCSG_CRDS_Patrimoine(millesime);

  const csgActivite = salaireBrut * (taux.csg_crds || 0.098);
  const csgPatrimoine = revenusPatrimoine * tauxPatrimoine;

  return Math.round(csgActivite + csgPatrimoine);
}

/**
 * Calcule les cotisations salariales
 */
export async function calculCotisationsSalariales(
  salaireBrut: number,
  millesime: string
): Promise<number> {
  const taux = await getTauxCotisations(millesime, "salariales");
  const plafond = await getPlafondSS(millesime);

  const salairePlafonne = Math.min(salaireBrut, plafond);
  const salaireDeplafonne = salaireBrut;

  let total = 0;

  // Vieillesse plafonnée
  if (taux.vieillesse_plafonnee) {
    total += salairePlafonne * taux.vieillesse_plafonnee;
  }

  // Vieillesse déplafonnée
  if (taux.vieillesse_deplafonnee) {
    total += salaireDeplafonne * taux.vieillesse_deplafonnee;
  }

  // Retraite complémentaire tranche 1
  if (taux.retraite_complementaire_tranche1) {
    total += salairePlafonne * taux.retraite_complementaire_tranche1;
  }

  return Math.round(total);
}

/**
 * Calcule le coefficient de réduction RGDU (Réduction Générale Dégressive Unique, ex-Fillon)
 * La RGDU s'applique sur les cotisations patronales de maladie, allocations familiales et vieillesse déplafonnée
 *
 * Formule URSSAF 2026 : Coefficient = (T/0.6) × [(1.6 × SMIC annuel / Rémunération annuelle) - 1]
 * - Au SMIC : coefficient = T (maximal, 0.3206 soit 32,06%)
 * - À 1.6 SMIC : coefficient = 0 (pas de réduction)
 *
 * Source : https://www.urssaf.fr/portail/home/employeur/calculer-les-cotisations/les-taux-de-cotisations/la-reduction-generale.html
 */
async function calculateRGDU(
  remunerationAnnuelle: number,
  millesime: string
): Promise<number> {
  const params = await getParametresRGDU(millesime);

  // Si la rémunération dépasse 1.6 SMIC, pas de réduction
  if (remunerationAnnuelle >= params.seuilMax * params.smicAnnuel) {
    return 0;
  }

  // Si la rémunération est inférieure ou égale au SMIC, réduction maximale
  if (remunerationAnnuelle <= params.smicAnnuel) {
    return params.coefficientMaximal;
  }

  // Calcul du coefficient selon la formule URSSAF
  const T = params.coefficientMaximal;
  const rapport = (params.seuilMax * params.smicAnnuel) / remunerationAnnuelle;
  const coefficient = (T / 0.6) * (rapport - 1);

  // Le coefficient ne peut pas être négatif
  return Math.max(0, coefficient);
}

/**
 * Calcule les cotisations patronales (avec application de la RGDU)
 *
 * La RGDU (Réduction Générale Dégressive Unique, ex-Fillon) s'applique sur :
 * - Maladie-maternité
 * - Allocations familiales
 * - Vieillesse déplafonnée
 *
 * Source : URSSAF - Réduction générale de cotisations patronales 2026
 */
export async function calculCotisationsPatronales(
  salaireBrut: number,
  millesime: string
): Promise<number> {
  const taux = await getTauxCotisations(millesime, "patronales");
  const plafond = await getPlafondSS(millesime);

  const salairePlafonne = Math.min(salaireBrut, plafond);
  const salaireDeplafonne = salaireBrut;

  // Cotisations soumises à RGDU
  let cotisationsAvecRGDU = 0;

  // Maladie-maternité (soumise à RGDU)
  if (taux.maladie_maternite) {
    cotisationsAvecRGDU += salaireDeplafonne * taux.maladie_maternite;
  }

  // Allocations familiales (soumises à RGDU)
  if (taux.allocations_familiales) {
    cotisationsAvecRGDU += salaireDeplafonne * taux.allocations_familiales;
  }

  // Vieillesse déplafonnée (soumise à RGDU)
  if (taux.vieillesse_deplafonnee) {
    cotisationsAvecRGDU += salaireDeplafonne * taux.vieillesse_deplafonnee;
  }

  // Application de la RGDU
  const coefficientRGDU = await calculateRGDU(salaireBrut, millesime);
  const reductionRGDU = cotisationsAvecRGDU * coefficientRGDU;
  const cotisationsApresRGDU = cotisationsAvecRGDU - reductionRGDU;

  // Cotisations NON soumises à RGDU
  let cotisationsSansRGDU = 0;

  // Vieillesse plafonnée (NON soumise à RGDU)
  if (taux.vieillesse_plafonnee) {
    cotisationsSansRGDU += salairePlafonne * taux.vieillesse_plafonnee;
  }

  // Accidents du travail (NON soumis à RGDU)
  if (taux.accidents_travail) {
    cotisationsSansRGDU += salaireDeplafonne * taux.accidents_travail;
  }

  // Chômage (NON soumis à RGDU)
  if (taux.chomage) {
    cotisationsSansRGDU += salaireDeplafonne * taux.chomage;
  }

  // Retraite complémentaire (NON soumise à RGDU)
  if (taux.retraite_complementaire_tranche1) {
    cotisationsSansRGDU += salairePlafonne * taux.retraite_complementaire_tranche1;
  }

  const total = cotisationsApresRGDU + cotisationsSansRGDU;

  return Math.round(total);
}

/**
 * Calcule la TVA estimée (méthode par défaut sans journal)
 */
export async function calculTVA(
  depensesAnnuelles: number,
  millesime: string
): Promise<number> {
  const tauxTVA = await getTauxTVA(millesime);

  // Répartition estimée par taux (à affiner selon le profil)
  const repartition = {
    normal: 0.50, // 50% à 20%
    intermediaire: 0.25, // 25% à 10%
    reduit: 0.20, // 20% à 5.5%
    super_reduit: 0.05, // 5% à 2.1%
  };

  const tvaTotal =
    depensesAnnuelles *
    (repartition.normal * (tauxTVA.normal / (1 + tauxTVA.normal)) +
      repartition.intermediaire * (tauxTVA.intermediaire / (1 + tauxTVA.intermediaire)) +
      repartition.reduit * (tauxTVA.reduit / (1 + tauxTVA.reduit)) +
      repartition.super_reduit * (tauxTVA.super_reduit / (1 + tauxTVA.super_reduit)));

  return Math.round(tvaTotal);
}

/**
 * Calcule la TVA avec données du journal (hybride : réel + estimé)
 * Utilise les données réelles du journal quand disponibles,
 * complète avec des estimations pour les jours manquants
 */
export async function calculTVAAvecJournal(
  userId: string,
  depensesAnnuellesEstimees: number,
  millesime: string
): Promise<number> {
  try {
    console.log("[calculTVAAvecJournal] Starting with userId:", userId);

    // Récupérer les entrées du journal pour l'année en cours
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    console.log("[calculTVAAvecJournal] Fetching journal entries...");
    const journalEntries = await getJournalEntries(userId, {
      startDate,
      endDate,
    });
    console.log("[calculTVAAvecJournal] Found", journalEntries.length, "entries");

    if (journalEntries.length === 0) {
      // Pas de données journal, utiliser estimation pure
      console.log("[calculTVAAvecJournal] No journal data, using pure estimation");
      return calculTVA(depensesAnnuellesEstimees, millesime);
    }

    // Agréger les taxes du journal
    const yearlyAgg = getCurrentYearAggregation(journalEntries);
    if (!yearlyAgg) {
      return calculTVA(depensesAnnuellesEstimees, millesime);
    }

    // Total des taxes TVA réelles du journal
    const tvaReelle = yearlyAgg.totalTaxes;

    // Nombre de jours avec données
    const daysWithData = journalEntries.length; // Simplifié: 1 entry = 1 jour
    const totalDaysInYear = 365;
    const daysWithoutData = Math.max(0, totalDaysInYear - daysWithData);

    // Estimation pour les jours manquants
    // Dépenses quotidiennes estimées = dépenses annuelles / 365
    const depensesQuotidiennesEstimees = depensesAnnuellesEstimees / totalDaysInYear;
    const tvaQuotidienneEstimee = (await calculTVA(depensesAnnuellesEstimees, millesime)) / totalDaysInYear;
    const tvaEstimeePourJoursManquants = tvaQuotidienneEstimee * daysWithoutData;

    // TVA hybride = TVA réelle + TVA estimée pour jours manquants
    const tvaHybride = tvaReelle + tvaEstimeePourJoursManquants;

    return Math.round(tvaHybride);
  } catch (error) {
    console.error("[calculTVAAvecJournal] Error:", error);
    // Fallback sur estimation pure en cas d'erreur
    return calculTVA(depensesAnnuellesEstimees, millesime);
  }
}

/**
 * Calcule l'Impôt sur la Fortune Immobilière (IFI)
 */
export async function calculIFI(patrimoineNet: number, millesime: string): Promise<number> {
  const params = await getParametresIFI(millesime);

  // Si en dessous du seuil, pas d'IFI
  if (patrimoineNet < params.seuil) {
    return 0;
  }

  // Calcul du patrimoine net taxable (après abattement)
  const patrimoineNetTaxable = patrimoineNet - params.abattement;

  // Calcul par tranches
  let ifi = 0;
  for (const tranche of params.bareme) {
    if (patrimoineNetTaxable > tranche.min) {
      const baseImposable = Math.min(patrimoineNetTaxable, tranche.max) - tranche.min;
      ifi += baseImposable * tranche.taux;
    }
  }

  return Math.round(ifi);
}

/**
 * Calcule le total "Ce que je paie"
 */
export async function calculTotalPaye(
  profil: Partial<ProfilFiscalComplete>,
  millesime: string,
  options?: {
    userId?: string;
    useJournalData?: boolean;
  }
): Promise<DetailPaye> {
  const salaireBrut = profil.revenus?.salaireBrut || 0;
  const salaireNet = profil.revenus?.salaireNet || 0;
  const revenusFonciers = profil.revenus?.revenusFonciers || 0;
  const revenusCapitaux = profil.revenus?.revenusCapitaux || 0;
  const taxeFonciere = profil.patrimoine?.taxeFonciere || 0;
  const patrimoineIFI = profil.patrimoine?.patrimoineIFI || 0;
  const nombreParts = profil.situation?.nombreParts || 1;

  // Estimation des dépenses annuelles depuis le Référentiel si non renseigné
  const depensesAnnuellesDefaut = await getDepensesAnnuellesDefaut(millesime);
  let depensesAnnuelles = depensesAnnuellesDefaut;

  if (profil.consommation?.budgetMensuel) {
    const budget = profil.consommation.budgetMensuel;
    const totalMensuel =
      (budget.courses || 0) +
      (budget.restaurants || 0) +
      (budget.carburant || 0) +
      (budget.loisirs || 0);
    depensesAnnuelles = totalMensuel * 12;
  }

  const impotRevenu = await calculImpotRevenu(salaireNet, nombreParts, millesime);
  const csg_crds = await calculCSG_CRDS(
    salaireBrut,
    revenusFonciers + revenusCapitaux,
    millesime
  );
  const cotisationsSalariales = await calculCotisationsSalariales(salaireBrut, millesime);
  const cotisationsPatronales = await calculCotisationsPatronales(salaireBrut, millesime);

  // Use journal data for TVA if available and requested
  let tva: number;
  if (options?.useJournalData && options?.userId) {
    console.log("[calculTotalPaye] Using journal data for TVA calculation");
    tva = await calculTVAAvecJournal(options.userId, depensesAnnuelles, millesime);
    console.log("[calculTotalPaye] TVA calculated:", tva);
  } else {
    tva = await calculTVA(depensesAnnuelles, millesime);
  }

  // IFI - Calcul depuis le Référentiel
  const ifi = await calculIFI(patrimoineIFI, millesime);

  return {
    impotRevenu,
    csg_crds,
    cotisationsSalariales,
    cotisationsPatronales,
    tva,
    ticpe: 0, // TODO: implémenter le calcul TICPE
    taxeFonciere,
    ifi,
    autresTaxes: 0,
  };
}
