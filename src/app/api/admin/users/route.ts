/**
 * API Routes pour la gestion des utilisateurs (Admin)
 * GET /api/admin/users - Recherche utilisateurs
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/modules/admin/auth';
import { searchUsers, getUserStats } from '@/modules/admin/users';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request, 'manage_users');

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);

    // Si on demande les stats
    if (searchParams.get('stats') === 'true') {
      const stats = await getUserStats();
      return NextResponse.json({ stats });
    }

    // Sinon, recherche normale
    const query = searchParams.get('query') || undefined;
    const role = searchParams.get('role') as any;
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await searchUsers({
      query,
      role,
      status,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
