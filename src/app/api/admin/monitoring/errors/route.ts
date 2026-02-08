/**
 * API Route pour les erreurs système
 * GET /api/admin/monitoring/errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/modules/admin/auth';
import { getRecentErrors } from '@/modules/admin/monitoring';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'view_logs');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const severity = searchParams.get('severity') as 'error' | 'warning' | 'critical' | undefined;

    const result = await getRecentErrors({ limit, offset, severity });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error getting errors:', error);
    return NextResponse.json(
      { error: 'Failed to get errors' },
      { status: 500 }
    );
  }
}
