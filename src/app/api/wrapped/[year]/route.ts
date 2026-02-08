/**
 * API Route pour générer les données du Wrapped
 * GET /api/wrapped/[year] - Génère le bilan annuel
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateWrappedData } from '@/modules/wrapped/generator';
import { WrappedTheme } from '@/modules/wrapped/types';

/**
 * GET /api/wrapped/[year]?theme=classic
 * Génère les données du bilan annuel pour une année donnée
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const year = parseInt(params.year);
    const { searchParams } = new URL(request.url);
    const theme = (searchParams.get('theme') as WrappedTheme) || WrappedTheme.CLASSIC;

    if (isNaN(year) || year < 2020 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    // Valider le thème
    if (!Object.values(WrappedTheme).includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      );
    }

    const wrapped = await generateWrappedData(session.user.id, year, theme);

    return NextResponse.json({ wrapped });
  } catch (error: any) {
    console.error('Error generating wrapped:', error);

    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (error.message === 'No fiscal data available for this year') {
      return NextResponse.json(
        {
          error: 'No data available',
          message: 'No fiscal data available for this year. You need at least 6 months of data.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate wrapped' },
      { status: 500 }
    );
  }
}
