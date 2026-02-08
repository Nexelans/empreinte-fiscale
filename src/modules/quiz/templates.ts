/**
 * Quiz Templates
 * Question templates with placeholders for personalization
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct answer
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  relatedGlossaryTerms?: string[];
}

export interface QuizTemplate {
  id: string;
  question: string; // With {{placeholders}}
  options: string[]; // With {{placeholders}}
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  requiredData: string[]; // Which user data is needed
  relatedGlossaryTerms?: string[];
}

/**
 * Quiz templates with placeholders for personalization
 * Format: {{variableName}}
 */
export const QUIZ_TEMPLATES: QuizTemplate[] = [
  // IR Templates
  {
    id: "ir-amount-personal",
    question: "Vous payez environ {{irAnnuel}}€ d'impôt sur le revenu par an. Combien représente-t-il par mois ?",
    options: [
      "{{irMensuelFaux1}}€",
      "{{irMensuelCorrect}}€",
      "{{irMensuelFaux2}}€",
      "{{irMensuelFaux3}}€",
    ],
    correctAnswer: 1,
    explanation: "L'impôt sur le revenu est prélevé mensuellement. {{irAnnuel}}€ ÷ 12 = {{irMensuelCorrect}}€ par mois.",
    difficulty: "easy",
    category: "Impôt sur le revenu",
    requiredData: ["irAnnuel"],
    relatedGlossaryTerms: ["impot-revenu", "prelevement-source"],
  },
  {
    id: "ir-tranche-personal",
    question: "Avec un revenu imposable de {{revenuImposable}}€, vous êtes dans la tranche marginale d'imposition de {{tranche}}%. Que signifie cela ?",
    options: [
      "Vous payez {{tranche}}% sur tous vos revenus",
      "Vous payez {{tranche}}% uniquement sur la partie de vos revenus au-dessus du seuil de cette tranche",
      "Vous payez {{tranche}}% moins d'impôts que les autres",
      "C'est votre taux d'imposition effectif",
    ],
    correctAnswer: 1,
    explanation: "Le taux marginal s'applique uniquement à la tranche de revenus concernée, pas à l'ensemble. Votre taux effectif est inférieur à {{tranche}}%.",
    difficulty: "medium",
    category: "Impôt sur le revenu",
    requiredData: ["revenuImposable", "tranche"],
    relatedGlossaryTerms: ["tranche-marginale", "taux-effectif"],
  },

  // CSG/CRDS Templates
  {
    id: "csg-amount-personal",
    question: "Vous payez {{csgAnnuel}}€ de CSG/CRDS par an. À quoi sert principalement la CSG ?",
    options: [
      "Financer les retraites",
      "Financer la Sécurité sociale (santé, famille, dépendance)",
      "Réduire la dette publique",
      "Financer l'éducation nationale",
    ],
    correctAnswer: 1,
    explanation: "La CSG finance principalement la Sécurité sociale. Sur vos {{csgAnnuel}}€, environ 85% vont à l'assurance maladie et famille.",
    difficulty: "easy",
    category: "Cotisations sociales",
    requiredData: ["csgAnnuel"],
    relatedGlossaryTerms: ["csg", "securite-sociale"],
  },

  // Cotisations Templates
  {
    id: "cotisations-patronales-personal",
    question: "Votre employeur paie environ {{cotisationsPatronales}}€ de cotisations patronales pour vous. Cela représente quel pourcentage de votre salaire brut ?",
    options: [
      "Environ 10%",
      "Environ 25%",
      "Environ 42%",
      "Environ 60%",
    ],
    correctAnswer: 2,
    explanation: "Les cotisations patronales représentent environ 42% du salaire brut. C'est une partie invisible du 'coût du travail' pour l'employeur.",
    difficulty: "medium",
    category: "Cotisations sociales",
    requiredData: ["cotisationsPatronales", "salaireBrut"],
    relatedGlossaryTerms: ["cotisations-patronales", "cout-travail"],
  },

  // TVA Templates
  {
    id: "tva-daily-personal",
    question: "Vous payez environ {{tvaQuotidienne}}€ de TVA par jour. Sur un achat de 100€ TTC à 20%, combien y a-t-il de TVA ?",
    options: [
      "20€",
      "16,67€",
      "25€",
      "18€",
    ],
    correctAnswer: 1,
    explanation: "Sur 100€ TTC à 20%, la TVA est de 16,67€ (100 ÷ 1,20 × 0,20). Le prix HT est de 83,33€.",
    difficulty: "medium",
    category: "TVA",
    requiredData: ["tvaQuotidienne"],
    relatedGlossaryTerms: ["tva", "prix-ttc"],
  },

  // Services publics Templates
  {
    id: "education-cost-personal",
    question: "L'État dépense environ {{coutEducation}}€ par an pour la scolarité de vos {{nbEnfants}} enfant(s). Combien coûte environ un élève de collège par an ?",
    options: [
      "4 000€",
      "8 000€",
      "12 000€",
      "16 000€",
    ],
    correctAnswer: 1,
    explanation: "Un collégien coûte environ 8 000€ par an à l'État (enseignants, bâtiments, équipements). C'est pourquoi l'éducation est gratuite !",
    difficulty: "easy",
    category: "Services publics",
    requiredData: ["coutEducation", "nbEnfants"],
    relatedGlossaryTerms: ["education-nationale", "services-publics"],
  },
  {
    id: "sante-remboursements-personal",
    question: "Vous bénéficiez d'environ {{remboursementsSante}}€ de remboursements santé par an. Quel pourcentage des dépenses de santé est pris en charge par la Sécurité sociale en France ?",
    options: [
      "Environ 50%",
      "Environ 60%",
      "Environ 78%",
      "Environ 90%",
    ],
    correctAnswer: 2,
    explanation: "La Sécurité sociale prend en charge environ 78% des dépenses de santé en France, ce qui est l'un des taux les plus élevés au monde.",
    difficulty: "medium",
    category: "Services publics",
    requiredData: ["remboursementsSante"],
    relatedGlossaryTerms: ["securite-sociale", "assurance-maladie"],
  },

  // Solde net Templates
  {
    id: "solde-net-personal",
    question: "Votre solde fiscal net est de {{soldeNet}}€. Qu'est-ce que cela signifie ?",
    options: [
      "C'est l'argent qui vous reste après impôts",
      "C'est la différence entre ce que vous payez et ce que vous recevez de l'État",
      "C'est votre salaire net",
      "C'est le montant que vous devez à l'État",
    ],
    correctAnswer: 1,
    explanation: "Le solde net représente ce que vous payez (impôts + cotisations + taxes) moins ce que vous recevez (transferts + services valorisés). {{soldeNetExplication}}",
    difficulty: "medium",
    category: "Score fiscal",
    requiredData: ["soldeNet"],
    relatedGlossaryTerms: ["solde-net", "contributeur-net"],
  },

  // Ratio Templates
  {
    id: "ratio-personal",
    question: "Votre ratio fiscal est de {{ratio}}. Cela signifie que pour chaque euro que vous recevez, vous payez :",
    options: [
      "{{ratioFaux1}}€",
      "{{ratioCorrect}}€",
      "{{ratioFaux2}}€",
      "{{ratioFaux3}}€",
    ],
    correctAnswer: 1,
    explanation: "Un ratio de {{ratio}} signifie que vous {{ratioExplication}}. C'est votre position dans la solidarité nationale.",
    difficulty: "easy",
    category: "Score fiscal",
    requiredData: ["ratio"],
    relatedGlossaryTerms: ["ratio-fiscal", "solidarite"],
  },

  // Generic templates (always available)
  {
    id: "ir-tranches-generic",
    question: "Combien y a-t-il de tranches d'imposition pour l'impôt sur le revenu en France en 2026 ?",
    options: ["3 tranches", "5 tranches", "7 tranches", "10 tranches"],
    correctAnswer: 1,
    explanation: "Il y a 5 tranches : 0%, 11%, 30%, 41%, et 45%. Chaque tranche s'applique uniquement à la partie du revenu concernée.",
    difficulty: "easy",
    category: "Impôt sur le revenu",
    requiredData: [],
    relatedGlossaryTerms: ["impot-revenu", "bareme-progressif"],
  },
  {
    id: "csg-taux-generic",
    question: "Quel est le taux de CSG sur les revenus d'activité salariée ?",
    options: ["7,5%", "9,2%", "11%", "15,5%"],
    correctAnswer: 1,
    explanation: "Le taux de CSG sur les revenus d'activité est de 9,2% (dont 6,8% déductibles). Elle finance la Sécurité sociale.",
    difficulty: "medium",
    category: "Cotisations sociales",
    requiredData: [],
    relatedGlossaryTerms: ["csg", "revenus-activite"],
  },
  {
    id: "tva-taux-generic",
    question: "Quel est le taux de TVA standard en France ?",
    options: ["10%", "15%", "20%", "25%"],
    correctAnswer: 2,
    explanation: "Le taux normal de TVA est de 20%. Il existe aussi des taux réduits : 10%, 5,5% et 2,1% pour certains produits.",
    difficulty: "easy",
    category: "TVA",
    requiredData: [],
    relatedGlossaryTerms: ["tva", "taux-normal"],
  },
];
