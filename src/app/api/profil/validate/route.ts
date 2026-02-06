// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateProfilForScore } from "@/modules/score";

/**
 * POST /api/profil/validate
 * Valide un profil sans le sauvegarder
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the profile
    const validation = validateProfilForScore(body);

    return NextResponse.json(validation);
  } catch (error) {
    console.error("Error validating profil:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
