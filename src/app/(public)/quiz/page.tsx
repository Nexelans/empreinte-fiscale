"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QUESTIONS_QUIZ, QuestionQuiz, getRandomQuestions } from "@/modules/quiz/questions";

type QuizMode = "selection" | "quiz" | "resultats";

export default function QuizPage() {
  const [mode, setMode] = useState<QuizMode>("selection");
  const [questions, setQuestions] = useState<QuestionQuiz[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);

  const startQuiz = (type: "rapide" | "complet") => {
    const questionsSelectionnees =
      type === "rapide" ? getRandomQuestions(5) : QUESTIONS_QUIZ;
    setQuestions(questionsSelectionnees);
    setCurrentQuestion(0);
    setReponses({});
    setScore(0);
    setMode("quiz");
  };

  const handleReponse = (questionId: string, reponseId: string) => {
    const question = questions[currentQuestion];
    const nouvellescoreponses = { ...reponses, [questionId]: reponseId };
    setReponses(nouvellescoreponses);

    // Si bonne réponse, incrémenter le score
    if (reponseId === question.reponseCorrecte) {
      setScore(score + 1);
    }

    // Attendre un peu avant de passer à la question suivante
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setMode("resultats");
      }
    }, 1500);
  };

  const recommencer = () => {
    setMode("selection");
    setQuestions([]);
    setCurrentQuestion(0);
    setReponses({});
    setScore(0);
  };

  const pourcentage = Math.round((score / questions.length) * 100);

  // Écran de sélection
  if (mode === "selection") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎯 Quiz Fiscal
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Testez vos connaissances sur les impôts, les taxes et les services
              publics. Découvrez combien vous savez vraiment sur votre relation
              financière avec l'État !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Quiz rapide */}
            <button
              onClick={() => startQuiz("rapide")}
              className="bg-white border-2 border-purple-300 rounded-lg p-8 hover:shadow-lg hover:border-purple-500 transition-all group"
            >
              <div className="text-5xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Quiz rapide
              </h2>
              <p className="text-gray-600 mb-4">
                5 questions aléatoires pour découvrir rapidement des faits
                surprenants
              </p>
              <div className="inline-flex items-center gap-2 text-purple-600 font-medium">
                Commencer
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>

            {/* Quiz complet */}
            <button
              onClick={() => startQuiz("complet")}
              className="bg-white border-2 border-blue-300 rounded-lg p-8 hover:shadow-lg hover:border-blue-500 transition-all group"
            >
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Quiz complet
              </h2>
              <p className="text-gray-600 mb-4">
                {QUESTIONS_QUIZ.length} questions pour devenir un expert de la
                fiscalité française
              </p>
              <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
                Commencer
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Envie de calculer votre propre score fiscal ?
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/decouverte">
                <Button variant="outline" size="lg">
                  🔍 Mode découverte
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg">✨ Créer mon compte</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Écran de quiz
  if (mode === "quiz") {
    const question = questions[currentQuestion];
    const aRepondu = reponses[question.id] !== undefined;
    const reponseSelectionnee = reponses[question.id];
    const estCorrecte = reponseSelectionnee === question.reponseCorrecte;

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Progression */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestion + 1} / {questions.length}
              </span>
              <span className="text-sm font-medium text-purple-600">
                Score: {score} / {currentQuestion + (aRepondu ? 1 : 0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <span className="text-2xl">{question.categorie === "impots_directs" && "📊"}{question.categorie === "impots_indirects" && "🛒"}{question.categorie === "cotisations" && "💼"}{question.categorie === "services_publics" && "🏛️"}{question.categorie === "culture_generale" && "📚"}</span>
              <div>
                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 mb-2">
                  {question.difficulte === "facile" && "Facile"}
                  {question.difficulte === "moyen" && "Moyen"}
                  {question.difficulte === "difficile" && "Difficile"}
                </span>
                <h2 className="text-2xl font-bold text-gray-900">
                  {question.question}
                </h2>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = reponseSelectionnee === option.id;
                const isCorrect = option.id === question.reponseCorrecte;
                const showResult = aRepondu;

                let className =
                  "w-full p-4 rounded-lg border-2 text-left font-medium transition-all ";
                if (!showResult) {
                  className +=
                    "border-gray-200 hover:border-purple-500 hover:bg-purple-50";
                } else {
                  if (isCorrect) {
                    className += "border-green-500 bg-green-50 text-green-900";
                  } else if (isSelected && !isCorrect) {
                    className += "border-red-500 bg-red-50 text-red-900";
                  } else {
                    className += "border-gray-200 bg-gray-50";
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() =>
                      !aRepondu && handleReponse(question.id, option.id)
                    }
                    disabled={aRepondu}
                    className={className}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.texte}</span>
                      {showResult && isCorrect && (
                        <span className="text-green-600 text-xl">✓</span>
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <span className="text-red-600 text-xl">✗</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explication */}
            {aRepondu && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  estCorrecte ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`font-semibold mb-2 ${
                    estCorrecte ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {estCorrecte ? "✓ Bonne réponse !" : "✗ Mauvaise réponse"}
                </p>
                <p className="text-gray-700">{question.explication}</p>
                {question.source && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Source :</strong> {question.source}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Écran de résultats
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {pourcentage >= 80 && "🏆"}
            {pourcentage >= 60 && pourcentage < 80 && "🎯"}
            {pourcentage >= 40 && pourcentage < 60 && "📚"}
            {pourcentage < 40 && "💪"}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quiz terminé !
          </h1>
          <p className="text-xl text-gray-600">
            Vous avez obtenu{" "}
            <span className="font-bold text-purple-600">
              {score} / {questions.length}
            </span>{" "}
            ({pourcentage}%)
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div
              className="mx-auto w-48 h-48 rounded-full flex items-center justify-center text-6xl font-bold"
              style={{
                background: `conic-gradient(#9333ea ${pourcentage}%, #e5e7eb ${pourcentage}%)`,
              }}
            >
              <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center">
                <span className="text-purple-600">{pourcentage}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold text-gray-900 text-center">
              Votre niveau
            </h2>
            <p className="text-gray-700 text-center">
              {pourcentage >= 80 &&
                "🏆 Expert fiscal ! Vous maîtrisez parfaitement le système fiscal français."}
              {pourcentage >= 60 &&
                pourcentage < 80 &&
                "🎯 Très bon niveau ! Vous avez une solide compréhension de la fiscalité."}
              {pourcentage >= 40 &&
                pourcentage < 60 &&
                "📚 Bon début ! Il vous reste encore quelques notions à découvrir."}
              {pourcentage < 40 &&
                "💪 À améliorer ! Ne vous découragez pas, la fiscalité est complexe pour tout le monde."}
            </p>
          </div>

          {/* Détail des réponses */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">
              Détail de vos réponses
            </h3>
            {questions.map((q, index) => {
              const reponseUser = reponses[q.id];
              const estCorrecte = reponseUser === q.reponseCorrecte;

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-lg border ${
                    estCorrecte
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={estCorrecte ? "text-green-600" : "text-red-600"}>
                      {estCorrecte ? "✓" : "✗"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Question {index + 1} : {q.question}
                      </p>
                      {!estCorrecte && (
                        <p className="text-xs text-gray-600 mt-1">
                          Bonne réponse :{" "}
                          {
                            q.options.find((o) => o.id === q.reponseCorrecte)
                              ?.texte
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button onClick={recommencer} size="lg" className="w-full">
            🔄 Refaire un quiz
          </Button>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-center text-white">
            <h3 className="text-xl font-bold mb-2">
              Envie de connaître VOTRE score fiscal ?
            </h3>
            <p className="mb-4 opacity-90">
              Créez votre compte pour calculer votre véritable empreinte fiscale
              avec vos données personnelles.
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full">
                ✨ Créer mon compte gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
