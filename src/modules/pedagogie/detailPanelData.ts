import { DetailPanelProps } from "@/components/pedagogie/DetailPanel";

/**
 * Données pédagogiques pour les DetailPanels du dashboard
 * Contient les formules, sources et explications pour chaque ligne fiscale
 */

export function getImpotRevenuDetail(montant: number, revenuNet: number, nombreParts: number): DetailPanelProps {
  return {
    titre: "Impôt sur le revenu (IR)",
    montant,
    description:
      "Impôt progressif calculé sur votre revenu net imposable selon le barème par tranches. Le quotient familial divise votre revenu par le nombre de parts pour réduire la progressivité.",
    formule: "IR = Σ(tranches × taux) × nombreParts - décote",
    etapes: [
      {
        label: "Revenu net imposable",
        formula: `${revenuNet.toLocaleString("fr-FR")} €`,
        result: revenuNet,
      },
      {
        label: `Quotient familial (${nombreParts} parts)`,
        formula: `${revenuNet.toLocaleString("fr-FR")} ÷ ${nombreParts}`,
        result: Math.round(revenuNet / nombreParts),
      },
      {
        label: "Application du barème progressif",
        formula: "0% jusqu'à 11 294€, puis 11%, 30%, 41%, 45%",
        result: montant,
      },
    ],
    sources: [
      {
        nom: "Code général des impôts, article 197",
        url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000047450983",
        date: "2026",
      },
      {
        nom: "Barème de l'impôt sur le revenu 2026",
        url: "https://www.impots.gouv.fr/",
      },
    ],
    hypotheses: [
      "Barème officiel 2026 du PLF",
      "Revenu net imposable après déductions",
      "Décote appliquée si éligible",
    ],
    statut: "estime",
    icon: "📊",
  };
}

export function getCsgCrdsDetail(montant: number, salaireBrut: number): DetailPanelProps {
  return {
    titre: "CSG et CRDS",
    montant,
    description:
      "Contributions sociales prélevées à la source pour financer la Sécurité sociale. CSG : 9,2% du salaire brut. CRDS : 0,5% du salaire brut.",
    formule: "CSG + CRDS = salaireBrut × 9,7%",
    etapes: [
      {
        label: "Salaire brut annuel",
        formula: `${salaireBrut.toLocaleString("fr-FR")} €`,
        result: salaireBrut,
      },
      {
        label: "CSG (9,2%)",
        formula: `${salaireBrut.toLocaleString("fr-FR")} × 0.092`,
        result: Math.round(salaireBrut * 0.092),
      },
      {
        label: "CRDS (0,5%)",
        formula: `${salaireBrut.toLocaleString("fr-FR")} × 0.005`,
        result: Math.round(salaireBrut * 0.005),
      },
    ],
    sources: [
      {
        nom: "Code de la sécurité sociale - CSG/CRDS",
        url: "https://www.securite-sociale.fr/",
        date: "2026",
      },
      {
        nom: "Urssaf - Taux de cotisations",
        url: "https://www.urssaf.fr/",
      },
    ],
    hypotheses: ["Taux CSG 9,2% et CRDS 0,5% en vigueur"],
    statut: "estime",
    icon: "💼",
  };
}

export function getCotisationsSalarialesDetail(montant: number, salaireBrut: number): DetailPanelProps {
  return {
    titre: "Cotisations salariales",
    montant,
    description:
      "Cotisations prélevées sur votre salaire brut pour financer votre protection sociale : retraite de base et complémentaire, chômage, maladie. Environ 22% du salaire brut.",
    formule: "Cotisations = salaireBrut × taux (vieillesse + retraite complémentaire + chômage)",
    etapes: [
      {
        label: "Salaire brut annuel",
        formula: `${salaireBrut.toLocaleString("fr-FR")} €`,
        result: salaireBrut,
      },
      {
        label: "Taux global moyen",
        formula: "≈ 22%",
        result: montant,
      },
    ],
    sources: [
      {
        nom: "Urssaf - Cotisations salariales",
        url: "https://www.urssaf.fr/",
      },
    ],
    hypotheses: ["Cotisations sociales standard (hors cadres dirigeants)"],
    statut: "estime",
    icon: "👤",
  };
}

export function getCotisationsPatronalesDetail(montant: number, salaireBrut: number): DetailPanelProps {
  return {
    titre: "Cotisations patronales",
    montant,
    description:
      "Cotisations payées par votre employeur en plus de votre salaire brut. Elles financent la Sécurité sociale (maladie, famille, retraite, chômage). Invisibles sur votre fiche de paie, elles représentent environ 42% du salaire brut.",
    formule: "Cotisations patronales = salaireBrut × 42%",
    etapes: [
      {
        label: "Salaire brut annuel",
        formula: `${salaireBrut.toLocaleString("fr-FR")} €`,
        result: salaireBrut,
      },
      {
        label: "Taux moyen (42%)",
        formula: `${salaireBrut.toLocaleString("fr-FR")} × 0.42`,
        result: montant,
      },
      {
        label: "Coût total du travail",
        formula: `${salaireBrut.toLocaleString("fr-FR")} + ${montant.toLocaleString("fr-FR")}`,
        result: salaireBrut + montant,
      },
    ],
    sources: [
      {
        nom: "Urssaf - Cotisations patronales",
        url: "https://www.urssaf.fr/",
      },
    ],
    hypotheses: [
      "Taux moyen 42% (maladie, famille, retraite, chômage, accidents du travail)",
      "Ces cotisations sont du coût du travail invisible pour le salarié",
    ],
    statut: "estime",
    icon: "🏢",
  };
}

