/**
 * Formulaire de configuration IA
 * Phase 4 - Module AI
 *
 * Permet à l'utilisateur de configurer son provider IA personnel
 */

'use client';

import { useState, useEffect } from 'react';
import { AIProvider, AVAILABLE_MODELS } from '@/modules/ai/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIConfigFormProps {
  onConfigSaved?: () => void;
}

export function AIConfigForm({ onConfigSaved }: AIConfigFormProps) {
  const { toast } = useToast();

  const [provider, setProvider] = useState<AIProvider>(AIProvider.OPENAI);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [endpoint, setEndpoint] = useState('');
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [customSystemPrompt, setCustomSystemPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);

  // Charger la configuration existante
  useEffect(() => {
    loadConfig();
  }, []);

  // Mettre à jour le modèle par défaut quand le provider change
  useEffect(() => {
    const models = AVAILABLE_MODELS[provider];
    if (models && models.length > 0) {
      setModel(models[0]!.id); // Safe because we check length > 0
    }
  }, [provider]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/ai/config');
      const data = await response.json();

      if (data.config) {
        setProvider(data.config.provider);
        setModel(data.config.model);
        setTemperature(data.config.temperature);
        setMaxTokens(data.config.maxTokens);
        setEndpoint(data.config.endpoint || '');
        setCustomSystemPrompt(data.config.customSystemPrompt || '');
        setHasExistingConfig(true);
        // Ne pas charger l'API key (elle n'est pas retournée)
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!apiKey && !hasExistingConfig) {
        toast({
          title: 'Erreur',
          description: 'Veuillez saisir votre clé API',
          type: 'error',
        });
        setLoading(false);
        return;
      }

      if (provider === AIProvider.CUSTOM && !endpoint) {
        toast({
          title: 'Erreur',
          description: "L'endpoint est requis pour un provider personnalisé",
          type: 'error',
        });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKey || undefined, // Ne pas envoyer si vide (garde l'existante)
          endpoint: provider === AIProvider.CUSTOM ? endpoint : undefined,
          model,
          temperature,
          maxTokens,
          customSystemPrompt: customSystemPrompt || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save configuration');
      }

      toast({
        title: 'Configuration sauvegardée',
        description: 'Votre configuration IA a été enregistrée avec succès',
      });

      setHasExistingConfig(true);
      setApiKey(''); // Effacer l'API key du formulaire
      onConfigSaved?.();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder la configuration',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre configuration IA ?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/ai/config', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }

      toast({
        title: 'Configuration supprimée',
        description: 'Votre configuration IA a été supprimée',
      });

      // Réinitialiser le formulaire
      setApiKey('');
      setEndpoint('');
      setCustomSystemPrompt('');
      setHasExistingConfig(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer la configuration',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const availableModels = AVAILABLE_MODELS[provider] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration IA</CardTitle>
        <CardDescription>
          Connectez votre propre IA pour des analyses personnalisées et un OCR amélioré
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Confidentialité :</strong> Votre clé API est chiffrée (AES-256) et
            stockée de manière sécurisée. Vos données fiscales ne sont envoyées à l'IA
            que lorsque vous le demandez explicitement.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider */}
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={provider}
              onValueChange={(value) => setProvider(value as AIProvider)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AIProvider.OPENAI}>OpenAI (GPT)</SelectItem>
                <SelectItem value={AIProvider.ANTHROPIC}>
                  Anthropic (Claude)
                </SelectItem>
                <SelectItem value={AIProvider.MISTRAL}>Mistral AI</SelectItem>
                <SelectItem value={AIProvider.GOOGLE}>Google (Gemini)</SelectItem>
                <SelectItem value={AIProvider.CUSTOM}>Endpoint personnalisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">
              Clé API {hasExistingConfig && '(laisser vide pour garder l\'existante)'}
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                required={!hasExistingConfig}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Endpoint (Custom only) */}
          {provider === AIProvider.CUSTOM && (
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Input
                id="endpoint"
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://..."
                required
              />
              <p className="text-sm text-muted-foreground">
                Format compatible OpenAI Chat Completions API
              </p>
            </div>
          )}

          {/* Model */}
          <div className="space-y-2">
            <Label htmlFor="model">Modèle</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                    {m.costPer1kTokens && (
                      <span className="text-muted-foreground text-xs ml-2">
                        ({m.costPer1kTokens.input * 1000}€/1M tokens)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">
              Température : {temperature.toFixed(1)}
            </Label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Plus bas = plus précis et déterministe
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Tokens maximum</Label>
            <Input
              id="maxTokens"
              type="number"
              min="100"
              max="8000"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            />
          </div>

          {/* Custom System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="customSystemPrompt">
              Prompt système personnalisé (optionnel)
            </Label>
            <Textarea
              id="customSystemPrompt"
              value={customSystemPrompt}
              onChange={(e) => setCustomSystemPrompt(e.target.value)}
              placeholder="Ajouter des instructions spécifiques pour l'IA..."
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sauvegarder
            </Button>

            {hasExistingConfig && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
              >
                Supprimer
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
