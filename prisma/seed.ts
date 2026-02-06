import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ReferentielData {
  millesime: string;
  categorie: string;
  cle: string;
  valeur: unknown;
  unite?: string;
  source: string;
  urlSource: string;
  datePublication: Date;
  statut: "OFFICIEL" | "PROVISOIRE" | "ESTIME";
  notes?: string;
}

async function createReferentielEntry(data: ReferentielData) {
  // Validate that all required fields are present
  if (!data.source || !data.urlSource) {
    throw new Error(
      `Source validation failed for ${data.categorie}.${data.cle}: source and urlSource are required`
    );
  }

  return prisma.referentiel.create({
    data: {
      millesime: data.millesime,
      categorie: data.categorie,
      cle: data.cle,
      valeur: data.valeur as any,
      unite: data.unite,
      source: data.source,
      urlSource: data.urlSource,
      datePublication: data.datePublication,
      statut: data.statut,
      notes: data.notes,
    },
  });
}

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing referentiel data
  await prisma.referentiel.deleteMany({});
  console.log("Cleared existing Référentiel data");

  // Seed sections will be added here
  await seedBaremeIR();
  await seedTauxTVA();
  await seedCotisationsSociales();
  await seedCoutsEducation();
  await seedBudgetsPLF();
  await seedStatsINSEE();
  await seedTaxesIndirectes();
  await seedAutresTaux();

  console.log("✅ Seed completed successfully!");
}

async function seedBaremeIR() {
  console.log("Seeding Barème IR 2026...");

  // Source: Projet de loi de finances 2026
  // https://www.legifrance.gouv.fr/
  await createReferentielEntry({
    millesime: "2026",
    categorie: "BAREME_IR",
    cle: "tranches",
    valeur: [
      { min: 0, max: 11294, taux: 0 },
      { min: 11294, max: 28797, taux: 0.11 },
      { min: 28797, max: 82341, taux: 0.30 },
      { min: 82341, max: 177106, taux: 0.41 },
      { min: 177106, max: Infinity, taux: 0.45 },
    ],
    unite: "euros_et_taux",
    source: "PLF 2026",
    urlSource: "https://www.legifrance.gouv.fr/",
    datePublication: new Date("2025-09-27"),
    statut: "OFFICIEL",
    notes: "Barème progressif de l'impôt sur le revenu applicable aux revenus 2026",
  });

  // Décote
  await createReferentielEntry({
    millesime: "2026",
    categorie: "BAREME_IR",
    cle: "decote",
    valeur: {
      montantMax: 873,
      seuilCelibataire: 1841,
      seuilCouple: 3045,
    },
    unite: "euros",
    source: "PLF 2026",
    urlSource: "https://www.legifrance.gouv.fr/",
    datePublication: new Date("2025-09-27"),
    statut: "OFFICIEL",
    notes: "Décote applicable pour lisser l'entrée dans l'imposition",
  });

  // Plafonnement des effets du quotient familial
  await createReferentielEntry({
    millesime: "2026",
    categorie: "BAREME_IR",
    cle: "plafond_quotient_familial",
    valeur: {
      parDemiPart: 1759,
      premieresDemiParts: 1759,
    },
    unite: "euros",
    source: "PLF 2026",
    urlSource: "https://www.legifrance.gouv.fr/",
    datePublication: new Date("2025-09-27"),
    statut: "OFFICIEL",
    notes: "Plafonnement de l'avantage procuré par le quotient familial",
  });

  console.log("✓ Barème IR 2026 seeded");
}

async function seedTauxTVA() {
  console.log("Seeding Taux TVA...");

  // Taux normal
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TAUX_TVA",
    cle: "normal",
    valeur: 0.20,
    unite: "pourcentage",
    source: "Code général des impôts, article 278",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006279261",
    datePublication: new Date("2014-01-01"),
    statut: "OFFICIEL",
    notes: "Taux normal applicable à la plupart des biens et services",
  });

  // Taux intermédiaire
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TAUX_TVA",
    cle: "intermediaire",
    valeur: 0.10,
    unite: "pourcentage",
    source: "Code général des impôts, article 278-0 bis",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006279243",
    datePublication: new Date("2014-01-01"),
    statut: "OFFICIEL",
    notes:
      "Applicable notamment aux produits agricoles, restauration, travaux dans logements anciens",
  });

  // Taux réduit
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TAUX_TVA",
    cle: "reduit",
    valeur: 0.055,
    unite: "pourcentage",
    source: "Code général des impôts, article 278-0 bis A",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006279244",
    datePublication: new Date("2014-01-01"),
    statut: "OFFICIEL",
    notes: "Applicable notamment aux produits alimentaires de première nécessité, livres",
  });

  // Taux super-réduit
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TAUX_TVA",
    cle: "super_reduit",
    valeur: 0.021,
    unite: "pourcentage",
    source: "Code général des impôts, article 281 quater",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006279278",
    datePublication: new Date("2014-01-01"),
    statut: "OFFICIEL",
    notes: "Applicable aux médicaments remboursables, presse",
  });

  console.log("✓ Taux TVA seeded");
}

