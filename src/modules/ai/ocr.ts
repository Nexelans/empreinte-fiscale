/**
 * OCR amélioré avec IA vision
 * Phase 4 - Module AI
 *
 * Utilise les modèles vision des providers IA pour extraire
 * les données des documents de manière plus précise que l'OCR traditionnel
 */

import { getAIConfig } from './service';
import { decryptKey } from './encryption';
import { AIProvider } from './types';
import { generateDocumentAnalysisContext } from './context';
import { recordUsage } from './usage';
import { checkOCRRateLimit, formatRateLimitError } from './rateLimit';

/**
 * Type de document supporté
 */
export type DocumentType = 'paie' | 'impot' | 'fonciere' | 'ticket' | 'facture' | 'caf';

/**
 * Résultat de l'extraction OCR
 */
export interface OCRResult {
  success: boolean;
  data: any;
  confidence: 'high' | 'medium' | 'low';
  rawText?: string;
  error?: string;
  method: 'ai' | 'tesseract' | 'hybrid';
  estimatedCost?: number;
}

/**
 * Configuration OCR
 */
export interface OCROptions {
  documentType: DocumentType;
  useAI?: boolean; // Par défaut: true si config IA disponible
  fallbackToTesseract?: boolean; // Par défaut: true
  includeRawText?: boolean; // Par défaut: false
}

/**
 * Extrait les données d'un document avec l'IA vision
 */
export async function enhancedOCR(
  userId: string,
  imageData: Buffer | string,
  options: OCROptions
): Promise<OCRResult> {
  // Vérifier le rate limit
  const rateLimit = checkOCRRateLimit(userId);
  if (!rateLimit.allowed) {
    return {
      success: false,
      data: null,
      confidence: 'low',
      error: formatRateLimitError(rateLimit),
      method: 'ai',
    };
  }

  // Récupérer la configuration IA
  const aiConfig = await getAIConfig(userId);

  // Déterminer la méthode à utiliser
  const useAI = options.useAI !== false && aiConfig !== null;

  if (!useAI) {
    // Fallback vers tesseract.js
    return fallbackTesseractOCR(imageData, options);
  }

  try {
    // Essayer avec l'IA
    const result = await processWithAI(userId, imageData, options, aiConfig!);
    return result;
  } catch (error: any) {
    console.error('AI OCR error:', error);

    // Fallback vers tesseract si activé
    if (options.fallbackToTesseract !== false) {
      console.log('Falling back to tesseract OCR');
      return fallbackTesseractOCR(imageData, options);
    }

    return {
      success: false,
      data: null,
      confidence: 'low',
      error: error.message || 'OCR failed',
      method: 'ai',
    };
  }
}

/**
 * Traite l'image avec l'IA vision
 */
async function processWithAI(
  userId: string,
  imageData: Buffer | string,
  options: OCROptions,
  aiConfig: any
): Promise<OCRResult> {
  // Convertir l'image en base64 si nécessaire
  const imageBase64 =
    typeof imageData === 'string'
      ? imageData
      : imageData.toString('base64');

  // Déchiffrer la clé API
  const apiKey = decryptKey(aiConfig.encryptedKey);

  // Générer le prompt de contexte
  const context = generateDocumentAnalysisContext(options.documentType);

  // Envoyer la requête selon le provider
  let result: OCRResult;

  switch (aiConfig.provider as AIProvider) {
    case AIProvider.OPENAI:
      result = await processWithOpenAI(apiKey, imageBase64, context, aiConfig.model);
      break;

    case AIProvider.ANTHROPIC:
      result = await processWithAnthropic(apiKey, imageBase64, context, aiConfig.model);
      break;

    case AIProvider.GOOGLE:
      result = await processWithGoogle(apiKey, imageBase64, context, aiConfig.model);
      break;

    default:
      throw new Error(`Provider ${aiConfig.provider} does not support vision`);
  }

  // Enregistrer l'utilisation
  if (result.success && result.estimatedCost !== undefined) {
    recordUsage({
      userId,
      provider: aiConfig.provider,
      model: aiConfig.model,
      promptTokens: 0, // Les providers vision ne retournent pas toujours ces infos
      completionTokens: 0,
      totalTokens: 0,
      estimatedCost: result.estimatedCost,
      context: 'document-ocr',
    });
  }

  return result;
}

/**
 * Traite avec OpenAI Vision (GPT-4o)
 */
