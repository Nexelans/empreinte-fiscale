import {
  ProfilFiscalComplete,
  DataStatus,
  DATA_WEIGHTS,
  STATUS_COEFFICIENTS,
} from "@/modules/profil/types";

/**
 * Détail du score de confiance par catégorie
 */
export interface ScoreConfianceDetail {
  categorie: string;
  score: number;
  poids: number;
  contribution: number;
}

/**
 * Résultat complet du calcul de confiance
 */
export interface ResultatScoreConfiance {
  scoreGlobal: number;
  details: ScoreConfianceDetail[];
  nombreChampsVerifies: number;
  nombreChampsTotal: number;
  tauxCompletude: number;
  recommandations: string[];
}

/**
 * Calcule le score de confiance global à partir du profil
 */
export function calculerScoreConfiance(
  profil: Partial<ProfilFiscalComplete>
): ResultatScoreConfiance {
  const details: ScoreConfianceDetail[] = [];
  const statusData = profil.statusData || {};
  const recommandations: string[] = [];

  let poidsTotal = 0;
  let scoreTotal = 0;
  let nombreChampsVerifies = 0;
  let nombreChampsTotal = 0;

  // Revenus (poids important)
  const champsRevenus = [
    { field: "salaireBrut", label: "Salaire brut", weight: DATA_WEIGHTS.salaireBrut },
    { field: "salaireNet", label: "Salaire net", weight: DATA_WEIGHTS.salaireNet },
    {
      field: "revenusFonciers",
      label: "Revenus fonciers",
      weight: DATA_WEIGHTS.revenusFonciers,
    },
    {
      field: "revenusCapitaux",
      label: "Revenus de capitaux",
      weight: DATA_WEIGHTS.revenusCapitaux,
    },
  ];

  for (const champ of champsRevenus) {
    const valeur = profil.revenus?.[champ.field as keyof typeof profil.revenus];
    if (valeur !== null && valeur !== undefined) {
      nombreChampsTotal++;
      const status: DataStatus = statusData[champ.field] || "ESTIME";
      const coefficient = STATUS_COEFFICIENTS[status];
      const weight = champ.weight || 0;
      const contribution = weight * coefficient;

      poidsTotal += weight;
      scoreTotal += contribution;

      details.push({
        categorie: `Revenus - ${champ.label}`,
        score: Math.round(coefficient * 100),
        poids: weight,
        contribution,
      });

      if (status === "VERIFIE") {
        nombreChampsVerifies++;
      } else if (status === "ESTIME") {
        recommandations.push(
          `Vérifiez ${champ.label.toLowerCase()} pour améliorer votre score`
        );
      }
    }
  }

  // Patrimoine
  if (profil.patrimoine?.patrimoineIFI !== null && profil.patrimoine?.patrimoineIFI !== undefined) {
    nombreChampsTotal++;
    const status: DataStatus = statusData.patrimoineIFI || "DECLARE";
    const coefficient = STATUS_COEFFICIENTS[status];
    const weight = DATA_WEIGHTS.patrimoineIFI || 0;
    const contribution = weight * coefficient;

    poidsTotal += weight;
    scoreTotal += contribution;

    details.push({
      categorie: "Patrimoine - IFI",
      score: Math.round(coefficient * 100),
      poids: weight,
      contribution,
    });

    if (status === "VERIFIE") nombreChampsVerifies++;
  }

  if (profil.patrimoine?.taxeFonciere) {
    nombreChampsTotal++;
    const status: DataStatus = statusData.taxeFonciere || "DECLARE";
    const coefficient = STATUS_COEFFICIENTS[status];
    const weight = DATA_WEIGHTS.taxeFonciere || 0;
    const contribution = weight * coefficient;

    poidsTotal += weight;
    scoreTotal += contribution;

    details.push({
      categorie: "Patrimoine - Taxe foncière",
      score: Math.round(coefficient * 100),
      poids: weight,
      contribution,
    });

    if (status === "VERIFIE") nombreChampsVerifies++;
  }

  // Consommation
  if (profil.consommation?.mode) {
    nombreChampsTotal++;
    const status: DataStatus = statusData.consommation || "ESTIME";
    const coefficient = STATUS_COEFFICIENTS[status];

    let weight = DATA_WEIGHTS.budgetMensuel || 0;
    if (profil.consommation.mode === "detaille") {
      weight = DATA_WEIGHTS.consommationDetaillee || 0;
    }

    const contribution = weight * coefficient;
    poidsTotal += weight;
    scoreTotal += contribution;

    details.push({
      categorie: "Consommation",
      score: Math.round(coefficient * 100),
      poids: weight,
      contribution,
    });

    if (status === "VERIFIE") nombreChampsVerifies++;
    else if (status === "ESTIME" && profil.consommation.mode === "profil_type") {
      recommandations.push(
        "Saisissez vos dépenses réelles pour un calcul plus précis de la TVA"
      );
    }
  }

  // Famille
  if (profil.familleServices?.nombreEnfants) {
    nombreChampsTotal++;
    const status: DataStatus = statusData.nombreEnfants || "DECLARE";
    const coefficient = STATUS_COEFFICIENTS[status];
    const weight = DATA_WEIGHTS.nombreEnfants || 0;
    const contribution = weight * coefficient;

    poidsTotal += weight;
    scoreTotal += contribution;

    details.push({
      categorie: "Famille - Nombre d'enfants",
      score: Math.round(coefficient * 100),
      poids: weight,
      contribution,
    });

    if (status === "VERIFIE") nombreChampsVerifies++;

    // Vérifier cohérence enfants
    const enfantsDetails = profil.familleServices.enfants?.length || 0;
    if (enfantsDetails < profil.familleServices.nombreEnfants) {
      recommandations.push(
        "Complétez les détails de vos enfants pour un calcul précis du coût éducation"
      );
    }
  }

  // Aides
  if (profil.familleServices?.aides) {
    const aides = profil.familleServices.aides;
    if (aides.caf || aides.apl || aides.rsa || aides.chomage || aides.bourses) {
      nombreChampsTotal++;
      const status: DataStatus = statusData.aides || "DECLARE";
      const coefficient = STATUS_COEFFICIENTS[status];
      const weight = DATA_WEIGHTS.aides || 0;
      const contribution = weight * coefficient;

      poidsTotal += weight;
      scoreTotal += contribution;

      details.push({
        categorie: "Aides sociales",
        score: Math.round(coefficient * 100),
        poids: weight,
        contribution,
      });

      if (status === "VERIFIE") nombreChampsVerifies++;
      else {
        recommandations.push(
          "Uploadez vos justificatifs d'aides pour vérifier les montants"
        );
      }
    }
  }

  // Calcul du score global (0-100)
  const scoreGlobal =
    poidsTotal > 0 ? Math.round((scoreTotal / poidsTotal) * 100) : 0;

  // Taux de complétude
  const tauxCompletude =
    nombreChampsTotal > 0 ? Math.round((nombreChampsVerifies / nombreChampsTotal) * 100) : 0;

  // Recommandations générales
  if (scoreGlobal < 50) {
    recommandations.unshift(
      "Score de confiance faible. Uploadez vos documents fiscaux pour améliorer la précision."
    );
  } else if (scoreGlobal < 70) {
    recommandations.unshift(
      "Score de confiance moyen. Quelques données sont estimées."
    );
  }

  if (nombreChampsVerifies === 0) {
    recommandations.push(
      "Aucune donnée vérifiée. Uploadez votre bulletin de paie ou avis d'imposition."
    );
  }

  return {
    scoreGlobal,
    details,
    nombreChampsVerifies,
    nombreChampsTotal,
    tauxCompletude,
    recommandations: Array.from(new Set(recommandations)), // Déduplicate
  };
}

