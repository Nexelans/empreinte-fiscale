'use client';

/**
 * Card de sélection d'un provider IA
 * Phase 4 - Module AI
 */

import { Card } from '@/components/ui/card';
import { AIProvider } from '@/modules/ai/types';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIProviderCardProps {
  provider: AIProvider;
  selected: boolean;
  onSelect: () => void;
}

const PROVIDER_INFO = {
  [AIProvider.OPENAI]: {
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo - Excellente précision',
    features: ['Vision', 'Analyse de documents', '128K tokens'],
    pricing: 'À partir de 0.15$/1M tokens (GPT-4o Mini)',
    color: 'from-green-500 to-green-600',
  },
  [AIProvider.ANTHROPIC]: {
    name: 'Anthropic',
    description: 'Claude 4 - Leader en précision',
    features: ['Vision', 'Contexte 200K tokens', 'Analyse poussée'],
    pricing: 'À partir de 0.80$/1M tokens (Claude Haiku)',
    color: 'from-orange-500 to-orange-600',
  },
  [AIProvider.MISTRAL]: {
    name: 'Mistral AI',
    description: 'Mistral Large - IA française',
    features: ['Souveraineté', '128K tokens', 'Rapide'],
    pricing: 'À partir de 0.20$/1M tokens (Mistral Small)',
    color: 'from-blue-500 to-blue-600',
  },
  [AIProvider.GOOGLE]: {
    name: 'Google',
    description: 'Gemini 2.0 - Contexte ultra-long',
    features: ['Vision', 'Jusqu\'à 2M tokens', 'Multimodal'],
    pricing: 'À partir de 0.10$/1M tokens (Gemini Flash)',
    color: 'from-purple-500 to-purple-600',
  },
  [AIProvider.CUSTOM]: {
    name: 'Endpoint custom',
    description: 'Votre propre API compatible OpenAI',
    features: ['Contrôle total', 'Auto-hébergé possible', 'Flexible'],
    pricing: 'Selon votre configuration',
    color: 'from-gray-500 to-gray-600',
  },
};

export function AIProviderCard({ provider, selected, onSelect }: AIProviderCardProps) {
  const info = PROVIDER_INFO[provider];

  return (
    <Card
      className={cn(
        'p-6 cursor-pointer transition-all hover:shadow-md',
        selected && 'ring-2 ring-blue-500 shadow-md'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className={cn('text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent', info.color)}>
            {info.name}
          </div>
          <p className="text-sm text-gray-600 mt-1">{info.description}</p>
        </div>
        {selected && (
          <div className="p-1 bg-blue-500 rounded-full">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {info.features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
        💰 {info.pricing}
      </div>
    </Card>
  );
}
