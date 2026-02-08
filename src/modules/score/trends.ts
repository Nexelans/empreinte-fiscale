import type { ScoreHistoryEntry } from "./history";
import type { ScoreFiscal } from "./types";

/**
 * Trend Analysis Module
 * Analyzes patterns in score history to detect trends, volatility, and milestones
 */

export type TrendDirection = "increasing" | "decreasing" | "stable" | "volatile";

export type TrendPattern =
  | "increasing_contributor"
  | "decreasing_contributor"
  | "high_volatility"
  | "stable";

export interface TrendAnalysis {
  direction: TrendDirection;
  patterns: TrendPattern[];
  insights: TrendInsight[];
  volatilityScore: number; // 0-100, higher = more volatile
  averageMonthlyChange: number;
  lastMonthChange: number;
  confidenceTrend: {
    direction: "improving" | "declining" | "stable";
    currentValue: number;
    changeFromStart: number;
  };
}

export interface TrendInsight {
  type:
    | "increasing_contributor"
    | "decreasing_contributor"
    | "high_volatility"
    | "milestone_reached"
    | "confidence_improved"
    | "confidence_declined";
  severity: "info" | "warning" | "success";
  title: string;
  description: string;
  since?: string; // YYYY-MM for date reference
  value?: number;
}

export interface Milestone {
  id: string;
  date: string; // YYYY-MM
  type: "status_change" | "confidence_threshold" | "large_change";
  title: string;
  description: string;
  previousValue?: number;
  newValue: number;
}

/**
 * Main trend analysis function
 * Analyzes score history to detect patterns and generate insights
 */
export function analyzeTrend(history: ScoreHistoryEntry[]): TrendAnalysis {
  if (history.length === 0) {
    return {
      direction: "stable",
      patterns: ["stable"],
      insights: [],
      volatilityScore: 0,
      averageMonthlyChange: 0,
      lastMonthChange: 0,
      confidenceTrend: {
        direction: "stable",
        currentValue: 0,
        changeFromStart: 0,
      },
    };
  }

  // Sort by date (oldest first)
  const sorted = [...history].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const patterns: TrendPattern[] = [];
  const insights: TrendInsight[] = [];

  // Calculate month-over-month changes
  const changes = calculateMonthlyChanges(sorted);

  // Detect increasing contributor pattern
  const increasingResult = detectIncreasingContributor(sorted, changes);
  if (increasingResult.detected) {
    patterns.push("increasing_contributor");
    insights.push(...increasingResult.insights);
  }

  // Detect decreasing contributor pattern
  const decreasingResult = detectDecreasingContributor(sorted, changes);
  if (decreasingResult.detected) {
    patterns.push("decreasing_contributor");
    insights.push(...decreasingResult.insights);
  }

  // Detect volatility
  const volatilityResult = detectVolatility(changes);
  if (volatilityResult.detected) {
    patterns.push("high_volatility");
    insights.push(...volatilityResult.insights);
  }

  // Detect milestones
  const milestoneInsights = detectMilestone(sorted);
  insights.push(...milestoneInsights);

  // If no specific pattern detected, mark as stable
  if (patterns.length === 0) {
    patterns.push("stable");
  }

  // Determine overall direction
  const direction = determineDirection(changes, patterns);

  // Calculate statistics
  const averageMonthlyChange =
    changes.length > 0
      ? changes.reduce((sum, c) => sum + c.soldeNetChange, 0) / changes.length
      : 0;

  const lastMonthChange =
    changes.length > 0 ? changes[changes.length - 1]!.soldeNetChange : 0;

  // Analyze confidence trend
  const confidenceTrend = analyzeConfidenceTrend(sorted);

  return {
    direction,
    patterns,
    insights,
    volatilityScore: volatilityResult.volatilityScore,
    averageMonthlyChange: Math.round(averageMonthlyChange),
    lastMonthChange: Math.round(lastMonthChange),
    confidenceTrend,
  };
}

/**
 * Calculate month-over-month changes
 */
