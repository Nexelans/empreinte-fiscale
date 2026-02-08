/**
 * API Route pour le statut des jobs planifiés
 * GET /api/admin/monitoring/jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/modules/admin/auth';
import { getJobStatus } from '@/modules/admin/monitoring';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'view_analytics');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const jobs = await getJobStatus();
    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error('Error getting job status:', error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}
