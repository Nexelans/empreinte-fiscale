/**
 * API Route pour l'OCR IA
 * POST /api/ai/ocr - Traite un document avec l'IA vision
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enhancedOCR, DocumentType } from '@/modules/ai/ocr';
import { checkAIOperation } from '@/modules/ai/rateLimit';
import { recordUsage } from '@/modules/ai/usage';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ai/ocr
 * Traite un document uploadé avec l'IA vision
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as DocumentType;
    const useAI = formData.get('useAI') === 'true';
    const fallbackToTesseract = formData.get('fallbackToTesseract') !== 'false';

    // Validation
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      );
    }

    // Valider le type de document
    const validTypes: DocumentType[] = [
      'paie',
      'impot',
      'fonciere',
      'ticket',
      'facture',
      'caf',
    ];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Valider le type MIME du fichier
    const validMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and PDFs are allowed.' },
        { status: 400 }
      );
    }

    // Valider la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Vérifier les limites (rate limit + circuit breaker)
    const operationCheck = checkAIOperation(session.user.id, 'ocr');
    if (!operationCheck.allowed) {
      return NextResponse.json(
        {
          error: operationCheck.reason,
          retryAfter: operationCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Traiter avec l'OCR amélioré
    const result = await enhancedOCR(session.user.id, buffer, {
      documentType,
      useAI,
      fallbackToTesseract,
      includeRawText: false,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'OCR processing failed',
          method: result.method,
        },
        { status: 400 }
      );
    }

    // Track usage if AI was used
    if (result.method === 'ai' && useAI) {
      try {
        // Get AI config to know provider and model
        const aiConfig = await prisma.aIConfig.findUnique({
          where: { userId: session.user.id },
        });

        if (aiConfig) {
          // Estimate tokens (OCR typically uses 1000-2000 tokens for images)
          const estimatedPromptTokens = 1500;
          const estimatedCompletionTokens = 500;

          // Record usage
          recordUsage({
            userId: session.user.id,
            provider: aiConfig.provider,
            model: aiConfig.model,
            promptTokens: estimatedPromptTokens,
            completionTokens: estimatedCompletionTokens,
            totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
            estimatedCost: result.estimatedCost || 0.02,
            context: 'ocr',
          });
        }
      } catch (usageError) {
        console.error('Failed to record AI usage:', usageError);
        // Non-blocking: continue even if usage tracking fails
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      confidence: result.confidence,
      method: result.method,
      estimatedCost: result.estimatedCost,
    });
  } catch (error: any) {
    console.error('Error in AI OCR:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