function calculateMonthlyChanges(
  history: ScoreHistoryEntry[]
): Array<{
  month: string;
  soldeNetChange: number;
  totalPayeChange: number;
  totalRecuChange: number;
  confidenceChange: number;
}> {
  const changes = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i]!;
    const previous = history[i - 1]!

    changes.push({
      month: `${current.year}-${String(current.month).padStart(2, "0")}`,
      soldeNetChange:
        current.scoreFiscalData.soldeNet - previous.scoreFiscalData.soldeNet,
      totalPayeChange:
        current.scoreFiscalData.totalPaye - previous.scoreFiscalData.totalPaye,
      totalRecuChange:
        current.scoreFiscalData.totalRecu - previous.scoreFiscalData.totalRecu,
      confidenceChange: current.confidenceScore - previous.confidenceScore,
    });
  }

  return changes;
}

/**
 * Detect increasing contributor pattern (3+ consecutive months of soldeNet increase)
 */
export function detectIncreasingContributor(
  history: ScoreHistoryEntry[],
  changes: ReturnType<typeof calculateMonthlyChanges>
): {
  detected: boolean;
  insights: TrendInsight[];
  consecutiveMonths?: number;
} {
  if (changes.length < 3) {
    return { detected: false, insights: [] };
  }

  let consecutiveIncreases = 0;
  let maxConsecutive = 0;
  let startMonth = "";

  for (let i = 0; i < changes.length; i++) {
    if (changes[i]!.soldeNetChange > 0) {
      consecutiveIncreases++;
      if (consecutiveIncreases === 1) {
        startMonth = changes[i]!.month;
      }
      maxConsecutive = Math.max(maxConsecutive, consecutiveIncreases);
    } else {
      consecutiveIncreases = 0;
    }
  }

  if (maxConsecutive >= 3) {
    const insights: TrendInsight[] = [
      {
        type: "increasing_contributor",
        severity: "warning",
        title: "Contributeur croissant",
        description: `Votre solde net (ce que vous payez - ce que vous recevez) augmente depuis ${maxConsecutive} mois consécutifs. Vous contribuez de plus en plus au budget de l'État.`,
        since: startMonth,
        value: maxConsecutive,
      },
    ];

    return {
      detected: true,
      insights,
      consecutiveMonths: maxConsecutive,
    };
  }

  return { detected: false, insights: [] };
}

/**
 * Detect decreasing contributor pattern (3+ consecutive months of soldeNet decrease)
 */
export function detectDecreasingContributor(
  history: ScoreHistoryEntry[],
  changes: ReturnType<typeof calculateMonthlyChanges>
): {
  detected: boolean;
  insights: TrendInsight[];
  consecutiveMonths?: number;
} {
  if (changes.length < 3) {
    return { detected: false, insights: [] };
  }

  let consecutiveDecreases = 0;
  let maxConsecutive = 0;
  let startMonth = "";

  for (let i = 0; i < changes.length; i++) {
    if (changes[i]!.soldeNetChange < 0) {
      consecutiveDecreases++;
      if (consecutiveDecreases === 1) {
        startMonth = changes[i]!.month;
      }
      maxConsecutive = Math.max(maxConsecutive, consecutiveDecreases);
    } else {
      consecutiveDecreases = 0;
    }
  }

  if (maxConsecutive >= 3) {
    const insights: TrendInsight[] = [
      {
        type: "decreasing_contributor",
        severity: "success",
        title: "Contribution en baisse",
        description: `Votre solde net diminue depuis ${maxConsecutive} mois consécutifs. Vous recevez proportionnellement plus de l'État ou payez moins d'impôts.`,
        since: startMonth,
        value: maxConsecutive,
      },
    ];

    return {
      detected: true,
      insights,
      consecutiveMonths: maxConsecutive,
    };
  }

  return { detected: false, insights: [] };
}

/**
 * Detect volatility (>20% month-over-month variation)
 */
