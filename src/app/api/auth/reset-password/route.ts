// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPasswordResetToken } from "@/modules/auth/tokens";
import { hashPassword } from "@/modules/auth/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token et mot de passe requis" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    // Verify token
    const email = await verifyPasswordResetToken(token);

    if (!email) {
      return NextResponse.json(
        { error: "Le lien a expiré, veuillez en demander un nouveau" },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Delete the token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
