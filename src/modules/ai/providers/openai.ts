/**
 * Intégration OpenAI pour le module IA utilisateur
 * Phase 4 - Module AI
 *
 * Gère les appels à l'API OpenAI (GPT-4o, GPT-4o Mini, GPT-4 Turbo)
 */

import { AIProvider, AIChatRequest, AIChatResponse, AITestResult } from '../types';
import { handleProviderError } from '../errors';

const OPENAI_BASE_URL = 'https://api.openai.com/v1';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Envoie une requête de chat à l'API OpenAI
 */
export async function sendChatRequest(
  apiKey: string,
  request: AIChatRequest,
  model: string
): Promise<AIChatResponse> {
  try {
    const openAIRequest: OpenAIRequest = {
      model,
      messages: request.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 2048,
    };

    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(openAIRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      const error = new Error(errorData.error?.message || 'OpenAI API error');
      (error as any).response = { status: response.status, data: errorData };
      throw handleProviderError(error, 'OpenAI');
    }

      const data: OpenAIResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenAI API returned no choices');
    }

    const choice = data.choices[0]!;

    // Calculer le coût estimé (basé sur le modèle)
    const estimatedCost = calculateCost(
      model,
      data.usage.prompt_tokens,
      data.usage.completion_tokens
    );

    return {
      content: choice.message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      model: data.model,
      estimatedCost,
    };
  } catch (error) {
    // Si c'est déjà une AIError, la relancer
    if (error && typeof error === 'object' && 'code' in error && 'userMessage' in error) {
      throw error;
    }
    // Sinon, mapper vers AIError
    throw handleProviderError(error, 'OpenAI');
  }
}

/**
 * Teste la connexion à l'API OpenAI
 */
export async function testConnection(apiKey: string, model: string): Promise<AITestResult> {
  const startTime = Date.now();

  try {
    const response = await sendChatRequest(
      apiKey,
      {
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
        temperature: 0.3,
        maxTokens: 10,
      },
      model
    );

    const latency = Date.now() - startTime;

    return {
      success: true,
      message: `Connected successfully to ${response.model}`,
      latency,
      model: response.model,
    };
  } catch (error: any) {
    // Si c'est une AIError, utiliser son userMessage
    const errorMessage = error.userMessage || error.message || 'Unknown error';

    return {
      success: false,
      message: 'Connection failed',
      error: errorMessage,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Liste les modèles disponibles pour cette clé API
 */
export async function listModels(apiKey: string): Promise<string[]> {
  const response = await fetch(`${OPENAI_BASE_URL}/models`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list models: ${response.status}`);
  }

  const data = await response.json();

  // Filtrer uniquement les modèles de chat pertinents
  const chatModels = data.data
    .filter((model: any) => {
      const id = model.id.toLowerCase();
      return (
        id.includes('gpt-4') ||
        id.includes('gpt-3.5') ||
        id.includes('gpt-4o')
      );
    })
    .map((model: any) => model.id);

  return chatModels;
}

/**
 * Calcule le coût estimé d'une requête
 * Tarifs au 1000 tokens
 */
function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  // Tarifs par 1000 tokens (janvier 2025)
  const pricing: Record<
    string,
    { input: number; output: number }
  > = {
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  };

  // Trouver le modèle correspondant (peut avoir des suffixes de version)
  let modelPricing = null;
  for (const [key, value] of Object.entries(pricing)) {
    if (model.startsWith(key)) {
      modelPricing = value;
      break;
    }
  }

  if (!modelPricing) {
    // Si modèle inconnu, utiliser les tarifs de gpt-4o par défaut
    modelPricing = pricing['gpt-4o']!;
  }

  const inputCost = (promptTokens / 1000) * modelPricing!.input;
  const outputCost = (completionTokens / 1000) * modelPricing!.output;

  return inputCost + outputCost;
}
