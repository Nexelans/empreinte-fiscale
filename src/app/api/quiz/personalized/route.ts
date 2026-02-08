import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePersonalizedQuiz, getAdaptiveDifficulty } from "@/modules/quiz/personalization";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/quiz/personalized
 * Generate a personalized quiz for the authenticated user
 *
 * Query params:
 * - count?: number (default: 5, max: 20)
 * - difficulty?: "easy" | "medium" | "hard" | "mixed" | "adaptive"
 * - category?: string (optional filter by category)
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

    // Parse parameters
    const countParam = searchParams.get("count");
    const count = countParam ? Math.min(parseInt(countParam), 20) : 5;

    let difficulty = (searchParams.get("difficulty") ||
      "adaptive") as "easy" | "medium" | "hard" | "mixed" | "adaptive";
    const category = searchParams.get("category") || undefined;

    // Validate count
    if (isNaN(count) || count < 1) {
      return NextResponse.json(
        { error: "Invalid count parameter. Must be between 1 and 20." },
        { status: 400 }
      );
    }

    // Task 27.9: Use adaptive difficulty if requested
    if (difficulty === "adaptive") {
      difficulty = await getAdaptiveDifficulty(userId);
      console.log(`[Quiz] Adaptive difficulty for user ${userId}: ${difficulty}`);
    }

    // Validate difficulty
    if (!["easy", "medium", "hard", "mixed"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty parameter. Must be easy, medium, hard, mixed, or adaptive." },
        { status: 400 }
      );
    }

    // Generate personalized quiz
    const questions = await generatePersonalizedQuiz(userId, {
      count,
      difficulty: difficulty as "easy" | "medium" | "hard" | "mixed",
      category,
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Could not generate quiz questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quizType: "PERSONALIZED",
      difficulty,
      count: questions.length,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category,
        relatedGlossaryTerms: q.relatedGlossaryTerms,
      })),
      // Don't send correct answers to client
    });
  } catch (error) {
    console.error("[API] Error generating personalized quiz:", error);

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
 * POST /api/quiz/personalized/submit
 * Submit quiz answers and get results
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
    const { questions, answers } = body;

    if (!questions || !answers || !Array.isArray(questions) || !Array.isArray(answers)) {
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

    // Re-generate the quiz to get correct answers (security: don't trust client)
    const regenerated = await generatePersonalizedQuiz(userId, {
      count: questions.length,
    });

    // Match questions by ID and calculate score
    let correctCount = 0;
    const results = questions.map((questionData: any, index: number) => {
      const userAnswer = answers[index];
      const regeneratedQuestion = regenerated.find((q) => q.id === questionData.id);

      if (!regeneratedQuestion) {
        return {
          questionId: questionData.id,
          correct: false,
          userAnswer,
          correctAnswer: -1,
          explanation: "Question not found",
        };
      }

      const isCorrect = userAnswer === regeneratedQuestion.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: questionData.id,
        correct: isCorrect,
        userAnswer,
        correctAnswer: regeneratedQuestion.correctAnswer,
        explanation: regeneratedQuestion.explanation,
        relatedGlossaryTerms: regeneratedQuestion.relatedGlossaryTerms || [],
      };
    });

    const score = correctCount;
    const percentage = Math.round((score / questions.length) * 100);

    // Save quiz attempt (Task 27.4)
    await prisma.quizAttempt.create({
      data: {
        userId,
        quizType: "PERSONALIZED",
        questions: questions as any,
        answers: answers as any,
        score,
        totalQuestions: questions.length,
      },
    });

    console.log(
      `[Quiz] User ${userId} scored ${score}/${questions.length} (${percentage}%)`
    );

    return NextResponse.json({
      success: true,
      score,
      totalQuestions: questions.length,
      percentage,
      results,
    });
  } catch (error) {
    console.error("[API] Error submitting quiz:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
