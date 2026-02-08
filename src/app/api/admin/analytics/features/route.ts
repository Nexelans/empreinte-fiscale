/**
 * API Route pour les statistiques d'utilisation des fonctionnalités
 * GET /api/admin/analytics/features
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/modules/admin/auth';
import { getFeatureUsage, getEngagementMetrics } from '@/modules/admin/analytics';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'view_analytics');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const [features, engagement] = await Promise.all([
      getFeatureUsage(),
      getEngagementMetrics(),
    ]);

    return NextResponse.json({
      features,
      engagement,
    });
  } catch (error: any) {
    console.error('Error getting feature usage:', error);
    return NextResponse.json(
      { error: 'Failed to get feature usage' },
      { status: 500 }
    );
  }
}
