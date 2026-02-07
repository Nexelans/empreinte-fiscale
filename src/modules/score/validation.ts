import { ProfilFiscalComplete } from "@/modules/profil/types";

/**
 * Validation des données du profil avant calcul
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProfilForScore(
  profil: Partial<ProfilFiscalComplete>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérification revenus
  if (profil.revenus?.salaireBrut && profil.revenus?.salaireNet) {
    if (profil.revenus.salaireNet > profil.revenus.salaireBrut) {
      errors.push("Le salaire net ne peut pas être supérieur au salaire brut");
    }
  }

  // Vérification parts fiscales
  if (profil.situation?.nombreParts) {
    if (profil.situation.nombreParts < 1) {
      errors.push("Le nombre de parts fiscales doit être au moins 1");
    }
    if (profil.situation.nombreParts > 10) {
      warnings.push("Nombre de parts fiscales inhabituellement élevé");
    }
  }

  // Vérification patrimoine IFI
  if (profil.patrimoine?.patrimoineIFI) {
    if (profil.patrimoine.patrimoineIFI < 0) {
      errors.push("Le patrimoine IFI ne peut pas être négatif");
    }
  }

  // Vérification nombre d'enfants
  if (profil.familleServices?.nombreEnfants) {
    if (profil.familleServices.nombreEnfants < 0) {
      errors.push("Le nombre d'enfants ne peut pas être négatif");
    }
    const enfantsDetails = profil.familleServices.enfants?.length || 0;
    if (enfantsDetails > 0 && enfantsDetails !== profil.familleServices.nombreEnfants) {
      warnings.push(
        `Le nombre d'enfants déclaré (${profil.familleServices.nombreEnfants}) ne correspond pas au nombre de détails fournis (${enfantsDetails})`
      );
    }
  }

  // Vérification âge
  if (profil.situation?.age) {
    if (profil.situation.age < 18) {
      warnings.push("Âge inférieur à 18 ans");
    }
    if (profil.situation.age > 120) {
      errors.push("Âge invalide");
    }
  }

  // Vérification cohérence revenus fonciers et propriété
  if (profil.revenus?.revenusFonciers && profil.revenus.revenusFonciers > 0) {
    if (profil.patrimoine?.proprietaire === false) {
      warnings.push("Revenus fonciers déclarés mais vous n'êtes pas propriétaire");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gestion des cas limites dans les calculs
 * Note: Le solde net PEUT être négatif (bénéficiaire net)
 */
export function handleEdgeCases(value: number): number {
  // Arrondi à 2 décimales
  const rounded = Math.round(value * 100) / 100;

  // Retourne la valeur arrondie sans forcer à positif
  // (le solde net peut être négatif si bénéficiaire net)
  return rounded;
}

/**
 * Sécurisation des divisions par zéro
 */
export function safeDivide(numerator: number, denominator: number, defaultValue = 0): number {
  if (denominator === 0) {
    return defaultValue;
  }
  return numerator / denominator;
}
