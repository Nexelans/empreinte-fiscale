import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { performOCR, estimateProcessingTime } from "@/modules/tickets/ocr";
import { extractTicketData } from "@/modules/tickets/extraction";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Type de fichier non supporté. Formats acceptés : JPEG, PNG, WebP",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "Fichier trop volumineux. Taille maximale : 10 MB",
        },
        { status: 400 }
      );
    }

    console.log(
      `[POST /api/tickets/scan] Processing ticket: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
    );

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Estimate processing time for client-side progress
    const estimatedMs = estimateProcessingTime(file.size);
    console.log(`[POST /api/tickets/scan] Estimated OCR time: ${estimatedMs}ms`);

    // Perform OCR
    console.log("[POST /api/tickets/scan] Starting OCR...");
    const ocrResult = await performOCR(buffer);
    console.log(
      `[POST /api/tickets/scan] OCR completed in ${ocrResult.processingTimeMs}ms with ${ocrResult.confidence}% confidence`
    );

    // Extract ticket data from OCR result
    console.log("[POST /api/tickets/scan] Extracting ticket data...");
    const scanResult = extractTicketData(ocrResult);

    if (!scanResult.success) {
      return NextResponse.json(
        {
          success: false,
          scanResult,
          message: "L'extraction a échoué. Veuillez saisir les données manuellement.",
        },
        { status: 200 } // Still 200 OK, but success: false in body
      );
    }

    console.log(
      `[POST /api/tickets/scan] Extraction successful: ${scanResult.ticketData?.enseigne || "Unknown"} - ${scanResult.ticketData?.montantTTC}€`
    );

    return NextResponse.json({
      success: true,
      scanResult,
      estimatedMs,
    });
  } catch (error) {
    console.error("[POST /api/tickets/scan] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du traitement de l'image",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
