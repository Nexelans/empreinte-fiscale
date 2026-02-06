import { describe, it, expect } from "vitest";
import {
  calculerScoreConfiance,
  marquerChampVerifie,
  marquerChampsVerifies,
  getCouleurScore,
  getIconeStatut,
  getLabelStatut,
} from "../scoreConfiance";

describe("scoreConfiance", () => {
  describe("calculerScoreConfiance", () => {
    it("should calculate low score for minimal profile", () => {
      const profil = {
        revenus: {
          salaireBrut: null,
          salaireNet: null,
          typeContrat: null,
          revenusFonciers: null,
          revenusCapitaux: null,
          autresRevenus: null,
        },
        statusData: {},
      };

      const result = calculerScoreConfiance(profil);

      expect(result.scoreGlobal).toBeLessThan(50);
      expect(result.nombreChampsVerifies).toBe(0);
      expect(result.recommandations.length).toBeGreaterThan(0);
    });

    it("should calculate high score for verified profile", () => {
      const profil = {
        revenus: {
          salaireBrut: 50000,
          salaireNet: 39000,
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
          mode: "detaille" as const,
          detailCategories: {
            alimentation_tva_55: 3000,
            alimentation_tva_20: 1500,
            restaurants: 1800,
            transport: 2400,
            logement: 6000,
            sante: 800,
            loisirs: 1200,
            equipement: 2000,
            autres: 1000,
          },
        },
        familleServices: {
          nombreEnfants: 2,
          enfants: [
            { age: 8, niveauScolaire: "primaire" as const },
            { age: 12, niveauScolaire: "college" as const },
          ],
          frequenceServices: {} as any,
          aides: {
            caf: true,
            montantCAF: 1500,
            apl: false,
            rsa: false,
            bourses: false,
            chomage: false,
            cmuc: false,
          },
        },
        statusData: {
          salaireBrut: "VERIFIE",
          salaireNet: "VERIFIE",
          revenusFonciers: "VERIFIE",
          taxeFonciere: "VERIFIE",
          consommation: "DECLARE",
          nombreEnfants: "VERIFIE",
          aides: "VERIFIE",
        },
      };

      const result = calculerScoreConfiance(profil);

      expect(result.scoreGlobal).toBeGreaterThan(70);
      expect(result.nombreChampsVerifies).toBeGreaterThan(4);
      expect(result.tauxCompletude).toBeGreaterThan(50);
      expect(result.details.length).toBeGreaterThan(5);
    });

    it("should provide recommendations for improvement", () => {
      const profil = {
        revenus: {
          salaireBrut: 50000,
          salaireNet: 39000,
          typeContrat: "CDI" as const,
          revenusFonciers: null,
          revenusCapitaux: null,
          autresRevenus: null,
        },
        consommation: {
          mode: "profil_type" as const,
          profilType: "moyen" as const,
        },
        statusData: {
          salaireBrut: "DECLARE",
          salaireNet: "DECLARE",
        },
      };

      const result = calculerScoreConfiance(profil);

      expect(result.recommandations.length).toBeGreaterThan(0);
      expect(result.recommandations.some((r) => r.includes("dépenses réelles"))).toBe(true);
    });

    it("should handle profile with IFI", () => {
      const profil = {
        patrimoine: {
          proprietaire: true,
          valeurLocative: 20000,
          taxeFonciere: 3000,
          vehicules: [],
          patrimoineIFI: 2000000,
        },
        statusData: {
          patrimoineIFI: "DECLARE",
          taxeFonciere: "VERIFIE",
        },
      };

      const result = calculerScoreConfiance(profil);

      expect(result.details.some((d) => d.categorie.includes("IFI"))).toBe(true);
      expect(result.details.some((d) => d.categorie.includes("Taxe foncière"))).toBe(true);
    });

    it("should weight detailed consumption higher", () => {
      const profilSimple = {
        consommation: {
          mode: "profil_type" as const,
          profilType: "moyen" as const,
        },
        statusData: {
          consommation: "DECLARE",
        },
      };

      const profilDetaille = {
        consommation: {
          mode: "detaille" as const,
          detailCategories: {
            alimentation_tva_55: 3000,
            alimentation_tva_20: 1500,
            restaurants: 1800,
            transport: 2400,
            logement: 6000,
            sante: 800,
            loisirs: 1200,
            equipement: 2000,
            autres: 1000,
          },
        },
        statusData: {
          consommation: "DECLARE",
        },
      };

      const resultSimple = calculerScoreConfiance(profilSimple);
      const resultDetaille = calculerScoreConfiance(profilDetaille);

      // Le profil détaillé devrait avoir un poids plus élevé
      const poidsSimple = resultSimple.details.find((d) =>
        d.categorie.includes("Consommation")
      )?.poids;
      const poidsDetaille = resultDetaille.details.find((d) =>
        d.categorie.includes("Consommation")
      )?.poids;

      expect(poidsDetaille).toBeGreaterThan(poidsSimple || 0);
    });

    it("should recommend completing children details", () => {
      const profil = {
        familleServices: {
          nombreEnfants: 3,
          enfants: [{ age: 8, niveauScolaire: "primaire" as const }],
          frequenceServices: {} as any,
          aides: {} as any,
        },
        statusData: {
          nombreEnfants: "DECLARE",
        },
      };

      const result = calculerScoreConfiance(profil);

      expect(
        result.recommandations.some((r) => r.includes("Complétez les détails de vos enfants"))
      ).toBe(true);
    });

    it("should calculate taux de completude correctly", () => {
      const profil = {
        revenus: {
          salaireBrut: 50000,
          salaireNet: 39000,
          typeContrat: "CDI" as const,
          revenusFonciers: null,
          revenusCapitaux: null,
          autresRevenus: null,
        },
        statusData: {
          salaireBrut: "VERIFIE",
          salaireNet: "DECLARE",
        },
      };

      const result = calculerScoreConfiance(profil);

      expect(result.nombreChampsTotal).toBe(2);
      expect(result.nombreChampsVerifies).toBe(1);
      expect(result.tauxCompletude).toBe(50);
    });
  });

  describe("marquerChampVerifie", () => {
    it("should mark field as verified", () => {
      const statusData = {
        salaireBrut: "DECLARE" as const,
        salaireNet: "DECLARE" as const,
      };

      const updated = marquerChampVerifie(statusData, "salaireBrut");

      expect(updated.salaireBrut).toBe("VERIFIE");
      expect(updated.salaireNet).toBe("DECLARE");
    });

    it("should add new field if not exists", () => {
      const statusData = {};

      const updated = marquerChampVerifie(statusData, "taxeFonciere");

      expect(updated.taxeFonciere).toBe("VERIFIE");
    });

    it("should not mutate original", () => {
      const statusData = { salaireBrut: "DECLARE" as const };

      const updated = marquerChampVerifie(statusData, "salaireBrut");

      expect(statusData.salaireBrut).toBe("DECLARE");
      expect(updated.salaireBrut).toBe("VERIFIE");
    });
  });

  describe("marquerChampsVerifies", () => {
    it("should mark multiple fields as verified", () => {
      const statusData = {
        salaireBrut: "DECLARE" as const,
        salaireNet: "DECLARE" as const,
        revenusFonciers: "DECLARE" as const,
      };

      const updated = marquerChampsVerifies(statusData, ["salaireBrut", "salaireNet"]);

      expect(updated.salaireBrut).toBe("VERIFIE");
      expect(updated.salaireNet).toBe("VERIFIE");
      expect(updated.revenusFonciers).toBe("DECLARE");
    });

    it("should handle empty array", () => {
      const statusData = { salaireBrut: "DECLARE" as const };

      const updated = marquerChampsVerifies(statusData, []);

      expect(updated).toEqual(statusData);
    });
  });

  describe("getCouleurScore", () => {
    it("should return green for high scores", () => {
      expect(getCouleurScore(90)).toBe("green");
      expect(getCouleurScore(80)).toBe("green");
    });

    it("should return blue for good scores", () => {
      expect(getCouleurScore(70)).toBe("blue");
      expect(getCouleurScore(60)).toBe("blue");
    });

    it("should return orange for medium scores", () => {
      expect(getCouleurScore(50)).toBe("orange");
      expect(getCouleurScore(40)).toBe("orange");
    });

    it("should return red for low scores", () => {
      expect(getCouleurScore(30)).toBe("red");
      expect(getCouleurScore(10)).toBe("red");
    });
  });

  describe("getIconeStatut", () => {
    it("should return correct icons", () => {
      expect(getIconeStatut("VERIFIE")).toBe("🟢");
      expect(getIconeStatut("DECLARE")).toBe("🟡");
      expect(getIconeStatut("ESTIME")).toBe("🔴");
    });
  });

  describe("getLabelStatut", () => {
    it("should return correct labels", () => {
      expect(getLabelStatut("VERIFIE")).toBe("Vérifié");
      expect(getLabelStatut("DECLARE")).toBe("Déclaré");
      expect(getLabelStatut("ESTIME")).toBe("Estimé");
    });
  });
});