async function seedCotisationsSociales() {
  console.log("Seeding Cotisations sociales...");

  // Cotisations salariales
  await createReferentielEntry({
    millesime: "2026",
    categorie: "COTISATIONS",
    cle: "salariales",
    valeur: {
      maladie: 0.0,
      vieillesse_plafonnee: 0.0690,
      vieillesse_deplafonnee: 0.0040,
      chomage: 0.0,
      retraite_complementaire_tranche1: 0.0387,
      retraite_complementaire_tranche2: 0.2162,
      csg_crds: 0.098,
    },
    unite: "taux",
    source: "URSSAF - Taux de cotisations 2026",
    urlSource: "https://www.urssaf.fr/",
    datePublication: new Date("2025-12-01"),
    statut: "OFFICIEL",
    notes: "Taux de cotisations salariales applicables au secteur privé en 2026",
  });

  // Cotisations patronales
  await createReferentielEntry({
    millesime: "2026",
    categorie: "COTISATIONS",
    cle: "patronales",
    valeur: {
      maladie_maternite: 0.13,
      vieillesse_plafonnee: 0.0855,
      vieillesse_deplafonnee: 0.0190,
      allocations_familiales: 0.0340,
      accidents_travail: 0.022,
      chomage: 0.0405,
      retraite_complementaire_tranche1: 0.0601,
      retraite_complementaire_tranche2: 0.1674,
      agff: 0.0,
      fnal: 0.0050,
      contribution_solidarite: 0.003,
    },
    unite: "taux",
    source: "URSSAF - Taux de cotisations 2026",
    urlSource: "https://www.urssaf.fr/",
    datePublication: new Date("2025-12-01"),
    statut: "OFFICIEL",
    notes: "Taux de cotisations patronales applicables au secteur privé en 2026",
  });

  // Plafond annuel de sécurité sociale
  await createReferentielEntry({
    millesime: "2026",
    categorie: "COTISATIONS",
    cle: "plafond_ss",
    valeur: 46368,
    unite: "euros_annuel",
    source: "Arrêté du 14 novembre 2025",
    urlSource: "https://www.legifrance.gouv.fr/",
    datePublication: new Date("2025-11-14"),
    statut: "OFFICIEL",
    notes: "Plafond annuel de la sécurité sociale pour 2026",
  });

  console.log("✓ Cotisations sociales seeded");
}

async function seedCoutsEducation() {
  console.log("Seeding Coûts éducation...");

  // Source: DEPP - Repères et références statistiques 2025
  const couts = [
    {
      niveau: "maternelle",
      cout: 7720,
      notes: "Coût moyen par élève en école maternelle publique",
    },
    {
      niveau: "primaire",
      cout: 7510,
      notes: "Coût moyen par élève en école élémentaire publique",
    },
    {
      niveau: "college",
      cout: 9530,
      notes: "Coût moyen par élève en collège public",
    },
    {
      niveau: "lycee_general",
      cout: 11630,
      notes: "Coût moyen par élève en lycée général et technologique public",
    },
    {
      niveau: "lycee_professionnel",
      cout: 13450,
      notes: "Coût moyen par élève en lycée professionnel public",
    },
    {
      niveau: "superieur_public",
      cout: 11630,
      notes: "Coût moyen par étudiant dans l'enseignement supérieur public",
    },
  ];

  for (const item of couts) {
    await createReferentielEntry({
      millesime: "2026",
      categorie: "COUT_EDUCATION",
      cle: item.niveau,
      valeur: item.cout,
      unite: "euros_par_eleve_annuel",
      source: "DEPP - Repères et références statistiques 2025",
      urlSource: "https://www.education.gouv.fr/",
      datePublication: new Date("2025-08-01"),
      statut: "OFFICIEL",
      notes: item.notes,
    });
  }

  console.log("✓ Coûts éducation seeded");
}