export function getTVADetail(montant: number, depensesAnnuelles: number): DetailPanelProps {
  return {
    titre: "TVA (Taxe sur la Valeur Ajoutée)",
    montant,
    description:
      "Taxe indirecte sur votre consommation, incluse dans tous vos achats. Taux : 20% (normal), 10% (restauration), 5,5% (alimentation), 2,1% (médicaments). Montant estimé selon votre profil de consommation.",
    formule: "TVA = Σ(dépenses × taux TVA par catégorie)",
    etapes: [
      {
        label: "Dépenses annuelles estimées",
        formula: `${depensesAnnuelles.toLocaleString("fr-FR")} €`,
        result: depensesAnnuelles,
      },
      {
        label: "Répartition par taux",
        formula: "50% à 20%, 25% à 10%, 20% à 5.5%, 5% à 2.1%",
        result: montant,
      },
    ],
    sources: [
      {
        nom: "Direction générale des finances publiques - TVA",
        url: "https://www.impots.gouv.fr/",
      },
    ],
    hypotheses: [
      "Dépenses annuelles estimées selon votre profil de consommation",
      "Répartition moyenne des achats par taux de TVA",
      "Scanez vos tickets pour un calcul plus précis !",
    ],
    statut: "estime",
    icon: "🛒",
  };
}

export function getTaxeFonciereDetail(montant: number): DetailPanelProps {
  return {
    titre: "Taxe foncière",
    montant,
    description:
      "Impôt local payé par les propriétaires pour financer les services municipaux (écoles, voirie, éclairage). Calculé sur la valeur locative cadastrale × taux votés par la commune.",
    formule: "Taxe foncière = valeur locative × taux communaux",
    sources: [
      {
        nom: "Code général des impôts - Taxe foncière",
        url: "https://www.legifrance.gouv.fr/",
      },
    ],
    hypotheses: ["Montant déclaré ou estimé selon votre commune"],
    statut: montant > 0 ? "declare" : "estime",
    icon: "🏠",
  };
}

export function getIFIDetail(montant: number, patrimoine: number): DetailPanelProps {
  return {
    titre: "IFI (Impôt sur la Fortune Immobilière)",
    montant,
    description:
      "Impôt progressif sur le patrimoine immobilier net supérieur à 1,3 million d'euros. Taux de 0,5% à 1,5% selon les tranches.",
    formule: "IFI = Σ(tranches patrimoine × taux)",
    etapes: patrimoine > 1300000 ? [
      {
        label: "Patrimoine immobilier net",
        formula: `${patrimoine.toLocaleString("fr-FR")} €`,
        result: patrimoine,
      },
      {
        label: "Patrimoine taxable (après abattement)",
        formula: `${patrimoine.toLocaleString("fr-FR")} - 800 000`,
        result: patrimoine - 800000,
      },
      {
        label: "IFI calculé par tranches",
        formula: "0.5% à 1.5% selon tranches",
        result: montant,
      },
    ] : [],
    sources: [
      {
        nom: "Code général des impôts - IFI",
        url: "https://www.legifrance.gouv.fr/",
      },
    ],
    hypotheses: montant > 0 ? ["Patrimoine immobilier net déclaré"] : ["Patrimoine < 1,3 M€ : pas d'IFI"],
    statut: montant > 0 ? "declare" : "estime",
    icon: "🏛️",
  };
}

export function getAllocationsDetail(montant: number, nombreEnfants: number): DetailPanelProps {
  return {
    titre: "Allocations familiales",
    montant,
    description:
      "Prestations versées par la CAF aux familles avec au moins 2 enfants. Montant modulé selon vos revenus.",
    formule: "Allocations = montant de base × nombre d'enfants × coefficient revenus",
    etapes: nombreEnfants >= 2 ? [
      {
        label: `Famille avec ${nombreEnfants} enfants`,
        formula: "Montant de base modulé",
        result: montant,
      },
    ] : [],
    sources: [
      {
        nom: "Caisse d'Allocations Familiales",
        url: "https://www.caf.fr/",
      },
    ],
    hypotheses: nombreEnfants >= 2 ? ["Allocations modulées selon vos revenus"] : ["Moins de 2 enfants : pas d'allocations familiales"],
    statut: "estime",
    icon: "👨‍👩‍👧‍👦",
  };
}