async function processWithOpenAI(
  apiKey: string,
  imageBase64: string,
  context: string,
  model: string
): Promise<OCRResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: context + '\n\nRetourne uniquement un JSON valide avec les données extraites.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.1, // Faible température pour extraction précise
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`OpenAI Vision error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parser le JSON
  let extractedData;
  try {
    extractedData = JSON.parse(content);
  } catch (e) {
    // Essayer d'extraire le JSON d'un markdown code block
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      extractedData = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Failed to parse JSON from AI response');
    }
  }

  // Calculer le coût estimé
  const estimatedCost = calculateVisionCost('openai', model, imageBase64.length);

  return {
    success: true,
    data: extractedData,
    confidence: 'high',
    rawText: undefined, // options parameter not available
    method: 'ai',
    estimatedCost,
  };
}

/**
 * Traite avec Anthropic Vision (Claude)
 */
async function processWithAnthropic(
  apiKey: string,
  imageBase64: string,
  context: string,
  model: string
): Promise<OCRResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: context + '\n\nRetourne uniquement un JSON valide avec les données extraites.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Anthropic Vision error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parser le JSON
  let extractedData;
  try {
    extractedData = JSON.parse(content);
  } catch (e) {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      extractedData = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Failed to parse JSON from AI response');
    }
  }

  const estimatedCost = calculateVisionCost('anthropic', model, imageBase64.length);

  return {
    success: true,
    data: extractedData,
    confidence: 'high',
    rawText: undefined, // options parameter not available
    method: 'ai',
    estimatedCost,
  };
}

/**
 * Traite avec Google Vision (Gemini)
 */
async function processWithGoogle(
  apiKey: string,
  imageBase64: string,
  context: string,
  model: string
): Promise<OCRResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: context + '\n\nRetourne uniquement un JSON valide avec les données extraites.',
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Google Vision error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;

  // Parser le JSON
  let extractedData;
  try {
    extractedData = JSON.parse(content);
  } catch (e) {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      extractedData = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Failed to parse JSON from AI response');
    }
  }

  const estimatedCost = calculateVisionCost('google', model, imageBase64.length);

  return {
    success: true,
    data: extractedData,
    confidence: 'high',
    rawText: undefined, // options parameter not available
    method: 'ai',
    estimatedCost,
  };
}

/**
 * Fallback vers tesseract.js pour OCR traditionnel
 * TODO: Implémenter l'intégration tesseract.js
 */
async function fallbackTesseractOCR(
  imageData: Buffer | string,
  options: OCROptions
): Promise<OCRResult> {
  // Pour l'instant, retourne un échec
  // Dans une implémentation complète, utiliser tesseract.js
  console.log('Tesseract OCR fallback called');

  return {
    success: false,
    data: null,
    confidence: 'low',
    error: 'Tesseract OCR not yet implemented. Please configure AI vision.',
    method: 'tesseract',
  };
}

/**
 * Calcule le coût estimé pour une requête vision
 * Basé sur la taille de l'image (approximation)
 */
function calculateVisionCost(
  provider: string,
  model: string,
  imageBase64Length: number
): number {
  // Estimation basée sur la taille de l'image
  // Les modèles vision coûtent généralement plus cher
  const imageSizeKB = (imageBase64Length * 0.75) / 1024; // Base64 est ~33% plus grand

  // Coûts approximatifs par image (en €)
  const costs: Record<string, number> = {
    'openai:gpt-4o': 0.01,
    'openai:gpt-4o-mini': 0.003,
    'anthropic:claude-sonnet-4': 0.015,
    'anthropic:claude-opus-4': 0.04,
    'google:gemini-2.0-flash': 0.002,
    'google:gemini-1.5-pro': 0.01,
  };

  const key = `${provider}:${model}`;

  // Trouver un coût correspondant
  for (const [costKey, cost] of Object.entries(costs)) {
    if (key.includes(costKey.split(':')[1]!)) {
      // Ajuster selon la taille (images > 1MB coûtent plus cher)
      const sizeMultiplier = imageSizeKB > 1024 ? 1.5 : 1.0;
      return cost * sizeMultiplier;
    }
  }

  // Coût par défaut
  return 0.01;
}

/**
 * Mode comparaison: lance AI et tesseract en parallèle
 */
export async function compareOCRMethods(
  userId: string,
  imageData: Buffer | string,
  documentType: DocumentType
): Promise<{
  ai: OCRResult;
  tesseract: OCRResult;
  recommendation: 'ai' | 'tesseract' | 'manual';
}> {
  // Lancer les deux méthodes en parallèle
  const [aiResult, tesseractResult] = await Promise.all([
    enhancedOCR(userId, imageData, {
      documentType,
      useAI: true,
      fallbackToTesseract: false,
    }),
    fallbackTesseractOCR(imageData, { documentType }),
  ]);

  // Recommander la méthode la plus fiable
  let recommendation: 'ai' | 'tesseract' | 'manual';

  if (aiResult.success && aiResult.confidence === 'high') {
    recommendation = 'ai';
  } else if (tesseractResult.success && tesseractResult.confidence === 'high') {
    recommendation = 'tesseract';
  } else {
    recommendation = 'manual';
  }

  return {
    ai: aiResult,
    tesseract: tesseractResult,
    recommendation,
  };
}
