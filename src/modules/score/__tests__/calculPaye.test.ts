import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculImpotRevenu,
  calculCSG_CRDS,
  calculCotisationsSalariales,
  calculCotisationsPatronales,
  calculTVA,
  calculTotalPaye,
} from "../calculPaye";
import * as referentiel from "@/modules/referentiel";

// Mock referentiel
vi.mock("@/modules/referentiel", () => ({
  getBaremeIR: vi.fn(),
  getTauxCotisations: vi.fn(),
  getTauxTVA: vi.fn(),
  getPlafondSS: vi.fn(),
}));

describe("calculPaye", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculImpotRevenu", () => {
    beforeEach(() => {
      vi.mocked(referentiel.getBaremeIR).mockResolvedValue({
        tranches: [
          { min: 0, max: 11294, taux: 0 },
          { min: 11294, max: 28797, taux: 0.11 },
          { min: 28797, max: 82341, taux: 0.30 },
          { min: 82341, max: 177106, taux: 0.41 },
          { min: 177106, max: Infinity, taux: 0.45 },
        ],
        decote: {
          seuilCelibataire: 1929,
          seuilCouple: 3191,
          montantMax: 873,
        },
      });
    });

    it("should calculate 0 for revenue below first bracket", async () => {
      const result = await calculImpotRevenu(10000, 1, "2025");
      expect(result).toBe(0);
    });

    it("should calculate correct tax for single person", async () => {
      const result = await calculImpotRevenu(30000, 1, "2025");
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(30000);
    });

    it("should apply quotient familial correctly", async () => {
      const single = await calculImpotRevenu(60000, 1, "2025");
      const couple = await calculImpotRevenu(60000, 2, "2025");
      expect(couple).toBeLessThan(single);
    });

    it("should apply décote for low tax amounts", async () => {
      const result = await calculImpotRevenu(15000, 1, "2025");
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should handle very high incomes", async () => {
      const result = await calculImpotRevenu(500000, 1, "2025");
      expect(result).toBeGreaterThan(100000);
    });
  });

  describe("calculCSG_CRDS", () => {
    beforeEach(() => {
      vi.mocked(referentiel.getTauxCotisations).mockResolvedValue({
        csg_crds: 0.098,
      });
    });

    it("should calculate CSG/CRDS on salary", async () => {
      const result = await calculCSG_CRDS(50000, 0, "2025");
      expect(result).toBe(Math.round(50000 * 0.098));
    });

    it("should calculate CSG/CRDS on patrimoine", async () => {
      const result = await calculCSG_CRDS(0, 10000, "2025");
      expect(result).toBe(Math.round(10000 * 0.172));
    });

    it("should calculate CSG/CRDS on both", async () => {
      const result = await calculCSG_CRDS(50000, 10000, "2025");
      expect(result).toBeGreaterThan(0);
    });

    it("should return 0 for no income", async () => {
      const result = await calculCSG_CRDS(0, 0, "2025");
      expect(result).toBe(0);
    });
  });

  describe("calculCotisationsSalariales", () => {
    beforeEach(() => {
      vi.mocked(referentiel.getTauxCotisations).mockResolvedValue({
        vieillesse_plafonnee: 0.069,
        vieillesse_deplafonnee: 0.004,
        retraite_complementaire_tranche1: 0.0387,
      });
      vi.mocked(referentiel.getPlafondSS).mockResolvedValue(46368);
    });

    it("should calculate cotisations for salary below plafond", async () => {
      const result = await calculCotisationsSalariales(40000, "2025");
      expect(result).toBeGreaterThan(0);
    });

    it("should handle salary above plafond", async () => {
      const result = await calculCotisationsSalariales(80000, "2025");
      expect(result).toBeGreaterThan(0);
    });

    it("should return 0 for no salary", async () => {
      const result = await calculCotisationsSalariales(0, "2025");
      expect(result).toBe(0);
    });
  });

  describe("calculCotisationsPatronales", () => {
    beforeEach(() => {
      vi.mocked(referentiel.getTauxCotisations).mockResolvedValue({
        maladie_maternite: 0.13,
        vieillesse_plafonnee: 0.086,
        vieillesse_deplafonnee: 0.019,
        allocations_familiales: 0.0345,
        accidents_travail: 0.01,
        chomage: 0.0405,
        retraite_complementaire_tranche1: 0.0601,
      });
      vi.mocked(referentiel.getPlafondSS).mockResolvedValue(46368);
    });

    it("should calculate cotisations patronales", async () => {
      const result = await calculCotisationsPatronales(40000, "2025");
      expect(result).toBeGreaterThan(0);
      expect(result).toBeGreaterThan(10000); // ~25-30% du brut
    });

    it("should handle high salaries", async () => {
      const result = await calculCotisationsPatronales(100000, "2025");
      expect(result).toBeGreaterThan(20000);
    });

    it("should return 0 for no salary", async () => {
      const result = await calculCotisationsPatronales(0, "2025");
      expect(result).toBe(0);
    });
  });

  describe("calculTVA", () => {
    beforeEach(() => {
      vi.mocked(referentiel.getTauxTVA).mockResolvedValue({
        normal: 0.20,
        intermediaire: 0.10,
        reduit: 0.055,
        super_reduit: 0.021,
      });
    });

    it("should calculate TVA for typical spending", async () => {
      const result = await calculTVA(30000, "2025");
      expect(result).toBeGreaterThan(3000); // Au moins 10% de TVA moyenne
      expect(result).toBeLessThan(6000); // Maximum ~20%
    });

    it("should return 0 for no spending", async () => {
      const result = await calculTVA(0, "2025");
      expect(result).toBe(0);
    });

    it("should scale with spending", async () => {
      const low = await calculTVA(20000, "2025");
      const high = await calculTVA(40000, "2025");
      expect(high).toBeGreaterThan(low);
      expect(high).toBeCloseTo(low * 2, -2);
    });
  });

  describe("calculTotalPaye", () => {
    beforeEach(() => {
      // Setup all mocks
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
    });

    it("should calculate total for complete profile", async () => {
      const profil = {
        revenus: {
          salaireBrut: 50000,
          salaireNet: 39000,
          typeContrat: "CDI" as const,
          revenusFonciers: 5000,
          revenusCapitaux: 2000,
          autresRevenus: 0,
        },
        situation: {
          statut: "celibataire" as const,
          nombreParts: 1,
          commune: "Paris",
          age: 35,
        },
        patrimoine: {
          proprietaire: true,
          valeurLocative: 8000,
          taxeFonciere: 1200,
          vehicules: [],
          patrimoineIFI: null,
        },
      };

      const result = await calculTotalPaye(profil, "2025");

      expect(result.impotRevenu).toBeGreaterThan(0);
      expect(result.csg_crds).toBeGreaterThan(0);
      expect(result.cotisationsSalariales).toBeGreaterThan(0);
      expect(result.cotisationsPatronales).toBeGreaterThan(0);
      expect(result.tva).toBeGreaterThan(0);
      expect(result.taxeFonciere).toBe(1200);
    });

    it("should handle minimal profile", async () => {
      const profil = {
        revenus: { salaireBrut: 20000, salaireNet: 15600 },
        situation: { nombreParts: 1 },
      };

      const result = await calculTotalPaye(profil, "2025");

      expect(result.impotRevenu).toBeGreaterThanOrEqual(0);
      expect(result.csg_crds).toBeGreaterThan(0);
    });

    it("should handle IFI for high patrimoine", async () => {
      const profil = {
        revenus: { salaireBrut: 100000, salaireNet: 78000 },
        situation: { nombreParts: 2 },
        patrimoine: { patrimoineIFI: 2000000 },
      };

      const result = await calculTotalPaye(profil, "2025");

      expect(result.ifi).toBeGreaterThan(0);
    });
  });
});
