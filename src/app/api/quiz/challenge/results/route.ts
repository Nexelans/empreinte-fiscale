import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/quiz/challenge/results?challengeId=xxx
 * Get side-by-side comparison results for a quiz challenge
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get("challengeId");

    if (!challengeId) {
      return NextResponse.json(
        { error: "Missing required parameter: challengeId" },
        { status: 400 }
      );
    }

    // Find the original challenge
    // Note: Using any to bypass TypeScript check for JSON path query
    const originalChallenge = await (prisma.quizAttempt.findFirst as any)({
      where: {
        quizType: "CHALLENGE",
        metadata: {
          path: ["challengeId"],
          equals: challengeId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!originalChallenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Find the participant's response
    const participantResponse = await (prisma.quizAttempt.findFirst as any)({
      where: {
        userId,
        quizType: "CHALLENGE_RESPONSE",
        metadata: {
          path: ["challengeId"],
          equals: challengeId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!participantResponse) {
      return NextResponse.json(
        { error: "You haven't completed this challenge yet" },
        { status: 404 }
      );
    }

    // Calculate comparison data
    const originalQuestions = originalChallenge.questions as any[];
    const participantAnswers = participantResponse.answers as number[];

    // Question-by-question breakdown
    const questionBreakdown = originalQuestions.map((q, index) => {
      const creatorCorrect = true; // Creator has access to correct answers
      const participantAnswer = participantAnswers[index];
      const participantCorrect = participantAnswer === q.correctAnswer;

      return {
        questionId: q.id,
        question: q.question,
        category: q.category,
        creatorCorrect,
        participantCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "Pas d'explication disponible",
        relatedGlossaryTerms: q.relatedGlossaryTerms || [],
      };
    });

    // Analyze performance by category
    const categoryPerformance = new Map<
      string,
      { correct: number; total: number }
    >();

    questionBreakdown.forEach((q) => {
      const current = categoryPerformance.get(q.category) || {
        correct: 0,
        total: 0,
      };
      current.total++;
      if (q.participantCorrect) current.correct++;
      categoryPerformance.set(q.category, current);
    });

    // Identify strong and weak topics
    const strongTopics: string[] = [];
    const weakTopics: string[] = [];

    categoryPerformance.forEach((perf, category) => {
      const percentage = (perf.correct / perf.total) * 100;
      if (percentage >= 75) {
        strongTopics.push(category);
      } else if (percentage < 50) {
        weakTopics.push(category);
      }
    });

    // Common mistakes (both got wrong)
    const commonMistakes = questionBreakdown
      .filter((q) => !q.creatorCorrect && !q.participantCorrect)
      .map((q) => ({
        questionId: q.questionId,
        question: q.question,
        explanation: q.explanation,
      }));

    // Educational summary (Task 29.5)
    const educationalSummary = generateEducationalSummary(
      originalChallenge.score,
      participantResponse.score,
      originalChallenge.totalQuestions,
      strongTopics,
      weakTopics,
      commonMistakes.length
    );

    return NextResponse.json({
      challengeId,
      creator: {
        id: originalChallenge.user.id,
        name: originalChallenge.user.name || "Anonyme",
        score: originalChallenge.score,
        percentage: Math.round(
          (originalChallenge.score / originalChallenge.totalQuestions) * 100
        ),
        completedAt: originalChallenge.completedAt?.toISOString() || new Date().toISOString(),
      },
      participant: {
        id: participantResponse.user.id,
        name: participantResponse.user.name || "Anonyme",
        score: participantResponse.score,
        percentage: Math.round(
          (participantResponse.score / participantResponse.totalQuestions) * 100
        ),
        completedAt: participantResponse.completedAt?.toISOString() || new Date().toISOString(),
      },
      totalQuestions: originalChallenge.totalQuestions,
      questionBreakdown,
      commonMistakes,
      strongTopics,
      weakTopics,
      educationalSummary,
    });
  } catch (error) {
    console.error("[API] Error retrieving quiz challenge results:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Generate educational summary based on performance (Task 29.5)
 */
function generateEducationalSummary(
  creatorScore: number,
  participantScore: number,
  totalQuestions: number,
  strongTopics: string[],
  weakTopics: string[],
  commonMistakesCount: number
): string {
  const creatorPercentage = Math.round((creatorScore / totalQuestions) * 100);
  const participantPercentage = Math.round((participantScore / totalQuestions) * 100);

  let summary = "";

  // Overall performance
  if (participantScore > creatorScore) {
    summary += `Excellent travail ! Vous avez surpassé le créateur du défi avec ${participantPercentage}% contre ${creatorPercentage}%. `;
  } else if (participantScore === creatorScore) {
    summary += `Match parfaitement équilibré ! Vous avez obtenu le même score que le créateur (${participantPercentage}%). `;
  } else {
    summary += `Bon effort ! Vous avez obtenu ${participantPercentage}%, tandis que le créateur a atteint ${creatorPercentage}%. `;
  }

  // Strong topics
  if (strongTopics.length > 0) {
    summary += `Vous maîtrisez particulièrement bien ${strongTopics.length === 1 ? "le sujet" : "les sujets"} : ${strongTopics.join(", ")}. `;
  }

  // Weak topics
  if (weakTopics.length > 0) {
    summary += `Pour progresser, concentrez-vous sur ${weakTopics.length === 1 ? "le sujet" : "les sujets"} : ${weakTopics.join(", ")}. `;
  }

  // Common mistakes
  if (commonMistakesCount > 0) {
    summary += `Vous et le créateur avez tous les deux eu des difficultés sur ${commonMistakesCount} question${commonMistakesCount > 1 ? "s" : ""}, ce qui montre que ${commonMistakesCount > 1 ? "ces concepts sont" : "ce concept est"} complexe${commonMistakesCount > 1 ? "s" : ""} pour beaucoup. `;
  }

  // Encouragement
  if (participantPercentage < 60) {
    summary += "Continuez à vous entraîner avec des quiz ciblés sur vos points faibles pour améliorer votre score !";
  } else if (participantPercentage < 80) {
    summary += "Vous êtes sur la bonne voie ! Quelques révisions ciblées et vous atteindrez l'excellence.";
  } else {
    summary += "Votre maîtrise du sujet est impressionnante ! Vous pourriez même créer vos propres défis.";
  }

  return summary;
}
