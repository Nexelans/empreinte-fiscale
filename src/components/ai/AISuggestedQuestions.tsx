/**
 * Suggested questions chips for AI chat
 * Phase 5 - Module AI / Chat
 *
 * Displays context-specific suggested questions as clickable chips
 */

'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface SuggestedQuestion {
  id: string;
  question: string;
}

interface AISuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function AISuggestedQuestions({
  questions,
  onSelect,
  disabled = false,
}: AISuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="border-t bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-700">
          Questions suggérées
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <Button
            key={q.id}
            variant="outline"
            size="sm"
            onClick={() => onSelect(q.question)}
            disabled={disabled}
            className="text-left whitespace-normal h-auto py-2 px-3 hover:bg-white hover:border-indigo-300 hover:text-indigo-700 transition-colors"
          >
            {q.question}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * Get suggested questions by context
 */
export function getSuggestedQuestions(context?: string): SuggestedQuestion[] {
  const questionsByContext: Record<string, SuggestedQuestion[]> = {
    dashboard: [
      {
        id: 'dashboard-1',
        question: 'Pourquoi je paie plus que je reçois ?',
      },
      {
        id: 'dashboard-2',
        question: 'Comment réduire légalement mes impôts ?',
      },
      {
        id: 'dashboard-3',
        question: 'Quelles optimisations fiscales me concernent ?',
      },
      {
        id: 'dashboard-4',
        question: 'Mon score fiscal est-il normal pour mon profil ?',
      },
    ],
    score: [
      {
        id: 'score-1',
        question: 'Comment est calculé mon impôt sur le revenu ?',
      },
      {
        id: 'score-2',
        question: 'À quelle tranche marginale suis-je ?',
      },
      {
        id: 'score-3',
        question: "Quelle est la différence entre CSG et cotisations sociales ?",
      },
      {
        id: 'score-4',
        question: 'Combien je paie de TVA par an ?',
      },
    ],
    simulation: [
      {
        id: 'simulation-1',
        question: 'Pourquoi cette différence avec ma situation actuelle ?',
      },
      {
        id: 'simulation-2',
        question: 'Quelles optimisations possibles dans ce scénario ?',
      },
      {
        id: 'simulation-3',
        question: 'Quels sont les impacts cachés de ce changement ?',
      },
    ],
    referentiel: [
      {
        id: 'referentiel-1',
        question: 'Quand ce barème a-t-il changé pour la dernière fois ?',
      },
      {
        id: 'referentiel-2',
        question: 'Comment est fixé ce taux ?',
      },
      {
        id: 'referentiel-3',
        question: "Quelle est la source officielle de cette donnée ?",
      },
    ],
  };

  return (questionsByContext[context || 'dashboard'] ?? questionsByContext['dashboard']) as SuggestedQuestion[];
}