export function detectVolatility(
  changes: ReturnType<typeof calculateMonthlyChanges>
): {
  detected: boolean;
  insights: TrendInsight[];
  volatilityScore: number;
} {
  if (changes.length === 0) {
    return { detected: false, insights: [], volatilityScore: 0 };
  }

  const VOLATILITY_THRESHOLD = 0.2; // 20%

  // Calculate coefficient of variation (std dev / mean)
  const soldeNetChanges = changes.map((c) => Math.abs(c.soldeNetChange));
  const mean =
    soldeNetChanges.reduce((sum, val) => sum + val, 0) / soldeNetChanges.length;
  const variance =
    soldeNetChanges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    soldeNetChanges.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

  // Volatility score: 0-100
  const volatilityScore = Math.min(100, Math.round(coefficientOfVariation * 100));

  // Count number of large variations (>20%)
  let largeVariations = 0;
  const variationMonths: string[] = [];

  for (const change of changes) {
    const percentChange = Math.abs(change.soldeNetChange) / 100; // Simplified percentage
    if (percentChange > VOLATILITY_THRESHOLD) {
      largeVariations++;
      variationMonths.push(change.month);
    }
  }

  const detected = largeVariations >= 2 || coefficientOfVariation > VOLATILITY_THRESHOLD;

  const insights: TrendInsight[] = [];

  if (detected) {
    insights.push({
      type: "high_volatility",
      severity: "warning",
      title: "Forte volatilité détectée",
      description: `Votre situation fiscale varie beaucoup d'un mois à l'autre (${largeVariations} variations importantes). Cela peut indiquer des revenus irréguliers ou des changements fréquents de situation.`,
      value: volatilityScore,
    });
  }

  return {
    detected,
    insights,
    volatilityScore,
  };
}

/**
 * Detect milestones (status change, confidence threshold crossed)
 */
export function detectMilestone(
  history: ScoreHistoryEntry[]
): TrendInsight[] {
  if (history.length < 2) {
    return [];
  }

  const insights: TrendInsight[] = [];

  // Check confidence improvements
  const firstConfidence = history[0]!.confidenceScore;
  const lastConfidence = history[history.length - 1]!.confidenceScore;
  const confidenceChange = lastConfidence - firstConfidence;

  if (confidenceChange >= 20) {
    insights.push({
      type: "confidence_improved",
      severity: "success",
      title: "Score de confiance en hausse",
      description: `Votre score de confiance a augmenté de ${Math.round(confidenceChange)} points depuis le début. Vous avez ajouté plus de données vérifiées à votre profil.`,
      value: Math.round(confidenceChange),
    });
  } else if (confidenceChange <= -10) {
    insights.push({
      type: "confidence_declined",
      severity: "info",
      title: "Score de confiance en baisse",
      description: `Votre score de confiance a diminué de ${Math.abs(Math.round(confidenceChange))} points. Vérifiez que vos données sont à jour.`,
      value: Math.abs(Math.round(confidenceChange)),
    });
  }

  // Check for status changes (contributor to recipient or vice versa)
  for (let i = 1; i < history.length; i++) {
    const current = history[i]!;
    const previous = history[i - 1]!

    const wasContributor = previous.scoreFiscalData.soldeNet > 0;
    const isContributor = current.scoreFiscalData.soldeNet > 0;

    if (wasContributor !== isContributor) {
      const month = `${current.year}-${String(current.month).padStart(2, "0")}`;
      insights.push({
        type: "milestone_reached",
        severity: "info",
        title: isContributor
          ? "Passage en contributeur net"
          : "Passage en bénéficiaire net",
        description: isContributor
          ? `En ${month}, vous êtes devenu contributeur net (vous payez plus que vous ne recevez).`
          : `En ${month}, vous êtes devenu bénéficiaire net (vous recevez plus que vous ne payez).`,
        since: month,
        value: current.scoreFiscalData.soldeNet,
      });
    }
  }

  // Check for large single-month changes
  for (let i = 1; i < history.length; i++) {
    const current = history[i]!;
    const previous = history[i - 1]!

    const change = Math.abs(
      current.scoreFiscalData.soldeNet - previous.scoreFiscalData.soldeNet
    );

    // Large change threshold: 5000€
    if (change > 5000) {
      const month = `${current.year}-${String(current.month).padStart(2, "0")}`;
      insights.push({
        type: "milestone_reached",
        severity: "warning",
        title: "Changement important détecté",
        description: `En ${month}, votre solde net a varié de ${Math.round(change)}€. Cela peut indiquer un changement majeur de situation (nouveau travail, mariage, naissance, etc.).`,
        since: month,
        value: Math.round(change),
      });
    }
  }

  return insights;
}

