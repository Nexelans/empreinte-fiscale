// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/profil
 * Récupère le profil fiscal de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profilFiscal: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.profilFiscal) {
      return NextResponse.json({ error: "Profil not found" }, { status: 404 });
    }

    return NextResponse.json(user.profilFiscal);
  } catch (error) {
    console.error("Error fetching profil:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profil
 * Crée ou met à jour le profil fiscal de l'utilisateur
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    // Prepare data for Prisma (convert nested objects to JSON)
    const profilData = {
      userId: user.id,
      wizardStep: body.wizardStep || 1,
      isComplete: body.isComplete || false,
      lastCompletedAt: body.lastCompletedAt ? new Date(body.lastCompletedAt) : null,

      // Situation personnelle
      statut: body.situation?.statut || null,
      nombreParts: body.situation?.nombreParts || null,
      commune: body.situation?.commune || null,
      age: body.situation?.age || null,

      // Revenus
      salaireBrut: body.revenus?.salaireBrut || null,
      salaireNet: body.revenus?.salaireNet || null,
      typeContrat: body.revenus?.typeContrat || null,
      revenusFonciers: body.revenus?.revenusFonciers || null,
      revenusCapitaux: body.revenus?.revenusCapitaux || null,
      autresRevenus: body.revenus?.autresRevenus || null,

      // Patrimoine
      proprietaire: body.patrimoine?.proprietaire ?? null,
      valeurLocative: body.patrimoine?.valeurLocative || null,
      taxeFonciere: body.patrimoine?.taxeFonciere || null,
      vehicules: body.patrimoine?.vehicules || [],
      patrimoineIFI: body.patrimoine?.patrimoineIFI || null,

      // Consommation (stored as separate JSON fields)
      modeConsommation: body.consommation?.mode || null,
      budgetMensuel: body.consommation?.budgetMensuel || null,
      detailCategories: body.consommation?.detailCategories || null,
      alcoolTabac: body.consommation?.alcoolTabac || null,

      // Famille & Services
      nombreEnfants: body.familleServices?.nombreEnfants || 0,
      enfantsDetails: body.familleServices?.enfants || [],
      frequenceServices: body.familleServices?.frequenceServices || {},
      aides: body.familleServices?.aides || {},

      // Status data
      statusData: body.statusData || {},
    };

    // Upsert the profile
    const profil = await prisma.profilFiscal.upsert({
      where: { userId: user.id },
      update: profilData,
      create: profilData,
    });

    return NextResponse.json(profil);
  } catch (error) {
    console.error("Error saving profil:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
