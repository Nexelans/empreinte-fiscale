import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitGameEvent } from "@/modules/gamification/events";

/**
 * POST /api/quiz/challenge/submit
 * Submit answers for a quiz challenge
 *
 * Body:
 * - challengeId: string
 * - questions: QuizQuestion[]
 * - answers: number[]
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { challengeId, questions, answers } = body;

    if (!challengeId || !questions || !answers) {
      return NextResponse.json(
        { error: "Missing required fields: challengeId, questions, answers" },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected questions and answers arrays." },
        { status: 400 }
      );
    }

    if (questions.length !== answers.length) {
      return NextResponse.json(
        { error: "Questions and answers arrays must have the same length." },
        { status: 400 }
      );
    }

    // Find the original challenge
    const originalChallenge = await (prisma.quizAttempt.findFirst as any)({
      where: {
        quizType: "CHALLENGE",
        metadata: {
          path: ["challengeId"],
          equals: challengeId,
        },
      },
    });

    if (!originalChallenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    const metadata = originalChallenge.metadata as any;

    // Check if challenge is expired
    const expiresAt = new Date(metadata.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Challenge has expired" },
        { status: 410 }
      );
    }

    // Get the original questions with correct answers
    const originalQuestions = originalChallenge.questions as any[];

    // Calculate score and results
    let correctCount = 0;
    const results = questions.map((questionData: any, index: number) => {
      const userAnswer = answers[index];
      const originalQuestion = originalQuestions.find((q) => q.id === questionData.id);

      if (!originalQuestion) {
        return {
          questionId: questionData.id,
          correct: false,
          userAnswer,
          correctAnswer: -1,
          explanation: "Question not found",
          relatedGlossaryTerms: [],
        };
      }

      const isCorrect = userAnswer === originalQuestion.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: questionData.id,
        correct: isCorrect,
        userAnswer,
        correctAnswer: originalQuestion.correctAnswer,
        explanation: originalQuestion.explanation || "Pas d'explication disponible",
        relatedGlossaryTerms: originalQuestion.relatedGlossaryTerms || [],
      };
    });

    const score = correctCount;
    const percentage = Math.round((score / questions.length) * 100);

    // Save the participant's attempt
    await (prisma.quizAttempt.create as any)({
      data: {
        userId,
        quizType: "CHALLENGE_RESPONSE",
        questions: questions,
        answers: answers,
        score,
        totalQuestions: questions.length,
        metadata: {
          challengeId,
          originalChallengeId: originalChallenge.id,
          creatorId: originalChallenge.userId,
        },
      },
    });

    // Emit quiz completed event for gamification
    await emitGameEvent("QUIZ_COMPLETED", userId, {
      quizType: "CHALLENGE_RESPONSE",
      score,
      totalQuestions: questions.length,
      percentage,
    });

    console.log(
      `[Quiz Challenge] User ${userId} completed challenge ${challengeId} with score ${score}/${questions.length} (${percentage}%)`
    );

    return NextResponse.json({
      success: true,
      challengeId,
      score,
      totalQuestions: questions.length,
      percentage,
      results,
    });
  } catch (error) {
    console.error("[API] Error submitting quiz challenge:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
