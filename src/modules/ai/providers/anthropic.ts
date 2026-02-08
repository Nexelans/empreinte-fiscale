/**
 * Intégration Anthropic pour le module IA utilisateur
 * Phase 4 - Module AI
 *
 * Gère les appels à l'API Anthropic (Claude Sonnet, Opus, Haiku)
 */

import { AIChatRequest, AIChatResponse, AITestResult } from '../types';

const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';
const ANTHROPIC_VERSION = '2023-06-01';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  temperature?: number;
  system?: string;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Envoie une requête de chat à l'API Anthropic
 */
export async function sendChatRequest(
  apiKey: string,
  request: AIChatRequest,
  model: string
): Promise<AIChatResponse> {
  // Séparer le message système des autres messages
  const systemMessage = request.messages.find((msg) => msg.role === 'system');
  const conversationMessages = request.messages
    .filter((msg) => msg.role !== 'system')
    .map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

  const anthropicRequest: AnthropicRequest = {
    model,
    messages: conversationMessages,
    max_tokens: request.maxTokens ?? 2048,
    temperature: request.temperature ?? 0.3,
    ...(systemMessage && { system: systemMessage.content }),
  };

  const response = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(anthropicRequest),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Anthropic API error: ${response.status} - ${error.error?.message || JSON.stringify(error)}`
    );
  }

  const data: AnthropicResponse = await response.json();

  if (!data.content || data.content.length === 0) {
    throw new Error('Anthropic API returned no content');
  }

  const textContent = data.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  // Calculer le coût estimé
  const estimatedCost = calculateCost(
    model,
    data.usage.input_tokens,
    data.usage.output_tokens
  );

  return {
    content: textContent,
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
    model: data.model,
    estimatedCost,
  };
}

/**
 * Teste la connexion à l'API Anthropic
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
 * Calcule le coût estimé d'une requête
 * Tarifs au 1000 tokens
 */
function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Tarifs par 1000 tokens (janvier 2025)
  const pricing: Record<
    string,
    { input: number; output: number }
  > = {
    'claude-sonnet-4': { input: 0.003, output: 0.015 },
    'claude-opus-4': { input: 0.015, output: 0.075 },
    'claude-haiku-4': { input: 0.0008, output: 0.004 },
    'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  };

  // Trouver le modèle correspondant (peut avoir des suffixes de version)
  let modelPricing = null;
  for (const [key, value] of Object.entries(pricing)) {
    if (model.includes(key)) {
      modelPricing = value;
      break;
    }
  }

  if (!modelPricing) {
    // Si modèle inconnu, utiliser les tarifs de sonnet par défaut
    modelPricing = pricing['claude-sonnet-4']!;
  }

  const inputCost = (inputTokens / 1000) * modelPricing!.input;
  const outputCost = (outputTokens / 1000) * modelPricing!.output;

  return inputCost + outputCost;
}
