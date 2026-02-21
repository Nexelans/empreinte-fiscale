'use client';

/**
 * Wizard de configuration IA en 3 étapes
 * Phase 4 - Module AI
 *
 * Step 1: Choix du provider
 * Step 2: Authentification (API key + test)
 * Step 3: Configuration modèle
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AIProvider } from '@/modules/ai/types';
import { AIProviderCard } from './AIProviderCard';
import { AITestConnectionWizard } from './AITestConnectionWizard';
import { AIModelConfig } from './AIModelConfig';
import { AIConsentModal } from './AIConsentModal';
import { toast } from 'sonner';

interface AIConfigWizardProps {
  onComplete: () => void;
  existingConfig?: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    endpoint?: string;
  };
}

type Step = 1 | 2 | 3;

export function AIConfigWizard({ onComplete, existingConfig }: AIConfigWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);

  // Form state
  const [provider, setProvider] = useState<AIProvider | null>(
    existingConfig?.provider as AIProvider || null
  );
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState(existingConfig?.endpoint || '');
  const [model, setModel] = useState(existingConfig?.model || '');
  const [temperature, setTemperature] = useState(existingConfig?.temperature || 0.3);
  const [maxTokens, setMaxTokens] = useState(existingConfig?.maxTokens || 2048);
  const [testStatus, setTestStatus] = useState<'untested' | 'testing' | 'success' | 'failed'>('untested');

  const progress = (step / 3) * 100;

  const handleProviderSelect = (selectedProvider: AIProvider) => {
    setProvider(selectedProvider);

    // Si c'est la première config, montrer le consentement
    if (!existingConfig && !consentGranted) {
      setShowConsentModal(true);
    } else {
      setStep(2);
    }
  };

  const handleConsentAccept = async () => {
    setConsentGranted(true);
    setShowConsentModal(false);
    setStep(2);
  };

  const handleConsentDecline = () => {
    setShowConsentModal(false);
    setProvider(null);
    toast.info('Configuration annulée');
  };

  const handleTestSuccess = () => {
    setTestStatus('success');
    // Auto-avancer à l'étape 3 après 500ms
    setTimeout(() => setStep(3), 500);
  };

  const handleSave = async () => {
    if (!provider || !apiKey || !model) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          endpoint: provider === AIProvider.CUSTOM ? endpoint : undefined,
          model,
          temperature,
          maxTokens,
          grantConsent: !existingConfig && consentGranted, // Premier setup
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save configuration');
      }

      onComplete();
    } catch (error: any) {
      console.error('Failed to save AI config:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Étape {step} sur 3</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Step 1: Provider selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choisissez votre provider IA</h2>
              <p className="text-gray-600">
                Sélectionnez le service d'IA que vous souhaitez utiliser.
                Votre clé API sera chiffrée et jamais exposée.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <AIProviderCard
                provider={AIProvider.OPENAI}
                selected={provider === AIProvider.OPENAI}
                onSelect={() => handleProviderSelect(AIProvider.OPENAI)}
              />
              <AIProviderCard
                provider={AIProvider.ANTHROPIC}
                selected={provider === AIProvider.ANTHROPIC}
                onSelect={() => handleProviderSelect(AIProvider.ANTHROPIC)}
              />
              <AIProviderCard
                provider={AIProvider.MISTRAL}
                selected={provider === AIProvider.MISTRAL}
                onSelect={() => handleProviderSelect(AIProvider.MISTRAL)}
              />
              <AIProviderCard
                provider={AIProvider.GOOGLE}
                selected={provider === AIProvider.GOOGLE}
                onSelect={() => handleProviderSelect(AIProvider.GOOGLE)}
              />
              <AIProviderCard
                provider={AIProvider.CUSTOM}
                selected={provider === AIProvider.CUSTOM}
                onSelect={() => handleProviderSelect(AIProvider.CUSTOM)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Authentication */}
        {step === 2 && provider && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Authentification</h2>
                <p className="text-gray-600">
                  Entrez votre clé API {provider}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setStep(1)}>
                ← Retour
              </Button>
            </div>

            <AITestConnectionWizard
              provider={provider}
              apiKey={apiKey}
              endpoint={endpoint}
              onApiKeyChange={setApiKey}
              onEndpointChange={setEndpoint}
              onModelDetected={setModel}
              onStatusChange={setTestStatus}
              onTestSuccess={handleTestSuccess}
            />
          </div>
        )}

        {/* Step 3: Model configuration */}
        {step === 3 && provider && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Configuration du modèle</h2>
                <p className="text-gray-600">
                  Personnalisez les paramètres de votre IA
                </p>
              </div>
              <Button variant="ghost" onClick={() => setStep(2)}>
                ← Retour
              </Button>
            </div>

            <AIModelConfig
              provider={provider}
              model={model}
              temperature={temperature}
              maxTokens={maxTokens}
              onModelChange={setModel}
              onTemperatureChange={setTemperature}
              onMaxTokensChange={setMaxTokens}
            />

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                Précédent
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Enregistrer la configuration
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de consentement RGPD */}
      <AIConsentModal
        open={showConsentModal}
        onOpenChange={setShowConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
    </>
  );
}
