'use client';

/**
 * Composant de test de connexion IA pour le wizard
 * Phase 4 - Module AI
 *
 * Teste la connexion AVANT de sauvegarder la config (via POST temporaire)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AIProvider } from '@/modules/ai/types';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AITestConnectionWizardProps {
  provider: AIProvider;
  apiKey: string;
  endpoint: string;
  onApiKeyChange: (value: string) => void;
  onEndpointChange: (value: string) => void;
  onModelDetected: (model: string) => void;
  onStatusChange: (status: 'untested' | 'testing' | 'success' | 'failed') => void;
  onTestSuccess: () => void;
}

export function AITestConnectionWizard({
  provider,
  apiKey,
  endpoint,
  onApiKeyChange,
  onEndpointChange,
  onModelDetected,
  onStatusChange,
  onTestSuccess,
}: AITestConnectionWizardProps) {
  const [status, setStatus] = useState<'untested' | 'testing' | 'success' | 'failed'>('untested');
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedModel, setDetectedModel] = useState('');

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error('Veuillez entrer une clé API');
      return;
    }

    if (provider === AIProvider.CUSTOM && !endpoint.trim()) {
      toast.error('Veuillez entrer l\'URL de votre endpoint');
      return;
    }

    setStatus('testing');
    onStatusChange('testing');
    setErrorMessage('');

    try {
      // Utiliser un modèle par défaut pour chaque provider
      const defaultModels: Record<AIProvider, string> = {
        [AIProvider.OPENAI]: 'gpt-4o-mini',
        [AIProvider.ANTHROPIC]: 'claude-sonnet-4-20250514',
        [AIProvider.MISTRAL]: 'mistral-small-latest',
        [AIProvider.GOOGLE]: 'gemini-2.0-flash',
        [AIProvider.CUSTOM]: 'default',
      };

      const testModel = defaultModels[provider];

      // Créer une config temporaire pour le test (pas de sauvegarde DB)
      const res = await fetch('/api/ai/test-temp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          endpoint: provider === AIProvider.CUSTOM ? endpoint : undefined,
          model: testModel,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Test failed');
      }

      setStatus('success');
      onStatusChange('success');
      setDetectedModel(data.model || testModel);
      onModelDetected(data.model || testModel);
      toast.success(`Connexion réussie ! Modèle détecté: ${data.model || testModel}`);
      onTestSuccess();
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setStatus('failed');
      onStatusChange('failed');
      setErrorMessage(error.message || 'Erreur de connexion');
      toast.error(error.message || 'Échec de la connexion');
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="apiKey">Clé API {provider}</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder={
              provider === AIProvider.OPENAI
                ? 'sk-proj-...'
                : provider === AIProvider.ANTHROPIC
                ? 'sk-ant-...'
                : provider === AIProvider.MISTRAL
                ? 'Mistral API Key'
                : provider === AIProvider.GOOGLE
                ? 'AIza...'
                : 'Votre clé API'
            }
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            Votre clé sera chiffrée avec AES-256 et jamais exposée au navigateur
          </p>
        </div>

        {provider === AIProvider.CUSTOM && (
          <div>
            <Label htmlFor="endpoint">URL de l'endpoint</Label>
            <Input
              id="endpoint"
              type="url"
              placeholder="https://api.example.com/v1/chat/completions"
              value={endpoint}
              onChange={(e) => onEndpointChange(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Doit être compatible avec le format OpenAI API
            </p>
          </div>
        )}

        <Button
          onClick={handleTest}
          disabled={status === 'testing'}
          className="w-full"
        >
          {status === 'testing' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {status === 'testing' ? 'Test en cours...' : 'Tester la connexion'}
        </Button>

        {/* Status display */}
        {status === 'success' && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900">Connexion réussie !</p>
              {detectedModel && (
                <p className="text-sm text-green-700 mt-1">
                  Modèle détecté : {detectedModel}
                </p>
              )}
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-900">Échec de la connexion</p>
              {errorMessage && (
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              )}
              <p className="text-xs text-red-600 mt-2">
                Vérifiez votre clé API et réessayez
              </p>
            </div>
          </div>
        )}

        {provider === AIProvider.OPENAI && status === 'untested' && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-900">
              <p className="font-medium mb-1">Où trouver ma clé API OpenAI ?</p>
              <p>
                Rendez-vous sur{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  platform.openai.com/api-keys
                </a>{' '}
                et créez une nouvelle clé.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
