/**
 * API Route for Cache Metrics
 * GET /api/admin/monitoring/cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/modules/admin/auth';
import { getCacheMetrics } from '@/lib/cache';

/**
 * GET /api/admin/monitoring/cache
 * Get cache hit/miss metrics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const adminCheck = await requireAdmin(request, 'view_analytics');
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get cache metrics
    const metrics = getCacheMetrics();

    return NextResponse.json({
      metrics: {
        hits: metrics.hits,
        misses: metrics.misses,
        writes: metrics.writes,
        invalidations: metrics.invalidations,
        hitRate: metrics.hitRate.toFixed(2),
        backend: metrics.backend,
        isProduction: metrics.backend === 'redis',
      },
    });
  } catch (error) {
    console.error('Error getting cache metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get cache metrics' },
      { status: 500 }
    );
  }
}
