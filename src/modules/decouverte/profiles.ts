import { ProfilFiscalComplete } from "@/modules/profil/types";

/**
 * Profils types pour le mode découverte
 * Basés sur des données INSEE et statistiques publiques
 */

export interface ProfilType {
  id: string;
  nom: string;
  description: string;
  emoji: string;
  categorie: "revenus_modestes" | "classe_moyenne" | "cadres" | "independants" | "retraites" | "etudiants" | "famille";
  profil: Partial<ProfilFiscalComplete>;
}

export const PROFILS_TYPES: ProfilType[] = [
  {
    id: "smicard",
    nom: "Salarié au SMIC",
    description: "Célibataire, SMIC temps plein, locataire",
    emoji: "👷",
    categorie: "revenus_modestes",
    profil: {
      situation: {
        statut: "celibataire",
        nombreParts: 1,
        commune: "Lyon",
        age: 28,
      },
      revenus: {
        salaireBrut: 21203, // SMIC 2026
        salaireNet: 16600,
        typeContrat: "CDI",
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: false,
        valeurLocative: 0,
        taxeFonciere: 0,
        vehicules: [],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "sobre",
        budgetMensuel: {
          courses: 200,
          restaurants: 50,
          carburant: 0,
          loisirs: 80,
        },
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: { transportsCommun: "quotidienne", hopitalMedecin: "annuelle", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: false, apl: true, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "enseignant",
    nom: "Enseignant",
    description: "Professeur certifié, marié, 2 enfants",
    emoji: "👨‍🏫",
    categorie: "classe_moyenne",
    profil: {
      situation: {
        statut: "marie_pacse",
        nombreParts: 3,
        commune: "Toulouse",
        age: 38,
      },
      revenus: {
        salaireBrut: 32000,
        salaireNet: 25000,
        typeContrat: "fonctionnaire",
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: true,
        valeurLocative: 12000,
        taxeFonciere: 1200,
        vehicules: [{ type: "thermique", kmAnnuels: 12000 }],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "moyen",
        budgetMensuel: {
          courses: 600,
          restaurants: 150,
          carburant: 150,
          loisirs: 200,
        },
      },
      familleServices: {
        nombreEnfants: 2,
        enfants: [
          { age: 8, niveauScolaire: "primaire" },
          { age: 12, niveauScolaire: "college" },
        ],
        frequenceServices: { transportsCommun: "quotidienne", hopitalMedecin: "mensuelle", bibliotheque: "jamais", equipementsSportifs: "occasionnelle" },
        aides: { caf: true, apl: false, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "cadre",
    nom: "Cadre en entreprise",
    description: "Cadre supérieur, célibataire, Paris",
    emoji: "👔",
    categorie: "cadres",
    profil: {
      situation: {
        statut: "celibataire",
        nombreParts: 1,
        commune: "Paris",
        age: 35,
      },
      revenus: {
        salaireBrut: 65000,
        salaireNet: 50000,
        typeContrat: "CDI",
        revenusFonciers: 0,
        revenusCapitaux: 2000,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: false,
        valeurLocative: 0,
        taxeFonciere: 0,
        vehicules: [],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "eleve",
        budgetMensuel: {
          courses: 400,
          restaurants: 400,
          carburant: 0,
          loisirs: 500,
        },
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: { transportsCommun: "quotidienne", hopitalMedecin: "mensuelle", bibliotheque: "jamais", equipementsSportifs: "occasionnelle" },
        aides: { caf: false, apl: false, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "medecin",
    nom: "Médecin libéral",
    description: "Médecin généraliste, marié, 1 enfant",
    emoji: "⚕️",
    categorie: "independants",
    profil: {
      situation: {
        statut: "marie_pacse",
        nombreParts: 2.5,
        commune: "Bordeaux",
        age: 45,
      },
      revenus: {
        salaireBrut: 95000,
        salaireNet: 75000,
        typeContrat: "independant",
        revenusFonciers: 5000,
        revenusCapitaux: 3000,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: true,
        valeurLocative: 18000,
        taxeFonciere: 2200,
        vehicules: [{ type: "thermique", kmAnnuels: 15000 }],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "eleve",
        budgetMensuel: {
          courses: 800,
          restaurants: 300,
          carburant: 200,
          loisirs: 400,
        },
      },
      familleServices: {
        nombreEnfants: 1,
        enfants: [{ age: 15, niveauScolaire: "lycee_general" }],
        frequenceServices: { transportsCommun: "occasionnelle", hopitalMedecin: "mensuelle", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: false, apl: false, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "artisan",
    nom: "Artisan",
    description: "Plombier indépendant, marié, 3 enfants",
    emoji: "🔧",
    categorie: "independants",
    profil: {
      situation: {
        statut: "marie_pacse",
        nombreParts: 4,
        commune: "Nantes",
        age: 42,
      },
      revenus: {
        salaireBrut: 45000,
        salaireNet: 35000,
        typeContrat: "independant",
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: true,
        valeurLocative: 10000,
        taxeFonciere: 900,
        vehicules: [
          { type: "thermique", kmAnnuels: 25000 },
          { type: "thermique", kmAnnuels: 10000 },
        ],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "moyen",
        budgetMensuel: {
          courses: 700,
          restaurants: 100,
          carburant: 300,
          loisirs: 150,
        },
      },
      familleServices: {
        nombreEnfants: 3,
        enfants: [
          { age: 6, niveauScolaire: "primaire" },
          { age: 10, niveauScolaire: "primaire" },
          { age: 14, niveauScolaire: "college" },
        ],
        frequenceServices: { transportsCommun: "occasionnelle", hopitalMedecin: "mensuelle", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: true, apl: false, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "retraite",
    nom: "Retraité",
    description: "Retraité, couple, propriétaire",
    emoji: "👴",
    categorie: "retraites",
    profil: {
      situation: {
        statut: "marie_pacse",
        nombreParts: 2,
        commune: "Nice",
        age: 68,
      },
      revenus: {
        salaireBrut: 0,
        salaireNet: 0,
        typeContrat: "CDI",
        revenusFonciers: 3000,
        revenusCapitaux: 2000,
        autresRevenus: 28000, // pension
      },
      patrimoine: {
        proprietaire: true,
        valeurLocative: 15000,
        taxeFonciere: 1500,
        vehicules: [{ type: "thermique", kmAnnuels: 8000 }],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "moyen",
        budgetMensuel: {
          courses: 400,
          restaurants: 150,
          carburant: 100,
          loisirs: 200,
        },
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: { transportsCommun: "occasionnelle", hopitalMedecin: "hebdomadaire", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: false, apl: false, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "etudiant",
    nom: "Étudiant",
    description: "Étudiant en master, job à mi-temps",
    emoji: "🎓",
    categorie: "etudiants",
    profil: {
      situation: {
        statut: "celibataire",
        nombreParts: 1,
        commune: "Paris",
        age: 23,
      },
      revenus: {
        salaireBrut: 8000,
        salaireNet: 6500,
        typeContrat: "CDD",
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: false,
        valeurLocative: 0,
        taxeFonciere: 0,
        vehicules: [],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "sobre",
        budgetMensuel: {
          courses: 150,
          restaurants: 80,
          carburant: 0,
          loisirs: 100,
        },
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: { transportsCommun: "quotidienne", hopitalMedecin: "annuelle", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: false, apl: true, rsa: false, bourses: true, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "haut_revenu",
    nom: "Haut revenu",
    description: "Dirigeant, marié, 2 enfants, patrimoine important",
    emoji: "💼",
    categorie: "cadres",
    profil: {
      situation: {
        statut: "marie_pacse",
        nombreParts: 3,
        commune: "Paris",
        age: 50,
      },
      revenus: {
        salaireBrut: 180000,
        salaireNet: 140000,
        typeContrat: "CDI",
        revenusFonciers: 25000,
        revenusCapitaux: 15000,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: true,
        valeurLocative: 35000,
        taxeFonciere: 4500,
        vehicules: [
          { type: "hybride", kmAnnuels: 15000 },
          { type: "electrique", kmAnnuels: 10000 },
        ],
        patrimoineIFI: 1800000,
      },
      consommation: {
        mode: "profil_type",
        profilType: "eleve",
        budgetMensuel: {
          courses: 1200,
          restaurants: 800,
          carburant: 150,
          loisirs: 1000,
        },
      },
      familleServices: {
        nombreEnfants: 2,
        enfants: [
          { age: 16, niveauScolaire: "lycee_general" },
          { age: 19, niveauScolaire: "superieur_public" },
        ],
        frequenceServices: { transportsCommun: "occasionnelle", hopitalMedecin: "mensuelle", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: false, apl: false, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "stagiaire",
    nom: "Stagiaire",
    description: "Stage de fin d'études, gratification minimale",
    emoji: "🎯",
    categorie: "etudiants",
    profil: {
      situation: {
        statut: "celibataire",
        nombreParts: 1,
        commune: "Lyon",
        age: 22,
      },
      revenus: {
        salaireBrut: 4500, // 6 mois × 750€/mois
        salaireNet: 4400,
        typeContrat: "CDD",
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: false,
        valeurLocative: 0,
        taxeFonciere: 0,
        vehicules: [],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "sobre",
        budgetMensuel: {
          courses: 120,
          restaurants: 40,
          carburant: 0,
          loisirs: 50,
        },
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: { transportsCommun: "quotidienne", hopitalMedecin: "annuelle", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: false, apl: true, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "apprenti",
    nom: "Apprenti",
    description: "Apprentissage CAP/BTS, rémunération apprenti",
    emoji: "🔨",
    categorie: "etudiants",
    profil: {
      situation: {
        statut: "celibataire",
        nombreParts: 1,
        commune: "Marseille",
        age: 19,
      },
      revenus: {
        salaireBrut: 12000, // ~1000€/mois
        salaireNet: 11800,
        typeContrat: "CDI",
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: false,
        valeurLocative: 0,
        taxeFonciere: 0,
        vehicules: [],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "sobre",
        budgetMensuel: {
          courses: 180,
          restaurants: 60,
          carburant: 80,
          loisirs: 100,
        },
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: { transportsCommun: "quotidienne", hopitalMedecin: "annuelle", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: false, apl: true, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "parent_isole",
    nom: "Parent isolé",
    description: "Parent seul, 2 enfants, temps partiel",
    emoji: "👨‍👧‍👦",
    categorie: "famille",
    profil: {
      situation: {
        statut: "divorce",
        nombreParts: 2.5, // 1 + 0.5×2 + 0.5 majoration parent isolé
        commune: "Lille",
        age: 35,
      },
      revenus: {
        salaireBrut: 18000,
        salaireNet: 14500,
        typeContrat: "CDI",
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 2400, // pension alimentaire
      },
      patrimoine: {
        proprietaire: false,
        valeurLocative: 0,
        taxeFonciere: 0,
        vehicules: [{ type: "thermique", kmAnnuels: 10000 }],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "sobre",
        budgetMensuel: {
          courses: 400,
          restaurants: 40,
          carburant: 120,
          loisirs: 80,
        },
      },
      familleServices: {
        nombreEnfants: 2,
        enfants: [
          { age: 7, niveauScolaire: "primaire" },
          { age: 10, niveauScolaire: "primaire" },
        ],
        frequenceServices: { transportsCommun: "occasionnelle", hopitalMedecin: "mensuelle", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: true, apl: true, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "famille_nombreuse",
    nom: "Famille nombreuse",
    description: "Couple, 4 enfants, classe moyenne",
    emoji: "👨‍👩‍👧‍👦",
    categorie: "famille",
    profil: {
      situation: {
        statut: "marie_pacse",
        nombreParts: 5, // 2 + 1 + 1 + 1
        commune: "Strasbourg",
        age: 42,
      },
      revenus: {
        salaireBrut: 55000,
        salaireNet: 43000,
        typeContrat: "CDI",
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: true,
        valeurLocative: 14000,
        taxeFonciere: 1400,
        vehicules: [
          { type: "thermique", kmAnnuels: 18000 },
        ],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "moyen",
        budgetMensuel: {
          courses: 900,
          restaurants: 120,
          carburant: 250,
          loisirs: 300,
        },
      },
      familleServices: {
        nombreEnfants: 4,
        enfants: [
          { age: 5, niveauScolaire: "maternelle" },
          { age: 8, niveauScolaire: "primaire" },
          { age: 12, niveauScolaire: "college" },
          { age: 16, niveauScolaire: "lycee_general" },
        ],
        frequenceServices: { transportsCommun: "quotidienne", hopitalMedecin: "mensuelle", bibliotheque: "jamais", equipementsSportifs: "hebdomadaire" },
        aides: { caf: true, apl: false, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "cadre_dirigeant",
    nom: "Cadre dirigeant",
    description: "Directeur général, célibataire, très haut revenu",
    emoji: "🎩",
    categorie: "cadres",
    profil: {
      situation: {
        statut: "celibataire",
        nombreParts: 1,
        commune: "Paris",
        age: 48,
      },
      revenus: {
        salaireBrut: 250000,
        salaireNet: 190000,
        typeContrat: "CDI",
        revenusFonciers: 35000,
        revenusCapitaux: 25000,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: true,
        valeurLocative: 50000,
        taxeFonciere: 6000,
        vehicules: [
          { type: "hybride", kmAnnuels: 20000 },
        ],
        patrimoineIFI: 2500000,
      },
      consommation: {
        mode: "profil_type",
        profilType: "eleve",
        budgetMensuel: {
          courses: 800,
          restaurants: 1200,
          carburant: 200,
          loisirs: 1500,
        },
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: { transportsCommun: "jamais", hopitalMedecin: "mensuelle", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: false, apl: false, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
  {
    id: "entrepreneur",
    nom: "Créateur d'entreprise",
    description: "Start-up tech, revenus variables, 1ère année",
    emoji: "🚀",
    categorie: "independants",
    profil: {
      situation: {
        statut: "celibataire",
        nombreParts: 1,
        commune: "Lyon",
        age: 32,
      },
      revenus: {
        salaireBrut: 25000,
        salaireNet: 20000,
        typeContrat: "independant",
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: false,
        valeurLocative: 0,
        taxeFonciere: 0,
        vehicules: [],
        patrimoineIFI: 0,
      },
      consommation: {
        mode: "profil_type",
        profilType: "sobre",
        budgetMensuel: {
          courses: 250,
          restaurants: 100,
          carburant: 0,
          loisirs: 120,
        },
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: { transportsCommun: "quotidienne", hopitalMedecin: "annuelle", bibliotheque: "jamais", equipementsSportifs: "jamais" },
        aides: { caf: false, apl: false, rsa: false, bourses: false, chomage: false, cmuc: false },
      },
      statusData: {},
    },
  },
];

export function getProfilById(id: string): ProfilType | undefined {
  return PROFILS_TYPES.find((p) => p.id === id);
}

export function getProfilsByCategorie(categorie: string): ProfilType[] {
  return PROFILS_TYPES.filter((p) => p.categorie === categorie);
}
