import { ProfilFiscalComplete } from "@/modules/profil/types";
import {
  getBaremeIR,
  getTauxCotisations,
  getTauxTVA,
  getPlafondSS,
  getTauxCSG_CRDS_Patrimoine,
  getParametresIFI,
  getDepensesAnnuellesDefaut,
} from "@/modules/referentiel";
import { DetailPaye } from "./types";

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

  // Application de la décote si applicable
  const seuilDecote =
    nombreParts === 1 ? bareme.decote.seuilCelibataire : bareme.decote.seuilCouple;

  if (impot > 0 && impot < seuilDecote) {
    const decote = bareme.decote.montantMax - impot * 0.75;
    impot = Math.max(0, impot - decote);
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
 * Calcule les cotisations patronales
 */
export async function calculCotisationsPatronales(
  salaireBrut: number,
  millesime: string
): Promise<number> {
  const taux = await getTauxCotisations(millesime, "patronales");
  const plafond = await getPlafondSS(millesime);

  const salairePlafonne = Math.min(salaireBrut, plafond);
  const salaireDeplafonne = salaireBrut;

  let total = 0;

  // Maladie-maternité
  if (taux.maladie_maternite) {
    total += salaireDeplafonne * taux.maladie_maternite;
  }

  // Vieillesse plafonnée
  if (taux.vieillesse_plafonnee) {
    total += salairePlafonne * taux.vieillesse_plafonnee;
  }

  // Vieillesse déplafonnée
  if (taux.vieillesse_deplafonnee) {
    total += salaireDeplafonne * taux.vieillesse_deplafonnee;
  }

  // Allocations familiales
  if (taux.allocations_familiales) {
    total += salaireDeplafonne * taux.allocations_familiales;
  }

  // Accidents du travail
  if (taux.accidents_travail) {
    total += salaireDeplafonne * taux.accidents_travail;
  }

  // Chômage
  if (taux.chomage) {
    total += salaireDeplafonne * taux.chomage;
  }

  // Retraite complémentaire
  if (taux.retraite_complementaire_tranche1) {
    total += salairePlafonne * taux.retraite_complementaire_tranche1;
  }

  return Math.round(total);
}

/**
 * Calcule la TVA estimée
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
  millesime: string
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
  const tva = await calculTVA(depensesAnnuelles, millesime);

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