async function seedBudgetsPLF() {
  console.log("Seeding Budgets PLF...");

  // Source: Projet de loi de finances 2026
  const budgets = [
    {
      fonction: "defense",
      montant: 50100,
      notes: "Défense nationale (armée, gendarmerie)",
    },
    {
      fonction: "education",
      montant: 67800,
      notes: "Enseignement scolaire (premier et second degré)",
    },
    {
      fonction: "enseignement_superieur",
      montant: 31400,
      notes: "Enseignement supérieur et recherche",
    },
    {
      fonction: "sante",
      montant: 9500,
      notes: "Santé (hors sécurité sociale)",
    },
    {
      fonction: "justice",
      montant: 11200,
      notes: "Justice",
    },
    {
      fonction: "police",
      montant: 22400,
      notes: "Sécurité (police nationale, sécurité civile)",
    },
    {
      fonction: "infrastructure",
      montant: 18900,
      notes: "Infrastructures et transports",
    },
    {
      fonction: "culture",
      montant: 3900,
      notes: "Culture et médias",
    },
    {
      fonction: "administration",
      montant: 15600,
      notes: "Administration générale et territoriale",
    },
    {
      fonction: "charge_dette",
      montant: 52100,
      notes: "Charge de la dette publique (intérêts)",
    },
  ];

  for (const item of budgets) {
    await createReferentielEntry({
      millesime: "2026",
      categorie: "BUDGET_PLF",
      cle: item.fonction,
      valeur: item.montant,
      unite: "millions_euros",
      source: "PLF 2026",
      urlSource: "https://www.budget.gouv.fr/",
      datePublication: new Date("2025-09-27"),
      statut: "OFFICIEL",
      notes: item.notes,
    });
  }

  console.log("✓ Budgets PLF seeded");
}

async function seedStatsINSEE() {
  console.log("Seeding Stats INSEE...");

  // Population française
  await createReferentielEntry({
    millesime: "2026",
    categorie: "STATS_INSEE",
    cle: "population_france",
    valeur: 68042591,
    unite: "habitants",
    source: "INSEE - Estimation de population 2026",
    urlSource: "https://www.insee.fr/",
    datePublication: new Date("2026-01-01"),
    statut: "ESTIME",
    notes: "Population totale de la France au 1er janvier 2026 (estimation)",
  });

  // Consommation moyenne par tranche de revenu
  await createReferentielEntry({
    millesime: "2026",
    categorie: "STATS_INSEE",
    cle: "conso_moyenne_decile_1",
    valeur: {
      total_annuel: 18200,
      alimentation: 3800,
      logement: 7200,
      transport: 2100,
      loisirs: 1500,
      autres: 3600,
    },
    unite: "euros_annuel",
    source: "INSEE - Enquête Budget de famille 2023 (actualisé 2026)",
    urlSource: "https://www.insee.fr/",
    datePublication: new Date("2025-06-01"),
    statut: "OFFICIEL",
    notes: "Consommation moyenne annuelle pour le 1er décile de revenu",
  });

  await createReferentielEntry({
    millesime: "2026",
    categorie: "STATS_INSEE",
    cle: "conso_moyenne_decile_5",
    valeur: {
      total_annuel: 32400,
      alimentation: 5200,
      logement: 10800,
      transport: 5600,
      loisirs: 3900,
      autres: 6900,
    },
    unite: "euros_annuel",
    source: "INSEE - Enquête Budget de famille 2023 (actualisé 2026)",
    urlSource: "https://www.insee.fr/",
    datePublication: new Date("2025-06-01"),
    statut: "OFFICIEL",
    notes: "Consommation moyenne annuelle pour le 5e décile de revenu (médiane)",
  });

  await createReferentielEntry({
    millesime: "2026",
    categorie: "STATS_INSEE",
    cle: "conso_moyenne_decile_10",
    valeur: {
      total_annuel: 68900,
      alimentation: 8900,
      logement: 18200,
      transport: 12400,
      loisirs: 11800,
      autres: 17600,
    },
    unite: "euros_annuel",
    source: "INSEE - Enquête Budget de famille 2023 (actualisé 2026)",
    urlSource: "https://www.insee.fr/",
    datePublication: new Date("2025-06-01"),
    statut: "OFFICIEL",
    notes: "Consommation moyenne annuelle pour le 10e décile de revenu",
  });

  console.log("✓ Stats INSEE seeded");
}

