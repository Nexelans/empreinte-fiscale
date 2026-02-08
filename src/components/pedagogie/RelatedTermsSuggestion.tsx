"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink } from "lucide-react";

interface RelatedTermsSuggestionProps {
  wrongAnswers: Array<{
    questionId: string;
    relatedGlossaryTerms?: string[];
  }>;
  onTermClick?: (term: string) => void;
}

/**
 * Task 28.3: Related Glossary Terms Suggestion
 * Shows glossary term suggestions based on quiz wrong answers
 */
export function RelatedTermsSuggestion({
  wrongAnswers,
  onTermClick,
}: RelatedTermsSuggestionProps) {
  // Collect all related terms from wrong answers
  const relatedTerms = Array.from(
    new Set(
      wrongAnswers.flatMap((answer) => answer.relatedGlossaryTerms || [])
    )
  );

  if (relatedTerms.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
      <div className="flex items-start gap-3">
        <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            📚 Pour mieux comprendre
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            Vous avez eu des difficultés sur certaines questions. Voici des termes du
            glossaire qui peuvent vous aider à mieux comprendre ces concepts :
          </p>

          <div className="flex flex-wrap gap-2">
            {relatedTerms.map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onTermClick) {
                    onTermClick(term);
                  } else {
                    window.location.href = `/glossaire#${term}`;
                  }
                }}
                className="bg-white hover:bg-blue-100 border-blue-300 text-blue-900"
              >
                {term.replace(/-/g, " ")}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            ))}
          </div>

          <p className="text-xs text-blue-700 mt-4">
            💡 Astuce : Consultez ces termes dans le glossaire pour améliorer votre
            score au prochain quiz !
          </p>
        </div>
      </div>
    </div>
  );
}
