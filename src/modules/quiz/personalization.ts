import { prisma } from "@/lib/prisma";
import type { QuizQuestion, QuizTemplate } from "./templates";
import { QUIZ_TEMPLATES } from "./templates";
import { calculerScoreFiscal } from "@/modules/score";
import type { ProfilFiscalComplete } from "@/modules/profil/types";

/**
 * Quiz Personalization Module
 * Generates personalized quiz questions using user's real data
 */

interface PersonalizationContext {
  irAnnuel: number;
  irMensuel: number;
  csgAnnuel: number;
  revenuImposable: number;
  tranche: number;
  salaireBrut: number;
  cotisationsPatronales: number;
  tvaQuotidienne: number;
  coutEducation: number;
  nbEnfants: number;
  remboursementsSante: number;
  soldeNet: number;
  ratio: number;
  isContributeur: boolean;
}

/**
 * Task 27.3: Generate personalized quiz
 * Inject user's real data into question templates
 */
export async function generatePersonalizedQuiz(
  userId: string,
  options: {
    count?: number;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
    category?: string;
  } = {}
): Promise<QuizQuestion[]> {
  const { count = 5, difficulty = "mixed", category } = options;

  console.log(`[Quiz] Generating personalized quiz for user ${userId}`);

  // Fetch user profile and calculate context
  const context = await getPersonalizationContext(userId);

  if (!context) {
    console.log("[Quiz] No profile data, using generic questions");
    return getGenericQuestions(count, difficulty);
  }

  // Filter templates based on criteria
  let availableTemplates = QUIZ_TEMPLATES.filter((template) => {
    // Check if we have required data
    const hasRequiredData = template.requiredData.every((key) =>
      context.hasOwnProperty(key)
    );
    if (!hasRequiredData) return false;

    // Filter by category if specified
    if (category && template.category !== category) return false;

    // Filter by difficulty
    if (difficulty !== "mixed" && template.difficulty !== difficulty) return false;

    return true;
  });

  // If not enough personalized templates, add generic ones
  const genericTemplates = QUIZ_TEMPLATES.filter((t) => t.requiredData.length === 0);
  if (availableTemplates.length < count) {
    availableTemplates = [...availableTemplates, ...genericTemplates];
  }

  // Shuffle and take requested count
  const shuffled = shuffleArray(availableTemplates);
  const selectedTemplates = shuffled.slice(0, count);

  // Personalize each template
  const questions = selectedTemplates.map((template) =>
    personalizeTemplate(template, context)
  );

  return questions;
}

/**
 * Get personalization context from user profile and score
 */
async function getPersonalizationContext(
  userId: string
): Promise<PersonalizationContext | null> {
  try {
    // Fetch user with full profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profilFiscal: true,
      },
    });

    if (!user || !user.profilFiscal) {
      return null;
    }

    // Build profil complete from flat fields
    const pf = user.profilFiscal;
    const profil: Partial<ProfilFiscalComplete> = {
      situation: {
        statut: pf.statut as any,
        nombreParts: pf.nombreParts || null,
        commune: pf.commune || null,
        age: pf.age || null,
      },
      revenus: {
        salaireBrut: pf.salaireBrut || null,
        salaireNet: pf.salaireNet || null,
        typeContrat: pf.typeContrat as any,
        revenusFonciers: pf.revenusFonciers || null,
        revenusCapitaux: pf.revenusCapitaux || null,
        autresRevenus: pf.autresRevenus || null,
      },
      patrimoine: {
        proprietaire: pf.proprietaire || null,
        valeurLocative: pf.valeurLocative || null,
        taxeFonciere: pf.taxeFonciere || null,
        vehicules: (pf.vehicules as any) || [],
        patrimoineIFI: pf.patrimoineIFI || null,
      },
      consommation: {
        mode: pf.modeConsommation as any,
        budgetMensuel: (pf.budgetMensuel as any) || undefined,
        detailCategories: (pf.detailCategories as any) || undefined,
        alcoolTabac: (pf.alcoolTabac as any) || undefined,
      },
      familleServices: {
        nombreEnfants: pf.nombreEnfants || 0,
        enfants: (pf.enfantsDetails as any) || [],
        frequenceServices: (pf.frequenceServices as any) || {
          transportsCommun: "jamais",
          hopitalMedecin: "annuelle",
          bibliotheque: "jamais",
          equipementsSportifs: "jamais",
        },
        aides: (pf.aides as any) || {
          caf: false,
          apl: false,
          rsa: false,
          bourses: false,
          chomage: false,
          cmuc: false,
        },
      },
      statusData: (pf.statusData as any) || {},
    };

    // Calculate score
    const score = await calculerScoreFiscal(profil, undefined, { userId });

    // Extract values
    const context: PersonalizationContext = {
      irAnnuel: Math.round(score.detailPaye.impotRevenu),
      irMensuel: Math.round(score.detailPaye.impotRevenu / 12),
      csgAnnuel: Math.round(score.detailPaye.csg_crds),
      revenuImposable: profil.revenus?.salaireNet || 0,
      tranche: determineTranche(profil.revenus?.salaireNet || 0),
      salaireBrut: profil.revenus?.salaireBrut || 0,
      cotisationsPatronales: Math.round(score.detailPaye.cotisationsPatronales),
      tvaQuotidienne: Math.round((score.detailPaye.tva / 365) * 10) / 10,
      coutEducation: Math.round(score.detailRecu.servicesMutualises.education),
      nbEnfants: profil.familleServices?.enfants?.length || 0,
      remboursementsSante: Math.round(
        score.detailRecu.transfertsDirects.remboursementsSante +
          score.detailRecu.servicesMutualises.sante
      ),
      soldeNet: Math.round(score.soldeNet),
      ratio: score.ratio,
      isContributeur: score.soldeNet > 0,
    };

    return context;
  } catch (error) {
    console.error("[Quiz] Error getting personalization context:", error);
    return null;
  }
}

