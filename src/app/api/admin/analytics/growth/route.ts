/**
 * API Route pour les métriques de croissance
 * GET /api/admin/analytics/growth?period=daily&from=2025-01-01&to=2025-12-31
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/modules/admin/auth';
import { getUserGrowthMetrics } from '@/modules/admin/analytics';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'view_analytics');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as 'daily' | 'weekly' | 'monthly') || 'daily';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Dates par défaut: 30 derniers jours
    const endDate = to ? new Date(to) : new Date();
    const startDate = from
      ? new Date(from)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await getUserGrowthMetrics(period, startDate, endDate);

    return NextResponse.json({ metrics });
  } catch (error: any) {
    console.error('Error getting growth metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get growth metrics' },
      { status: 500 }
    );
  }
}