/**
 * Determine overall trend direction
 */
function determineDirection(
  changes: ReturnType<typeof calculateMonthlyChanges>,
  patterns: TrendPattern[]
): TrendDirection {
  if (patterns.includes("high_volatility")) {
    return "volatile";
  }

  if (patterns.includes("increasing_contributor")) {
    return "increasing";
  }

  if (patterns.includes("decreasing_contributor")) {
    return "decreasing";
  }

  // Look at overall trend in last few months
  if (changes.length >= 3) {
    const recentChanges = changes.slice(-3);
    const avgRecent =
      recentChanges.reduce((sum, c) => sum + c.soldeNetChange, 0) /
      recentChanges.length;

    if (avgRecent > 500) return "increasing";
    if (avgRecent < -500) return "decreasing";
  }

  return "stable";
}

/**
 * Analyze confidence trend
 */
function analyzeConfidenceTrend(history: ScoreHistoryEntry[]): {
  direction: "improving" | "declining" | "stable";
  currentValue: number;
  changeFromStart: number;
} {
  if (history.length === 0) {
    return {
      direction: "stable",
      currentValue: 0,
      changeFromStart: 0,
    };
  }

  const first = history[0]!;
  const last = history[history.length - 1]!;

  const change = last.confidenceScore - first.confidenceScore;
  const currentValue = last.confidenceScore;

  let direction: "improving" | "declining" | "stable" = "stable";
  if (change > 5) direction = "improving";
  else if (change < -5) direction = "declining";

  return {
    direction,
    currentValue: Math.round(currentValue),
    changeFromStart: Math.round(change),
  };
}

/**
 * Get milestones from history
 */
export function getMilestones(history: ScoreHistoryEntry[]): Milestone[] {
  const milestones: Milestone[] = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i]!;
    const previous = history[i - 1]!

    const month = `${current.year}-${String(current.month).padStart(2, "0")}`;

    // Status change
    const wasContributor = previous.scoreFiscalData.soldeNet > 0;
    const isContributor = current.scoreFiscalData.soldeNet > 0;

    if (wasContributor !== isContributor) {
      milestones.push({
        id: `status-change-${month}`,
        date: month,
        type: "status_change",
        title: isContributor ? "Contributeur net" : "Bénéficiaire net",
        description: isContributor
          ? "Passage en contributeur net"
          : "Passage en bénéficiaire net",
        previousValue: previous.scoreFiscalData.soldeNet,
        newValue: current.scoreFiscalData.soldeNet,
      });
    }

    // Confidence threshold (reached 90%+)
    if (previous.confidenceScore < 90 && current.confidenceScore >= 90) {
      milestones.push({
        id: `confidence-90-${month}`,
        date: month,
        type: "confidence_threshold",
        title: "Confiance excellente",
        description: "Score de confiance ≥ 90%",
        previousValue: previous.confidenceScore,
        newValue: current.confidenceScore,
      });
    }

    // Large change
    const change = Math.abs(
      current.scoreFiscalData.soldeNet - previous.scoreFiscalData.soldeNet
    );
    if (change > 5000) {
      milestones.push({
        id: `large-change-${month}`,
        date: month,
        type: "large_change",
        title: "Changement majeur",
        description: `Variation de ${Math.round(change)}€`,
        previousValue: previous.scoreFiscalData.soldeNet,
        newValue: current.scoreFiscalData.soldeNet,
      });
    }
  }

  return milestones;
}