async function seedTaxesIndirectes() {
  console.log("Seeding Taxes indirectes...");

  // TICPE Essence
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TICPE",
    cle: "essence_sp95_e10",
    valeur: 0.6829,
    unite: "euros_par_litre",
    source: "Code des impositions sur les biens et services, article L312-34",
    urlSource: "https://www.legifrance.gouv.fr/",
    datePublication: new Date("2025-01-01"),
    statut: "OFFICIEL",
    notes: "Taxe intérieure de consommation sur les produits énergétiques - Essence SP95-E10",
  });

  // TICPE Gazole
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TICPE",
    cle: "gazole",
    valeur: 0.5946,
    unite: "euros_par_litre",
    source: "Code des impositions sur les biens et services, article L312-34",
    urlSource: "https://www.legifrance.gouv.fr/",
    datePublication: new Date("2025-01-01"),
    statut: "OFFICIEL",
    notes: "Taxe intérieure de consommation sur les produits énergétiques - Gazole",
  });

  // Consommation moyenne véhicule
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TICPE",
    cle: "conso_moyenne_vehicule",
    valeur: {
      essence: 7.2,
      diesel: 6.1,
      hybride: 4.8,
      electrique: 0.0,
    },
    unite: "litres_pour_100km",
    source: "ADEME - Consommations conventionnelles 2025",
    urlSource: "https://www.ademe.fr/",
    datePublication: new Date("2025-03-01"),
    statut: "OFFICIEL",
    notes: "Consommation moyenne par type de véhicule (cycle mixte WLTP)",
  });

  // Taxe sur les assurances
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TAXES_INDIRECTES",
    cle: "taxe_assurance_auto",
    valeur: 0.33,
    unite: "taux",
    source: "Code général des impôts, article 991",
    urlSource: "https://www.legifrance.gouv.fr/",
    datePublication: new Date("2024-01-01"),
    statut: "OFFICIEL",
    notes: "Taxe sur les conventions d'assurance automobile",
  });

  await createReferentielEntry({
    millesime: "2026",
    categorie: "TAXES_INDIRECTES",
    cle: "taxe_assurance_habitation",
    valeur: 0.185,
    unite: "taux",
    source: "Code général des impôts, article 991",
    urlSource: "https://www.legifrance.gouv.fr/",
    datePublication: new Date("2024-01-01"),
    statut: "OFFICIEL",
    notes: "Taxe sur les conventions d'assurance habitation",
  });

  console.log("✓ Taxes indirectes seeded");
}

async function seedAutresTaux() {
  console.log("Seeding Autres taux et seuils...");

  // CSG + CRDS sur revenus du patrimoine
  await createReferentielEntry({
    millesime: "2026",
    categorie: "COTISATIONS",
    cle: "csg_crds_patrimoine",
    valeur: 0.172,
    unite: "taux",
    source: "Code général des impôts, article 1600-0 S",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000047454104",
    datePublication: new Date("2024-01-01"),
    statut: "OFFICIEL",
    notes: "CSG (9,2%) + CRDS (0,5%) + prélèvement de solidarité (7,5%) sur revenus du patrimoine",
  });

  // IFI - Seuil d'entrée
  await createReferentielEntry({
    millesime: "2026",
    categorie: "IFI",
    cle: "seuil_entree",
    valeur: 1300000,
    unite: "euros",
    source: "Code général des impôts, article 964",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036380769",
    datePublication: new Date("2018-01-01"),
    statut: "OFFICIEL",
    notes: "Seuil d'assujettissement à l'Impôt sur la Fortune Immobilière",
  });

  // IFI - Abattement sur la valeur nette taxable
  await createReferentielEntry({
    millesime: "2026",
    categorie: "IFI",
    cle: "abattement",
    valeur: 800000,
    unite: "euros",
    source: "Code général des impôts, article 965",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036380741",
    datePublication: new Date("2018-01-01"),
    statut: "OFFICIEL",
    notes: "Abattement à appliquer pour le calcul de l'IFI (patrimoine net taxable - abattement)",
  });

  // IFI - Barème (version simplifiée : taux de base)
  await createReferentielEntry({
    millesime: "2026",
    categorie: "IFI",
    cle: "bareme",
    valeur: [
      { min: 0, max: 800000, taux: 0.0 },
      { min: 800000, max: 1300000, taux: 0.005 },
      { min: 1300000, max: 2570000, taux: 0.007 },
      { min: 2570000, max: 5000000, taux: 0.01 },
      { min: 5000000, max: 10000000, taux: 0.0125 },
      { min: 10000000, max: Infinity, taux: 0.015 },
    ],
    unite: "euros_et_taux",
    source: "Code général des impôts, article 977",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036380639",
    datePublication: new Date("2018-01-01"),
    statut: "OFFICIEL",
    notes: "Barème progressif de l'IFI applicable au patrimoine net taxable",
  });

  // Dépenses annuelles par défaut (estimation INSEE)
  await createReferentielEntry({
    millesime: "2026",
    categorie: "STATS_INSEE",
    cle: "depenses_annuelles_defaut",
    valeur: 30000,
    unite: "euros_annuel",
    source: "INSEE - Enquête Budget de famille 2023",
    urlSource: "https://www.insee.fr/",
    datePublication: new Date("2025-06-01"),
    statut: "OFFICIEL",
    notes: "Dépenses de consommation annuelles moyennes par ménage (valeur par défaut si non renseigné)",
  });

  console.log("✓ Autres taux et seuils seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
