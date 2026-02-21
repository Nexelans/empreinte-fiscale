/**
 * Composant d'affichage d'erreur AI user-friendly
 * Phase 7 - Module AI / UX Polish
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Settings, CheckCircle } from 'lucide-react';
import { AIError, formatErrorMessage } from '@/modules/ai/errors';
import { useRouter } from 'next/navigation';

interface ErrorAlertProps {
  error: AIError | Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onRetry, className }: ErrorAlertProps) {
  const router = useRouter();

  // Convertir l'erreur en AIError si nécessaire
  const aiError =
    error instanceof AIError
      ? error
      : typeof error === 'string'
      ? { userMessage: error, code: 'UNKNOWN_ERROR', retryable: false }
      : { userMessage: error.message, code: 'UNKNOWN_ERROR', retryable: false };

  const formatted = formatErrorMessage(aiError as AIError);

  const handleAction = () => {
    if (formatted.action === 'Vérifier ma configuration' || formatted.action === 'Configurer mon IA') {
      router.push('/settings/ai');
    } else if (formatted.action === 'Donner mon consentement') {
      router.push('/settings/privacy');
    } else if (onRetry && aiError.retryable) {
      onRetry();
    }
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{formatted.title}</AlertTitle>
      <AlertDescription>
        <p className="mb-3">{formatted.message}</p>
        <div className="flex gap-2">
          {aiError.retryable && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Réessayer
            </Button>
          )}
          {formatted.action && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAction}
              className="bg-white hover:bg-gray-50"
            >
              <Settings className="h-3 w-3 mr-1" />
              {formatted.action}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Composant de succès (pour feedback positif)
 */
interface SuccessAlertProps {
  message: string;
  className?: string;
}

export function SuccessAlert({ message, className }: SuccessAlertProps) {
  return (
    <Alert className={`border-green-200 bg-green-50 ${className}`}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">{message}</AlertDescription>
    </Alert>
  );
}
