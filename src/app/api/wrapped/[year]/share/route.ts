/**
 * API Route pour générer un lien de partage public du Wrapped
 * POST /api/wrapped/[year]/share - Génère un lien partageable
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { anonymizeWrappedData, generateWrappedData } from '@/modules/wrapped/generator';
import { WrappedTheme } from '@/modules/wrapped/types';

/**
 * POST /api/wrapped/[year]/share
 * Génère un lien de partage public du wrapped
 * Le lien est valable 30 jours et contient des données anonymisées
 */
export async function POST(
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

    if (isNaN(year) || year < 2020 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    // Générer le wrapped avec données anonymisées
    const wrappedData = await generateWrappedData(
      session.user.id,
      year,
      WrappedTheme.CLASSIC
    );
    const anonymizedData = anonymizeWrappedData(wrappedData);

    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours

    // Créer l'entrée de partage
    const shareLink = await prisma.sharedAnimation.create({
      data: {
        userId: session.user.id,
        animationData: anonymizedData as any,
        expiresAt,
      },
    });

    return NextResponse.json({
      shareLink: {
        id: shareLink.id,
        token: shareLink.id, // Utiliser l'ID comme token pour simplifier
        expiresAt: shareLink.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating share link:', error);

    if (error.message === 'No fiscal data available for this year') {
      return NextResponse.json(
        { error: 'No data available for this year' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
