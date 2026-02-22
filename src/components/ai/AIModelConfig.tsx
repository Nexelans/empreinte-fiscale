'use client';

/**
 * Configuration du modèle IA (Step 3 wizard)
 * Phase 4 - Module AI
 */

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { AIProvider, AVAILABLE_MODELS } from '@/modules/ai/types';
import { Info } from 'lucide-react';

interface AIModelConfigProps {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  onModelChange: (value: string) => void;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
}

export function AIModelConfig({
  provider,
  model,
  temperature,
  maxTokens,
  onModelChange,
  onTemperatureChange,
  onMaxTokensChange,
}: AIModelConfigProps) {
  const availableModels = AVAILABLE_MODELS[provider] || [];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Model selection */}
        <div>
          <Label htmlFor="model">Modèle</Label>
          <Select value={model} onValueChange={onModelChange}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Sélectionnez un modèle" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{m.name}</span>
                    {m.supportsVision && (
                      <span className="ml-2 text-xs text-blue-600">Vision</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {model && availableModels.find((m) => m.id === model) && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
              {(() => {
                const selectedModel = availableModels.find((m) => m.id === model)!;
                return (
                  <div className="space-y-1">
                    <p className="font-medium">{selectedModel.name}</p>
                    <p className="text-gray-600">
                      Contexte : {(selectedModel.contextWindow / 1000).toFixed(0)}K tokens
                    </p>
                    {selectedModel.costPer1kTokens && (
                      <p className="text-gray-600">
                        Coût : ${selectedModel.costPer1kTokens.input.toFixed(4)}/1K input,
                        ${selectedModel.costPer1kTokens.output.toFixed(4)}/1K output
                      </p>
                    )}
                    {selectedModel.supportsVision && (
                      <p className="text-blue-600 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Supporte l'analyse d'images (OCR amélioré)
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Temperature */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="temperature">Température</Label>
            <span className="text-sm font-mono text-gray-600">{temperature.toFixed(1)}</span>
          </div>
          <Slider
            id="temperature"
            min={0}
            max={1}
            step={0.1}
            value={[temperature]}
            onValueChange={([value]) => onTemperatureChange(value ?? 0.3)}
          />
          <p className="text-xs text-gray-500 mt-1">
            {temperature < 0.3
              ? 'Très déterministe - Recommandé pour extraction de données'
              : temperature < 0.7
              ? 'Équilibré - Bon pour la plupart des usages'
              : 'Créatif - Plus de variabilité dans les réponses'}
          </p>
        </div>

        {/* Max Tokens */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="maxTokens">Tokens maximum</Label>
            <span className="text-sm font-mono text-gray-600">{maxTokens}</span>
          </div>
          <Slider
            id="maxTokens"
            min={512}
            max={4096}
            step={256}
            value={[maxTokens]}
            onValueChange={([value]) => onMaxTokensChange(value ?? 1024)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Limite de longueur des réponses générées (≈ {Math.round(maxTokens * 0.75)} mots)
          </p>
        </div>

        {/* Estimation de coût */}
        {model && (() => {
          const selectedModel = availableModels.find((m) => m.id === model);
          if (selectedModel?.costPer1kTokens) {
            const avgCostPerRequest =
              (selectedModel.costPer1kTokens.input * 1 + selectedModel.costPer1kTokens.output * (maxTokens / 1000));
            return (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Estimation de coût
                </p>
                <p className="text-xs text-blue-700">
                  ~${avgCostPerRequest.toFixed(4)} par requête moyenne (1K input + {maxTokens / 1000}K output)
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Pour 100 requêtes : ~${(avgCostPerRequest * 100).toFixed(2)}
                </p>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </Card>
  );
}
