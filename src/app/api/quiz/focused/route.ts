import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePersonalizedQuiz } from "@/modules/quiz/personalization";
import { QUIZ_TEMPLATES } from "@/modules/quiz/templates";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/quiz/focused
 * Generate a focused quiz on a specific topic
 *
 * Query params:
 * - topic: string (required) - The category/topic to focus on
 * - count?: number (default: 5, max: 10)
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
    const topic = searchParams.get("topic");
    const countParam = searchParams.get("count");
    const count = countParam ? Math.min(parseInt(countParam), 10) : 5;

    if (!topic) {
      return NextResponse.json(
        { error: "Missing required parameter: topic" },
        { status: 400 }
      );
    }

    // Validate count
    if (isNaN(count) || count < 1) {
      return NextResponse.json(
        { error: "Invalid count parameter. Must be between 1 and 10." },
        { status: 400 }
      );
    }

    console.log(`[Quiz] Generating focused quiz on topic: ${topic}, count: ${count}`);

    // Generate personalized quiz filtered by category
    const questions = await generatePersonalizedQuiz(userId, {
      count,
      difficulty: "mixed",
      category: topic,
    });

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: "No questions available for this topic",
          availableTopics: getAvailableTopics(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quizType: "FOCUSED",
      topic,
      count: questions.length,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category,
        relatedGlossaryTerms: q.relatedGlossaryTerms,
      })),
    });
  } catch (error) {
    console.error("[API] Error generating focused quiz:", error);

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
 * POST /api/quiz/focused/submit
 * Submit focused quiz answers and get results
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
    const { questions, answers, topic } = body;

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

    // Re-generate the quiz to get correct answers
    const regenerated = await generatePersonalizedQuiz(userId, {
      count: questions.length,
      category: topic,
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
          relatedGlossaryTerms: [],
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

    // Save quiz attempt
    await prisma.quizAttempt.create({
      data: {
        userId,
        quizType: "FOCUSED",
        questions: questions as any,
        answers: answers as any,
        score,
        totalQuestions: questions.length,
      },
    });

    // Task 28.3: Collect related terms from wrong answers
    const wrongAnswers = results
      .filter((r) => !r.correct)
      .map((r) => ({
        questionId: r.questionId,
        relatedGlossaryTerms: r.relatedGlossaryTerms,
      }));

    console.log(
      `[Quiz] Focused quiz (${topic}) - User ${userId} scored ${score}/${questions.length} (${percentage}%)`
    );

    return NextResponse.json({
      success: true,
      quizType: "FOCUSED",
      topic,
      score,
      totalQuestions: questions.length,
      percentage,
      results,
      relatedTermsSuggestions: wrongAnswers, // Task 28.3
    });
  } catch (error) {
    console.error("[API] Error submitting focused quiz:", error);

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
 * Get available quiz topics
 */
function getAvailableTopics(): string[] {
  const topics = new Set(QUIZ_TEMPLATES.map((t) => t.category));
  return Array.from(topics);
}
