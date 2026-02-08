"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  User,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Share2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

interface ComparisonData {
  challengeId: string;
  creator: {
    id: string;
    name: string;
    score: number;
    percentage: number;
    completedAt: string;
  };
  participant: {
    id: string;
    name: string;
    score: number;
    percentage: number;
    completedAt: string;
  };
  totalQuestions: number;
  questionBreakdown: Array<{
    questionId: string;
    question: string;
    category: string;
    creatorCorrect: boolean;
    participantCorrect: boolean;
    correctAnswer: number;
    explanation: string;
    relatedGlossaryTerms: string[];
  }>;
  commonMistakes: Array<{
    questionId: string;
    question: string;
    explanation: string;
  }>;
  strongTopics: string[];
  weakTopics: string[];
  educationalSummary: string; // Task 29.5
}

export default function ChallengeResultsPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.challengeId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/quiz/challenge/results?challengeId=${challengeId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load results");
        }

        setComparison(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    }

    if (challengeId) {
      fetchResults();
    }
  }, [challengeId]);

  const handleShare = () => {
    if (!comparison) return;

    const shareText = `J'ai obtenu ${comparison.participant.percentage}% au défi fiscal de ${comparison.creator.name} ! Tentez votre chance : ${window.location.origin}/quiz/challenge/${challengeId}`;

    if (navigator.share) {
      navigator.share({
        title: "Défi Fiscal",
        text: shareText,
        url: `${window.location.origin}/quiz/challenge/${challengeId}`,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Lien copié dans le presse-papier !");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Erreur</h2>
          </div>
          <p className="text-red-800 mb-4">{error || "Résultats non trouvés"}</p>
          <Button onClick={() => router.push("/quiz")} variant="outline">
            Retour aux quiz
          </Button>
        </div>
      </div>
    );
  }

  const creatorWins = comparison.creator.score > comparison.participant.score;
  const participantWins = comparison.participant.score > comparison.creator.score;
  const tie = comparison.creator.score === comparison.participant.score;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => router.push("/quiz")}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux quiz
        </Button>

        {/* Winner Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center"
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {tie
              ? "Match nul !"
              : creatorWins
              ? `${comparison.creator.name} gagne !`
              : `${comparison.participant.name} gagne !`}
          </h1>
          <p className="text-gray-600">
            {tie
              ? "Vous avez tous les deux obtenu le même score !"
              : creatorWins
              ? "Le créateur du défi conserve son titre !"
              : "Félicitations pour avoir surpassé le créateur !"}
          </p>
        </motion.div>

        {/* Side-by-Side Comparison (Task 29.4) */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Creator Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white rounded-xl shadow-lg p-6 ${
              creatorWins ? "ring-4 ring-yellow-400" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="font-bold text-gray-900">{comparison.creator.name}</h2>
                <p className="text-sm text-gray-600">Créateur du défi</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Score</span>
                <span className="text-2xl font-bold text-blue-600">
                  {comparison.creator.score}/{comparison.totalQuestions}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Pourcentage</span>
                <span className="text-xl font-bold text-blue-600">
                  {comparison.creator.percentage}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Terminé le</span>
                <span className="text-sm text-gray-600">
                  {new Date(comparison.creator.completedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Participant Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white rounded-xl shadow-lg p-6 ${
              participantWins ? "ring-4 ring-yellow-400" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <User className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="font-bold text-gray-900">{comparison.participant.name}</h2>
                <p className="text-sm text-gray-600">Participant</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Score</span>
                <span className="text-2xl font-bold text-purple-600">
                  {comparison.participant.score}/{comparison.totalQuestions}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Pourcentage</span>
                <span className="text-xl font-bold text-purple-600">
                  {comparison.participant.percentage}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Terminé le</span>
                <span className="text-sm text-gray-600">
                  {new Date(comparison.participant.completedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Educational Summary (Task 29.5) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                📚 Résumé pédagogique
              </h3>
              <p className="text-blue-800 leading-relaxed">
                {comparison.educationalSummary}
              </p>
            </div>
          </div>

          {/* Strong Topics */}
          {comparison.strongTopics.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-semibold text-green-900">Points forts</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {comparison.strongTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weak Topics */}
          {comparison.weakTopics.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-orange-600" />
                <h4 className="text-sm font-semibold text-orange-900">À améliorer</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {comparison.weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Question-by-Question Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Détail des questions
          </h3>

          <div className="space-y-3">
            {comparison.questionBreakdown.map((question, index) => {
              const bothCorrect = question.creatorCorrect && question.participantCorrect;
              const bothWrong = !question.creatorCorrect && !question.participantCorrect;
              const creatorOnly = question.creatorCorrect && !question.participantCorrect;
              const participantOnly = !question.creatorCorrect && question.participantCorrect;

              return (
                <div
                  key={question.questionId}
                  className={`p-4 rounded-lg border-2 ${
                    bothCorrect
                      ? "bg-green-50 border-green-200"
                      : bothWrong
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="font-semibold text-gray-700 min-w-[30px]">
                      Q{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {question.question}
                      </p>
                      <div className="flex items-center gap-4 text-sm mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Créateur:</span>
                          {question.creatorCorrect ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-red-600 font-bold">✗</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Participant:</span>
                          {question.participantCorrect ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-red-600 font-bold">✗</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">
                        {question.explanation}
                      </p>
                      {question.relatedGlossaryTerms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {question.relatedGlossaryTerms.map((term) => (
                            <a
                              key={term}
                              href={`/glossaire#${term}`}
                              className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              {term.replace(/-/g, " ")}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleShare} className="flex-1" size="lg">
            <Share2 className="w-4 h-4 mr-2" />
            Partager le défi
          </Button>
          <Button
            onClick={() => router.push(`/quiz/challenge/${challengeId}`)}
            variant="outline"
            size="lg"
          >
            Recommencer
          </Button>
        </div>
      </div>
    </div>
  );
}
