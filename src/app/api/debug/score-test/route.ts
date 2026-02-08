import { NextResponse } from "next/server";
import { calculImpotRevenu, calculCSG_CRDS, calculTotalPaye } from "@/modules/score/calculPaye";
import { ProfilFiscalComplete } from "@/modules/profil/types";

/**
 * Debug endpoint to test score calculation functions individually
 * GET /api/debug/score-test
 */
export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: IR calculation
    console.log("[DEBUG] Testing IR calculation...");
    const startIR = Date.now();
    try {
      const ir = await calculImpotRevenu(28000, 1, "2026");
      results.tests.push({
        name: "calculImpotRevenu",
        status: "SUCCESS",
        duration: Date.now() - startIR,
        result: ir
      });
    } catch (error) {
      results.tests.push({
        name: "calculImpotRevenu",
        status: "ERROR",
        duration: Date.now() - startIR,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 2: CSG calculation
    console.log("[DEBUG] Testing CSG calculation...");
    const startCSG = Date.now();
    try {
      const csg = await calculCSG_CRDS(36000, 0, "2026");
      results.tests.push({
        name: "calculCSG_CRDS",
        status: "SUCCESS",
        duration: Date.now() - startCSG,
        result: csg
      });
    } catch (error) {
      results.tests.push({
        name: "calculCSG_CRDS",
        status: "ERROR",
        duration: Date.now() - startCSG,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 3: Full calculTotalPaye
    console.log("[DEBUG] Testing calculTotalPaye...");
    const startTotal = Date.now();
    const testProfil: Partial<ProfilFiscalComplete> = {
      situation: {
        statut: "celibataire",
        nombreParts: 1,
        commune: "Paris",
        age: 35
      },
      revenus: {
        salaireBrut: 36000,
        salaireNet: 28000,
        typeContrat: "CDI",
        revenusFonciers: 0,
        revenusCapitaux: 0,
        autresRevenus: 0
      },
      patrimoine: {
        proprietaire: false,
        valeurLocative: 0,
        taxeFonciere: 0,
        vehicules: [],
        patrimoineIFI: 0
      },
      consommation: {
        mode: "profil_type",
        profilType: "moyen",
        budgetMensuel: undefined,
        detailCategories: undefined,
        alcoolTabac: undefined
      },
      familleServices: {
        nombreEnfants: 0,
        enfants: [],
        frequenceServices: {
          transportsCommun: "jamais",
          hopitalMedecin: "annuelle",
          bibliotheque: "jamais",
          equipementsSportifs: "jamais",
        },
        aides: {
          caf: false,
          apl: false,
          rsa: false,
          bourses: false,
          chomage: false,
          cmuc: false,
        }
      },
      statusData: {}
    };

    try {
      const detailPaye = await calculTotalPaye(testProfil, "2026", {
        useJournalData: false
      });

      results.tests.push({
        name: "calculTotalPaye",
        status: "SUCCESS",
        duration: Date.now() - startTotal,
        result: detailPaye
      });
    } catch (error) {
      results.tests.push({
        name: "calculTotalPaye",
        status: "ERROR",
        duration: Date.now() - startTotal,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    // Test 4: calculTotalRecu
    console.log("[DEBUG] Testing calculTotalRecu...");
    const startRecu = Date.now();
    try {
      const { calculTotalRecu } = await import("@/modules/score/calculRecu");

      const detailRecu = await calculTotalRecu(testProfil, 0, "2026");

      results.tests.push({
        name: "calculTotalRecu",
        status: "SUCCESS",
        duration: Date.now() - startRecu,
        result: detailRecu
      });
    } catch (error) {
      results.tests.push({
        name: "calculTotalRecu",
        status: "ERROR",
        duration: Date.now() - startRecu,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    // Test 5: Full calculerScoreFiscal
    console.log("[DEBUG] Testing calculerScoreFiscal...");
    const startScore = Date.now();
    try {
      const { calculerScoreFiscal } = await import("@/modules/score");

      const score = await calculerScoreFiscal(testProfil, "2026", {
        useJournalData: false
      });

      results.tests.push({
        name: "calculerScoreFiscal",
        status: "SUCCESS",
        duration: Date.now() - startScore,
        result: {
          totalPaye: score.totalPaye,
          totalRecu: score.totalRecu,
          soldeNet: score.soldeNet
        }
      });
    } catch (error) {
      results.tests.push({
        name: "calculerScoreFiscal",
        status: "ERROR",
        duration: Date.now() - startScore,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[DEBUG] Score test error:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
