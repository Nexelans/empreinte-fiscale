/**
 * Questions du quiz fiscal
 * Conçu pour être pédagogique et révéler les taxes invisibles
 */

export interface QuestionQuiz {
  id: string;
  question: string;
  options: Array<{
    id: string;
    texte: string;
  }>;
  reponseCorrecte: string;
  explication: string;
  source?: string;
  urlSource?: string;
  difficulte: "facile" | "moyen" | "difficile";
  categorie:
    | "impots_directs"
    | "impots_indirects"
    | "cotisations"
    | "services_publics"
    | "culture_generale";
}

export const QUESTIONS_QUIZ: QuestionQuiz[] = [
  {
    id: "q1",
    question:
      "Combien un Français moyen paie-t-il de TVA par an (environ) ?",
    options: [
      { id: "a", texte: "500 €" },
      { id: "b", texte: "2 000 €" },
      { id: "c", texte: "3 500 €" },
      { id: "d", texte: "5 000 €" },
    ],
    reponseCorrecte: "c",
    explication:
      "Un Français moyen dépense environ 20 000€ par an en consommation. Avec une TVA moyenne pondérée de 17%, cela représente environ 3 500€ de TVA payée chaque année, souvent sans s'en rendre compte !",
    difficulte: "facile",
    categorie: "impots_indirects",
    source: "INSEE",
  },

  {
    id: "q2",
    question:
      "Quelle part du prix de l'essence est constituée de taxes (TICPE + TVA) ?",
    options: [
      { id: "a", texte: "Environ 30%" },
      { id: "b", texte: "Environ 45%" },
      { id: "c", texte: "Environ 60%" },
      { id: "d", texte: "Environ 75%" },
    ],
    reponseCorrecte: "c",
    explication:
      "Sur 1,80€ le litre d'essence, environ 1,08€ est constitué de taxes : 0,69€ de TICPE et 0,39€ de TVA. Soit environ 60% du prix à la pompe !",
    difficulte: "moyen",
    categorie: "impots_indirects",
    source: "Ministère de la Transition écologique",
  },

  {
    id: "q3",
    question:
      "Combien coûte à l'État un élève de collège par an (environ) ?",
    options: [
      { id: "a", texte: "3 000 €" },
      { id: "b", texte: "5 500 €" },
      { id: "c", texte: "8 780 €" },
      { id: "d", texte: "12 000 €" },
    ],
    reponseCorrecte: "c",
    explication:
      "Un élève de collège coûte environ 8 780€ par an à l'État (professeurs, bâtiments, matériel, cantines...). Pour un élève de primaire, c'est 7 000€, et pour un lycéen 11 200€.",
    difficulte: "difficile",
    categorie: "services_publics",
    source: "DEPP - Ministère de l'Éducation nationale",
  },

  {
    id: "q4",
    question:
      "Pour un salaire brut de 3 000€, combien l'employeur paie-t-il de cotisations patronales (environ) ?",
    options: [
      { id: "a", texte: "450 €" },
      { id: "b", texte: "900 €" },
      { id: "c", texte: "1 260 €" },
      { id: "d", texte: "1 800 €" },
    ],
    reponseCorrecte: "c",
    explication:
      "Les cotisations patronales représentent environ 42% du salaire brut. Pour 3 000€ brut, c'est donc 1 260€ de cotisations invisibles qui financent la Sécurité sociale (maladie, retraite, chômage, famille).",
    difficulte: "difficile",
    categorie: "cotisations",
    source: "Urssaf",
  },

  {
    id: "q5",
    question:
      "Quel pourcentage des Français paie l'impôt sur le revenu ?",
    options: [
      { id: "a", texte: "25%" },
      { id: "b", texte: "43%" },
      { id: "c", texte: "68%" },
      { id: "d", texte: "87%" },
    ],
    reponseCorrecte: "b",
    explication:
      "Seulement 43% des foyers fiscaux français paient l'impôt sur le revenu. Mais attention : TOUS paient la TVA, la CSG, et d'autres taxes indirectes ! L'IR ne représente que 20% des recettes fiscales de l'État.",
    difficulte: "moyen",
    categorie: "culture_generale",
    source: "Direction générale des finances publiques",
  },

  {
    id: "q6",
    question:
      "Quelle est la première tranche d'imposition de l'impôt sur le revenu ?",
    options: [
      { id: "a", texte: "0% jusqu'à 11 294€" },
      { id: "b", texte: "5% jusqu'à 15 000€" },
      { id: "c", texte: "11% jusqu'à 20 000€" },
      { id: "d", texte: "0% jusqu'à 5 000€" },
    ],
    reponseCorrecte: "a",
    explication:
      "La première tranche est imposée à 0% jusqu'à 11 294€ de revenu net imposable. C'est pourquoi même avec un SMIC, on ne paie généralement pas d'impôt sur le revenu.",
    difficulte: "moyen",
    categorie: "impots_directs",
    source: "Code général des impôts",
  },

  {
    id: "q7",
    question: "Qu'est-ce que la CSG ?",
    options: [
      { id: "a", texte: "Contribution Salariale Générale" },
      { id: "b", texte: "Cotisation de Sécurité Générale" },
      { id: "c", texte: "Contribution Sociale Généralisée" },
      { id: "d", texte: "Charge Sociale Globale" },
    ],
    reponseCorrecte: "c",
    explication:
      "La CSG (Contribution Sociale Généralisée) finance la Sécurité sociale. Elle représente 9,2% du salaire brut. Créée en 1991, elle est devenue le premier impôt français en termes de recettes (135 milliards d'euros en 2026).",
    difficulte: "facile",
    categorie: "cotisations",
    source: "Sécurité sociale",
  },

  {
    id: "q8",
    question:
      "Combien de km de routes un conducteur moyen finance-t-il par an avec ses impôts et taxes ?",
    options: [
      { id: "a", texte: "10 mètres" },
      { id: "b", texte: "50 mètres" },
      { id: "c", texte: "200 mètres" },
      { id: "d", texte: "1 kilomètre" },
    ],
    reponseCorrecte: "c",
    explication:
      "Avec environ 20 milliards d'euros de budget routes pour 1 million de km de voirie et 67 millions d'habitants, chaque Français finance environ 200 mètres de routes par an. Si vous conduisez 15 000 km/an, vous utilisez donc 75 fois plus que ce que vous financez !",
    difficulte: "difficile",
    categorie: "services_publics",
    source: "Ministère de la Transition écologique",
  },

  {
    id: "q9",
    question:
      "Quel est le taux de TVA sur les produits alimentaires de base (pain, lait, fruits) ?",
    options: [
      { id: "a", texte: "2,1%" },
      { id: "b", texte: "5,5%" },
      { id: "c", texte: "10%" },
      { id: "d", texte: "20%" },
    ],
    reponseCorrecte: "b",
    explication:
      "Les produits alimentaires de base bénéficient du taux réduit de 5,5%. Le taux super-réduit de 2,1% s'applique aux médicaments remboursés et à la presse. Le taux normal de 20% concerne la plupart des autres produits.",
    difficulte: "moyen",
    categorie: "impots_indirects",
    source: "Direction générale des finances publiques",
  },

  {
    id: "q10",
    question:
      "À partir de quel montant de patrimoine immobilier net paie-t-on l'IFI ?",
    options: [
      { id: "a", texte: "500 000 €" },
      { id: "b", texte: "800 000 €" },
      { id: "c", texte: "1 300 000 €" },
      { id: "d", texte: "2 000 000 €" },
    ],
    reponseCorrecte: "c",
    explication:
      "L'Impôt sur la Fortune Immobilière (IFI) s'applique à partir de 1,3 million d'euros de patrimoine immobilier net. Il concerne environ 1% des foyers fiscaux français. Le taux varie de 0,5% à 1,5% selon les tranches.",
    difficulte: "moyen",
    categorie: "impots_directs",
    source: "Direction générale des finances publiques",
  },

  {
    id: "q11",
    question:
      "Combien représentent les cotisations patronales par rapport au salaire brut ?",
    options: [
      { id: "a", texte: "Environ 15%" },
      { id: "b", texte: "Environ 23%" },
      { id: "c", texte: "Environ 42%" },
      { id: "d", texte: "Environ 60%" },
    ],
    reponseCorrecte: "c",
    explication:
      "Les cotisations patronales représentent environ 42% du salaire brut ! C'est ce qu'on appelle le 'coût du travail'. Pour un salarié payé 3 000€ brut (2 300€ net), l'employeur débourse en réalité 4 260€ au total.",
    difficulte: "difficile",
    categorie: "cotisations",
    source: "Urssaf",
  },

  {
    id: "q12",
    question:
      "Quelle est la part de l'impôt sur le revenu dans les recettes fiscales de l'État ?",
    options: [
      { id: "a", texte: "Environ 10%" },
      { id: "b", texte: "Environ 20%" },
      { id: "c", texte: "Environ 35%" },
      { id: "d", texte: "Environ 50%" },
    ],
    reponseCorrecte: "b",
    explication:
      "L'impôt sur le revenu ne représente que 20% des recettes fiscales de l'État (85 milliards sur 430 milliards). La TVA rapporte bien plus (190 milliards), et la CSG encore davantage (135 milliards) !",
    difficulte: "difficile",
    categorie: "culture_generale",
    source: "Projet de Loi de Finances 2026",
  },

  {
    id: "q13",
    question:
      "Quel montant un Français contribue-t-il en moyenne à la défense nationale par an ?",
    options: [
      { id: "a", texte: "150 €" },
      { id: "b", texte: "600 €" },
      { id: "c", texte: "1 200 €" },
      { id: "d", texte: "2 000 €" },
    ],
    reponseCorrecte: "b",
    explication:
      "Avec un budget défense de 40 milliards d'euros pour 67 millions d'habitants, chaque Français contribue environ 600€ par an à la défense nationale (armée, gendarmerie, renseignement, cyberdéfense).",
    difficulte: "moyen",
    categorie: "services_publics",
    source: "Projet de Loi de Finances 2026",
  },

  {
    id: "q14",
    question: "Que finance principalement la taxe foncière ?",
    options: [
      { id: "a", texte: "L'État" },
      { id: "b", texte: "La Sécurité sociale" },
      { id: "c", texte: "Les collectivités locales" },
      { id: "d", texte: "Les associations" },
    ],
    reponseCorrecte: "c",
    explication:
      "La taxe foncière est un impôt local qui finance les communes, départements et régions. Elle sert à payer les écoles, la voirie, l'éclairage public, les services municipaux, etc. Son montant varie fortement d'une commune à l'autre.",
    difficulte: "facile",
    categorie: "impots_directs",
    source: "Direction générale des finances publiques",
  },

  {
    id: "q15",
    question:
      "Combien coûte en moyenne un étudiant à l'université publique par an ?",
    options: [
      { id: "a", texte: "3 000 €" },
      { id: "b", texte: "6 500 €" },
      { id: "c", texte: "11 530 €" },
      { id: "d", texte: "18 000 €" },
    ],
    reponseCorrecte: "c",
    explication:
      "Un étudiant à l'université coûte environ 11 530€ par an à l'État (hors frais d'inscription symboliques de 170€). En école d'ingénieur publique, c'est même 15 000€. L'enseignement supérieur est donc largement subventionné !",
    difficulte: "difficile",
    categorie: "services_publics",
    source: "MESRI - Ministère de l'Enseignement Supérieur",
  },
];

export function getQuestionsByCategorie(
  categorie: QuestionQuiz["categorie"]
): QuestionQuiz[] {
  return QUESTIONS_QUIZ.filter((q) => q.categorie === categorie);
}

export function getQuestionsByDifficulte(
  difficulte: QuestionQuiz["difficulte"]
): QuestionQuiz[] {
  return QUESTIONS_QUIZ.filter((q) => q.difficulte === difficulte);
}

export function getRandomQuestions(count: number): QuestionQuiz[] {
  const shuffled = [...QUESTIONS_QUIZ].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
