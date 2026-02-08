/**
 * API Route pour lister les modèles IA disponibles
 * GET /api/ai/models?provider=openai - Liste les modèles d'un provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAvailableModels } from '@/modules/ai/service';
import { AIProvider } from '@/modules/ai/types';

/**
 * GET /api/ai/models?provider=openai
 * Liste les modèles disponibles pour un provider
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer le provider depuis les query params
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider || !Object.values(AIProvider).includes(provider as AIProvider)) {
      return NextResponse.json(
        { error: 'Invalid or missing provider parameter' },
        { status: 400 }
      );
    }

    // Récupérer les modèles disponibles
    const models = getAvailableModels(provider as AIProvider);

    return NextResponse.json({ models });
  } catch (error: any) {
    console.error('Error listing models:', error);
    return NextResponse.json(
      { error: 'Failed to list models' },
      { status: 500 }
    );
  }
}
