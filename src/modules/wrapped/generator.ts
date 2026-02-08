/**
 * Générateur de données pour le bilan annuel "Wrapped"
 * Phase 4 - Module Wrapped
 */

import { prisma } from '@/lib/prisma';
import {
  WrappedData,
  WrappedTheme,
  WrappedScene,
  WrappedSceneType,
} from './types';
import { calculateNationalPercentile } from '../social/leaderboard/service';
import { LeaderboardMetric } from '../social/leaderboard/types';

/**
 * Génère les données du bilan annuel pour un utilisateur
 */
export async function generateWrappedData(
  userId: string,
  year: number,
  theme: WrappedTheme = WrappedTheme.CLASSIC
): Promise<WrappedData> {
  // Récupérer l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Récupérer l'historique des scores pour l'année
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const scoreHistory = await prisma.scoreHistory.findMany({
    where: {
      userId,
      year,
    },
    orderBy: {
      month: 'asc',
    },
  });

  if (scoreHistory.length === 0) {
    throw new Error('No fiscal data available for this year');
  }

  // Calculer les totaux annuels (moyenne des mois disponibles)
  const totalPaye =
    scoreHistory.reduce((sum, s) => {
      const data = s.scoreFiscalData as any;
      return sum + (data.totalPaye || 0);
    }, 0) / scoreHistory.length;

  const totalRecu =
    scoreHistory.reduce((sum, s) => {
      const data = s.scoreFiscalData as any;
      return sum + (data.totalRecu || 0);
    }, 0) / scoreHistory.length;

  const soldeNet =
    scoreHistory.reduce((sum, s) => {
      const data = s.scoreFiscalData as any;
      return sum + (data.soldeNet || 0);
    }, 0) / scoreHistory.length;

  const ratio =
    scoreHistory.reduce((sum, s) => {
      const data = s.scoreFiscalData as any;
      return sum + (data.ratio || 0);
    }, 0) / scoreHistory.length;

  const scoreConfiance =
    scoreHistory.reduce((sum, s) => sum + s.confidenceScore, 0) /
    scoreHistory.length;

  // Construire le breakdown mensuel
  const monthlyData = scoreHistory.map((s) => {
    const data = s.scoreFiscalData as any;
    return {
      month: s.month,
      soldeNet: data.soldeNet || 0,
      totalPaye: data.totalPaye || 0,
      totalRecu: data.totalRecu || 0,
    };
  });

  // Calculer l'évolution par rapport à l'année précédente
  let evolution = undefined;
  const previousYearScores = await prisma.scoreHistory.findMany({
    where: {
      userId,
      year: year - 1,
    },
  });

  if (previousYearScores.length > 0) {
    const prevTotalPaye =
      previousYearScores.reduce((sum, s) => {
        const data = s.scoreFiscalData as any;
        return sum + (data.totalPaye || 0);
      }, 0) / previousYearScores.length;

    const prevTotalRecu =
      previousYearScores.reduce((sum, s) => {
        const data = s.scoreFiscalData as any;
        return sum + (data.totalRecu || 0);
      }, 0) / previousYearScores.length;

    const prevSoldeNet =
      previousYearScores.reduce((sum, s) => {
        const data = s.scoreFiscalData as any;
        return sum + (data.soldeNet || 0);
      }, 0) / previousYearScores.length;

    const prevRatio =
      previousYearScores.reduce((sum, s) => {
        const data = s.scoreFiscalData as any;
        return sum + (data.ratio || 0);
      }, 0) / previousYearScores.length;

    evolution = {
      totalPayeDelta: ((totalPaye - prevTotalPaye) / prevTotalPaye) * 100,
      totalRecuDelta: ((totalRecu - prevTotalRecu) / prevTotalRecu) * 100,
      soldeNetDelta: ((soldeNet - prevSoldeNet) / Math.abs(prevSoldeNet)) * 100,
      ratioDelta: ((ratio - prevRatio) / prevRatio) * 100,
    };
  }

  // Récupérer le percentile national (si opt-in)
  let nationalPercentile = undefined;
  try {
    const percentile = await calculateNationalPercentile(
      userId,
      LeaderboardMetric.SOLDE_NET
    );
    if (percentile) {
      nationalPercentile = percentile.percentile;
    }
  } catch {
    // Utilisateur n'a pas opté ou pas assez de données
  }

  // Générer les insights
  const topInsights = generateInsights(
    totalPaye,
    totalRecu,
    soldeNet,
    ratio,
    monthlyData
  );

  // Construire les scènes
  const scenes = generateScenes(
    totalPaye,
    totalRecu,
    soldeNet,
    ratio,
    monthlyData,
    topInsights,
    evolution
  );

  return {
    year,
    userId,
    userName: user.name || user.email,
    totalPaye,
    totalRecu,
    soldeNet,
    ratio,
    scoreConfiance,
    monthlyData,
    topInsights,
    evolution,
    nationalPercentile,
    theme,
    scenes,
    generatedAt: new Date(),
  };
}

