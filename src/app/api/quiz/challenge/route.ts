import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePersonalizedQuiz } from "@/modules/quiz/personalization";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

/**
 * POST /api/quiz/challenge
 * Generate a shareable quiz challenge for friends
 *
 * Body:
 * - friendId?: string (optional - if specified, challenge is sent to specific friend)
 * - count?: number (default: 5, max: 10)
 * - difficulty?: "easy" | "medium" | "hard" | "mixed"
 * - category?: string (optional - focus on specific topic)
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
    const { friendId, count = 5, difficulty = "mixed", category } = body;

    // Validate count
    const questionCount = Math.min(Math.max(count, 1), 10);

    // Verify friend relationship if friendId is provided
    if (friendId) {
      const friendLink = await prisma.friendLink.findFirst({
        where: {
          OR: [
            { userId, friendId, status: "ACCEPTED" },
            { userId: friendId, friendId: userId, status: "ACCEPTED" },
          ],
        },
      });

      if (!friendLink) {
        return NextResponse.json(
          { error: "Friend relationship not found or not accepted" },
          { status: 403 }
        );
      }
    }

    console.log(
      `[Quiz Challenge] User ${userId} creating challenge (count: ${questionCount}, difficulty: ${difficulty}, category: ${category || "all"})`
    );

    // Generate quiz questions from challenger's perspective
    const questions = await generatePersonalizedQuiz(userId, {
      count: questionCount,
      difficulty,
      category,
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate quiz questions" },
        { status: 500 }
      );
    }

    // Create shareable challenge ID
    const challengeId = nanoid(12);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Store challenge in database (using QuizAttempt model with special type)
    await (prisma.quizAttempt.create as any)({
      data: {
        userId,
        quizType: "CHALLENGE",
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          difficulty: q.difficulty,
          category: q.category,
          relatedGlossaryTerms: q.relatedGlossaryTerms,
        })),
        answers: [], // Empty - will be filled when accepted
        score: 0,
        totalQuestions: questions.length,
        metadata: {
          challengeId,
          targetFriendId: friendId || null,
          expiresAt: expiresAt.toISOString(),
          status: "PENDING",
        },
      },
    });

    const shareUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/quiz/challenge/${challengeId}`;

    console.log(
      `[Quiz Challenge] Challenge created with ID: ${challengeId}, expires: ${expiresAt.toISOString()}`
    );

    return NextResponse.json({
      success: true,
      challengeId,
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      questionCount: questions.length,
      difficulty,
      category: category || "all",
    });
  } catch (error) {
    console.error("[API] Error creating quiz challenge:", error);

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
 * GET /api/quiz/challenge?challengeId=xxx
 * Retrieve challenge details (anonymized for non-owner)
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

    // Find the challenge
    const challenge = await (prisma.quizAttempt.findFirst as any)({
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
            image: true,
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    const metadata = challenge.metadata as any;

    // Check if challenge is expired
    const expiresAt = new Date(metadata.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Challenge has expired" },
        { status: 410 }
      );
    }

    // Check if user is the creator or the target friend
    const isCreator = challenge.userId === userId;
    const isTargetFriend = metadata.targetFriendId === userId;
    const isPublic = !metadata.targetFriendId;

    if (!isCreator && !isTargetFriend && !isPublic) {
      return NextResponse.json(
        { error: "You are not authorized to access this challenge" },
        { status: 403 }
      );
    }

    // Anonymize questions if not the creator (Task 29.2)
    const questions = (challenge.questions as any[]).map((q) => ({
      id: q.id,
      question: anonymizeQuestion(q.question, isCreator),
      options: q.options,
      difficulty: q.difficulty,
      category: q.category,
      relatedGlossaryTerms: q.relatedGlossaryTerms,
    }));

    return NextResponse.json({
      success: true,
      challengeId,
      creator: {
        id: isCreator ? challenge.user.id : "anonymous",
        name: isCreator ? challenge.user.name : anonymizeName(challenge.user.name || "Utilisateur"),
        image: isCreator ? challenge.user.image : null,
      },
      questions,
      totalQuestions: challenge.totalQuestions,
      expiresAt: metadata.expiresAt,
      status: metadata.status,
      isCreator,
    });
  } catch (error) {
    console.error("[API] Error retrieving quiz challenge:", error);

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
 * Anonymize question text by removing personal details (Task 29.2)
 */
function anonymizeQuestion(question: string, isCreator: boolean): string {
  if (isCreator) return question;

  // Replace specific amounts with rounded values
  const amountPattern = /(\d{1,3}(?:[,\s]\d{3})*(?:[.,]\d{2})?)\s*€/g;
  question = question.replace(amountPattern, (match, amount) => {
    const numericValue = parseFloat(amount.replace(/[,\s]/g, "").replace(",", "."));
    const rounded = Math.round(numericValue / 100) * 100;
    return `${rounded.toLocaleString("fr-FR")} €`;
  });

  // Replace "vous" with "un utilisateur"
  question = question.replace(/\bVous\b/g, "Un utilisateur");
  question = question.replace(/\bvous\b/g, "un utilisateur");
  question = question.replace(/\bvotre\b/g, "son");
  question = question.replace(/\bVotre\b/g, "Son");

  return question;
}

/**
 * Anonymize user name
 */
function anonymizeName(name: string): string {
  const parts = name.split(" ");
  if (parts.length === 0 || !parts[0]) return "Utilisateur";
  if (parts.length === 1) return parts[0].charAt(0) + ".";
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  if (!firstName || !lastName) return "Utilisateur";
  return `${firstName.charAt(0)}. ${lastName.charAt(0)}.`;
}
