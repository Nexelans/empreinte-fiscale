import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getScoreHistory } from "@/modules/score/history";

/**
 * GET /api/score/history/export
 * Export user's score history as CSV or JSON
 *
 * Query params:
 * - format: "csv" | "json" (required)
 * - startYear: number (optional)
 * - startMonth: number (optional)
 * - endYear: number (optional)
 * - endMonth: number (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // Parse format parameter
    const format = searchParams.get("format");

    if (!format || (format !== "csv" && format !== "json")) {
      return NextResponse.json(
        { error: "Invalid or missing format parameter. Must be 'csv' or 'json'" },
        { status: 400 }
      );
    }

    // Parse query parameters for date range filtering
    const startYear = searchParams.get("startYear")
      ? parseInt(searchParams.get("startYear")!)
      : undefined;
    const startMonth = searchParams.get("startMonth")
      ? parseInt(searchParams.get("startMonth")!)
      : undefined;
    const endYear = searchParams.get("endYear")
      ? parseInt(searchParams.get("endYear")!)
      : undefined;
    const endMonth = searchParams.get("endMonth")
      ? parseInt(searchParams.get("endMonth")!)
      : undefined;

    // Validation
    if (startMonth !== undefined && (startMonth < 1 || startMonth > 12)) {
      return NextResponse.json(
        { error: "startMonth must be between 1 and 12" },
        { status: 400 }
      );
    }

    if (endMonth !== undefined && (endMonth < 1 || endMonth > 12)) {
      return NextResponse.json(
        { error: "endMonth must be between 1 and 12" },
        { status: 400 }
      );
    }

    // Fetch history
    const history = await getScoreHistory(userId, {
      startYear,
      startMonth,
      endYear,
      endMonth,
    });

    if (history.length === 0) {
      return NextResponse.json(
        {
          error: "No score history found",
          suggestion: "Calculate your score first to generate history",
        },
        { status: 404 }
      );
    }

    // Generate filename
    const now = new Date();
    const filename = `empreinte-fiscale-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (format === "json") {
      return exportAsJSON(history, filename);
    } else {
      return exportAsCSV(history, filename);
    }
  } catch (error) {
    console.error("[API] Error exporting score history:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Export history as JSON
 */
function exportAsJSON(
  history: Awaited<ReturnType<typeof getScoreHistory>>,
  filename: string
) {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: "1.0",
    dataPoints: history.length,
    periodStart: history[0] ? `${history[0].year}-${String(history[0].month).padStart(2, "0")}` : "N/A",
    periodEnd: history.length > 0 && history[history.length - 1] ? `${history[history.length - 1]!.year}-${String(history[history.length - 1]!.month).padStart(2, "0")}` : "N/A",
    history: history.map((entry) => ({
      date: `${entry.year}-${String(entry.month).padStart(2, "0")}`,
      year: entry.year,
      month: entry.month,
      totalPaye: entry.scoreFiscalData.totalPaye,
      totalRecu: entry.scoreFiscalData.totalRecu,
      soldeNet: entry.scoreFiscalData.soldeNet,
      ratio: entry.scoreFiscalData.ratio,
      confidenceScore: entry.confidenceScore,
      detailPaye: entry.scoreFiscalData.detailPaye,
      detailRecu: entry.scoreFiscalData.detailRecu,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}.json"`,
    },
  });
}

/**
 * Export history as CSV
 */
function exportAsCSV(
  history: Awaited<ReturnType<typeof getScoreHistory>>,
  filename: string
) {
  // CSV header
  const headers = [
    "Date",
    "Année",
    "Mois",
    "Total Payé (€)",
    "Total Reçu (€)",
    "Solde Net (€)",
    "Ratio",
    "Score Confiance (%)",
    "IR (€)",
    "CSG/CRDS (€)",
    "Cotisations Salariales (€)",
    "Cotisations Patronales (€)",
    "TVA (€)",
    "TICPE (€)",
    "Taxe Foncière (€)",
    "IFI (€)",
    "Autres Taxes (€)",
    "Allocations (€)",
    "APL (€)",
    "Remboursements Santé (€)",
    "Autres Transferts (€)",
    "Éducation (€)",
    "Santé (€)",
    "Sécurité (€)",
    "Infrastructure (€)",
    "Culture (€)",
    "Administration (€)",
    "Charges Dette (€)",
  ];

  // CSV rows
  const rows = history.map((entry) => {
    const date = `${entry.year}-${String(entry.month).padStart(2, "0")}`;
    const detail = entry.scoreFiscalData;

    return [
      date,
      entry.year,
      entry.month,
      detail.totalPaye,
      detail.totalRecu,
      detail.soldeNet,
      detail.ratio,
      entry.confidenceScore,
      detail.detailPaye.impotRevenu,
      detail.detailPaye.csg_crds,
      detail.detailPaye.cotisationsSalariales,
      detail.detailPaye.cotisationsPatronales,
      detail.detailPaye.tva,
      detail.detailPaye.ticpe,
      detail.detailPaye.taxeFonciere,
      detail.detailPaye.ifi,
      detail.detailPaye.autresTaxes,
      detail.detailRecu.transfertsDirects.allocations,
      detail.detailRecu.transfertsDirects.apl,
      detail.detailRecu.transfertsDirects.remboursementsSante,
      detail.detailRecu.transfertsDirects.autres,
      detail.detailRecu.servicesMutualises.education,
      detail.detailRecu.servicesMutualises.sante,
      detail.detailRecu.servicesMutualises.securite,
      detail.detailRecu.servicesMutualises.infrastructure,
      detail.detailRecu.servicesMutualises.culture,
      detail.detailRecu.servicesMutualises.administration,
      detail.detailRecu.servicesMutualises.chargesDette,
    ];
  });

  // Build CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Add BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF";

  return new NextResponse(bom + csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