/**
 * Personalize a template with user data
 */
function personalizeTemplate(
  template: QuizTemplate,
  context: PersonalizationContext
): QuizQuestion {
  // Replace placeholders in question
  let question = template.question;
  Object.entries(context).forEach(([key, value]) => {
    question = question.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  });

  // Generate additional computed values for options
  const computed = {
    irMensuelCorrect: Math.round(context.irAnnuel / 12),
    irMensuelFaux1: Math.round(context.irAnnuel / 12) + 50,
    irMensuelFaux2: Math.round(context.irAnnuel / 12) - 30,
    irMensuelFaux3: Math.round(context.irAnnuel / 10),
    ratioCorrect: context.ratio.toFixed(2),
    ratioFaux1: (context.ratio * 0.8).toFixed(2),
    ratioFaux2: (context.ratio * 1.2).toFixed(2),
    ratioFaux3: (context.ratio * 1.5).toFixed(2),
    soldeNetExplication: context.isContributeur
      ? "Vous êtes contributeur net : vous contribuez plus que vous ne recevez."
      : "Vous êtes bénéficiaire net : vous recevez plus que vous ne contribuez.",
    ratioExplication:
      context.ratio > 1
        ? "payez plus que vous ne recevez (contributeur net)"
        : "recevez plus que vous ne payez (bénéficiaire net)",
  };

  // Replace placeholders in options
  const options = template.options.map((option) => {
    let replaced = option;
    Object.entries({ ...context, ...computed }).forEach(([key, value]) => {
      replaced = replaced.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    });
    return replaced;
  });

  // Replace placeholders in explanation
  let explanation = template.explanation;
  Object.entries({ ...context, ...computed }).forEach(([key, value]) => {
    explanation = explanation.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  });

  return {
    id: template.id,
    question,
    options,
    correctAnswer: template.correctAnswer,
    explanation,
    difficulty: template.difficulty,
    category: template.category,
    relatedGlossaryTerms: template.relatedGlossaryTerms,
  };
}

/**
 * Get generic questions when no user data available
 */
function getGenericQuestions(
  count: number,
  difficulty: "easy" | "medium" | "hard" | "mixed"
): QuizQuestion[] {
  const genericTemplates = QUIZ_TEMPLATES.filter((t) => t.requiredData.length === 0);

  let filtered = genericTemplates;
  if (difficulty !== "mixed") {
    filtered = genericTemplates.filter((t) => t.difficulty === difficulty);
  }

  const shuffled = shuffleArray(filtered);
  const selected = shuffled.slice(0, count);

  // Convert templates to questions (no personalization needed)
  return selected.map((template) => ({
    id: template.id,
    question: template.question,
    options: template.options,
    correctAnswer: template.correctAnswer,
    explanation: template.explanation,
    difficulty: template.difficulty,
    category: template.category,
    relatedGlossaryTerms: template.relatedGlossaryTerms,
  }));
}

/**
 * Determine tax bracket from income
 */
function determineTranche(revenuImposable: number): number {
  if (revenuImposable <= 11294) return 0;
  if (revenuImposable <= 28797) return 11;
  if (revenuImposable <= 82341) return 30;
  if (revenuImposable <= 177106) return 41;
  return 45;
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

/**
 * Task 27.9: Adaptive difficulty logic
 * Determine difficulty based on user's quiz history
 */
export async function getAdaptiveDifficulty(
  userId: string
): Promise<"easy" | "medium" | "hard"> {
  try {
    // Get recent quiz attempts (last 5)
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 5,
    });

    if (recentAttempts.length < 5) {
      return "easy"; // Start easy
    }

    // Calculate average score
    const avgScore =
      recentAttempts.reduce((sum, attempt) => {
        const percentage = (attempt.score / attempt.totalQuestions) * 100;
        return sum + percentage;
      }, 0) / recentAttempts.length;

    // Adaptive logic
    if (avgScore >= 80) {
      return "hard"; // User is doing well, increase difficulty
    } else if (avgScore >= 60) {
      return "medium"; // User is average, keep medium
    } else {
      return "easy"; // User is struggling, keep easy
    }
  } catch (error) {
    console.error("[Quiz] Error determining adaptive difficulty:", error);
    return "easy";
  }
}
