/**
 * Types pour l'intégration IA utilisateur
 * Phase 4 - Module AI
 */

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  MISTRAL = 'mistral',
  GOOGLE = 'google',
  CUSTOM = 'custom',
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  supportsVision: boolean;
  contextWindow: number;
  costPer1kTokens?: {
    input: number;
    output: number;
  };
}

export interface AIConfig {
  id: string;
  userId: string;
  provider: AIProvider;
  encryptedKey: string;
  endpoint?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  customSystemPrompt?: string;
  lastTestedAt?: Date;
  lastTestStatus: 'UNTESTED' | 'SUCCESS' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIChatRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIChatResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  estimatedCost?: number;
}

export interface AITestResult {
  success: boolean;
  message: string;
  latency?: number;
  model?: string;
  error?: string;
}

export interface AIUsageStats {
  userId: string;
  period: 'day' | 'month' | 'today';
  requestCount: number;
  totalTokens: number;
  estimatedCost: number;
  lastRequestAt?: Date;
  chatRequestsToday?: number;
}

export const AVAILABLE_MODELS: Record<AIProvider, AIModel[]> = {
  [AIProvider.OPENAI]: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: AIProvider.OPENAI,
      supportsVision: true,
      contextWindow: 128000,
      costPer1kTokens: { input: 0.0025, output: 0.01 },
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: AIProvider.OPENAI,
      supportsVision: true,
      contextWindow: 128000,
      costPer1kTokens: { input: 0.00015, output: 0.0006 },
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: AIProvider.OPENAI,
      supportsVision: true,
      contextWindow: 128000,
      costPer1kTokens: { input: 0.01, output: 0.03 },
    },
  ],
  [AIProvider.ANTHROPIC]: [
    {
      id: 'claude-sonnet-4-20250514',
      name: 'Claude Sonnet 4',
      provider: AIProvider.ANTHROPIC,
      supportsVision: true,
      contextWindow: 200000,
      costPer1kTokens: { input: 0.003, output: 0.015 },
    },
    {
      id: 'claude-opus-4-20250514',
      name: 'Claude Opus 4',
      provider: AIProvider.ANTHROPIC,
      supportsVision: true,
      contextWindow: 200000,
      costPer1kTokens: { input: 0.015, output: 0.075 },
    },
    {
      id: 'claude-haiku-4-20250514',
      name: 'Claude Haiku 4',
      provider: AIProvider.ANTHROPIC,
      supportsVision: true,
      contextWindow: 200000,
      costPer1kTokens: { input: 0.0008, output: 0.004 },
    },
  ],
  [AIProvider.MISTRAL]: [
    {
      id: 'mistral-large-latest',
      name: 'Mistral Large',
      provider: AIProvider.MISTRAL,
      supportsVision: false,
      contextWindow: 128000,
      costPer1kTokens: { input: 0.002, output: 0.006 },
    },
    {
      id: 'mistral-small-latest',
      name: 'Mistral Small',
      provider: AIProvider.MISTRAL,
      supportsVision: false,
      contextWindow: 128000,
      costPer1kTokens: { input: 0.0002, output: 0.0006 },
    },
  ],
  [AIProvider.GOOGLE]: [
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      provider: AIProvider.GOOGLE,
      supportsVision: true,
      contextWindow: 1000000,
      costPer1kTokens: { input: 0.0001, output: 0.0004 },
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: AIProvider.GOOGLE,
      supportsVision: true,
      contextWindow: 2000000,
      costPer1kTokens: { input: 0.00125, output: 0.005 },
    },
  ],
  [AIProvider.CUSTOM]: [],
};
