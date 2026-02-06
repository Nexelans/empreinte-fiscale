// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailToken } from "@/modules/auth/tokens";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    // Verify token
    const email = await verifyEmailToken(token);

    if (!email) {
      return NextResponse.json(
        { error: "Le lien de vérification est invalide ou expiré" },
        { status: 400 }
      );
    }

    // Update user
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete the token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      message: "Email vérifié avec succès",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification" },
      { status: 500 }
    );
  }
}
