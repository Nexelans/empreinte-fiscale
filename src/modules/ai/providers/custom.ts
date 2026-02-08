/**
 * Intégration Custom pour le module IA utilisateur
 * Phase 4 - Module AI
 *
 * Gère les appels à des endpoints personnalisés (LLMs locaux, proxies, etc.)
 * Compatible avec le format OpenAI Chat Completions API
 */

import { AIChatRequest, AIChatResponse, AITestResult } from '../types';

interface CustomMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CustomRequest {
  model: string;
  messages: CustomMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface CustomResponse {
  id?: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Envoie une requête de chat à un endpoint personnalisé
 * Format compatible OpenAI Chat Completions API
 */
export async function sendChatRequest(
  apiKey: string,
  endpoint: string,
  request: AIChatRequest,
  model: string
): Promise<AIChatResponse> {
  // Valider l'endpoint
  if (!endpoint || !endpoint.startsWith('http')) {
    throw new Error('Invalid endpoint URL. Must start with http:// or https://');
  }

  const customRequest: CustomRequest = {
    model,
    messages: request.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    temperature: request.temperature ?? 0.3,
    max_tokens: request.maxTokens ?? 2048,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Ajouter l'Authorization header seulement si une clé est fournie
  if (apiKey && apiKey.trim() !== '') {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(customRequest),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Custom endpoint error: ${response.status} - ${error.error?.message || JSON.stringify(error)}`
    );
  }

  const data: CustomResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('Custom endpoint returned no choices');
  }

  const choice = data.choices[0]!;

  // Usage peut ne pas être fourni par tous les endpoints
  const usage = data.usage || {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  };

  return {
    content: choice.message.content,
    usage: {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
    },
    model: data.model || model,
    estimatedCost: 0, // Pas de calcul de coût pour les endpoints custom
  };
}

/**
 * Teste la connexion à un endpoint personnalisé
 */
export async function testConnection(
  apiKey: string,
  endpoint: string,
  model: string
): Promise<AITestResult> {
  const startTime = Date.now();

  try {
    // Valider l'endpoint avant de tester
    if (!endpoint || !endpoint.startsWith('http')) {
      throw new Error('Invalid endpoint URL. Must start with http:// or https://');
    }

    const response = await sendChatRequest(
      apiKey,
      endpoint,
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
      message: `Connected successfully to custom endpoint (model: ${response.model})`,
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
 * Valide le format d'un endpoint personnalisé
 */
export function validateEndpoint(endpoint: string): {
  valid: boolean;
  error?: string;
} {
  if (!endpoint) {
    return { valid: false, error: 'Endpoint is required' };
  }

  if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    return {
      valid: false,
      error: 'Endpoint must start with http:// or https://',
    };
  }

  try {
    new URL(endpoint);
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }

  return { valid: true };
}

/**
 * Exemples d'endpoints compatibles
 */
export const EXAMPLE_ENDPOINTS = [
  {
    name: 'LM Studio Local',
    endpoint: 'http://localhost:1234/v1/chat/completions',
    description: 'LM Studio running locally',
  },
  {
    name: 'Ollama',
    endpoint: 'http://localhost:11434/v1/chat/completions',
    description: 'Ollama local endpoint (requires OpenAI compatibility)',
  },
  {
    name: 'Text Generation WebUI',
    endpoint: 'http://localhost:5000/v1/chat/completions',
    description: 'Text Generation WebUI with OpenAI API extension',
  },
  {
    name: 'vLLM',
    endpoint: 'http://localhost:8000/v1/chat/completions',
    description: 'vLLM inference server',
  },
];
