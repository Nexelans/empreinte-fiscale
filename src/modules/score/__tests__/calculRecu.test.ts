import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculAllocations,
  calculCoutEducation,
  calculServicesMutualises,
  calculTotalRecu,
} from "../calculRecu";
import * as referentiel from "@/modules/referentiel";

// Mock referentiel
vi.mock("@/modules/referentiel", () => ({
  getCoutEducation: vi.fn(),
  getBudgetPLF: vi.fn(),
  getStatsINSEE: vi.fn(),
}));

describe("calculRecu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculAllocations", () => {
    it("should return 0 for no children", async () => {
      const result = await calculAllocations(0, 50000);
      expect(result).toBe(0);
    });

    it("should return 0 for single child", async () => {
      const result = await calculAllocations(1, 50000);
      expect(result).toBe(0);
    });

    it("should calculate allocations for 2 children", async () => {
      const result = await calculAllocations(2, 50000);
      expect(result).toBe(1500);
    });

    it("should calculate allocations for 3 children", async () => {
      const result = await calculAllocations(3, 50000);
      expect(result).toBe(2800);
    });

    it("should apply means-testing for high income", async () => {
      const normalIncome = await calculAllocations(2, 50000);
      const highIncome = await calculAllocations(2, 150000);
      expect(highIncome).toBeLessThan(normalIncome);
      expect(highIncome).toBe(Math.round(normalIncome * 0.5));
    });

    it("should scale with number of children", async () => {
      const result4 = await calculAllocations(4, 50000);
      const result5 = await calculAllocations(5, 50000);
      expect(result5).toBeGreaterThan(result4);
      expect(result5).toBe(result4 + 800);
    });
  });

  describe("calculCoutEducation", () => {
    beforeEach(() => {
      vi.mocked(referentiel.getCoutEducation).mockImplementation(
        async (millesime, niveau) => {
          const couts: Record<string, number> = {
            maternelle: 7000,
            primaire: 7000,
            college: 9000,
            lycee_general: 11000,
            lycee_professionnel: 12000,
            superieur_public: 11000,
            superieur_prive: 15000,
          };
          return couts[niveau] || 0;
        }
      );
    });

    it("should return 0 for no children", async () => {
      const result = await calculCoutEducation([], "2025");
      expect(result).toBe(0);
    });

    it("should calculate cost for single child", async () => {
      const enfants = [{ age: 8, niveauScolaire: "primaire" as const }];
      const result = await calculCoutEducation(enfants, "2025");
      expect(result).toBe(7000);
    });

    it("should sum costs for multiple children", async () => {
      const enfants = [
        { age: 8, niveauScolaire: "primaire" as const },
        { age: 14, niveauScolaire: "college" as const },
        { age: 17, niveauScolaire: "lycee_general" as const },
      ];
      const result = await calculCoutEducation(enfants, "2025");
      expect(result).toBe(27000); // 7000 + 9000 + 11000
    });

    it("should handle different education levels", async () => {
      const primaire = await calculCoutEducation(
        [{ age: 8, niveauScolaire: "primaire" }],
        "2025"
      );
      const superieur = await calculCoutEducation(
        [{ age: 20, niveauScolaire: "superieur_public" }],
        "2025"
      );
      expect(superieur).toBeGreaterThan(primaire);
    });
  });

  describe("calculServicesMutualises", () => {
    beforeEach(() => {
      vi.mocked(referentiel.getStatsINSEE).mockResolvedValue(68000000); // Population
      vi.mocked(referentiel.getBudgetPLF).mockImplementation(
        async (millesime, fonction) => {
          const budgets: Record<string, number> = {
            defense: 40000, // millions
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

    it("should calculate per-person share of public services", async () => {
      const result = await calculServicesMutualises(0, "2025");

      expect(result.securite).toBeGreaterThan(0);
      expect(result.infrastructure).toBeGreaterThan(0);
      expect(result.culture).toBeGreaterThan(0);
      expect(result.administration).toBeGreaterThan(0);
      expect(result.chargesDette).toBeGreaterThan(0);
      expect(result.sante).toBe(2000); // Fixed estimation
      expect(result.education).toBe(0); // Calculated separately
    });

    it("should have reasonable per-capita amounts", async () => {
      const result = await calculServicesMutualises(0, "2025");

      // Vérification que les montants sont dans des ordres de grandeur raisonnables
      expect(result.securite).toBeGreaterThan(500);
      expect(result.securite).toBeLessThan(2000);
      expect(result.chargesDette).toBeGreaterThan(500);
    });

    it("should be consistent regardless of children", async () => {
      const result0 = await calculServicesMutualises(0, "2025");
      const result2 = await calculServicesMutualises(2, "2025");

      // Les services mutualisés (hors éducation) sont les mêmes
      expect(result0.securite).toBe(result2.securite);
      expect(result0.infrastructure).toBe(result2.infrastructure);
    });
  });

  describe("calculTotalRecu", () => {
    beforeEach(() => {
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

    it("should calculate total for profile without children", async () => {
      const profil = {
        familleServices: {
          nombreEnfants: 0,
          enfants: [],
          frequenceServices: {
            transportsCommun: "jamais" as const,
            hopitalMedecin: "jamais" as const,
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
        revenus: {
          salaireBrut: 50000,
          salaireNet: 39000,
          typeContrat: "CDI" as const,
          revenusFonciers: 0,
          revenusCapitaux: 0,
          autresRevenus: 0,
        },
      };

      const result = await calculTotalRecu(profil, 0, "2025");

      expect(result.transfertsDirects.allocations).toBe(0);
      expect(result.transfertsDirects.remboursementsSante).toBeGreaterThan(0);
      expect(result.servicesMutualises.education).toBe(0);
      expect(result.servicesMutualises.sante).toBe(2000);
      expect(result.servicesMutualises.securite).toBeGreaterThan(0);
    });

    it("should include allocations for families", async () => {
      const profil = {
        familleServices: {
          nombreEnfants: 2,
          enfants: [],
          frequenceServices: {} as any,
          aides: {
            caf: false,
            apl: false,
            rsa: false,
            bourses: false,
            chomage: false,
            cmuc: false,
          },
        },
        revenus: { salaireBrut: 40000, revenusFonciers: 0 },
      };

      const result = await calculTotalRecu(profil, 18000, "2025");

      expect(result.transfertsDirects.allocations).toBe(1500);
      expect(result.servicesMutualises.education).toBe(18000);
    });

    it("should include education costs when provided", async () => {
      const profil = {
        familleServices: {
          nombreEnfants: 1,
          enfants: [],
          frequenceServices: {} as any,
          aides: {} as any,
        },
        revenus: {},
      };

      const result = await calculTotalRecu(profil, 9000, "2025");

      expect(result.servicesMutualises.education).toBe(9000);
    });

    it("should have all required fields", async () => {
      const profil = {
        familleServices: {
          nombreEnfants: 0,
          enfants: [],
          frequenceServices: {} as any,
          aides: {} as any,
        },
        revenus: {},
      };

      const result = await calculTotalRecu(profil, 0, "2025");

      // Transferts directs
      expect(result.transfertsDirects).toHaveProperty("allocations");
      expect(result.transfertsDirects).toHaveProperty("apl");
      expect(result.transfertsDirects).toHaveProperty("remboursementsSante");
      expect(result.transfertsDirects).toHaveProperty("autres");

      // Services mutualisés
      expect(result.servicesMutualises).toHaveProperty("education");
      expect(result.servicesMutualises).toHaveProperty("sante");
      expect(result.servicesMutualises).toHaveProperty("securite");
      expect(result.servicesMutualises).toHaveProperty("infrastructure");
      expect(result.servicesMutualises).toHaveProperty("culture");
      expect(result.servicesMutualises).toHaveProperty("administration");
      expect(result.servicesMutualises).toHaveProperty("chargesDette");
    });
  });
});
