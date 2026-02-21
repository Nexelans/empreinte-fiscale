/**
 * Gestion des erreurs IA user-friendly
 * Phase 7 - Module AI / Error Handling
 *
 * Transforme les erreurs techniques en messages clairs pour l'utilisateur
 */

/**
 * Codes d'erreur AI standardisés
 */
export enum AIErrorCode {
  // Erreurs de configuration
  INVALID_API_KEY = 'INVALID_API_KEY',
  MISSING_CONFIG = 'MISSING_CONFIG',
  INVALID_CONFIG = 'INVALID_CONFIG',

  // Erreurs de quota et limites
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  DAILY_LIMIT_REACHED = 'DAILY_LIMIT_REACHED',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',

  // Erreurs de réseau
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // Erreurs provider
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  CONTEXT_LENGTH_EXCEEDED = 'CONTEXT_LENGTH_EXCEEDED',
  CONTENT_FILTER = 'CONTENT_FILTER',

  // Erreurs de parsing
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  JSON_PARSE_ERROR = 'JSON_PARSE_ERROR',

  // Autres
  CONSENT_REQUIRED = 'CONSENT_REQUIRED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Classe d'erreur AI avec messages user-friendly
 */
export class AIError extends Error {
  code: AIErrorCode;
  userMessage: string;
  retryable: boolean;
  retryAfter?: number; // Timestamp ou secondes
  details?: any;

  constructor(
    code: AIErrorCode,
    userMessage: string,
    retryable: boolean = false,
    details?: any
  ) {
    super(userMessage);
    this.name = 'AIError';
    this.code = code;
    this.userMessage = userMessage;
    this.retryable = retryable;
    this.details = details;
  }
}

/**
 * Mappe les erreurs HTTP des providers vers des AIError
 */
export function handleProviderError(
  error: any,
  provider: string
): AIError {
  // Erreur réseau
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return new AIError(
      AIErrorCode.CONNECTION_REFUSED,
      'Impossible de contacter le service IA. Vérifiez votre connexion internet.',
      true
    );
  }

  if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
    return new AIError(
      AIErrorCode.TIMEOUT_ERROR,
      'Le service IA met trop de temps à répondre. Réessayez dans quelques instants.',
      true
    );
  }

  // Erreurs HTTP basées sur le status
  const status = error.response?.status || error.status;
  const errorMessage = error.response?.data?.error?.message || error.message || '';

  if (status === 401 || status === 403) {
    return new AIError(
      AIErrorCode.INVALID_API_KEY,
      `Clé API ${provider} invalide ou expirée. Vérifiez votre configuration dans les paramètres.`,
      false
    );
  }

  if (status === 429) {
    // Vérifier si c'est un quota exceeded
    if (errorMessage.toLowerCase().includes('quota')) {
      return new AIError(
        AIErrorCode.QUOTA_EXCEEDED,
        `Quota ${provider} dépassé. Vérifiez votre compte ${provider} ou attendez le renouvellement.`,
        false
      );
    }

    // Rate limit avec retry-after
    const retryAfter = error.response?.headers?.['retry-after'];
    return new AIError(
      AIErrorCode.RATE_LIMIT_EXCEEDED,
      `Limite de requêtes ${provider} atteinte. Réessayez dans quelques secondes.`,
      true,
      { retryAfter: retryAfter ? parseInt(retryAfter) : undefined }
    );
  }

  if (status === 404) {
    return new AIError(
      AIErrorCode.MODEL_NOT_FOUND,
      `Le modèle configuré n'existe pas chez ${provider}. Vérifiez votre configuration.`,
      false
    );
  }

  if (status === 413) {
    return new AIError(
      AIErrorCode.CONTEXT_LENGTH_EXCEEDED,
      'Votre message est trop long. Essayez avec un message plus court.',
      false
    );
  }

  if (status === 500 || status === 502 || status === 503) {
    return new AIError(
      AIErrorCode.PROVIDER_UNAVAILABLE,
      `Le service ${provider} est temporairement indisponible. Réessayez dans quelques minutes.`,
      true
    );
  }

  // Content filter (OpenAI, Azure)
  if (errorMessage.toLowerCase().includes('content_filter') || errorMessage.toLowerCase().includes('content policy')) {
    return new AIError(
      AIErrorCode.CONTENT_FILTER,
      'Votre message a été bloqué par les filtres de contenu. Reformulez votre question.',
      false
    );
  }

  // Erreur de parsing JSON
  if (error instanceof SyntaxError || errorMessage.includes('JSON')) {
    return new AIError(
      AIErrorCode.JSON_PARSE_ERROR,
      'Réponse du service IA mal formée. Réessayez.',
      true
    );
  }

  // Erreur générique
  return new AIError(
    AIErrorCode.PROVIDER_ERROR,
    `Erreur ${provider}: ${errorMessage || 'Une erreur inattendue est survenue'}`,
    true,
    { originalError: error }
  );
}

/**
 * Mappe les erreurs internes de l'application
 */
export function handleInternalError(error: any): AIError {
  if (error instanceof AIError) {
    return error;
  }

  // Erreur de consentement
  if (error.message?.includes('consent')) {
    return new AIError(
      AIErrorCode.CONSENT_REQUIRED,
      'Vous devez accepter la transmission de données à votre IA avant utilisation.',
      false
    );
  }

  // Configuration manquante
  if (error.message?.includes('config') || error.message?.includes('configuration')) {
    return new AIError(
      AIErrorCode.MISSING_CONFIG,
      'Configuration IA manquante. Configurez votre IA dans les paramètres.',
      false
    );
  }

  // Circuit breaker ouvert
  if (error.message?.includes('circuit breaker')) {
    return new AIError(
      AIErrorCode.CIRCUIT_BREAKER_OPEN,
      'Trop d\'erreurs consécutives. Le service IA est temporairement désactivé. Réessayez dans 5 minutes.',
      false,
      { retryAfter: Date.now() + 5 * 60 * 1000 }
    );
  }

  // Limite quotidienne atteinte
  if (error.message?.includes('daily limit') || error.message?.includes('rate limit')) {
    return new AIError(
      AIErrorCode.DAILY_LIMIT_REACHED,
      'Limite quotidienne atteinte (100 messages/jour). Réessayez demain.',
      false
    );
  }

  // Erreur inconnue
  return new AIError(
    AIErrorCode.UNKNOWN_ERROR,
    'Une erreur inattendue est survenue. Réessayez ou contactez le support.',
    true,
    { originalError: error }
  );
}

/**
 * Formate un message d'erreur pour l'utilisateur
 */
export function formatErrorMessage(error: AIError): {
  title: string;
  message: string;
  action?: string;
} {
  const baseMessage = {
    title: 'Erreur',
    message: error.userMessage,
  };

  // Ajouter des actions suggérées selon le code d'erreur
  switch (error.code) {
    case AIErrorCode.INVALID_API_KEY:
      return {
        ...baseMessage,
        action: 'Vérifier ma configuration',
      };

    case AIErrorCode.MISSING_CONFIG:
      return {
        ...baseMessage,
        action: 'Configurer mon IA',
      };

    case AIErrorCode.QUOTA_EXCEEDED:
      return {
        ...baseMessage,
        action: 'Vérifier mon quota',
      };

    case AIErrorCode.DAILY_LIMIT_REACHED:
      return {
        ...baseMessage,
        message: `${error.userMessage} Vous pourrez réutiliser votre IA demain à partir de 00:00.`,
      };

    case AIErrorCode.CONSENT_REQUIRED:
      return {
        ...baseMessage,
        action: 'Donner mon consentement',
      };

    default:
      return baseMessage;
  }
}
