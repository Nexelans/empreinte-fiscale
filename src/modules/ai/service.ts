/**
 * Service principal pour le module IA utilisateur
 * Phase 4 - Module AI
 *
 * Gère la configuration, le routage des requêtes et l'orchestration des providers
 */

import { prisma } from '@/lib/prisma';
import { encryptKey, decryptKey } from './encryption';
import {
  AIProvider,
  AIConfig,
  AIChatRequest,
  AIChatResponse,
  AITestResult,
  AVAILABLE_MODELS,
} from './types';
import * as openai from './providers/openai';
import * as anthropic from './providers/anthropic';
import * as mistral from './providers/mistral';
import * as google from './providers/google';
import * as custom from './providers/custom';

/**
 * Crée ou met à jour la configuration IA d'un utilisateur
 */
export async function saveAIConfig(
  userId: string,
  config: {
    provider: AIProvider;
    apiKey: string;
    endpoint?: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    customSystemPrompt?: string;
  }
): Promise<AIConfig> {
  // Chiffrer la clé API
  const encryptedKey = encryptKey(config.apiKey);

  // Créer ou mettre à jour la config
  const aiConfig = await prisma.aIConfig.upsert({
    where: { userId },
    create: {
      userId,
      provider: config.provider,
      encryptedKey,
      endpoint: config.endpoint,
      model: config.model,
      temperature: config.temperature ?? 0.3,
      maxTokens: config.maxTokens ?? 2048,
      customSystemPrompt: config.customSystemPrompt,
      lastTestStatus: 'UNTESTED',
    },
    update: {
      provider: config.provider,
      encryptedKey,
      endpoint: config.endpoint,
      model: config.model,
      temperature: config.temperature ?? 0.3,
      maxTokens: config.maxTokens ?? 2048,
      customSystemPrompt: config.customSystemPrompt,
      lastTestStatus: 'UNTESTED',
    },
  });

  return {
    id: aiConfig.id,
    userId: aiConfig.userId,
    provider: aiConfig.provider as AIProvider,
    encryptedKey: aiConfig.encryptedKey,
    endpoint: aiConfig.endpoint || undefined,
    model: aiConfig.model,
    temperature: aiConfig.temperature,
    maxTokens: aiConfig.maxTokens,
    customSystemPrompt: aiConfig.customSystemPrompt || undefined,
    lastTestedAt: aiConfig.lastTestedAt || undefined,
    lastTestStatus: aiConfig.lastTestStatus as 'UNTESTED' | 'SUCCESS' | 'FAILED',
    createdAt: aiConfig.createdAt,
    updatedAt: aiConfig.updatedAt,
  };
}

/**
 * Récupère la configuration IA d'un utilisateur
 */
export async function getAIConfig(userId: string): Promise<AIConfig | null> {
  const aiConfig = await prisma.aIConfig.findUnique({
    where: { userId },
  });

  if (!aiConfig) {
    return null;
  }

  return {
    id: aiConfig.id,
    userId: aiConfig.userId,
    provider: aiConfig.provider as AIProvider,
    encryptedKey: aiConfig.encryptedKey,
    endpoint: aiConfig.endpoint || undefined,
    model: aiConfig.model,
    temperature: aiConfig.temperature,
    maxTokens: aiConfig.maxTokens,
    customSystemPrompt: aiConfig.customSystemPrompt || undefined,
    lastTestedAt: aiConfig.lastTestedAt || undefined,
    lastTestStatus: aiConfig.lastTestStatus as 'UNTESTED' | 'SUCCESS' | 'FAILED',
    createdAt: aiConfig.createdAt,
    updatedAt: aiConfig.updatedAt,
  };
}

/**
 * Supprime la configuration IA d'un utilisateur
 */
export async function deleteAIConfig(userId: string): Promise<void> {
  await prisma.aIConfig.delete({
    where: { userId },
  });
}

/**
 * Teste la connexion avec la configuration IA d'un utilisateur
 */
