import { ProfilFiscalComplete } from "@/modules/profil/types";
import { getMillesimeActif } from "@/modules/referentiel";
import { calculTotalPaye } from "./calculPaye";
import { calculTotalRecu, calculCoutEducation } from "./calculRecu";
import { ScoreFiscal } from "./types";
import { validateProfilForScore, handleEdgeCases, safeDivide } from "./validation";
import { calculerScoreConfiance } from "./scoreConfiance";
import { emitGameEvent } from "../gamification/events";
import { saveScoreHistory } from "./history";

/**
 * Calcule le score fiscal complet d'un utilisateur
 */
export async function calculerScoreFiscal(
  profil: Partial<ProfilFiscalComplete>,
  millesime?: string,
  options?: {
    userId?: string;
    useJournalData?: boolean;
  }
): Promise<ScoreFiscal> {
  // Validation du profil
  const validation = validateProfilForScore(profil);
  if (!validation.isValid) {
    throw new Error(`Profil invalide: ${validation.errors.join(", ")}`);
  }
  const millesimeActif = millesime || (await getMillesimeActif());
  const annee = parseInt(millesimeActif);

  // Calcul "Ce que je paie"
  const detailPaye = await calculTotalPaye(profil, millesimeActif, options);
  const totalPaye = Object.values(detailPaye).reduce((sum, val) => sum + val, 0);

  // Calcul du coût éducation
  const enfants = profil.familleServices?.enfants || [];
  const coutEducation =
    enfants.length > 0 ? await calculCoutEducation(enfants, millesimeActif) : 0;

  // Calcul "Ce que je reçois"
  const detailRecu = await calculTotalRecu(profil, coutEducation, millesimeActif);
  const totalRecu =
    Object.values(detailRecu.transfertsDirects).reduce((sum, val) => sum + val, 0) +
    Object.values(detailRecu.servicesMutualises).reduce((sum, val) => sum + val, 0);

  // Calcul du solde et du ratio
  const soldeNet = handleEdgeCases(totalPaye - totalRecu);
  const ratio = safeDivide(totalPaye, totalRecu, 0);

  // Calcul du score de confiance
  const resultConfiance = calculerScoreConfiance(profil);
  const scoreConfiance = resultConfiance.scoreGlobal;

  const score: ScoreFiscal = {
    annee,
    millesime: millesimeActif,
    totalPaye: Math.round(totalPaye),
    detailPaye,
    totalRecu: Math.round(totalRecu),
    detailRecu,
    soldeNet: Math.round(soldeNet),
    ratio: Math.round(ratio * 100) / 100,
    scoreConfiance,
    metadata: {
      sourcesUtilisees: [
        {
          categorie: "BAREME_IR",
          cle: "tranches",
          source: "PLF 2026",
          urlSource: "https://www.legifrance.gouv.fr/",
        },
      ],
      hypotheses: [
        "Dépenses annuelles estimées selon profil type",
        "Consommation de services publics selon moyennes nationales",
      ],
      margeErreurEstimee: 15,
    },
  };

  // Émettre l'événement pour la gamification (seulement si userId fourni)
  if (options?.userId) {
    await emitGameEvent("SCORE_CALCULATED", options.userId, {
      totalPaye: score.totalPaye,
      totalRecu: score.totalRecu,
      soldeNet: score.soldeNet,
      scoreConfiance,
    });

    // Sauvegarder l'historique du score pour le suivi temporel
    try {
      await saveScoreHistory(options.userId, score, scoreConfiance);
      console.log(`[Score] History saved for user ${options.userId}`);
    } catch (error) {
      console.error("[Score] Failed to save score history:", error);
      // Ne pas bloquer le calcul du score si la sauvegarde échoue
    }
  }

  return score;
}

export * from "./types";
export * from "./calculPaye";
export * from "./calculRecu";
export * from "./validation";
export * from "./scoreConfiance";
