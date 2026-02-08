/**
 * API Route pour la santé du système
 * GET /api/admin/monitoring/health
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/modules/admin/auth';
import { getSystemHealth } from '@/modules/admin/monitoring';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'view_analytics');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const health = await getSystemHealth();
    return NextResponse.json({ health });
  } catch (error: any) {
    console.error('Error getting system health:', error);
    return NextResponse.json(
      { error: 'Failed to get system health' },
      { status: 500 }
    );
  }
}
