/**
 * API Route pour la configuration IA utilisateur
 * GET /api/ai/config - Récupère la config (sans clé API)
 * POST /api/ai/config - Sauvegarde la config
 * DELETE /api/ai/config - Supprime la config
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAIConfig,
  saveAIConfig,
  deleteAIConfig,
} from '@/modules/ai/service';
import { AIProvider } from '@/modules/ai/types';
import { checkConfigRateLimit, formatRateLimitError } from '@/modules/ai/rateLimit';

/**
 * GET /api/ai/config
 * Récupère la configuration IA (sans la clé API en clair)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getAIConfig(session.user.id);

    if (!config) {
      return NextResponse.json({ config: null });
    }

    // Ne jamais exposer la clé chiffrée au client
    const safeConfig = {
      id: config.id,
      provider: config.provider,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      endpoint: config.endpoint,
      customSystemPrompt: config.customSystemPrompt,
      lastTestedAt: config.lastTestedAt,
      lastTestStatus: config.lastTestStatus,
      hasApiKey: true, // Indiquer qu'une clé est configurée
    };

    return NextResponse.json({ config: safeConfig });
  } catch (error: any) {
    console.error('Error fetching AI config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/config
 * Sauvegarde ou met à jour la configuration IA
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier le rate limit
    const rateLimit = checkConfigRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: formatRateLimitError(rateLimit) },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.provider || !Object.values(AIProvider).includes(body.provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    if (!body.apiKey || body.apiKey.trim() === '') {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (!body.model || body.model.trim() === '') {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }

    // Vérifier que l'endpoint est fourni pour les providers custom
    if (body.provider === AIProvider.CUSTOM && !body.endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required for custom provider' },
        { status: 400 }
      );
    }

    // Sauvegarder la configuration
    const config = await saveAIConfig(session.user.id, {
      provider: body.provider,
      apiKey: body.apiKey,
      endpoint: body.endpoint,
      model: body.model,
      temperature: body.temperature ?? 0.3,
      maxTokens: body.maxTokens ?? 2048,
      customSystemPrompt: body.customSystemPrompt,
    });

    // Retourner la config sans la clé API
    const safeConfig = {
      id: config.id,
      provider: config.provider,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      endpoint: config.endpoint,
      customSystemPrompt: config.customSystemPrompt,
      lastTestedAt: config.lastTestedAt,
      lastTestStatus: config.lastTestStatus,
    };

    return NextResponse.json({
      config: safeConfig,
      message: 'Configuration saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving AI config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/config
 * Supprime la configuration IA
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteAIConfig(session.user.id);

    return NextResponse.json({ message: 'Configuration deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting AI config:', error);

    // Si la config n'existe pas, retourner succès quand même
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Configuration deleted successfully' });
    }

    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}
