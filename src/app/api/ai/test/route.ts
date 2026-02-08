/**
 * API Route pour tester la connexion IA
 * POST /api/ai/test - Teste la connexion avec le provider configuré
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { testAIConnection } from '@/modules/ai/service';
import { checkTestRateLimit, formatRateLimitError, recordSuccess, recordError } from '@/modules/ai/rateLimit';

/**
 * POST /api/ai/test
 * Teste la connexion avec le provider IA configuré
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  try {

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier le rate limit
    const rateLimit = checkTestRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: formatRateLimitError(rateLimit) },
        { status: 429 }
      );
    }

    // Tester la connexion
    const result = await testAIConnection(session.user.id);

    // Enregistrer le résultat pour le circuit breaker
    if (result.success) {
      recordSuccess(session.user.id);
    } else {
      recordError(session.user.id);
    }

    // Retourner le résultat
    return NextResponse.json({
      success: result.success,
      message: result.message,
      latency: result.latency,
      model: result.model,
      error: result.error,
    });
  } catch (error: any) {
    console.error('Error testing AI connection:', error);

    // Enregistrer l'erreur pour le circuit breaker
    if (session?.user?.id) {
      recordError(session.user.id);
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Test failed',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
