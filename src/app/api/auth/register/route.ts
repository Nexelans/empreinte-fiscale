import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/modules/auth/password";
import { generateVerificationToken } from "@/modules/auth/tokens";
import { sendVerificationEmail } from "@/modules/auth/email";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, nom et mot de passe requis" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà associé à un compte" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    // Generate verification token
    const token = await generateVerificationToken(email);

    // Send verification email
    const emailResult = await sendVerificationEmail(email, token);

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // Continue anyway - user can request a new verification email
    }

    return NextResponse.json(
      {
        message: "Compte créé avec succès. Vérifiez votre email.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du compte" },
      { status: 500 }
    );
  }
}