export async function testAIConnection(userId: string): Promise<AITestResult> {
  const config = await getAIConfig(userId);

  if (!config) {
    return {
      success: false,
      message: 'No AI configuration found',
      error: 'Please configure your AI provider first',
    };
  }

  // Déchiffrer la clé API
  const apiKey = decryptKey(config.encryptedKey);

  let result: AITestResult;

  try {
    switch (config.provider) {
      case AIProvider.OPENAI:
        result = await openai.testConnection(apiKey, config.model);
        break;

      case AIProvider.ANTHROPIC:
        result = await anthropic.testConnection(apiKey, config.model);
        break;

      case AIProvider.MISTRAL:
        result = await mistral.testConnection(apiKey, config.model);
        break;

      case AIProvider.GOOGLE:
        result = await google.testConnection(apiKey, config.model);
        break;

      case AIProvider.CUSTOM:
        if (!config.endpoint) {
          result = {
            success: false,
            message: 'Custom endpoint not configured',
            error: 'Endpoint is required for custom provider',
          };
          break;
        }
        result = await custom.testConnection(apiKey, config.endpoint, config.model);
        break;

      default:
        result = {
          success: false,
          message: 'Unknown provider',
          error: `Provider ${config.provider} is not supported`,
        };
    }
  } catch (error: any) {
    result = {
      success: false,
      message: 'Test failed',
      error: error.message || 'Unknown error',
    };
  }

  // Mettre à jour le statut du dernier test
  await prisma.aIConfig.update({
    where: { userId },
    data: {
      lastTestedAt: new Date(),
      lastTestStatus: result.success ? 'SUCCESS' : 'FAILED',
    },
  });

  return result;
}

/**
 * Envoie une requête de chat via la configuration IA de l'utilisateur
 */
export async function sendChat(
  userId: string,
  request: AIChatRequest
): Promise<AIChatResponse> {
  const config = await getAIConfig(userId);

  if (!config) {
    throw new Error('No AI configuration found. Please configure your AI provider first.');
  }

  // Déchiffrer la clé API
  const apiKey = decryptKey(config.encryptedKey);

  // Fusionner le system prompt custom si présent
  let messages = request.messages;
  if (config.customSystemPrompt) {
    const hasSystemMessage = messages.some((msg) => msg.role === 'system');
    if (!hasSystemMessage) {
      messages = [
        { role: 'system', content: config.customSystemPrompt },
        ...messages,
      ];
    }
  }

  const chatRequest: AIChatRequest = {
    messages,
    temperature: request.temperature ?? config.temperature,
    maxTokens: request.maxTokens ?? config.maxTokens,
  };

  let response: AIChatResponse;

  switch (config.provider) {
    case AIProvider.OPENAI:
      response = await openai.sendChatRequest(apiKey, chatRequest, config.model);
      break;

    case AIProvider.ANTHROPIC:
      response = await anthropic.sendChatRequest(apiKey, chatRequest, config.model);
      break;

    case AIProvider.MISTRAL:
      response = await mistral.sendChatRequest(apiKey, chatRequest, config.model);
      break;

    case AIProvider.GOOGLE:
      response = await google.sendChatRequest(apiKey, chatRequest, config.model);
      break;

    case AIProvider.CUSTOM:
      if (!config.endpoint) {
        throw new Error('Custom endpoint not configured');
      }
      response = await custom.sendChatRequest(
        apiKey,
        config.endpoint,
        chatRequest,
        config.model
      );
      break;

    default:
      throw new Error(`Provider ${config.provider} is not supported`);
  }

  return response;
}

/**
 * Récupère les modèles disponibles pour un provider
 */
export function getAvailableModels(provider: AIProvider) {
  return AVAILABLE_MODELS[provider] || [];
}

/**
 * Vérifie si un utilisateur a configuré son IA
 */
export async function hasAIConfigured(userId: string): Promise<boolean> {
  const config = await getAIConfig(userId);
  return config !== null;
}

/**
 * Récupère les statistiques d'utilisation IA d'un utilisateur
 * (À implémenter dans une future itération avec tracking des requêtes)
 */
export async function getAIUsageStats(userId: string) {
  // TODO: Implémenter le tracking des requêtes et le calcul des stats
  return {
    requestCount: 0,
    totalTokens: 0,
    estimatedCost: 0,
  };
}
