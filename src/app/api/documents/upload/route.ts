// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseDocument } from "@/modules/documents/service";
import { DocumentType } from "@/modules/documents/types";
import { enhancedOCR } from "@/modules/ai/ocr";
import { hasAIConfigured } from "@/modules/ai/service";
import { checkAIConsent } from "@/modules/ai/consent";

/**
 * POST /api/documents/upload
 * Upload et parse un document fiscal PDF
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as DocumentType;
    const useAIOcr = formData.get("useAIOcr") === "true";

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: "Type de document manquant" }, { status: 400 });
    }

    // Validation du type de fichier
    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Format non supporté. PDF et images (JPG, PNG) acceptés." },
        { status: 400 }
      );
    }

    // Validation de la taille (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 10MB)" },
        { status: 400 }
      );
    }

    // Convertir le fichier en Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Déterminer la méthode d'extraction
    let parseResult;
    let extractionMethod = 'regex';

    // Si AI OCR demandé, vérifier config et consentement
    if (useAIOcr) {
      const hasAI = await hasAIConfigured(session.user.id);
      const hasConsent = await checkAIConsent(session.user.id);

      if (!hasAI) {
        return NextResponse.json(
          { error: "Configuration IA requise. Veuillez configurer votre IA dans les paramètres." },
          { status: 400 }
        );
      }

      if (!hasConsent) {
        return NextResponse.json(
          { error: "Consentement RGPD requis pour utiliser l'IA. Veuillez accepter dans les paramètres." },
          { status: 403 }
        );
      }

      console.log(`[Upload] Using AI OCR for document type: ${documentType}`);

      try {
        const ocrResult = await enhancedOCR(session.user.id, buffer, {
          documentType: documentType as any,
          useAI: true,
          fallbackToTesseract: false,
        });

        if (ocrResult.success) {
          // Convertir le résultat OCR au format parseResult
          parseResult = {
            status: 'success',
            confidence: ocrResult.confidence === 'high' ? 95 : ocrResult.confidence === 'medium' ? 70 : 40,
            data: ocrResult.data,
            metadata: {
              extractionMethod: 'ai',
              estimatedCost: ocrResult.estimatedCost,
            },
          };
          extractionMethod = 'ai';
          console.log(`[Upload] AI OCR success, confidence: ${parseResult.confidence}%, cost: €${ocrResult.estimatedCost?.toFixed(4)}`);
        } else {
          // Fallback vers regex si AI échoue
          console.log(`[Upload] AI OCR failed: ${ocrResult.error}, falling back to regex`);
          parseResult = await parseDocument(buffer, documentType);
          extractionMethod = 'regex';
        }
      } catch (error) {
        console.error(`[Upload] AI OCR error:`, error);
        // Fallback vers regex
        parseResult = await parseDocument(buffer, documentType);
        extractionMethod = 'regex';
      }
    } else {
      // Utiliser le parsing regex classique
      console.log(`[Upload] Using regex parsing for document type: ${documentType}`);
      parseResult = await parseDocument(buffer, documentType);
      extractionMethod = 'regex';
    }

    console.log(
      `[Upload] Parse result: ${parseResult.status}, confidence: ${parseResult.confidence}%, method: ${extractionMethod}`
    );

    // Retourner le résultat du parsing pour validation utilisateur
    return NextResponse.json({
      success: true,
      parseResult: {
        ...parseResult,
        metadata: {
          ...parseResult.metadata,
          extractionMethod,
        },
      },
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du traitement du document",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
