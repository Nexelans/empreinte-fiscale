/**
 * API route pour l'export du Wrapped fiscal (PNG/MP4)
 * GET /api/wrapped/[year]/export?format=png|mp4
 * Phase 4 - Social Features
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generatePNG, generateMP4, generateShareId } from '@/modules/wrapped/export';

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parser l'année
    const year = parseInt(params.year, 10);
    if (isNaN(year) || year < 2020 || year > new Date().getFullYear()) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    // Récupérer le format (png par défaut)
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'png';

    if (format !== 'png' && format !== 'mp4') {
      return NextResponse.json(
        { error: 'Invalid format. Must be png or mp4' },
        { status: 400 }
      );
    }

    // Récupérer le wrapped existant ou le créer
    let wrapped = await prisma.wrappedGeneration.findUnique({
      where: {
        userId_year: {
          userId: session.user.id,
          year,
        },
      },
    });

    // Si le wrapped n'existe pas, le générer d'abord
    if (!wrapped) {
      // Récupérer les scores de l'année
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);

      const scores = await prisma.scoreFiscal.findMany({
        where: {
          userId: session.user.id,
          calculatedAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        orderBy: { calculatedAt: 'desc' },
      });

      if (scores.length === 0) {
        return NextResponse.json(
          { error: 'No fiscal data for this year' },
          { status: 404 }
        );
      }

      // Calculer les données du wrapped
      const latestScore = scores[0]!; // Safe because we checked scores.length > 0
      const detailPaye = latestScore.detailPaye as any;
      const detailRecu = latestScore.detailRecu as any;

      const topPaye = Object.entries(detailPaye)
        .map(([category, amount]) => ({
          category,
          amount: amount as number,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      const topRecu = Object.entries(detailRecu.servicesMutualises || {})
        .map(([category, amount]) => ({
          category,
          amount: amount as number,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      // Récupérer les badges de l'utilisateur
      const userBadges = await prisma.userBadge.findMany({
        where: {
          userId: session.user.id,
          earnedAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      });

      const wrappedData = {
        totalPaye: latestScore.totalPaye,
        totalRecu: latestScore.totalRecu,
        soldeNet: latestScore.soldeNet,
        ratio: latestScore.ratio,
        topCategories: {
          paye: topPaye,
          recu: topRecu,
        },
        badges: userBadges.map((ub) => ({
          id: ub.badgeId,
          name: ub.badgeId, // TODO: Add badge metadata
          emoji: '🏆',
        })),
      };

      // Créer le wrapped
      const shareId = generateShareId();

      wrapped = await prisma.wrappedGeneration.create({
        data: {
          userId: session.user.id,
          year,
          data: wrappedData,
          shareId,
        },
      });
    }

    const wrappedData = wrapped.data as any;

    // Générer l'export selon le format
    let buffer: Buffer;
    let mimeType: string;
    let filename: string;

    if (format === 'png') {
      buffer = await generatePNG(
        {
          year: wrapped.year,
          ...wrappedData,
        },
        wrapped.shareId
      );
      mimeType = 'image/png';
      filename = `wrapped-fiscal-${year}.png`;
    } else {
      // format === 'mp4'
      buffer = await generateMP4(
        {
          year: wrapped.year,
          ...wrappedData,
        },
        wrapped.shareId
      );
      mimeType = 'video/mp4';
      filename = `wrapped-fiscal-${year}.mp4`;
    }

    // Incrémenter le compteur de vues
    await prisma.wrappedGeneration.update({
      where: { id: wrapped.id },
      data: { viewCount: { increment: 1 } },
    });

    // Retourner le fichier
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400', // Cache 24h
      },
    });
  } catch (error: any) {
    console.error('Error generating wrapped export:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
