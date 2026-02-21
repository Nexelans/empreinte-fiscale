/**
 * API Route pour les statistiques d'utilisation IA
 * GET /api/ai/usage?period=month - Récupère les statistiques d'utilisation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getUsageStats,
  getUsageByProvider,
  getUsageByContext,
  getUsageHistory,
  getCostProjections,
  exportUsageCSV,
} from '@/modules/ai/usage';

/**
 * GET /api/ai/usage?period=month&details=true
 * Récupère les statistiques d'utilisation IA de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as 'day' | 'month') || 'month';
    const details = searchParams.get('details') === 'true';
    const format = searchParams.get('format'); // 'json' ou 'csv'

    // Export CSV
    if (format === 'csv') {
      const days = period === 'day' ? 1 : 30;
      const csv = exportUsageCSV(session.user.id, days);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ai-usage-${period}.csv"`,
        },
      });
    }

    // Récupérer les statistiques de base
    const stats = await getUsageStats(session.user.id, period === 'day' ? 'today' : period);

    // Si pas de détails demandés, retourner seulement les stats de base
    if (!details) {
      return NextResponse.json({
        stats,
        chatRequestsToday: stats.chatRequestsToday,
      });
    }

    // Récupérer les détails
    const days = period === 'day' ? 1 : 30;
    const byProvider = await getUsageByProvider(session.user.id, days);
    const byContext = await getUsageByContext(session.user.id, days);
    const history = getUsageHistory(session.user.id, 20); // 20 derniers
    const projections = getCostProjections(session.user.id);

    return NextResponse.json({
      stats,
      byProvider,
      byContext,
      history,
      projections,
      chatRequestsToday: stats.chatRequestsToday,
    });
  } catch (error: any) {
    console.error('Error fetching AI usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}
