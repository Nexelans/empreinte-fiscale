// Force dynamic rendering
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/simulations/international
 * Récupère les données fiscales internationales disponibles
 *
 * Note: Implémentation placeholder pour Phase 4
 * Les données réelles nécessitent des sources fiables par pays
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pays supportés (données simplifiées pour le placeholder)
    const countries = [
      {
        code: "FR",
        name: "France",
        flag: "🇫🇷",
        available: true,
      },
      {
        code: "DE",
        name: "Allemagne",
        flag: "🇩🇪",
        available: false, // Pas encore implémenté
        comingSoon: true,
      },
      {
        code: "GB",
        name: "Royaume-Uni",
        flag: "🇬🇧",
        available: false,
        comingSoon: true,
      },
      {
        code: "SE",
        name: "Suède",
        flag: "🇸🇪",
        available: false,
        comingSoon: true,
      },
      {
        code: "US",
        name: "États-Unis",
        flag: "🇺🇸",
        available: false,
        comingSoon: true,
      },
    ];

    return NextResponse.json({
      countries,
      disclaimer:
        "Les comparaisons internationales sont des estimations simplifiées. Les systèmes fiscaux varient considérablement entre pays.",
    });
  } catch (error) {
    console.error("[International API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des données internationales",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/simulations/international
 * Exécute une simulation de comparaison internationale
 *
 * Body:
 * - countryCode: Code pays (ex: "DE", "GB", "SE", "US")
 *
 * Note: Implémentation placeholder - nécessite des barèmes fiscaux par pays
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { countryCode } = body;

    if (!countryCode) {
      return NextResponse.json(
        { error: "countryCode est requis" },
        { status: 400 }
      );
    }

    // Pour l'instant, retourner une erreur "non implémenté"
    return NextResponse.json(
      {
        error: "Fonctionnalité en développement",
        message:
          "Les comparaisons internationales seront disponibles dans une prochaine version. Nous travaillons à obtenir des sources fiscales fiables pour chaque pays.",
        countryCode,
      },
      { status: 501 } // Not Implemented
    );

    // TODO Phase 4: Implémentation complète
    // 1. Récupérer les barèmes fiscaux du pays cible depuis le Référentiel
    // 2. Convertir le profil utilisateur au format du pays
    // 3. Calculer le score fiscal avec les règles du pays
    // 4. Retourner la comparaison avec delta
  } catch (error) {
    console.error("[International API] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la comparaison internationale",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