/**
 * Met à jour le statut d'un champ après upload de document
 */
export function marquerChampVerifie(
  statusData: Record<string, DataStatus>,
  field: string
): Record<string, DataStatus> {
  return {
    ...statusData,
    [field]: "VERIFIE",
  };
}

/**
 * Met à jour plusieurs champs après upload de document
 */
export function marquerChampsVerifies(
  statusData: Record<string, DataStatus>,
  fields: string[]
): Record<string, DataStatus> {
  const updated = { ...statusData };
  for (const field of fields) {
    updated[field] = "VERIFIE";
  }
  return updated;
}

/**
 * Obtient la couleur à afficher pour un score
 */
export function getCouleurScore(score: number): string {
  if (score >= 80) return "green";
  if (score >= 60) return "blue";
  if (score >= 40) return "orange";
  return "red";
}

/**
 * Obtient l'icône à afficher pour un statut
 */
export function getIconeStatut(statut: DataStatus): string {
  switch (statut) {
    case "VERIFIE":
      return "🟢";
    case "DECLARE":
      return "🟡";
    case "ESTIME":
      return "🔴";
    default:
      return "⚪";
  }
}

/**
 * Obtient le label pour un statut
 */
export function getLabelStatut(statut: DataStatus): string {
  switch (statut) {
    case "VERIFIE":
      return "Vérifié";
    case "DECLARE":
      return "Déclaré";
    case "ESTIME":
      return "Estimé";
    default:
      return "Inconnu";
  }
}
