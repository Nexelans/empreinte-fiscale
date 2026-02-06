import { describe, it, expect } from "vitest";
import {
  validateProfilForScore,
  handleEdgeCases,
  safeDivide,
} from "../validation";

describe("validation", () => {
  describe("validateProfilForScore", () => {
    it("should validate correct profile", () => {
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
          revenusFonciers: null,
          revenusCapitaux: null,
          autresRevenus: null,
        },
        familleServices: {
          nombreEnfants: 0,
          enfants: [],
          frequenceServices: {} as any,
          aides: {} as any,
        },
      };

      const result = validateProfilForScore(profil);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid salary (net > brut)", () => {
      const profil = {
        revenus: {
          salaireBrut: 30000,
          salaireNet: 40000,
          typeContrat: "CDI" as const,
          revenusFonciers: null,
          revenusCapitaux: null,
          autresRevenus: null,
        },
      };

      const result = validateProfilForScore(profil);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Le salaire net ne peut pas être supérieur au salaire brut"
      );
    });

    it("should detect invalid nombre de parts", () => {
      const profil = {
        situation: {
          statut: "celibataire" as const,
          nombreParts: 0.5,
          commune: "Paris",
          age: 35,
        },
      };

      const result = validateProfilForScore(profil);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Le nombre de parts fiscales doit être au moins 1"
      );
    });

    it("should warn for unusually high parts", () => {
      const profil = {
        situation: {
          statut: "marie_pacse" as const,
          nombreParts: 12,
          commune: "Lyon",
          age: 45,
        },
      };

      const result = validateProfilForScore(profil);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        "Nombre de parts fiscales inhabituellement élevé"
      );
    });

    it("should detect negative patrimoine IFI", () => {
      const profil = {
        patrimoine: {
          proprietaire: true,
          valeurLocative: 10000,
          taxeFonciere: 1500,
          vehicules: [],
          patrimoineIFI: -100000,
        },
      };

      const result = validateProfilForScore(profil);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Le patrimoine IFI ne peut pas être négatif"
      );
    });

    it("should detect negative nombre d'enfants", () => {
      const profil = {
        familleServices: {
          nombreEnfants: -1,
          enfants: [],
          frequenceServices: {} as any,
          aides: {} as any,
        },
      };

      const result = validateProfilForScore(profil);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Le nombre d'enfants ne peut pas être négatif"
      );
    });

    it("should warn for mismatch between nombre enfants and details", () => {
      const profil = {
        familleServices: {
          nombreEnfants: 3,
          enfants: [
            { age: 8, niveauScolaire: "primaire" as const },
            { age: 12, niveauScolaire: "college" as const },
          ],
          frequenceServices: {} as any,
          aides: {} as any,
        },
      };

      const result = validateProfilForScore(profil);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("ne correspond pas");
    });

    it("should warn for age < 18", () => {
      const profil = {
        situation: {
          statut: "celibataire" as const,
          nombreParts: 1,
          commune: "Paris",
          age: 16,
        },
      };

      const result = validateProfilForScore(profil);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("Âge inférieur à 18 ans");
    });

    it("should detect invalid age", () => {
      const profil = {
        situation: {
          statut: "celibataire" as const,
          nombreParts: 1,
          commune: "Paris",
          age: 150,
        },
      };

      const result = validateProfilForScore(profil);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Âge invalide");
    });

    it("should warn for revenus fonciers without property", () => {
      const profil = {
        revenus: {
          salaireBrut: 40000,
          salaireNet: 31200,
          typeContrat: "CDI" as const,
          revenusFonciers: 10000,
          revenusCapitaux: null,
          autresRevenus: null,
        },
        patrimoine: {
          proprietaire: false,
          valeurLocative: null,
          taxeFonciere: null,
          vehicules: [],
          patrimoineIFI: null,
        },
      };

      const result = validateProfilForScore(profil);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        "Revenus fonciers déclarés mais vous n'êtes pas propriétaire"
      );
    });
  });

  describe("handleEdgeCases", () => {
    it("should round to 2 decimals", () => {
      expect(handleEdgeCases(123.456789)).toBe(123.46);
      expect(handleEdgeCases(100.1111)).toBe(100.11);
    });

    it("should convert negative to 0", () => {
      expect(handleEdgeCases(-100)).toBe(0);
      expect(handleEdgeCases(-0.01)).toBe(0);
    });

    it("should keep positive values", () => {
      expect(handleEdgeCases(100)).toBe(100);
      expect(handleEdgeCases(0.01)).toBe(0.01);
    });

    it("should handle 0", () => {
      expect(handleEdgeCases(0)).toBe(0);
    });

    it("should handle large numbers", () => {
      expect(handleEdgeCases(1000000.999)).toBe(1000001);
    });
  });

  describe("safeDivide", () => {
    it("should divide normally", () => {
      expect(safeDivide(10, 2)).toBe(5);
      expect(safeDivide(100, 4)).toBe(25);
    });

    it("should return default value for division by zero", () => {
      expect(safeDivide(10, 0)).toBe(0);
      expect(safeDivide(10, 0, 100)).toBe(100);
    });

    it("should handle negative numbers", () => {
      expect(safeDivide(-10, 2)).toBe(-5);
      expect(safeDivide(10, -2)).toBe(-5);
    });

    it("should handle decimals", () => {
      expect(safeDivide(1, 3)).toBeCloseTo(0.333, 2);
      expect(safeDivide(7, 3)).toBeCloseTo(2.333, 2);
    });
  });
});
