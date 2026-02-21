/**
 * API Route pour tester une connexion IA temporaire (sans sauvegarder)
 * POST /api/ai/test-temp - Teste la connexion avec des paramètres fournis
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AIProvider } from '@/modules/ai/types';
import * as openai from '@/modules/ai/providers/openai';
import * as anthropic from '@/modules/ai/providers/anthropic';
import * as mistral from '@/modules/ai/providers/mistral';
import * as google from '@/modules/ai/providers/google';
import * as custom from '@/modules/ai/providers/custom';

/**
 * POST /api/ai/test-temp
 * Teste une connexion IA avec des paramètres temporaires (pas de sauvegarde DB)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, apiKey, endpoint, model } = body;

    // Validation
    if (!provider || !Object.values(AIProvider).includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (!model || model.trim() === '') {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }

    if (provider === AIProvider.CUSTOM && !endpoint) {
      return NextResponse.json({ error: 'Endpoint is required for custom provider' }, { status: 400 });
    }

    // Tester la connexion selon le provider
    let result;

    try {
      switch (provider) {
        case AIProvider.OPENAI:
          result = await openai.testConnection(apiKey, model);
          break;

        case AIProvider.ANTHROPIC:
          result = await anthropic.testConnection(apiKey, model);
          break;

        case AIProvider.MISTRAL:
          result = await mistral.testConnection(apiKey, model);
          break;

        case AIProvider.GOOGLE:
          result = await google.testConnection(apiKey, model);
          break;

        case AIProvider.CUSTOM:
          result = await custom.testConnection(apiKey, endpoint, model);
          break;

        default:
          return NextResponse.json(
            { error: `Provider ${provider} is not supported` },
            { status: 400 }
          );
      }
    } catch (error: any) {
      result = {
        success: false,
        message: 'Test failed',
        error: error.message || 'Unknown error',
      };
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      latency: result.latency,
      model: result.model,
      error: result.error,
    });
  } catch (error: any) {
    console.error('Error testing AI connection (temp):', error);
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
