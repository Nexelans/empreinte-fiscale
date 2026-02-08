/**
 * Intégration Google AI (Gemini) pour le module IA utilisateur
 * Phase 4 - Module AI
 *
 * Gère les appels à l'API Google Generative AI (Gemini 2.0 Flash, 1.5 Pro)
 */

import { AIChatRequest, AIChatResponse, AITestResult } from '../types';

const GOOGLE_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

interface GoogleContent {
  role: string;
  parts: Array<{
    text: string;
  }>;
}

interface GoogleRequest {
  contents: GoogleContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
  systemInstruction?: {
    parts: Array<{
      text: string;
    }>;
  };
}

interface GoogleResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Envoie une requête de chat à l'API Google Generative AI
 */
export async function sendChatRequest(
  apiKey: string,
  request: AIChatRequest,
  model: string
): Promise<AIChatResponse> {
  // Séparer le message système des autres messages
  const systemMessage = request.messages.find((msg) => msg.role === 'system');
  const conversationMessages = request.messages.filter((msg) => msg.role !== 'system');

  // Convertir les messages au format Google
  const contents: GoogleContent[] = conversationMessages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const googleRequest: GoogleRequest = {
    contents,
    generationConfig: {
      temperature: request.temperature ?? 0.3,
      maxOutputTokens: request.maxTokens ?? 2048,
    },
    ...(systemMessage && {
      systemInstruction: {
        parts: [{ text: systemMessage.content }],
      },
    }),
  };

  const response = await fetch(
    `${GOOGLE_BASE_URL}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleRequest),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      `Google API error: ${response.status} - ${error.error?.message || JSON.stringify(error)}`
    );
  }

  const data: GoogleResponse = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Google API returned no candidates');
  }

  const candidate = data.candidates[0]!;
  const textContent = candidate.content.parts.map((part) => part.text).join('');

  // Calculer le coût estimé
  const estimatedCost = calculateCost(
    model,
    data.usageMetadata.promptTokenCount,
    data.usageMetadata.candidatesTokenCount
  );

  return {
    content: textContent,
    usage: {
      promptTokens: data.usageMetadata.promptTokenCount,
      completionTokens: data.usageMetadata.candidatesTokenCount,
      totalTokens: data.usageMetadata.totalTokenCount,
    },
    model,
    estimatedCost,
  };
}

/**
 * Teste la connexion à l'API Google
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
      message: `Connected successfully to ${model}`,
      latency,
      model,
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
 * Liste les modèles disponibles
 */
export async function listModels(apiKey: string): Promise<string[]> {
  const response = await fetch(`${GOOGLE_BASE_URL}/models?key=${apiKey}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to list models: ${response.status}`);
  }

  const data = await response.json();

  // Filtrer uniquement les modèles Gemini avec generateContent
  const geminiModels = data.models
    .filter(
      (model: any) =>
        model.name.includes('gemini') &&
        model.supportedGenerationMethods?.includes('generateContent')
    )
    .map((model: any) => model.name.replace('models/', ''));

  return geminiModels;
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
    'gemini-2.0-flash': { input: 0.0001, output: 0.0004 },
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
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
    // Si modèle inconnu, utiliser les tarifs de gemini-1.5-pro par défaut
    modelPricing = pricing['gemini-1.5-pro']!;
  }

  const inputCost = (promptTokens / 1000) * modelPricing!.input;
  const outputCost = (completionTokens / 1000) * modelPricing!.output;

  return inputCost + outputCost;
}
