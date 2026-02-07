/**
 * Glossaire fiscal - Définitions pédagogiques
 */

export interface TermeGlossaire {
  terme: string;
  definition: string;
  exemple?: string;
  source?: string;
  urlSource?: string;
}

export const GLOSSAIRE: Record<string, TermeGlossaire> = {
  impot_revenu: {
    terme: "Impôt sur le revenu (IR)",
    definition:
      "Impôt direct calculé sur l'ensemble des revenus d'un foyer fiscal. Il est progressif : plus vos revenus sont élevés, plus le taux d'imposition augmente. Calculé par tranches avec un système de quotient familial.",
    exemple:
      "Pour un célibataire avec 30 000€ de revenu net imposable, l'IR est d'environ 2 300€ après décote.",
    source: "Code général des impôts, article 197",
    urlSource: "https://www.legifrance.gouv.fr/",
  },

  csg_crds: {
    terme: "CSG et CRDS",
    definition:
      "Contributions sociales prélevées sur les revenus d'activité et de remplacement pour financer la Sécurité sociale. La CSG (Contribution Sociale Généralisée) représente 9,2% du salaire brut, la CRDS (Contribution au Remboursement de la Dette Sociale) 0,5%.",
    exemple: "Sur un salaire brut de 3 000€, CSG+CRDS = environ 290€.",
    source: "Code de la sécurité sociale",
    urlSource: "https://www.securite-sociale.fr/",
  },

  cotisations_salariales: {
    terme: "Cotisations salariales",
    definition:
      "Cotisations sociales prélevées sur votre salaire brut pour financer la protection sociale (retraite, chômage, maladie). Elles apparaissent sur votre fiche de paie et réduisent votre salaire net.",
    exemple:
      "Sur 3 000€ brut, environ 600€ de cotisations salariales (retraite, chômage, complémentaire).",
    source: "Urssaf",
    urlSource: "https://www.urssaf.fr/",
  },

  cotisations_patronales: {
    terme: "Cotisations patronales",
    definition:
      "Cotisations payées par votre employeur en plus de votre salaire brut. Elles financent la Sécurité sociale (maladie, famille, retraite, accidents du travail). Invisibles sur votre fiche de paie, elles représentent environ 42% du salaire brut.",
    exemple:
      "Pour un salaire brut de 3 000€, l'employeur paie environ 1 260€ de cotisations patronales.",
    source: "Urssaf",
    urlSource: "https://www.urssaf.fr/",
  },

  tva: {
    terme: "TVA (Taxe sur la Valeur Ajoutée)",
    definition:
      "Impôt indirect sur la consommation, inclus dans le prix de vos achats. Taux normal : 20%, taux réduit : 5,5% (alimentation de base) et 10% (restauration, transport).",
    exemple:
      "Sur un achat de 120€ TTC au taux normal (20%), la TVA représente 20€.",
    source: "Direction générale des finances publiques",
    urlSource: "https://www.impots.gouv.fr/",
  },

  ticpe: {
    terme: "TICPE (Taxe Intérieure de Consommation sur les Produits Énergétiques)",
    definition:
      "Taxe sur les carburants (essence, diesel). Elle représente environ 60% du prix à la pompe. Environ 0,69€/litre pour l'essence en 2026.",
    exemple:
      "Pour 50 litres d'essence, environ 34,50€ de TICPE (hors TVA sur le carburant).",
    source: "Douanes françaises",
    urlSource: "https://www.douane.gouv.fr/",
  },

  taxe_fonciere: {
    terme: "Taxe foncière",
    definition:
      "Impôt local payé par les propriétaires immobiliers. Son montant dépend de la valeur locative cadastrale du bien et des taux votés par les collectivités locales.",
    exemple:
      "Pour une maison de valeur locative 8 000€, avec un taux de 30%, la taxe foncière est de 2 400€.",
    source: "Code général des impôts, article 1380",
    urlSource: "https://www.legifrance.gouv.fr/",
  },

  ifi: {
    terme: "IFI (Impôt sur la Fortune Immobilière)",
    definition:
      "Impôt progressif sur le patrimoine immobilier net supérieur à 1,3 million d'euros. Concerne environ 1% des foyers fiscaux.",
    exemple:
      "Patrimoine net de 2 millions d'euros : IFI d'environ 2 500€ après abattement.",
    source: "Code général des impôts, article 964",
    urlSource: "https://www.legifrance.gouv.fr/",
  },

  quotient_familial: {
    terme: "Quotient familial",
    definition:
      "Mécanisme de calcul de l'IR qui divise le revenu imposable par le nombre de parts fiscales du foyer. Cela réduit la progressivité de l'impôt pour les familles.",
    exemple:
      "Couple marié avec 2 enfants = 3 parts. Revenu 60 000€ → quotient = 20 000€/part, ce qui réduit l'impôt.",
    source: "Code général des impôts, article 193",
    urlSource: "https://www.legifrance.gouv.fr/",
  },

  services_mutualises: {
    terme: "Services publics mutualisés",
    definition:
      "Services financés collectivement par l'impôt et accessibles à tous : éducation, santé, sécurité, infrastructure, culture. Leur coût est réparti selon la population.",
    exemple:
      "Éducation d'un enfant au collège : environ 8 780€/an financés par l'État.",
    source: "Ministère de l'Éducation nationale (DEPP)",
    urlSource: "https://www.education.gouv.fr/",
  },

  allocations_familiales: {
    terme: "Allocations familiales",
    definition:
      "Prestations versées par la CAF aux familles avec au moins 2 enfants. Montant modulé selon les revenus.",
    exemple: "Famille 2 enfants, revenus moyens : environ 140€/mois.",
    source: "Caisse d'Allocations Familiales",
    urlSource: "https://www.caf.fr/",
  },

  apl: {
    terme: "APL (Aide Personnalisée au Logement)",
    definition:
      "Aide financière pour payer le loyer ou rembourser un prêt immobilier. Montant calculé selon revenus, loyer et composition du foyer.",
    exemple: "Étudiant, loyer 450€, revenus faibles : APL d'environ 250€/mois.",
    source: "Caisse d'Allocations Familiales",
    urlSource: "https://www.caf.fr/",
  },

  prime_activite: {
    terme: "Prime d'activité",
    definition:
      "Complément de revenus pour les travailleurs modestes (salariés, indépendants). Remplace la prime pour l'emploi.",
    exemple:
      "Salarié célibataire, salaire net 1 400€ : prime d'activité d'environ 150€/mois.",
    source: "Caisse d'Allocations Familiales",
    urlSource: "https://www.caf.fr/",
  },

  plafond_ss: {
    terme: "Plafond de la Sécurité Sociale (PASS)",
    definition:
      "Montant de référence pour le calcul de certaines cotisations sociales. En 2026 : 46 368€ annuels.",
    exemple:
      "Certaines cotisations (retraite de base) sont plafonnées au PASS.",
    source: "Sécurité sociale",
    urlSource: "https://www.securite-sociale.fr/",
  },

  bareme_progressif: {
    terme: "Barème progressif",
    definition:
      "Système d'imposition par tranches : chaque tranche de revenu est imposée à un taux différent, croissant avec le revenu.",
    exemple:
      "Tranche 1 (0-11 294€) : 0%, Tranche 2 (11 295-28 797€) : 11%, etc.",
    source: "Direction générale des finances publiques",
    urlSource: "https://www.impots.gouv.fr/",
  },

  taux_marginal: {
    terme: "Taux marginal d'imposition",
    definition:
      "Taux d'imposition appliqué à votre dernière tranche de revenus. C'est le taux de la tranche la plus élevée que vous atteignez.",
    exemple:
      "Revenu net imposable 35 000€ : votre taux marginal est 30% (tranche 28 797-82 341€).",
    source: "Direction générale des finances publiques",
    urlSource: "https://www.impots.gouv.fr/",
  },

  taux_moyen: {
    terme: "Taux moyen d'imposition",
    definition:
      "Part de vos revenus qui part en impôt sur le revenu. Se calcule : (IR / revenu net imposable) × 100.",
    exemple:
      "Revenu net 35 000€, IR 3 500€ : taux moyen = 10% (bien inférieur au taux marginal de 30%).",
    source: "Direction générale des finances publiques",
    urlSource: "https://www.impots.gouv.fr/",
  },

  decote: {
    terme: "Décote",
    definition:
      "Réduction d'impôt automatique pour les contribuables dont l'IR brut est inférieur à un certain seuil. Elle peut réduire l'impôt à zéro.",
    exemple:
      "IR brut 800€, célibataire : décote de 550€ → IR final 250€ seulement.",
    source: "Code général des impôts, article 197",
    urlSource: "https://www.legifrance.gouv.fr/",
  },

  contributeur_net: {
    terme: "Contributeur net",
    definition:
      "Personne qui paie plus à l'État (impôts + cotisations + taxes) qu'elle ne reçoit (transferts + services publics). Solde fiscal positif.",
    exemple:
      "Cadre célibataire : paie 25 000€, reçoit 8 000€ de services → contributeur net de 17 000€.",
  },

  beneficiaire_net: {
    terme: "Bénéficiaire net",
    definition:
      "Personne qui reçoit plus de l'État (transferts + services publics) qu'elle ne paie (impôts + cotisations + taxes). Solde fiscal négatif.",
    exemple:
      "Famille nombreuse, revenus modestes : paie 8 000€, reçoit 18 000€ → bénéficiaire net de 10 000€.",
  },
};

export function getTerme(cle: string): TermeGlossaire | undefined {
  return GLOSSAIRE[cle];
}

export function rechercherTermes(query: string): TermeGlossaire[] {
  const q = query.toLowerCase();
  return Object.values(GLOSSAIRE).filter(
    (terme) =>
      terme.terme.toLowerCase().includes(q) ||
      terme.definition.toLowerCase().includes(q)
  );
}
