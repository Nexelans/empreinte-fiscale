import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculerScoreFiscal } from "../index";
import * as referentiel from "@/modules/referentiel";

// Mock referentiel
vi.mock("@/modules/referentiel");

describe("calculerScoreFiscal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup standard mocks
    vi.mocked(referentiel.getMillesimeActif).mockResolvedValue("2025");
    vi.mocked(referentiel.getBaremeIR).mockResolvedValue({
      tranches: [
        { min: 0, max: 11294, taux: 0 },
        { min: 11294, max: 28797, taux: 0.11 },
        { min: 28797, max: 82341, taux: 0.30 },
        { min: 82341, max: 177106, taux: 0.41 },
        { min: 177106, max: Infinity, taux: 0.45 },
      ],
      decote: { seuilCelibataire: 1929, seuilCouple: 3191, montantMax: 873 },
    });
    vi.mocked(referentiel.getTauxCotisations).mockImplementation(
      async (millesime, type) => {
        if (type === "salariales") {
          return {
            csg_crds: 0.098,
            vieillesse_plafonnee: 0.069,
            vieillesse_deplafonnee: 0.004,
            retraite_complementaire_tranche1: 0.0387,
          };
        }
        return {
          maladie_maternite: 0.13,
          vieillesse_plafonnee: 0.086,
          vieillesse_deplafonnee: 0.019,
          allocations_familiales: 0.0345,
          accidents_travail: 0.01,
          chomage: 0.0405,
          retraite_complementaire_tranche1: 0.0601,
        };
      }
    );
    vi.mocked(referentiel.getTauxTVA).mockResolvedValue({
      normal: 0.20,
      intermediaire: 0.10,
      reduit: 0.055,
      super_reduit: 0.021,
    });
    vi.mocked(referentiel.getPlafondSS).mockResolvedValue(46368);
    vi.mocked(referentiel.getCoutEducation).mockResolvedValue(9000);
    vi.mocked(referentiel.getStatsINSEE).mockResolvedValue(68000000);
    vi.mocked(referentiel.getBudgetPLF).mockImplementation(
      async (millesime, fonction) => {
        const budgets: Record<string, number> = {
          defense: 40000,
          justice: 10000,
          police: 20000,
          infrastructure: 15000,
          culture: 3000,
          administration: 25000,
          charge_dette: 50000,
        };
        return budgets[fonction] || 0;
      }
    );
  });

  it("should calculate complete score for typical profile", async () => {
    const profil = {
      situation: {
        statut: "celibataire" as const,
        nombreParts: 1,
        commune: "Paris",
        age: 35,
      },
      revenus: {
        salaireBrut: 50000,
        salaireNet: 39000,
        typeContrat: "CDI" as const,
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: false,
        valeurLocative: null,
        taxeFonciere: null,
        vehicules: [],
        patrimoineIFI: null,
      },
      consommation: {
        mode: "profil_type" as const,
        profilType: "moyen" as const,
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: {
          transportsCommun: "occasionnelle" as const,
          hopitalMedecin: "annuelle" as const,
          bibliotheque: "jamais" as const,
          equipementsSportifs: "jamais" as const,
        },
        aides: {
          caf: false,
          apl: false,
          rsa: false,
          bourses: false,
          chomage: false,
          cmuc: false,
        },
      },
      statusData: {},
    };

    const score = await calculerScoreFiscal(profil);

    // Structure checks
    expect(score).toHaveProperty("annee");
    expect(score).toHaveProperty("millesime");
    expect(score).toHaveProperty("totalPaye");
    expect(score).toHaveProperty("detailPaye");
    expect(score).toHaveProperty("totalRecu");
    expect(score).toHaveProperty("detailRecu");
    expect(score).toHaveProperty("soldeNet");
    expect(score).toHaveProperty("ratio");
    expect(score).toHaveProperty("scoreConfiance");
    expect(score).toHaveProperty("metadata");

    // Value checks
    expect(score.annee).toBe(2025);
    expect(score.millesime).toBe("2025");
    expect(score.totalPaye).toBeGreaterThan(0);
    expect(score.totalRecu).toBeGreaterThan(0);
    expect(score.scoreConfiance).toBeGreaterThan(0);
    expect(score.scoreConfiance).toBeLessThanOrEqual(100);

    // Detail checks
    expect(score.detailPaye.impotRevenu).toBeGreaterThan(0);
    expect(score.detailPaye.csg_crds).toBeGreaterThan(0);
    expect(score.detailPaye.cotisationsSalariales).toBeGreaterThan(0);
    expect(score.detailPaye.cotisationsPatronales).toBeGreaterThan(0);
    expect(score.detailPaye.tva).toBeGreaterThan(0);

    expect(score.detailRecu.servicesMutualises.sante).toBeGreaterThan(0);
    expect(score.detailRecu.servicesMutualises.securite).toBeGreaterThan(0);
  });

  it("should calculate score for family with children", async () => {
    const profil = {
      situation: {
        statut: "marie_pacse" as const,
        nombreParts: 3,
        commune: "Lyon",
        age: 40,
      },
      revenus: {
        salaireBrut: 70000,
        salaireNet: 54600,
        typeContrat: "CDI" as const,
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: true,
        valeurLocative: 10000,
        taxeFonciere: 1500,
        vehicules: [],
        patrimoineIFI: null,
      },
      consommation: {
        mode: "profil_type" as const,
        profilType: "moyen" as const,
      },
      familleServices: {
        nombreEnfants: 2,
        enfants: [
          { age: 8, niveauScolaire: "primaire" as const },
          { age: 12, niveauScolaire: "college" as const },
        ],
        frequenceServices: {
          transportsCommun: "quotidienne" as const,
          hopitalMedecin: "mensuelle" as const,
          bibliotheque: "occasionnelle" as const,
          equipementsSportifs: "hebdomadaire" as const,
        },
        aides: {
          caf: true,
          apl: false,
          rsa: false,
          bourses: false,
          chomage: false,
          cmuc: false,
        },
      },
      statusData: {},
    };

    const score = await calculerScoreFiscal(profil);

    expect(score.totalPaye).toBeGreaterThan(0);
    expect(score.totalRecu).toBeGreaterThan(0);
    expect(score.detailPaye.taxeFonciere).toBe(1500);
    expect(score.detailRecu.transfertsDirects.allocations).toBe(1500);
    expect(score.detailRecu.servicesMutualises.education).toBe(18000);
  });

  it("should handle high-income profile", async () => {
    const profil = {
      situation: {
        statut: "marie_pacse" as const,
        nombreParts: 2,
        commune: "Paris",
        age: 50,
      },
      revenus: {
        salaireBrut: 200000,
        salaireNet: 156000,
        typeContrat: "CDI" as const,
        revenusFonciers: 30000,
        revenusCapitaux: 20000,
        autresRevenus: 0,
      },
      patrimoine: {
        proprietaire: true,
        valeurLocative: 20000,
        taxeFonciere: 3000,
        vehicules: [],
        patrimoineIFI: 2000000,
      },
      consommation: {
        mode: "profil_type" as const,
        profilType: "eleve" as const,
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: {
          transportsCommun: "jamais" as const,
          hopitalMedecin: "mensuelle" as const,
          bibliotheque: "jamais" as const,
          equipementsSportifs: "hebdomadaire" as const,
        },
        aides: {
          caf: false,
          apl: false,
          rsa: false,
          bourses: false,
          chomage: false,
          cmuc: false,
        },
      },
      statusData: {},
    };

    const score = await calculerScoreFiscal(profil);

    expect(score.totalPaye).toBeGreaterThan(70000);
    expect(score.detailPaye.impotRevenu).toBeGreaterThan(20000);
    expect(score.detailPaye.ifi).toBeGreaterThan(0);
    expect(score.soldeNet).toBeGreaterThan(0); // Contributeur net
  });

  it("should reject invalid profile", async () => {
    const profil = {
      revenus: {
        salaireBrut: 30000,
        salaireNet: 40000, // Invalid: net > brut
        typeContrat: "CDI" as const,
        revenusFonciers: null,
        revenusCapitaux: null,
        autresRevenus: null,
      },
    };

    await expect(calculerScoreFiscal(profil)).rejects.toThrow("Profil invalide");
  });

  it("should use provided millesime", async () => {
    const profil = {
      situation: { nombreParts: 1 },
      revenus: { salaireBrut: 40000, salaireNet: 31200 },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: {} as any,
        aides: {} as any,
      },
    };

    const score = await calculerScoreFiscal(profil, "2024");

    expect(score.millesime).toBe("2024");
    expect(vi.mocked(referentiel.getMillesimeActif)).not.toHaveBeenCalled();
  });

  it("should calculate ratio correctly", async () => {
    const profil = {
      situation: { nombreParts: 1 },
      revenus: { salaireBrut: 50000, salaireNet: 39000 },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: {} as any,
        aides: {} as any,
      },
    };

    const score = await calculerScoreFiscal(profil);

    expect(score.ratio).toBeGreaterThan(0);
    expect(score.ratio).toBeCloseTo(score.totalPaye / score.totalRecu, 2);
  });

  it("should handle edge case with zero recu", async () => {
    vi.mocked(referentiel.getBudgetPLF).mockResolvedValue(0);
    vi.mocked(referentiel.getStatsINSEE).mockResolvedValue(1);

    const profil = {
      situation: { nombreParts: 1 },
      revenus: { salaireBrut: 50000, salaireNet: 39000 },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: {} as any,
        aides: {} as any,
      },
    };

    const score = await calculerScoreFiscal(profil);

    expect(score.ratio).toBe(0); // safeDivide should handle this
  });
});
