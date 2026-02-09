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

  // Phase 3: Gamification & Engagement
  await seedBadgeDefinitions();
  await seedChallengeDefinitions();
  await seedNotificationTemplates();
  await seedFiscalCalendar();

  console.log("✅ Seed completed successfully!");
}

async function seedBaremeIR() {
  console.log("Seeding Barème IR 2026...");

  // Source: Loi de finances 2026 adoptée le 2 février 2026 (revalorisation +0,9%)
  // https://www.economie.gouv.fr/particuliers/tranches-imposition-impot-revenu
  await createReferentielEntry({
    millesime: "2026",
    categorie: "BAREME_IR",
    cle: "tranches",
    valeur: [
      { min: 0, max: 11600, taux: 0 },
      { min: 11600, max: 29579, taux: 0.11 },
      { min: 29579, max: 84577, taux: 0.30 },
      { min: 84577, max: 181917, taux: 0.41 },
      { min: 181917, max: Infinity, taux: 0.45 },
    ],
    unite: "euros_et_taux",
    source: "LFI 2026 - Article 2 ter, revalorisation +0,9%",
    urlSource: "https://www.economie.gouv.fr/particuliers/tranches-imposition-impot-revenu",
    datePublication: new Date("2026-02-02"),
    statut: "OFFICIEL",
    notes: "Barème progressif de l'impôt sur le revenu applicable aux revenus 2025 (déclaration 2026)",
  });

  // Décote 2026 - Article 197-I-4 du CGI
  await createReferentielEntry({
    millesime: "2026",
    categorie: "BAREME_IR",
    cle: "decote",
    valeur: {
      montantMaxCelibataire: 889,
      montantMaxCouple: 1470,
      seuilCelibataire: 1965,
      seuilCouple: 3249,
      coefficient: 0.4525,
    },
    unite: "euros",
    source: "LFI 2026 - Article 197-I-4 CGI",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006302374",
    datePublication: new Date("2026-02-02"),
    statut: "OFFICIEL",
    notes: "Décote = montant forfaitaire - (impôt brut × 45,25%). Formules différenciées célibataire/couple.",
  });

  // Plafonnement des effets du quotient familial
  await createReferentielEntry({
    millesime: "2026",
    categorie: "BAREME_IR",
    cle: "plafond_quotient_familial",
    valeur: {
      parDemiPart: 1807,
      premieresDemiParts: 1807,
    },
    unite: "euros",
    source: "LFI 2026",
    urlSource: "https://www.legifrance.gouv.fr/",
    datePublication: new Date("2026-02-02"),
    statut: "OFFICIEL",
    notes: "Plafonnement de l'avantage procuré par le quotient familial (1 807 € par demi-part en 2026)",
  });

  console.log("✓ Barème IR 2026 seeded");
}

