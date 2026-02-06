import { describe, it, expect, beforeAll } from "vitest";
import {
  getReferentiel,
  getBaremeIR,
  getTauxCotisations,
  getTauxTVA,
  getCoutEducation,
  getBudgetPLF,
  getStatsINSEE,
  getMillesimeActif,
} from "./service";

// Note: These tests require a seeded database to run
// Run `npm run db:seed` before running tests

describe("Référentiel Service", () => {
  const MILLESIME_TEST = "2026";

  describe("getReferentiel", () => {
    it("should retrieve a referentiel entry", async () => {
      const entry = await getReferentiel(MILLESIME_TEST, "TAUX_TVA", "normal");
      expect(entry).toBeDefined();
      expect(entry.millesime).toBe(MILLESIME_TEST);
      expect(entry.categorie).toBe("TAUX_TVA");
      expect(entry.cle).toBe("normal");
      expect(entry.valeur).toBe(0.20);
    });

    it("should throw error for missing entry", async () => {
      await expect(
        getReferentiel(MILLESIME_TEST, "INVALID", "invalid")
      ).rejects.toThrow("Donnée manquante dans Référentiel");
    });
  });

  describe("getBaremeIR", () => {
    it("should retrieve complete IR barème", async () => {
      const bareme = await getBaremeIR(MILLESIME_TEST);
      expect(bareme.tranches).toHaveLength(5);
      expect(bareme.tranches[0]?.taux).toBe(0);
      expect(bareme.tranches[4]?.taux).toBe(0.45);
      expect(bareme.decote).toBeDefined();
      expect(bareme.plafondQuotientFamilial).toBeDefined();
    });

    it("should have continuous tranches", async () => {
      const bareme = await getBaremeIR(MILLESIME_TEST);
      for (let i = 0; i < bareme.tranches.length - 1; i++) {
        const current = bareme.tranches[i];
        const next = bareme.tranches[i + 1];
        if (current && next) {
          expect(current.max).toBe(next.min);
        }
      }
    });
  });

  describe("getTauxCotisations", () => {
    it("should retrieve cotisations salariales", async () => {
      const taux = await getTauxCotisations(MILLESIME_TEST, "salariales");
      expect(taux).toBeDefined();
      expect(taux.csg_crds).toBe(0.098);
    });

    it("should retrieve cotisations patronales", async () => {
      const taux = await getTauxCotisations(MILLESIME_TEST, "patronales");
      expect(taux).toBeDefined();
      expect(taux.maladie_maternite).toBe(0.13);
    });
  });

  describe("getTauxTVA", () => {
    it("should retrieve all TVA rates", async () => {
      const taux = await getTauxTVA(MILLESIME_TEST);
      expect(taux.normal).toBe(0.20);
      expect(taux.intermediaire).toBe(0.10);
      expect(taux.reduit).toBe(0.055);
      expect(taux.super_reduit).toBe(0.021);
    });
  });

  describe("getCoutEducation", () => {
    it("should retrieve education cost for primaire", async () => {
      const cout = await getCoutEducation(MILLESIME_TEST, "primaire");
      expect(cout).toBe(7510);
    });

    it("should retrieve education cost for college", async () => {
      const cout = await getCoutEducation(MILLESIME_TEST, "college");
      expect(cout).toBe(9530);
    });
  });

  describe("getBudgetPLF", () => {
    it("should retrieve defense budget", async () => {
      const budget = await getBudgetPLF(MILLESIME_TEST, "defense");
      expect(budget).toBe(50100);
    });

    it("should retrieve education budget", async () => {
      const budget = await getBudgetPLF(MILLESIME_TEST, "education");
      expect(budget).toBe(67800);
    });
  });

  describe("getStatsINSEE", () => {
    it("should retrieve population", async () => {
      const pop = await getStatsINSEE<number>(MILLESIME_TEST, "population_france");
      expect(pop).toBe(68042591);
    });

    it("should retrieve consumption stats", async () => {
      const conso = await getStatsINSEE(MILLESIME_TEST, "conso_moyenne_decile_5");
      expect(conso).toBeDefined();
      expect(typeof conso).toBe("object");
    });
  });

  describe("getMillesimeActif", () => {
    it("should retrieve the active millésime", async () => {
      const millesime = await getMillesimeActif();
      expect(millesime).toBe("2026");
    });
  });

  describe("Cache", () => {
    it("should cache results on second call", async () => {
      const start1 = Date.now();
      await getTauxTVA(MILLESIME_TEST);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await getTauxTVA(MILLESIME_TEST);
      const time2 = Date.now() - start2;

      // Second call should be significantly faster (cached)
      expect(time2).toBeLessThan(time1);
    });
  });
});