/**
 * Génère les insights principaux de l'année
 */
function generateInsights(
  totalPaye: number,
  totalRecu: number,
  soldeNet: number,
  ratio: number,
  monthlyData: any[]
): { label: string; value: string; icon?: string }[] {
  const insights = [];

  // Insight 1: Montant total payé en comparaison
  const dailyAverage = totalPaye / 365;
  insights.push({
    label: 'Vous avez payé en moyenne',
    value: `${Math.round(dailyAverage)}€ par jour`,
    icon: 'calendar',
  });

  // Insight 2: Équivalent en services publics
  const educationEquivalent = Math.floor(totalRecu / 7000); // Coût moyen d'un élève
  if (educationEquivalent > 0) {
    insights.push({
      label: 'Vos services publics équivalent à',
      value: `${educationEquivalent} année${educationEquivalent > 1 ? 's' : ''} de scolarité`,
      icon: 'school',
    });
  }

  // Insight 3: Mois le plus coûteux
  const maxMonth = monthlyData.reduce((max, curr) =>
    curr.totalPaye > max.totalPaye ? curr : max
  );
  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];
  insights.push({
    label: 'Votre mois le plus fiscal',
    value: monthNames[maxMonth.month - 1] || 'Inconnu',
    icon: 'trending-up',
  });

  // Insight 4: Statut contributeur/bénéficiaire
  if (ratio > 1) {
    insights.push({
      label: 'Vous êtes contributeur net',
      value: `Vous payez ${ratio.toFixed(1)}× ce que vous recevez`,
      icon: 'arrow-up',
    });
  } else {
    insights.push({
      label: 'Vous êtes bénéficiaire net',
      value: `Vous recevez ${(1 / ratio).toFixed(1)}× ce que vous payez`,
      icon: 'arrow-down',
    });
  }

  return insights.slice(0, 4); // Limiter à 4 insights
}

/**
 * Génère les scènes de l'animation Wrapped
 */
function generateScenes(
  totalPaye: number,
  totalRecu: number,
  soldeNet: number,
  ratio: number,
  monthlyData: any[],
  insights: any[],
  evolution?: any
): WrappedScene[] {
  const scenes: WrappedScene[] = [];

  // Scène 1: Intro
  scenes.push({
    type: WrappedSceneType.INTRO,
    title: 'Votre année fiscale',
    subtitle: 'En quelques chiffres',
    data: {},
    order: 1,
  });

  // Scène 2: Total payé
  scenes.push({
    type: WrappedSceneType.TOTAL_PAYE,
    title: 'Vous avez payé',
    data: { amount: totalPaye },
    order: 2,
  });

  // Scène 3: Total reçu
  scenes.push({
    type: WrappedSceneType.TOTAL_RECU,
    title: 'Vous avez reçu',
    data: { amount: totalRecu },
    order: 3,
  });

  // Scène 4: Solde net
  scenes.push({
    type: WrappedSceneType.SOLDE_NET,
    title: 'Votre solde fiscal',
    data: { amount: soldeNet, ratio },
    order: 4,
  });

  // Scène 5: Breakdown mensuel
  scenes.push({
    type: WrappedSceneType.MONTHLY_BREAKDOWN,
    title: 'Votre année en détail',
    data: { monthlyData },
    order: 5,
  });

  // Scène 6: Top insight
  if (insights.length > 0) {
    scenes.push({
      type: WrappedSceneType.TOP_INSIGHT,
      title: insights[0].label,
      subtitle: insights[0].value,
      data: { insights },
      order: 6,
    });
  }

  // Scène 7: Évolution (si disponible)
  if (evolution) {
    scenes.push({
      type: WrappedSceneType.EVOLUTION,
      title: 'Votre évolution',
      subtitle: 'Par rapport à l\'année dernière',
      data: { evolution },
      order: 7,
    });
  }

  // Scène 8: Outro
  scenes.push({
    type: WrappedSceneType.OUTRO,
    title: 'Merci d\'avoir utilisé',
    subtitle: 'Empreinte Fiscale',
    data: {},
    order: scenes.length + 1,
  });

  return scenes;
}

/**
 * Anonymise les données pour le partage public
 */
export function anonymizeWrappedData(data: WrappedData): WrappedData {
  return {
    ...data,
    userId: 'anonymous',
    userName: 'Un utilisateur',
    // Arrondir les montants
    totalPaye: Math.round(data.totalPaye / 100) * 100,
    totalRecu: Math.round(data.totalRecu / 100) * 100,
    soldeNet: Math.round(data.soldeNet / 100) * 100,
    monthlyData: data.monthlyData.map((m) => ({
      ...m,
      soldeNet: Math.round(m.soldeNet / 100) * 100,
      totalPaye: Math.round(m.totalPaye / 100) * 100,
      totalRecu: Math.round(m.totalRecu / 100) * 100,
    })),
    // Supprimer les données de comparaison
    nationalPercentile: undefined,
    friendsRank: undefined,
    friendsTotal: undefined,
  };
}