export function getEducationDetail(montant: number, enfants: any[]): DetailPanelProps {
  const details = enfants.map(e => {
    const couts: Record<string, number> = {
      maternelle: 7000,
      primaire: 7000,
      college: 8780,
      lycee: 11200,
      superieur_public: 11530,
    };
    return {
      niveau: e.niveauScolaire,
      cout: couts[e.niveauScolaire] || 7000,
    };
  });

  return {
    titre: "Éducation",
    montant,
    description:
      "Coût de l'éducation publique financé par l'État pour vos enfants. Comprend les enseignants, bâtiments, matériel, cantines, activités périscolaires.",
    formule: "Coût éducation = Σ(coût par niveau scolaire)",
    etapes: details.map((d, i) => ({
      label: `Enfant ${i + 1} (${d.niveau})`,
      formula: `${d.cout.toLocaleString("fr-FR")} € / an`,
      result: d.cout,
    })),
    sources: [
      {
        nom: "DEPP - Ministère de l'Éducation nationale",
        url: "https://www.education.gouv.fr/",
        date: "2025",
      },
    ],
    hypotheses: [
      "Coût moyen par élève (établissement public)",
      "Primaire: 7 000€, Collège: 8 780€, Lycée: 11 200€, Supérieur: 11 530€",
    ],
    statut: "estime",
    icon: "🎓",
  };
}

export function getRemboursementsSanteDetail(montant: number): DetailPanelProps {
  return {
    titre: "Remboursements santé (transferts directs)",
    montant,
    description:
      "Montants que la Sécurité sociale vous rembourse directement pour vos consultations médicales, médicaments, hospitalisations. C'est de l'argent qui arrive sur votre compte bancaire ou celui de votre médecin/pharmacien. Distinct du coût global du système de santé (voir 'Santé' dans les services mutualisés).",
    formule: "Remboursements = consultations remboursées + médicaments remboursés + hospitalisations",
    sources: [
      {
        nom: "Assurance Maladie",
        url: "https://www.ameli.fr/",
      },
    ],
    hypotheses: [
      "Estimation selon votre fréquence de consultation déclarée",
      "Taux de remboursement moyens de la Sécurité sociale",
      "Ne comprend pas les remboursements de votre mutuelle complémentaire",
    ],
    statut: "estime",
    icon: "💊",
  };
}

export function getSanteDetail(montant: number): DetailPanelProps {
  return {
    titre: "Santé (système public mutualisé)",
    montant,
    description:
      "Coût global du système de santé public dont vous bénéficiez : hôpitaux publics (bâtiments, équipements, personnel soignant), recherche médicale, prévention, veille sanitaire. Ce n'est PAS de l'argent que vous recevez directement, mais la valeur des infrastructures et services financés par l'impôt dont vous profitez. Réparti selon la moyenne nationale par habitant.",
    formule: "Santé = (budget hôpitaux + personnel soignant + équipements + prévention) / population",
    etapes: [
      {
        label: "Budget santé publique national",
        formula: "Projet de Loi de Finances 2026",
        result: montant,
      },
      {
        label: "Répartition par habitant",
        formula: "Budget total / 67 millions d'habitants",
        result: montant,
      },
    ],
    sources: [
      {
        nom: "Ministère de la Santé - Comptes de la santé",
        url: "https://sante.gouv.fr/",
      },
      {
        nom: "Projet de Loi de Finances 2026",
        url: "https://www.budget.gouv.fr/",
      },
    ],
    hypotheses: [
      "Répartition moyenne nationale par habitant",
      "Comprend : hôpitaux publics, personnel médical, équipements, recherche",
      "Ne comprend PAS vos remboursements directs (voir 'Remboursements santé')",
    ],
    statut: "estime",
    icon: "🏥",
  };
}

export function getSecuriteDetail(montant: number): DetailPanelProps {
  return {
    titre: "Sécurité",
    montant,
    description:
      "Budget sécurité (police, gendarmerie, justice, armée, renseignement) réparti par habitant. Assure la défense nationale et la sécurité intérieure.",
    formule: "Sécurité = (budget défense + police + justice) / population",
    sources: [
      {
        nom: "Projet de Loi de Finances 2026",
        url: "https://www.budget.gouv.fr/",
      },
    ],
    hypotheses: ["Répartition uniforme du budget sécurité par habitant"],
    statut: "estime",
    icon: "🛡️",
  };
}

export function getInfrastructureDetail(montant: number): DetailPanelProps {
  return {
    titre: "Infrastructure",
    montant,
    description:
      "Budget routes, transports, aménagement du territoire réparti par habitant. Entretien et développement des infrastructures publiques.",
    formule: "Infrastructure = budget infrastructure / population",
    sources: [
      {
        nom: "Ministère de la Transition écologique",
        url: "https://www.ecologie.gouv.fr/",
      },
    ],
    hypotheses: ["Répartition uniforme du budget infrastructure"],
    statut: "estime",
    icon: "🚧",
  };
}