async function seedTauxTVA() {
  console.log("Seeding Taux TVA...");

  // Taux normal - Stocké en décimale pour faciliter les calculs
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TAUX_TVA",
    cle: "normal",
    valeur: 0.20,
    unite: "decimal",
    source: "Code général des impôts, article 278",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006279261",
    datePublication: new Date("2014-01-01"),
    statut: "OFFICIEL",
    notes: "Taux normal applicable à la plupart des biens et services (20%)",
  });

  // Taux intermédiaire
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TAUX_TVA",
    cle: "intermediaire",
    valeur: 0.10,
    unite: "decimal",
    source: "Code général des impôts, article 278-0 bis",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006279243",
    datePublication: new Date("2014-01-01"),
    statut: "OFFICIEL",
    notes:
      "Applicable notamment aux produits agricoles, restauration, travaux dans logements anciens (10%)",
  });

  // Taux réduit
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TAUX_TVA",
    cle: "reduit",
    valeur: 0.055,
    unite: "decimal",
    source: "Code général des impôts, article 278-0 bis A",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006279244",
    datePublication: new Date("2014-01-01"),
    statut: "OFFICIEL",
    notes: "Applicable notamment aux produits alimentaires de première nécessité, livres (5,5%)",
  });

  // Taux super-réduit
  await createReferentielEntry({
    millesime: "2026",
    categorie: "TAUX_TVA",
    cle: "super_reduit",
    valeur: 0.021,
    unite: "decimal",
    source: "Code général des impôts, article 281 quater",
    urlSource: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006279278",
    datePublication: new Date("2014-01-01"),
    statut: "OFFICIEL",
    notes: "Applicable aux médicaments remboursables, presse (2,1%)",
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

  // Cotisations patronales (taux pleins avant RGDU)
  await createReferentielEntry({
    millesime: "2026",
    categorie: "COTISATIONS",
    cle: "patronales",
    valeur: {
      maladie_maternite: 0.1110,
      vieillesse_plafonnee: 0.0855,
      vieillesse_deplafonnee: 0.0190,
      allocations_familiales: 0.0525,
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
    notes: "Taux de cotisations patronales applicables au secteur privé en 2026 (avant application de la RGDU)",
  });

  // RGDU (Réduction Générale Dégressive Unique, ex-Fillon)
  await createReferentielEntry({
    millesime: "2026",
    categorie: "COTISATIONS",
    cle: "rgdu",
    valeur: {
      coefficientMaximal: 0.3206,
      seuilMin: 1.0,
      seuilMax: 1.6,
      smicAnnuel: 21600,
    },
    unite: "coefficient",
    source: "URSSAF - Réduction générale de cotisations patronales 2026",
    urlSource: "https://www.urssaf.fr/portail/home/employeur/calculer-les-cotisations/les-taux-de-cotisations/la-reduction-generale.html",
    datePublication: new Date("2025-12-01"),
    statut: "OFFICIEL",
    notes: "Paramètres de la RGDU (ex-réduction Fillon). Formule : Coefficient = (T/0.6) × [(1.6 × SMIC annuel / Rémunération annuelle) - 1]. Le coefficient est maximal au SMIC (T = 0.3206) et devient nul à partir de 1.6 SMIC. Cette réduction s'applique sur les cotisations patronales de maladie, allocations familiales et vieillesse déplafonnée.",
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

  // Dépenses annuelles par défaut (pour estimation TVA si aucun budget renseigné)
  await createReferentielEntry({
    millesime: "2026",
    categorie: "STATS_INSEE",
    cle: "depenses_annuelles_defaut",
    valeur: 32400,
    unite: "euros_annuel",
    source: "INSEE - Enquête Budget de famille 2023",
    urlSource: "https://www.insee.fr/",
    datePublication: new Date("2025-06-01"),
    statut: "OFFICIEL",
    notes: "Dépenses de consommation moyennes d'un ménage français (médiane, décile 5)",
  });

  // Remboursements santé Sécurité Sociale (données DREES)
  await createReferentielEntry({
    millesime: "2026",
    categorie: "STATS_DREES",
    cle: "remboursement_sante_moyen_par_personne",
    valeur: 2984,
    unite: "euros_annuel",
    source: "DREES - Les dépenses de santé en 2025",
    urlSource: "https://drees.solidarites-sante.gouv.fr/",
    datePublication: new Date("2025-09-15"),
    statut: "OFFICIEL",
    notes: "Remboursement moyen par la Sécurité Sociale par personne et par an, tous régimes confondus (hors complémentaires). Inclut consultations, hospitalisations, médicaments, soins dentaires et optiques.",
  });

  // Dépenses publiques de santé par habitant (services mutualisés)
  await createReferentielEntry({
    millesime: "2026",
    categorie: "STATS_DREES",
    cle: "sante_publique_par_habitant",
    valeur: 4200,
    unite: "euros_annuel",
    source: "DREES - Comptes de la santé 2025 + PLF 2026",
    urlSource: "https://drees.solidarites-sante.gouv.fr/",
    datePublication: new Date("2025-09-15"),
    statut: "OFFICIEL",
    notes: "Part des dépenses publiques de santé attribuable par habitant (hôpitaux publics, prévention, recherche médicale, formation des soignants). Ne pas confondre avec les remboursements individuels.",
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

  console.log("✓ Autres taux et seuils seeded");
}

async function seedBadgeDefinitions() {
  console.log("Seeding Badge definitions...");

  const badges = [
    {
      id: "PREMIER_PAS",
      nom: "📄 Premier pas",
      description: "Uploadez votre premier document",
      critere: "document_uploaded",
      seuil: 1,
      categorie: "onboarding",
    },
    {
      id: "BATISSEUR",
      nom: "🛣️ Bâtisseur",
      description: "Votre contribution annuelle finance au moins 200 mètres de routes",
      critere: "infrastructure_contribution",
      seuil: 200,
      categorie: "fiscal_contribution",
    },
    {
      id: "MECENE_SCOLAIRE",
      nom: "🏫 Mécène scolaire",
      description: "Vous avez des enfants scolarisés et bénéficiez de services éducatifs publics",
      critere: "education_services_received",
      seuil: 1,
      categorie: "fiscal_services",
    },
    {
      id: "PILIER_SANTE",
      nom: "🏥 Pilier de santé",
      description: "Vos services de santé reçus dépassent 2000€ annuellement",
      critere: "health_services_received",
      seuil: 2000,
      categorie: "fiscal_services",
    },
    {
      id: "PROFIL_CRISTALLIN",
      nom: "🔍 Profil cristallin",
      description: "Votre score de confiance atteint 90% ou plus",
      critere: "confidence_score",
      seuil: 90,
      categorie: "data_quality",
    },
    {
      id: "ASSIDU_7J",
      nom: "📅 Semaine parfaite",
      description: "Loggez des dépenses pendant 7 jours consécutifs",
      critere: "streak_days",
      seuil: 7,
      categorie: "engagement",
    },
    {
      id: "ASSIDU_14J",
      nom: "📅 Deux semaines d'or",
      description: "Loggez des dépenses pendant 14 jours consécutifs",
      critere: "streak_days",
      seuil: 14,
      categorie: "engagement",
    },
    {
      id: "ASSIDU_30J",
      nom: "📅 Assidu",
      description: "Loggez des dépenses pendant 30 jours consécutifs",
      critere: "streak_days",
      seuil: 30,
      categorie: "engagement",
    },
    {
      id: "ASSIDU_50J",
      nom: "🔥 Expert de la régularité",
      description: "Loggez des dépenses pendant 50 jours consécutifs",
      critere: "streak_days",
      seuil: 50,
      categorie: "engagement",
    },
    {
      id: "ASSIDU_100J",
      nom: "🔥 Champion fiscal",
      description: "Loggez des dépenses pendant 100 jours consécutifs (légendaire)",
      critere: "streak_days",
      seuil: 100,
      categorie: "engagement",
    },
    {
      id: "CHASSEUR_TAXES",
      nom: "🧮 Chasseur de taxes",
      description: "Découvrez 10 taxes indirectes différentes via le journal ou les détails",
      critere: "taxes_discovered",
      seuil: 10,
      categorie: "pedagogical",
    },
    {
      id: "EXPERT_FISCAL",
      nom: "🎓 Expert fiscal",
      description: "Obtenez un score parfait (100%) à n'importe quel quiz",
      critere: "quiz_perfect_score",
      seuil: 1,
      categorie: "pedagogical",
    },
  ];

  for (const badge of badges) {
    await createReferentielEntry({
      millesime: "2026",
      categorie: "BADGE_DEFINITION",
      cle: badge.id,
      valeur: {
        nom: badge.nom,
        description: badge.description,
        critere: badge.critere,
        seuil: badge.seuil,
        categorie: badge.categorie,
      },
      unite: "badge",
      source: "Empreinte Fiscale - Système de gamification",
      urlSource: "https://empreinte-fiscale.fr/gamification",
      datePublication: new Date("2026-02-07"),
      statut: "OFFICIEL",
      notes: `Badge ${badge.categorie}: ${badge.description}`,
    });
  }

  console.log("✓ Badge definitions seeded");
}

async function seedChallengeDefinitions() {
  console.log("Seeding Challenge definitions...");

  const challenges = [
    {
      id: "UPLOAD_AVIS_IMPOSITION",
      nom: "Importez votre avis d'imposition",
      description: "Uploadez votre avis d'imposition pour améliorer la précision de votre score",
      type: "document_upload",
      target: 1,
      recompenseXP: 100,
      duree: null,
      recurrent: false,
    },
    {
      id: "LOG_5_EXPENSES",
      nom: "Loggez 5 dépenses cette semaine",
      description: "Enregistrez au moins 5 dépenses dans votre journal fiscal cette semaine",
      type: "journal_entries",
      target: 5,
      recompenseXP: 50,
      duree: 7,
      recurrent: true,
    },
    {
      id: "COMPLETE_QUIZ",
      nom: "Complétez un quiz fiscal",
      description: "Testez vos connaissances en complétant n'importe quel quiz",
      type: "quiz_completion",
      target: 1,
      recompenseXP: 30,
      duree: null,
      recurrent: false,
    },
    {
      id: "REACH_90_CONFIDENCE",
      nom: "Atteignez 90% de confiance",
      description: "Améliorez la qualité de vos données pour atteindre un score de confiance de 90%",
      type: "confidence_milestone",
      target: 90,
      recompenseXP: 200,
      duree: null,
      recurrent: false,
    },
    {
      id: "SCAN_TICKET",
      nom: "Scannez votre premier ticket",
      description: "Utilisez la fonction scan pour enregistrer un ticket de caisse",
      type: "ticket_scan",
      target: 1,
      recompenseXP: 50,
      duree: null,
      recurrent: false,
    },
    {
      id: "CREATE_SIMULATION",
      nom: "Créez une simulation what-if",
      description: "Explorez un scénario de vie alternatif avec le simulateur",
      type: "simulation_created",
      target: 1,
      recompenseXP: 75,
      duree: null,
      recurrent: false,
    },
  ];

  for (const challenge of challenges) {
    await createReferentielEntry({
      millesime: "2026",
      categorie: "CHALLENGE_DEFINITION",
      cle: challenge.id,
      valeur: {
        nom: challenge.nom,
        description: challenge.description,
        type: challenge.type,
        target: challenge.target,
        recompenseXP: challenge.recompenseXP,
        duree: challenge.duree,
        recurrent: challenge.recurrent,
      },
      unite: "challenge",
      source: "Empreinte Fiscale - Système de gamification",
      urlSource: "https://empreinte-fiscale.fr/gamification",
      datePublication: new Date("2026-02-07"),
      statut: "OFFICIEL",
      notes: `Défi ${challenge.type}: ${challenge.description}`,
    });
  }

  console.log("✓ Challenge definitions seeded");
}

async function seedNotificationTemplates() {
  console.log("Seeding Notification templates...");

  const templates = [
    {
      id: "DAILY_FACT_COFFEE",
      type: "DAILY_FACT",
      titre: "☕ Votre café du matin",
      corps: "Votre contribution routes aujourd'hui = {montantRoutes}€ = prix d'un café !",
      variables: ["montantRoutes"],
    },
    {
      id: "DAILY_FACT_EDUCATION",
      type: "DAILY_FACT",
      titre: "🏫 Éducation publique",
      corps: "Vos enfants bénéficient de {montantEducation}€ de services éducatifs publics cette année.",
      variables: ["montantEducation"],
    },
    {
      id: "FISCAL_ALERT_TAX_DECLARATION",
      type: "FISCAL_ALERT",
      titre: "📅 Déclaration d'impôts",
      corps: "La période de déclaration d'impôts se termine le {dateLimit}. N'oubliez pas !",
      variables: ["dateLimit"],
    },
    {
      id: "FISCAL_ALERT_TAXE_FONCIERE",
      type: "FISCAL_ALERT",
      titre: "🏠 Taxe foncière",
      corps: "Le paiement de votre taxe foncière est prévu le {dateLimit}.",
      variables: ["dateLimit"],
    },
    {
      id: "EVENT_SITUATION_CHANGED",
      type: "EVENT_TRIGGERED",
      titre: "🔄 Situation mise à jour",
      corps: "Votre situation a changé. Recalculer votre score pour voir l'impact ?",
      variables: [],
    },
    {
      id: "EVENT_NEW_BAREME",
      type: "EVENT_TRIGGERED",
      titre: "📊 Nouveaux barèmes disponibles",
      corps: "Les barèmes {millesime} sont disponibles. Recalculez votre score avec les nouvelles données.",
      variables: ["millesime"],
    },
    {
      id: "STREAK_REMINDER",
      type: "EVENT_TRIGGERED",
      titre: "🔥 Ne perdez pas votre série !",
      corps: "Vous avez une série de {streakDays} jours. Ajoutez une dépense avant minuit pour la maintenir !",
      variables: ["streakDays"],
    },
    {
      id: "WEEKLY_DIGEST",
      type: "WEEKLY_DIGEST",
      titre: "📊 Votre semaine fiscale",
      corps: "Cette semaine : {nbEntries} dépenses loguées, {totalTaxes}€ de taxes, série de {streak} jours.",
      variables: ["nbEntries", "totalTaxes", "streak"],
    },
  ];

  for (const template of templates) {
    await createReferentielEntry({
      millesime: "2026",
      categorie: "NOTIFICATION_TEMPLATE",
      cle: template.id,
      valeur: {
        type: template.type,
        titre: template.titre,
        corps: template.corps,
        variables: template.variables,
      },
      unite: "template",
      source: "Empreinte Fiscale - Système de notifications",
      urlSource: "https://empreinte-fiscale.fr/notifications",
      datePublication: new Date("2026-02-07"),
      statut: "OFFICIEL",
      notes: `Template de notification: ${template.type}`,
    });
  }

  console.log("✓ Notification templates seeded");
}

async function seedFiscalCalendar() {
  console.log("Seeding Fiscal calendar dates...");

  const dates = [
    {
      id: "DECLARATION_REVENUS_2026",
      evenement: "Déclaration des revenus 2026",
      dateDebut: new Date("2027-04-08"),
      dateFin: new Date("2027-06-08"),
      type: "deadline",
      description: "Période de déclaration des revenus en ligne pour l'année fiscale 2026",
    },
    {
      id: "TAXE_FONCIERE_2026",
      evenement: "Paiement taxe foncière 2026",
      dateDebut: new Date("2026-10-01"),
      dateFin: new Date("2026-10-15"),
      type: "payment",
      description: "Date limite de paiement de la taxe foncière 2026",
    },
    {
      id: "TAXE_HABITATION_2026",
      evenement: "Paiement taxe d'habitation 2026",
      dateDebut: new Date("2026-11-01"),
      dateFin: new Date("2026-11-15"),
      type: "payment",
      description: "Date limite de paiement de la taxe d'habitation 2026 (résidences secondaires)",
    },
    {
      id: "IFI_2027",
      evenement: "Déclaration IFI 2027",
      dateDebut: new Date("2027-05-01"),
      dateFin: new Date("2027-06-08"),
      type: "deadline",
      description: "Déclaration de l'Impôt sur la Fortune Immobilière pour l'année 2027",
    },
    {
      id: "PLF_2027_PUBLICATION",
      evenement: "Publication PLF 2027",
      dateDebut: new Date("2026-09-27"),
      dateFin: new Date("2026-09-27"),
      type: "publication",
      description: "Publication du Projet de Loi de Finances 2027",
    },
  ];

  for (const date of dates) {
    await createReferentielEntry({
      millesime: "2026",
      categorie: "FISCAL_CALENDAR",
      cle: date.id,
      valeur: {
        evenement: date.evenement,
        dateDebut: date.dateDebut.toISOString(),
        dateFin: date.dateFin.toISOString(),
        type: date.type,
        description: date.description,
      },
      unite: "date",
      source: "Calendrier fiscal officiel - Direction générale des Finances publiques",
      urlSource: "https://www.impots.gouv.fr/calendrier-fiscal",
      datePublication: new Date("2026-01-01"),
      statut: "OFFICIEL",
      notes: `Événement fiscal: ${date.evenement}`,
    });
  }

  console.log("✓ Fiscal calendar dates seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
