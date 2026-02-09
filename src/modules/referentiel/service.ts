import { prisma } from "@/lib/prisma";
import {
  ReferentielEntry,
  ReferentielError,
  TrancheIR,
  TauxCotisation,
  NiveauScolaire,
  FonctionBudgetaire,
  DecoteIR,
  PlafondQuotientFamilial,
  ParametresRGDU,
} from "./types";

// Cache simple en mémoire (5 minutes de TTL)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(millesime: string, categorie: string, cle: string): string {
  return `${millesime}:${categorie}:${cle}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Récupère une entrée du Référentiel
 * @throws ReferentielError si l'entrée n'existe pas
 */
export async function getReferentiel<T = unknown>(
  millesime: string,
  categorie: string,
  cle: string
): Promise<ReferentielEntry<T>> {
  const cacheKey = getCacheKey(millesime, categorie, cle);
  const cached = getFromCache<ReferentielEntry<T>>(cacheKey);
  if (cached) return cached;

  const entry = await prisma.referentiel.findUnique({
    where: {
      millesime_categorie_cle: {
        millesime,
        categorie,
        cle,
      },
    },
  });

  if (!entry) {
    throw new ReferentielError(
      `Donnée manquante dans Référentiel : ${categorie}.${cle} pour le millésime ${millesime}`,
      millesime,
      categorie,
      cle
    );
  }

  const result: ReferentielEntry<T> = {
    ...entry,
    valeur: entry.valeur as T,
    statut: entry.statut as any,
    unite: entry.unite ?? undefined,
    notes: entry.notes ?? undefined,
  };

  setCache(cacheKey, result);
  return result;
}

/**
 * Récupère le barème de l'impôt sur le revenu
 */
export async function getBaremeIR(millesime: string): Promise<{
  tranches: TrancheIR[];
  decote: DecoteIR;
  plafondQuotientFamilial: PlafondQuotientFamilial;
}> {
  const tranchesEntry = await getReferentiel<TrancheIR[]>(millesime, "BAREME_IR", "tranches");
  const decoteEntry = await getReferentiel<DecoteIR>(millesime, "BAREME_IR", "decote");
  const plafondEntry = await getReferentiel<PlafondQuotientFamilial>(
    millesime,
    "BAREME_IR",
    "plafond_quotient_familial"
  );

  // Valider que les tranches sont bien ordonnées
  const tranches = tranchesEntry.valeur;
  for (let i = 0; i < tranches.length - 1; i++) {
    if (tranches[i]?.max !== tranches[i + 1]?.min) {
      throw new Error(
        `Barème IR invalide : les tranches ne sont pas continues (tranche ${i})`
      );
    }
  }

  return {
    tranches: tranchesEntry.valeur,
    decote: decoteEntry.valeur,
    plafondQuotientFamilial: plafondEntry.valeur,
  };
}

/**
 * Récupère les taux de cotisations sociales
 */
export async function getTauxCotisations(
  millesime: string,
  type: "salariales" | "patronales"
): Promise<TauxCotisation> {
  const entry = await getReferentiel<TauxCotisation>(millesime, "COTISATIONS", type);
  return entry.valeur;
}

/**
 * Récupère le plafond annuel de la sécurité sociale
 */
export async function getPlafondSS(millesime: string): Promise<number> {
  const entry = await getReferentiel<number>(millesime, "COTISATIONS", "plafond_ss");
  return entry.valeur;
}

/**
 * Récupère les paramètres de la RGDU (Réduction Générale Dégressive Unique)
 */
export async function getParametresRGDU(millesime: string): Promise<ParametresRGDU> {
  const entry = await getReferentiel<ParametresRGDU>(millesime, "COTISATIONS", "rgdu");
  return entry.valeur;
}

/**
 * Récupère le coût annuel par élève pour un niveau scolaire
 */
export async function getCoutEducation(
  millesime: string,
  niveau: NiveauScolaire
): Promise<number> {
  const entry = await getReferentiel<number>(millesime, "COUT_EDUCATION", niveau);
  return entry.valeur;
}

/**
 * Récupère le budget d'une fonction budgétaire (en millions d'euros)
 */
export async function getBudgetPLF(
  millesime: string,
  fonction: FonctionBudgetaire
): Promise<number> {
  const entry = await getReferentiel<number>(millesime, "BUDGET_PLF", fonction);
  return entry.valeur;
}

/**
 * Récupère une statistique INSEE
 */
export async function getStatsINSEE<T = unknown>(
  millesime: string,
  indicateur: string
): Promise<T> {
  const entry = await getReferentiel<T>(millesime, "STATS_INSEE", indicateur);
  return entry.valeur;
}

/**
 * Récupère les taux de TVA
 */
export async function getTauxTVA(millesime: string): Promise<{
  normal: number;
  intermediaire: number;
  reduit: number;
  super_reduit: number;
}> {
  const [normal, intermediaire, reduit, super_reduit] = await Promise.all([
    getReferentiel<number>(millesime, "TAUX_TVA", "normal"),
    getReferentiel<number>(millesime, "TAUX_TVA", "intermediaire"),
    getReferentiel<number>(millesime, "TAUX_TVA", "reduit"),
    getReferentiel<number>(millesime, "TAUX_TVA", "super_reduit"),
  ]);

  return {
    normal: normal.valeur,
    intermediaire: intermediaire.valeur,
    reduit: reduit.valeur,
    super_reduit: super_reduit.valeur,
  };
}

/**
 * Récupère le millésime actif (le plus récent avec statut OFFICIEL)
 */
export async function getMillesimeActif(): Promise<string> {
  const entry = await prisma.referentiel.findFirst({
    where: {
      statut: "OFFICIEL",
    },
    orderBy: {
      millesime: "desc",
    },
    select: {
      millesime: true,
    },
  });

  if (!entry) {
    throw new Error("Aucun millésime OFFICIEL trouvé dans le Référentiel");
  }

  return entry.millesime;
}

/**
 * Batch loading : récupère toutes les données d'un millésime et de catégories spécifiques
 * Utilisé pour optimiser les performances du moteur de calcul
 */
export async function batchLoadReferentiel(
  millesime: string,
  categories: string[]
): Promise<Map<string, ReferentielEntry>> {
  const entries = await prisma.referentiel.findMany({
    where: {
      millesime,
      categorie: {
        in: categories,
      },
    },
  });

  const map = new Map<string, ReferentielEntry>();
  for (const entry of entries) {
    const key = getCacheKey(millesime, entry.categorie, entry.cle);
    const referentielEntry: ReferentielEntry = {
      ...entry,
      statut: entry.statut as any,
      unite: entry.unite ?? undefined,
      notes: entry.notes ?? undefined,
    };
    map.set(key, referentielEntry);
    setCache(key, referentielEntry);
  }

  return map;
}

/**
 * Récupère le taux de CSG + CRDS sur les revenus du patrimoine
 */
export async function getTauxCSG_CRDS_Patrimoine(millesime: string): Promise<number> {
  const entry = await getReferentiel<number>(millesime, "COTISATIONS", "csg_crds_patrimoine");
  return entry.valeur;
}

/**
 * Récupère les paramètres de l'IFI (Impôt sur la Fortune Immobilière)
 */
export async function getParametresIFI(millesime: string): Promise<{
  seuil: number;
  abattement: number;
  bareme: TrancheIR[];
}> {
  const [seuilEntry, abattementEntry, baremeEntry] = await Promise.all([
    getReferentiel<number>(millesime, "IFI", "seuil_entree"),
    getReferentiel<number>(millesime, "IFI", "abattement"),
    getReferentiel<TrancheIR[]>(millesime, "IFI", "bareme"),
  ]);

  return {
    seuil: seuilEntry.valeur,
    abattement: abattementEntry.valeur,
    bareme: baremeEntry.valeur,
  };
}

/**
 * Récupère les dépenses annuelles par défaut (estimation INSEE)
 */
export async function getDepensesAnnuellesDefaut(millesime: string): Promise<number> {
  const entry = await getReferentiel<number>(millesime, "STATS_INSEE", "depenses_annuelles_defaut");
  return entry.valeur;
}

/**
 * Invalide le cache (utilisé après mise à jour du Référentiel)
 */
export function invalidateCache(): void {
  cache.clear();
}
