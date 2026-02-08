/**
 * Intégration Mistral AI pour le module IA utilisateur
 * Phase 4 - Module AI
 *
 * Gère les appels à l'API Mistral (Mistral Large, Small)
 */

import { AIChatRequest, AIChatResponse, AITestResult } from '../types';

const MISTRAL_BASE_URL = 'https://api.mistral.ai/v1';

interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralRequest {
  model: string;
  messages: MistralMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface MistralResponse {
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
 * Envoie une requête de chat à l'API Mistral
 */
export async function sendChatRequest(
  apiKey: string,
  request: AIChatRequest,
  model: string
): Promise<AIChatResponse> {
  const mistralRequest: MistralRequest = {
    model,
    messages: request.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: request.temperature ?? 0.3,
    max_tokens: request.maxTokens ?? 2048,
  };

  const response = await fetch(`${MISTRAL_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(mistralRequest),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Mistral API error: ${response.status} - ${error.message || JSON.stringify(error)}`
    );
  }

  const data: MistralResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('Mistral API returned no choices');
  }

  const choice = data.choices[0]!;

  // Calculer le coût estimé
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
}

/**
 * Teste la connexion à l'API Mistral
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
    return {
      success: false,
      message: 'Connection failed',
      error: error.message || 'Unknown error',
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Liste les modèles disponibles pour cette clé API
 */
export async function listModels(apiKey: string): Promise<string[]> {
  const response = await fetch(`${MISTRAL_BASE_URL}/models`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list models: ${response.status}`);
  }

  const data = await response.json();

  return data.data.map((model: any) => model.id);
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
    'mistral-large': { input: 0.002, output: 0.006 },
    'mistral-small': { input: 0.0002, output: 0.0006 },
    'mistral-medium': { input: 0.0027, output: 0.0081 },
  };

  // Trouver le modèle correspondant
  let modelPricing = null;
  for (const [key, value] of Object.entries(pricing)) {
    if (model.includes(key)) {
      modelPricing = value;
      break;
    }
  }

  if (!modelPricing) {
    // Si modèle inconnu, utiliser les tarifs de mistral-large par défaut
    modelPricing = pricing['mistral-large']!;
  }

  const inputCost = (promptTokens / 1000) * modelPricing!.input;
  const outputCost = (completionTokens / 1000) * modelPricing!.output;

  return inputCost + outputCost;
}
