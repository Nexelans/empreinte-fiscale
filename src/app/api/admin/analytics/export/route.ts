/**
 * API Route pour exporter les analytics en CSV
 * GET /api/admin/analytics/export?type=users&from=2025-01-01&to=2025-12-31
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/modules/admin/auth';
import { exportAnalyticsCSV } from '@/modules/admin/analytics';
import { logAdminAction } from '@/modules/admin/logging';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'view_analytics');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'users' | 'features' | 'engagement';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!type || !['users', 'features', 'engagement'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: users, features, or engagement' },
        { status: 400 }
      );
    }

    // Dates par défaut: 30 derniers jours
    const endDate = to ? new Date(to) : new Date();
    const startDate = from
      ? new Date(from)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const csv = await exportAnalyticsCSV(type, startDate, endDate);

    // Logger l'export
    await logAdminAction({
      adminUserId: auth.userId!,
      action: 'EXPORT_ANALYTICS',
      resourceType: 'Analytics',
      resourceId: type,
      details: {
        type,
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${type}-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}
