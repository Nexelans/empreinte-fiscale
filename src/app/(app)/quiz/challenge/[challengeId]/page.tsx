"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, User, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
  category: string;
  relatedGlossaryTerms?: string[];
}

interface ChallengeData {
  challengeId: string;
  creator: {
    id: string;
    name: string;
    image: string | null;
  };
  questions: QuizQuestion[];
  totalQuestions: number;
  expiresAt: string;
  status: string;
  isCreator: boolean;
}

interface QuizResult {
  questionId: string;
  correct: boolean;
  userAnswer: number;
  correctAnswer: number;
  explanation: string;
  relatedGlossaryTerms: string[];
}

export default function QuizChallengePage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.challengeId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Fetch challenge data
  useEffect(() => {
    async function fetchChallenge() {
      try {
        const response = await fetch(`/api/quiz/challenge?challengeId=${challengeId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load challenge");
        }

        setChallenge(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load challenge");
      } finally {
        setLoading(false);
      }
    }

    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId]);

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!challenge) return "";
    const now = new Date();
    const expires = new Date(challenge.expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Expiré";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} jour${days > 1 ? "s" : ""}`;
    return `${hours} heure${hours > 1 ? "s" : ""}`;
  };

  const handleStartChallenge = () => {
    setStarted(true);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestionIndex < challenge!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit quiz
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: number[]) => {
    setSubmitting(true);

    try {
      const response = await fetch("/api/quiz/challenge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          questions: challenge!.questions,
          answers: finalAnswers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit quiz");
      }

      setResults(data.results);
      setScore(data.score);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewComparison = () => {
    router.push(`/quiz/challenge/${challengeId}/results`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Erreur</h2>
          </div>
          <p className="text-red-800 mb-4">{error || "Challenge non trouvé"}</p>
          <Button onClick={() => router.push("/quiz")} variant="outline">
            Retour aux quiz
          </Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Challenge terminé !
              </h1>
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {score}/{challenge.totalQuestions}
              </div>
              <p className="text-gray-600">
                {Math.round((score / challenge.totalQuestions) * 100)}% de réussite
              </p>
            </div>
          </motion.div>

          {/* Results Details */}
          <div className="space-y-4 mb-6">
            {results.map((result, index) => (
              <motion.div
                key={result.questionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-lg p-6 border-2 ${
                  result.correct ? "border-green-200" : "border-red-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`text-2xl ${
                      result.correct ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {result.correct ? "✓" : "✗"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      Question {index + 1}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      {result.explanation}
                    </p>
                    {result.relatedGlossaryTerms &&
                      result.relatedGlossaryTerms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.relatedGlossaryTerms.map((term) => (
                            <a
                              key={term}
                              href={`/glossaire#${term}`}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              {term.replace(/-/g, " ")}
                            </a>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleViewComparison}
              className="flex-1"
              size="lg"
            >
              Voir la comparaison
            </Button>
            <Button
              onClick={() => router.push("/quiz")}
              variant="outline"
              size="lg"
            >
              Retour aux quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (started) {
    const currentQuestion = challenge.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / challenge.totalQuestions) * 100;

    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Question non trouvée</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestionIndex + 1} / {challenge.totalQuestions}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-6"
            >
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4">
                  {currentQuestion.category}
                </span>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === index
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAnswer === index && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Next Button */}
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null || submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : currentQuestionIndex < challenge.totalQuestions - 1 ? (
              "Question suivante"
            ) : (
              "Terminer le quiz"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Challenge intro screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Défi fiscal !
          </h1>
          <p className="text-gray-600">
            {challenge.creator.name} vous défie sur vos connaissances fiscales
          </p>
        </div>

        {/* Challenge Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Créé par</span>
            </div>
            <span className="text-gray-700">{challenge.creator.name}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Questions</span>
            </div>
            <span className="text-gray-700">{challenge.totalQuestions}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Temps restant</span>
            </div>
            <span className="text-gray-700">{getTimeRemaining()}</span>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">Règles du défi</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Répondez à toutes les questions aussi vite que possible</li>
            <li>• Chaque bonne réponse compte 1 point</li>
            <li>• Vos résultats seront comparés avec le créateur du défi</li>
            <li>• Les explications seront affichées à la fin</li>
          </ul>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleStartChallenge}
          className="w-full"
          size="lg"
        >
          Accepter le défi
        </Button>
      </motion.div>
    </div>
  );
}
