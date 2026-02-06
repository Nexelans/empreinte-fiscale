// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/modules/auth/tokens";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message:
          "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation",
      });
    }

    // Generate reset token
    const token = await generatePasswordResetToken(email);

    // TODO: Send reset email (will be implemented later)
    console.log(`Password reset token for ${email}: ${token}`);
    console.log(
      `Reset URL: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
    );

    return NextResponse.json({
      message:
        "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
